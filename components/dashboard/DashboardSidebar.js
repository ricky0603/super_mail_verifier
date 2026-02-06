import Link from "next/link";

const DashboardSidebar = () => {
  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-base-300 bg-base-100 min-h-screen">
      <div className="h-16 flex items-center px-6 border-b border-base-300">
        <div className="font-semibold text-base-content/80">Brand Area</div>
      </div>

      <nav className="flex-1 p-3">
        <Link
          href="/dashboard/validate"
          className="btn btn-ghost justify-start w-full"
        >
          Validate
        </Link>
      </nav>
    </aside>
  );
};

export default DashboardSidebar;
