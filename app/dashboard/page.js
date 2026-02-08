import Link from "next/link";
import { createClient } from "@/libs/supabase/server";

export const dynamic = "force-dynamic";

const isActiveSubscription = (subExpiredAt) => {
  if (!subExpiredAt) return false;
  const ms = new Date(subExpiredAt).getTime();
  return Number.isFinite(ms) && ms > Date.now();
};

const toDateKey = (dateString) => {
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const StatCard = ({ label, value, hint }) => {
  return (
    <div className="bg-base-100 border border-base-300 rounded-xl p-5">
      <div className="text-sm text-base-content/60">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      {hint ? <div className="mt-1 text-xs text-base-content/60">{hint}</div> : null}
    </div>
  );
};

const formatJobStatusLabel = (status) => {
  if (status === "QUEUE") return "Queue";
  if (status === "VERIFYING") return "Verifying";
  if (status === "COMPLETE") return "Complete";
  return status || "-";
};

const JobStatusBadge = ({ status }) => {
  if (status === "COMPLETE") return <span className="badge badge-success">Complete</span>;
  if (status === "VERIFYING") return <span className="badge badge-warning">Verifying</span>;
  if (status === "QUEUE") return <span className="badge badge-ghost">Queue</span>;
  return <span className="badge badge-ghost">{formatJobStatusLabel(status)}</span>;
};

const UsageChart = ({ days }) => {
  const items = Array.isArray(days) ? days : [];
  const max = Math.max(1, ...items.map((d) => d.count || 0));

  return (
    <div className="bg-base-100 border border-base-300 rounded-xl h-full flex flex-col relative z-10">
      <div className="p-5 flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="text-lg font-semibold">Usage</div>
          <div className="text-sm text-base-content/60">
            Emails submitted for verification (last {items.length} days).
          </div>
        </div>
      </div>

      <div className="px-5 pb-5 flex-1 min-h-40">
        <div className="grid grid-cols-7 sm:grid-cols-14 gap-2 items-end h-full">
          {items.map((d) => {
            const pct = Math.round(((d.count || 0) / max) * 100);
            const label = d.label || d.dateKey;
            const tip = `${label}: ${(d.count || 0).toLocaleString()} emails`;
            const hasUsage = (d.count || 0) > 0;

            return (
              <div
                key={d.dateKey}
                className="tooltip tooltip-open:tooltip-top h-full relative z-20"
                data-tip={tip}
              >
                <div className="h-full flex flex-col">
                  <div className="flex-1 flex items-end">
                    <div
                      className={`mx-auto w-[4px] sm:w-[6px] rounded-full transition-colors ${
                        hasUsage
                          ? "bg-primary/80 hover:bg-primary"
                          : "bg-base-300/70 hover:bg-base-300"
                      }`}
                      style={{ height: `${Math.max(2, pct)}%` }}
                      aria-label={tip}
                    />
                  </div>
                  <div className="mt-1 text-[10px] text-base-content/50 text-center select-none">
                    {label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // /app/dashboard/layout.js 已经做了鉴权，这里兜底防御。
  if (!user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("total_credit,used_credit,sub_expired_at,price_id")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(profileError.message);
  }

  const totalCredit = profile?.total_credit || 0;
  const usedCredit = profile?.used_credit || 0;
  const availableCredit = Math.max(0, totalCredit - usedCredit);
  const subExpiredAt = profile?.sub_expired_at || null;
  const subscriptionActive = isActiveSubscription(subExpiredAt);

  const countTasksByStatus = async (status) => {
    // 这里显式 join 到 jobs 来按 user 过滤（不依赖 RLS 是否正确配置）。
    const { count, error } = await supabase
      .from("verification_email_tasks")
      .select("id,verification_jobs!inner(user_id)", { count: "exact", head: true })
      .eq("verification_jobs.user_id", user.id)
      .eq("status", status);
    if (error) throw new Error(error.message);
    return count || 0;
  };

  const countJobsByStatus = async (status) => {
    const { count, error } = await supabase
      .from("verification_jobs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", status);
    if (error) throw new Error(error.message);
    return count || 0;
  };

  const [
    safeEmailCount,
    bounceEmailCount,
    queueEmailCount,
    observingEmailCount,
    queueCount,
    verifyingCount,
    completeCount,
  ] = await Promise.all([
    countTasksByStatus("SAFE"),
    countTasksByStatus("BOUNCE"),
    countTasksByStatus("QUEUE"),
    countTasksByStatus("OBSERVING"),
    countJobsByStatus("QUEUE"),
    countJobsByStatus("VERIFYING"),
    countJobsByStatus("COMPLETE"),
  ]);

  const verifiedEmailCount = safeEmailCount + bounceEmailCount;
  const inProgressEmailCount = queueEmailCount + observingEmailCount;

  const usageDays = 14;
  const usageStart = new Date();
  usageStart.setHours(0, 0, 0, 0);
  usageStart.setDate(usageStart.getDate() - (usageDays - 1));

  const [{ data: usageJobs, error: usageJobsError }, { data: recentJobs, error: recentJobsError }] =
    await Promise.all([
      supabase
        .from("verification_jobs")
        .select("created_at,unique_emails")
        .eq("user_id", user.id)
        .gte("created_at", usageStart.toISOString())
        .order("created_at", { ascending: true }),
      supabase
        .from("verification_jobs")
        .select("id,name,status,unique_emails,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3),
    ]);

  if (usageJobsError) {
    throw new Error(usageJobsError.message);
  }
  if (recentJobsError) {
    throw new Error(recentJobsError.message);
  }

  const dayMap = new Map();
  for (let i = 0; i < usageDays; i += 1) {
    const d = new Date(usageStart);
    d.setDate(d.getDate() + i);
    const key = toDateKey(d.toISOString());
    if (key) dayMap.set(key, 0);
  }
  (usageJobs || []).forEach((job) => {
    const key = toDateKey(job.created_at);
    if (!key || !dayMap.has(key)) return;
    dayMap.set(key, (dayMap.get(key) || 0) + (job.unique_emails || 0));
  });
  const usageSeries = Array.from(dayMap.entries()).map(([dateKey, count]) => {
    const shortLabel = dateKey.slice(5).replace("-", "/"); // MM/DD
    return { dateKey, count, label: shortLabel };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <div className="text-sm text-base-content/60">Dashboard</div>
        </div>
      </div>

      {!subscriptionActive ? (
        <div className="alert alert-warning">
          <span>
            No active subscription. Subscribe to start validating email lists.
          </span>
          <div>
            <Link className="btn btn-sm btn-outline" href="/dashboard/plans">
              View plans
            </Link>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Emails verified"
          value={verifiedEmailCount.toLocaleString()}
        />
        <StatCard label="Valid (Safe)" value={safeEmailCount.toLocaleString()} />
        <StatCard label="Invalid (Bounce)" value={bounceEmailCount.toLocaleString()} />
        <StatCard
          label="In progress"
          value={inProgressEmailCount.toLocaleString()}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 h-full flex flex-col gap-4">
          <div className="flex-1 min-h-[260px]">
            <UsageChart days={usageSeries} />
          </div>

          <div className="bg-base-100 border border-base-300 rounded-xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="text-lg font-semibold">Recent jobs</div>
              <Link className="btn btn-sm btn-ghost" href="/dashboard/validate">
                View all
              </Link>
            </div>

            <div className="mt-3 space-y-2">
              {(recentJobs || []).length ? (
                (recentJobs || []).map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-base-200 bg-base-100 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <Link
                        className="block text-sm font-medium truncate hover:underline"
                        href={`/dashboard/validate/${job.id}`}
                        title={job.name || job.id}
                      >
                        {job.name || job.id}
                      </Link>
                      <div className="text-xs text-base-content/60">
                        {(job.unique_emails || 0).toLocaleString()} emails
                        {job.created_at ? (
                          <span className="ml-2">
                            ·{" "}
                            {new Intl.DateTimeFormat("en-US", {
                              month: "short",
                              day: "2-digit",
                            }).format(new Date(job.created_at))}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="shrink-0">
                      <JobStatusBadge status={job.status} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-base-content/60">
                  No jobs yet. Upload a CSV to get started.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="h-full flex flex-col gap-4">
          <div className="bg-base-100 border border-base-300 rounded-xl p-5">
            <div className="text-lg font-semibold">Quick actions</div>
            <div className="mt-3 grid gap-2">
              <Link className="btn btn-primary" href="/dashboard/validate">
                Validate emails
              </Link>
              <Link className="btn btn-outline" href="/dashboard/plans">
                Manage subscription
              </Link>
            </div>
          </div>

          <div className="bg-base-100 border border-base-300 rounded-xl p-5 flex-1">
            <div className="text-lg font-semibold">Validate Job status</div>
            <div className="mt-3 grid gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-base-content/70">Queue</span>
                <span className="font-semibold">{queueCount.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base-content/70">Verifying</span>
                <span className="font-semibold">
                  {verifyingCount.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base-content/70">Complete</span>
                <span className="font-semibold">
                  {completeCount.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="mt-3 border-t border-base-200 pt-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-base-content/70">Available credits</span>
                <span className="font-semibold">
                  {availableCredit.toLocaleString()}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-base-content/60">
                <span>Used</span>
                <span>{usedCredit.toLocaleString()}</span>
              </div>
            </div>
            {subExpiredAt ? (
              <div className="mt-3 text-xs text-base-content/60">
                Subscription renews on{" "}
                {new Intl.DateTimeFormat("en-US", {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                }).format(new Date(subExpiredAt))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
