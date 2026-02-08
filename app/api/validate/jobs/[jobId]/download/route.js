import Papa from "papaparse";
import { NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";

export const dynamic = "force-dynamic";

const STORAGE_BUCKET = "email_list_sourcefile";
const TASKS_PAGE_SIZE = 1000;

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

const isEmailLike = (value) => {
  const v = String(value || "").trim();
  if (!v) return false;
  // 简单启发式：避免引入额外依赖，同时满足大多数 CSV 场景。
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
};

const guessHasHeader = (rows) => {
  if (!Array.isArray(rows) || rows.length < 2) return false;
  const first = rows[0] || [];
  const firstHasEmail = (first || []).some((cell) => isEmailLike(cell));
  if (firstHasEmail) return false;

  const sample = rows.slice(1, 6);
  const sampleHasEmail = sample.some((row) =>
    (row || []).some((cell) => isEmailLike(cell))
  );

  return sampleHasEmail;
};

const sanitizeFilename = (name) =>
  String(name || "")
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "_")
    .slice(0, 180) || "results.csv";

const blobToUtf8 = async (blob) => {
  if (!blob) return "";
  if (typeof blob === "string") return blob;

  if (blob instanceof ArrayBuffer) {
    return Buffer.from(blob).toString("utf8");
  }

  if (typeof blob.arrayBuffer === "function") {
    const ab = await blob.arrayBuffer();
    return Buffer.from(ab).toString("utf8");
  }

  // Fallback：尽量不因为运行时差异导致下载不可用。
  return String(blob);
};

const fetchAllEmailTasks = async ({ supabase, jobId }) => {
  const all = [];

  // supabase-js 单次返回有上限；这里分页拉全量，用于导出。
  for (let from = 0; ; from += TASKS_PAGE_SIZE) {
    const to = from + TASKS_PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from("verification_email_tasks")
      .select("email,status,detail")
      .eq("job_id", jobId)
      .order("email", { ascending: true })
      .range(from, to);

    if (error) throw new Error(error.message);
    if (!data?.length) break;

    all.push(...data);
    if (data.length < TASKS_PAGE_SIZE) break;
  }

  return all;
};

const findRowEmail = ({ row, taskByEmail }) => {
  if (!Array.isArray(row)) return null;

  // 优先匹配“确实在任务结果里出现过的邮箱”，避免选错列。
  for (const cell of row) {
    const norm = normalizeEmail(cell);
    if (norm && taskByEmail.has(norm)) return norm;
  }

  // 兜底：找到第一个看起来像邮箱的单元格。
  for (const cell of row) {
    const v = String(cell || "").trim();
    if (isEmailLike(v)) return normalizeEmail(v);
  }

  return null;
};

const parseJobIdFromPath = (pathname) => {
  const parts = String(pathname || "").split("/").filter(Boolean);
  if (!parts.length) return null;

  // e.g. /api/validate/jobs/<jobId>/download
  const last = parts[parts.length - 1];
  const prev = parts[parts.length - 2];
  if (last === "download") return prev || null;

  return last || null;
};

export async function GET(req, { params } = {}) {
  try {
    const supabase = await createClient();
    const jobId =
      params?.jobId ||
      req?.nextUrl?.searchParams?.get("jobId") ||
      parseJobIdFromPath(req?.nextUrl?.pathname);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!jobId) {
      return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
    }

    const { data: job, error: jobError } = await supabase
      .from("verification_jobs")
      .select("id,user_id,status,source_filename,source_storage_path,name")
      .eq("id", jobId)
      .maybeSingle();

    if (jobError) {
      return NextResponse.json({ error: jobError.message }, { status: 400 });
    }

    if (!job || job.user_id !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (job.status !== "COMPLETE") {
      return NextResponse.json(
        { error: "Job not complete" },
        { status: 400 }
      );
    }

    if (!job.source_storage_path) {
      return NextResponse.json(
        { error: "Missing source file path" },
        { status: 400 }
      );
    }

    const { data: blob, error: downloadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(job.source_storage_path);

    if (downloadError) {
      return NextResponse.json(
        { error: downloadError.message },
        { status: 400 }
      );
    }

    const sourceCsvText = await blobToUtf8(blob);

    const parsed = Papa.parse(sourceCsvText, {
      skipEmptyLines: false,
      dynamicTyping: false,
    });

    if (parsed?.errors?.length) {
      return NextResponse.json(
        { error: parsed.errors[0]?.message || "CSV parse failed" },
        { status: 400 }
      );
    }

    const rows = Array.isArray(parsed?.data) ? parsed.data : [];
    const hasHeader = guessHasHeader(rows);

    const tasks = await fetchAllEmailTasks({ supabase, jobId });
    const taskByEmail = new Map(
      (tasks || [])
        .map((t) => ({
          email: normalizeEmail(t.email),
          status: t.status || "",
          detail: t.detail || "",
        }))
        .filter((t) => t.email)
        .map((t) => [t.email, { status: t.status, detail: t.detail }])
    );

    const out = [];
    const newHeader = ["severe_result", "detail"];

    rows.forEach((row, idx) => {
      const arr = Array.isArray(row) ? row : [row];

      if (hasHeader && idx === 0) {
        out.push([...arr, ...newHeader]);
        return;
      }

      const email = findRowEmail({ row: arr, taskByEmail });
      const result = email ? taskByEmail.get(email) : null;

      out.push([
        ...arr,
        result?.status || "",
        result?.detail || "",
      ]);
    });

    // Excel 兼容：加 BOM，避免 UTF-8 在部分环境下乱码。
    const csvWithBom = `\ufeff${Papa.unparse(out)}`;

    const baseName =
      job.source_filename || job.name || `job-${String(jobId).slice(0, 8)}.csv`;
    const filename = sanitizeFilename(
      baseName.replace(/\.csv$/i, "") + "_results.csv"
    );

    return new NextResponse(csvWithBom, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename=\"${filename}\"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
