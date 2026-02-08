import { NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";

export const dynamic = "force-dynamic";

const isActiveSubscription = (subExpiredAt) => {
  if (!subExpiredAt) return false;
  const ms = new Date(subExpiredAt).getTime();
  return Number.isFinite(ms) && ms > Date.now();
};

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

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("sub_expired_at")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    if (!isActiveSubscription(profile?.sub_expired_at)) {
      return NextResponse.json(
        { error: "Subscription required" },
        { status: 403 }
      );
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
