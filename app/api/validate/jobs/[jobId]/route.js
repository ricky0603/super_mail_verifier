import { NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";

export const dynamic = "force-dynamic";

export async function PATCH(req, { params }) {
  try {
    const supabase = await createClient();
    const jobId =
      params?.jobId ||
      req?.nextUrl?.pathname?.split("/").filter(Boolean).slice(-1)?.[0];
    const { uniqueEmails } = await req.json();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!jobId || jobId === "jobs") {
      return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
    }

    const patch = {
      updated_at: new Date().toISOString(),
    };

    if (typeof uniqueEmails === "number") {
      patch.unique_emails = uniqueEmails;
    }

    const { error } = await supabase
      .from("verification_jobs")
      .update(patch)
      .eq("id", jobId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
