import { NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";

export const dynamic = "force-dynamic";

const BATCH_LIMIT = 1000;

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

    const rows = emails
      .map((email) => String(email || "").trim())
      .filter(Boolean)
      .map((email) => ({
        job_id: jobId,
        email,
        status: "QUEUE",
        detail: null,
        updated_at: new Date().toISOString(),
      }));

    if (!rows.length) {
      return NextResponse.json({ ok: true, inserted: 0 });
    }

    const { error } = await supabase
      .from("verification_email_tasks")
      .upsert(rows, {
        onConflict: "job_id,email_normalized",
        ignoreDuplicates: true,
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, inserted: rows.length });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}

