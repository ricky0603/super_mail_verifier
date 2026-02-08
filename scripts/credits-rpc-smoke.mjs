import { createClient } from "@supabase/supabase-js";
import dns from "node:dns";

// Avoid flaky IPv6/TLS issues in some environments.
dns.setDefaultResultOrder("ipv4first");

const requireEnv = (name) => {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
};

const assert = (cond, msg) => {
  if (!cond) throw new Error(msg);
};

const randomEmail = () => {
  const rand = crypto.randomUUID().slice(0, 8);
  return `credit-smoke+${Date.now()}-${rand}@example.com`;
};

const main = async () => {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const serviceKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false },
    realtime: { disabled: true },
  });

  const email = randomEmail();
  const password = `Pw_${crypto.randomUUID()}_pw`;

  // 1) Create a temp user + get an authenticated session
  const created = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (created.error) throw created.error;
  const userId = created.data.user.id;

  const authed = createClient(url, anonKey, {
    auth: { persistSession: false },
    realtime: { disabled: true },
  });
  const signedIn = await authed.auth.signInWithPassword({ email, password });
  if (signedIn.error) throw signedIn.error;
  assert(signedIn.data?.session?.access_token, "Missing access token after login");

  // 2) Seed credits + active subscription window
  const subExpiredAt = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
  const seed = await admin.from("profiles").upsert(
    {
      id: userId,
      total_credit: 5,
      used_credit: 0,
      sub_expired_at: subExpiredAt,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );
  if (seed.error) throw seed.error;

  // 3) Create a job (try as authenticated user first to validate RLS)
  const jobId = crypto.randomUUID();
  const jobPayload = {
    id: jobId,
    user_id: userId,
    name: "credits-rpc-smoke",
    status: "QUEUE",
    unique_emails: 0,
    updated_at: new Date().toISOString(),
  };

  const jobInsertAuthed = await authed.from("verification_jobs").insert(jobPayload);
  if (jobInsertAuthed.error) {
    // Fallback: some setups may not allow the client to insert jobs directly.
    const jobInsertAdmin = await admin.from("verification_jobs").insert(jobPayload);
    if (jobInsertAdmin.error) throw jobInsertAdmin.error;
  }

  const before = await admin
    .from("profiles")
    .select("total_credit,used_credit")
    .eq("id", userId)
    .maybeSingle();
  if (before.error) throw before.error;

  // Case A: duplicates within the same call should only consume unique(new) emails per job.
  const rpcA = await authed.rpc("consume_credits_and_insert_email_tasks", {
    p_job_id: jobId,
    p_emails: ["a@b.com", "A@B.COM ", "c@d.com"],
  });
  if (rpcA.error) throw rpcA.error;

  const mid = await admin
    .from("profiles")
    .select("total_credit,used_credit")
    .eq("id", userId)
    .maybeSingle();
  if (mid.error) throw mid.error;

  // We expect 2 unique inserts in job => used_credit increases by 2.
  assert(
    mid.data.used_credit - before.data.used_credit === 2,
    "Case A: expected used_credit to increase by 2"
  );

  // Case B: inserting existing + new consumes only the new one.
  const rpcB = await authed.rpc("consume_credits_and_insert_email_tasks", {
    p_job_id: jobId,
    p_emails: ["a@b.com", "e@f.com"],
  });
  if (rpcB.error) throw rpcB.error;

  const afterB = await admin
    .from("profiles")
    .select("total_credit,used_credit")
    .eq("id", userId)
    .maybeSingle();
  if (afterB.error) throw afterB.error;

  assert(
    afterB.data.used_credit - mid.data.used_credit === 1,
    "Case B: expected used_credit to increase by 1"
  );

  // Case C: insufficient credits should throw and NOT insert.
  let rpcCError = null;
  const rpcC = await authed.rpc("consume_credits_and_insert_email_tasks", {
    p_job_id: jobId,
    p_emails: ["x1@y.com", "x2@y.com", "x3@y.com"],
  });
  if (rpcC.error) rpcCError = rpcC.error;

  assert(rpcCError, "Case C: expected an error for insufficient credits");

  const afterC = await admin
    .from("profiles")
    .select("total_credit,used_credit")
    .eq("id", userId)
    .maybeSingle();
  if (afterC.error) throw afterC.error;

  // used_credit should be unchanged after a failed call.
  assert(
    afterC.data.used_credit === afterB.data.used_credit,
    "Case C: expected used_credit unchanged after failure"
  );

  const tasks = await admin
    .from("verification_email_tasks")
    .select("email_normalized")
    .eq("job_id", jobId);
  if (tasks.error) throw tasks.error;

  console.log(
    JSON.stringify(
      {
        userId,
        jobId,
        before: before.data,
        rpcA: rpcA.data,
        mid: mid.data,
        rpcB: rpcB.data,
        afterB: afterB.data,
        rpcC_error: rpcCError,
        afterC: afterC.data,
        taskCount: tasks.data.length,
        tasks: tasks.data.map((t) => t.email_normalized).sort(),
      },
      null,
      2
    )
  );
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
