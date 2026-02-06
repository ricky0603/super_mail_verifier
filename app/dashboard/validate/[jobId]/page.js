import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/libs/supabase/server";
import Pagination from "@/components/dashboard/Pagination";

const DownloadIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="M7 10l5 5 5-5" />
    <path d="M12 15V3" />
  </svg>
);

const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  if (Number.isNaN(diffMs)) return "-";
  if (diffMs < 60 * 1000) return "Just now";
  const diffMinutes = Math.floor(diffMs / (60 * 1000));
  if (diffMinutes < 60)
    return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24)
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
};

const formatDetailLabel = (detail) => {
  if (!detail) return "-";
  if (detail === "AR_OUT_OF_OFFICE") return "Out of office";
  if (detail === "AR_RESIGNED") return "Resigned";
  if (detail === "AR_RECEIVE_CONFIRM") return "Receive confirm";
  if (detail === "NO_SIGNAL_SO_FAR") return "No signal so far";
  if (detail === "B_ADDRESS_NOT_FOUND") return "Address not found";
  if (detail === "B_REJECT") return "Rejected";
  return String(detail);
};

const StatusPill = ({ status }) => {
  if (status === "SAFE")
    return <span className="badge badge-success">Safe</span>;
  if (status === "BOUNCE")
    return <span className="badge badge-error">Bounce</span>;
  if (status === "QUEUE")
    return <span className="badge badge-ghost">Queue</span>;
  return <span className="badge badge-ghost">Observing</span>;
};

export default async function ValidateDetailPage({ params, searchParams }) {
  const resolvedParams = await Promise.resolve(params);
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const perPage = 50;
  const page =
    typeof resolvedSearchParams?.page === "string"
      ? Number(resolvedSearchParams.page)
      : 1;
  const currentPage = Number.isFinite(page) && page > 0 ? page : 1;
  const from = (currentPage - 1) * perPage;
  const to = from + perPage - 1;

  const supabase = await createClient();
  const jobId = resolvedParams?.jobId;
  const isUuid =
    typeof jobId === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      jobId
    );

  if (!isUuid) {
    notFound();
  }

  const { data: job, error: jobError } = await supabase
    .from("verification_jobs")
    .select("id,name")
    .eq("id", jobId)
    .maybeSingle();

  if (jobError) {
    throw new Error(jobError.message);
  }

  if (!job) {
    notFound();
  }

  const queryWithTooltip = supabase
    .from("verification_email_tasks")
    .select("*", { count: "exact" })
    .eq("job_id", jobId)
    .order("updated_at", { ascending: false })
    .range(from, to);

  const { data: emailTasks, error: tasksError, count } = await queryWithTooltip;

  if (tasksError) {
    throw new Error(tasksError.message);
  }

  const rows = (emailTasks || []).map((row) => ({
    id: row.id,
    email: row.email,
    status: row.status,
    detail: formatDetailLabel(row.detail),
    tooltip: row.detail_tooltip || "",
    updatedAt: row.updated_at ? formatRelativeTime(row.updated_at) : "-",
  }));

  const jobName = job?.name || jobId;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Validate Detail</h1>
          <div className="text-sm text-base-content/60">
            <Link className="hover:underline" href="/dashboard">
              Dashboard
            </Link>
            <span className="mx-1">/</span>
            <Link className="hover:underline" href="/dashboard/validate">
              Validate
            </Link>
            <span className="mx-1">/</span>
            <span>{jobName}</span>
          </div>
        </div>

        <button className="btn btn-ghost" aria-label="Download">
          <DownloadIcon className="w-6 h-6" />
        </button>
      </div>

      <div className="bg-base-100 border border-base-300 rounded-xl overflow-hidden">
        <div className="w-full">
          <table className="table table-fixed">
            <thead>
              <tr>
                <th className="w-[360px]">Email</th>
                <th className="w-32">Status</th>
                <th>Detail</th>
                <th className="w-40">Last Update</th>
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map((row) => (
                  <tr key={row.id}>
                    <td className="font-medium whitespace-normal break-words">
                      {row.email}
                    </td>
                  <td>
                    <StatusPill status={row.status} />
                  </td>
                  <td>
                    {row.tooltip ? (
                      <span
                        className="tooltip tooltip-left"
                        data-tip={row.tooltip}
                      >
                        <span className="underline decoration-dotted underline-offset-4">
                          {row.detail}
                        </span>
                      </span>
                    ) : (
                      <span className="text-base-content/80">{row.detail}</span>
                    )}
                  </td>
                  <td className="text-base-content/70">{row.updatedAt}</td>
                </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4}>
                    <div className="p-8 text-center text-base-content/60">
                      No emails found for this job.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-base-200">
          <Pagination
            basePath={`/dashboard/validate/${jobId}`}
            page={currentPage}
            perPage={perPage}
            total={count || 0}
          />
        </div>
      </div>
    </div>
  );
}
