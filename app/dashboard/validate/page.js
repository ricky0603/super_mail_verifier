import Link from "next/link";
import ValidateAddNewListModal from "@/components/dashboard/ValidateAddNewListModal";
import { createClient } from "@/libs/supabase/server";
import Pagination from "@/components/dashboard/Pagination";

const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const formatDateTimeParts = (dateString) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return { date: "-", time: "" };

  const datePart = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);

  const timePart = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);

  return { date: datePart, time: timePart };
};

const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  if (Number.isNaN(diffMs)) return "-";
  if (diffMs < 60 * 1000) return "Just now";
  const diffMinutes = Math.floor(diffMs / (60 * 1000));
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
};

const EyeIcon = ({ className }) => (
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
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

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

const StatusDot = ({ status }) => {
  if (status === "VERIFYING") {
    return (
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning opacity-60" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-warning" />
      </span>
    );
  }

  if (status === "COMPLETE") {
    return <span className="inline-block w-2.5 h-2.5 rounded-full bg-success" />;
  }

  return <span className="inline-block w-2.5 h-2.5 rounded-full bg-base-content/30" />;
};

const formatStatusLabel = (status) => {
  if (status === "QUEUE") return "Queue";
  if (status === "VERIFYING") return "Verifying";
  if (status === "COMPLETE") return "Complete";
  return status || "-";
};

export default async function ValidatePage({ searchParams }) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const perPage = 20;
  const page =
    typeof resolvedSearchParams?.page === "string"
      ? Number(resolvedSearchParams.page)
      : 1;
  const currentPage = Number.isFinite(page) && page > 0 ? page : 1;
  const from = (currentPage - 1) * perPage;
  const to = from + perPage - 1;

  const supabase = await createClient();

  const { data: jobs, error, count } = await supabase
    .from("verification_jobs")
    .select("id,name,unique_emails,status,created_at,updated_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const rows = await Promise.all(
    (jobs || []).map(async (job) => {
      const [{ count: safeCount }, { count: bounceCount }] = await Promise.all([
        supabase
          .from("verification_email_tasks")
          .select("id", { count: "exact", head: true })
          .eq("job_id", job.id)
          .eq("status", "SAFE"),
        supabase
          .from("verification_email_tasks")
          .select("id", { count: "exact", head: true })
          .eq("job_id", job.id)
          .eq("status", "BOUNCE"),
      ]);

      return {
        id: job.id,
        name: job.name,
        uniqueEmails: job.unique_emails,
        uploadDate: job.created_at ? formatDateTime(job.created_at) : "-",
        uploadDateParts: job.created_at ? formatDateTimeParts(job.created_at) : { date: "-", time: "" },
        status: job.status,
        statusLabel: formatStatusLabel(job.status),
        summary: `${safeCount || 0} Safe · ${bounceCount || 0} Bounce`,
        lastUpdate: job.updated_at ? formatRelativeTime(job.updated_at) : "-",
      };
    })
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Validate</h1>
          <div className="text-sm text-base-content/60">
            Dashboard <span className="mx-1">/</span> Validate
          </div>
        </div>

        <ValidateAddNewListModal />
      </div>

      {rows.length ? (
        <div className="bg-base-100 border border-base-300 rounded-xl overflow-hidden">
          <div className="w-full">
            <table className="table table-fixed">
              <thead>
                <tr>
                  <th className="w-[320px] lg:w-[360px]">Name</th>
                  <th className="w-28">Unique</th>
                  <th className="hidden md:table-cell w-44">Upload</th>
                  <th className="w-52">Status</th>
                  <th className="hidden lg:table-cell w-40">Last update</th>
                  <th className="w-24 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((job) => (
                  <tr key={job.id}>
                    <td className="align-top">
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                        <div className="min-w-0 font-medium text-sm leading-5 whitespace-normal break-words">
                          {job.name}
                        </div>
                        <span className="badge badge-ghost badge-sm shrink-0">
                          ID
                        </span>
                      </div>
                    </td>
                    <td className="font-semibold align-top">{job.uniqueEmails}</td>
                    <td className="hidden md:table-cell text-base-content/70 align-top">
                      <div className="leading-5">
                        <div className="whitespace-nowrap">{job.uploadDateParts?.date}</div>
                        <div className="text-xs text-base-content/60 whitespace-nowrap">
                          {job.uploadDateParts?.time}
                        </div>
                      </div>
                    </td>
                    <td className="align-top">
                      <div className="flex items-start gap-3">
                        <div className="pt-1">
                          <StatusDot status={job.status} />
                        </div>
                        <div className="space-y-0.5">
                          <div className="font-semibold">{job.statusLabel}</div>
                          <div className="text-xs text-base-content/60">
                            {job.summary}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden lg:table-cell text-base-content/70 align-top">
                      {job.lastUpdate}
                    </td>
                    <td className="align-top">
                      <div className="flex items-center justify-end gap-1">
                        {job.status === "COMPLETE" ? (
                          <button
                            className="btn btn-ghost btn-sm"
                            aria-label="Download"
                          >
                            <DownloadIcon className="w-5 h-5" />
                          </button>
                        ) : null}
                        <Link
                          className="btn btn-ghost btn-sm"
                          href={`/dashboard/validate/${job.id}`}
                          aria-label="View"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-base-100 border border-base-300 rounded-xl p-10 text-center">
          <div className="text-lg font-semibold">No lists yet</div>
          <div className="text-sm text-base-content/60 mt-1">
            Upload a CSV to create your first email verification job.
          </div>
        </div>
      )}

      <div className="bg-base-100 border border-base-300 rounded-xl px-4 py-3">
        <Pagination
          basePath="/dashboard/validate"
          page={currentPage}
          perPage={perPage}
          total={count || 0}
        />
      </div>
    </div>
  );
}
