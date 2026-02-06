import Link from "next/link";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const buildPageItems = ({ page, totalPages }) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const items = [];
  const left = Math.max(2, page - 1);
  const right = Math.min(totalPages - 1, page + 1);

  items.push(1);
  if (left > 2) items.push("…");
  for (let i = left; i <= right; i += 1) items.push(i);
  if (right < totalPages - 1) items.push("…");
  items.push(totalPages);

  return items;
};

const Pagination = ({ basePath, page, perPage, total }) => {
  const totalPages = Math.max(1, Math.ceil((total || 0) / perPage));
  const currentPage = clamp(page, 1, totalPages);

  const makeHref = (nextPage) => {
    const url = new URL(basePath, "http://example.local");
    url.searchParams.set("page", String(nextPage));
    return `${url.pathname}?${url.searchParams.toString()}`;
  };

  const items = buildPageItems({ page: currentPage, totalPages });
  const from = total ? (currentPage - 1) * perPage + 1 : 0;
  const to = Math.min(currentPage * perPage, total || 0);

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div className="text-sm text-base-content/60">
        {total ? (
          <>
            Showing <span className="font-medium text-base-content">{from}</span>
            –<span className="font-medium text-base-content">{to}</span> of{" "}
            <span className="font-medium text-base-content">{total}</span>
          </>
        ) : (
          <>No results</>
        )}
      </div>

      <div className="join">
        <Link
          className={`btn btn-sm join-item ${
            currentPage === 1 ? "btn-disabled" : ""
          }`}
          href={makeHref(currentPage - 1)}
          aria-disabled={currentPage === 1}
          tabIndex={currentPage === 1 ? -1 : 0}
        >
          Prev
        </Link>

        {items.map((it, idx) =>
          it === "…" ? (
            <button
              key={`ellipsis-${idx}`}
              type="button"
              className="btn btn-sm join-item btn-disabled"
              aria-disabled="true"
              tabIndex={-1}
            >
              …
            </button>
          ) : (
            <Link
              key={`page-${it}`}
              className={`btn btn-sm join-item ${
                it === currentPage ? "btn-primary" : "btn-ghost"
              }`}
              href={makeHref(it)}
              aria-current={it === currentPage ? "page" : undefined}
            >
              {it}
            </Link>
          )
        )}

        <Link
          className={`btn btn-sm join-item ${
            currentPage === totalPages ? "btn-disabled" : ""
          }`}
          href={makeHref(currentPage + 1)}
          aria-disabled={currentPage === totalPages}
          tabIndex={currentPage === totalPages ? -1 : 0}
        >
          Next
        </Link>
      </div>
    </div>
  );
};

export default Pagination;

