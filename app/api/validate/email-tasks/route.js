import { NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";

export const dynamic = "force-dynamic";

const BATCH_LIMIT = 1000;

const parseJsonOrNull = (value) => {
  if (!value || typeof value !== "string") return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export async function POST(req) {
  try {
    const supabase = await createClient();

    const { jobId, emails } = await req.json();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!jobId || !Array.isArray(emails)) {
      return NextResponse.json(
        { error: "Missing jobId or emails" },
        { status: 400 }
      );
    }

    if (emails.length > BATCH_LIMIT) {
      return NextResponse.json(
        { error: `Too many emails in one request (max ${BATCH_LIMIT})` },
        { status: 400 }
      );
    }

    const trimmed = emails
      .map((email) => String(email || "").trim())
      .filter(Boolean);

    if (!trimmed.length) {
      return NextResponse.json({ ok: true, inserted: 0 });
    }

    const { data, error } = await supabase.rpc(
      "consume_credits_and_insert_email_tasks",
      {
        p_job_id: jobId,
        p_emails: trimmed,
      }
    );

    if (error) {
      // Common misconfiguration: function exists but roles can't execute it.
      // In Supabase this often shows up as 403 + code 28000.
      if (error?.code === "28000") {
        return NextResponse.json(
          {
            error:
              "Server misconfiguration: RPC permission denied. Grant EXECUTE on consume_credits_and_insert_email_tasks to role authenticated (and service_role if needed).",
          },
          { status: 500 }
        );
      }

      if (
        error?.code === "P0001" &&
        String(error?.message || "").includes("insufficient_credits")
      ) {
        const detail = parseJsonOrNull(error?.details);
        return NextResponse.json(
          {
            error: "Insufficient credits",
            availableCredit: detail?.available ?? null,
            requiredCredit: detail?.required ?? null,
          },
          { status: 402 }
        );
      }

      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      inserted: data?.insertedCount || 0,
      availableAfter: data?.availableAfter ?? null,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
