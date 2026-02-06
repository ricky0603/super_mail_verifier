import { NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const supabase = await createClient();

    const {
      jobId,
      name,
      sourceFilename,
      sourceStoragePath,
    } = await req.json();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!jobId || !name) {
      return NextResponse.json(
        { error: "Missing jobId or name" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("verification_jobs").insert({
      id: jobId,
      user_id: user.id,
      name,
      source_filename: sourceFilename || null,
      source_storage_path: sourceStoragePath || null,
      status: "QUEUE",
      unique_emails: 0,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ jobId });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}

