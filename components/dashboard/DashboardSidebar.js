"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import config from "@/config";

const DashboardSidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-base-300 bg-base-100 min-h-screen">
      <div className="h-16 flex items-center px-6 border-b border-base-300">
        <Link href="/dashboard" className="font-semibold text-base-content/80">
          {config?.appName || "Dashboard"}
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-2">
        <Link
          href="/dashboard"
          className={`btn btn-ghost justify-start w-full ${
            pathname === "/dashboard" ? "btn-active" : ""
          }`}
        >
          Dashboard
        </Link>

        <Link
          href="/dashboard/validate"
          className={`btn btn-ghost justify-start w-full ${
            pathname?.startsWith("/dashboard/validate") ? "btn-active" : ""
          }`}
        >
          Validate
        </Link>

        <Link
          href="/dashboard/plans"
          className={`btn btn-ghost justify-start w-full ${
            pathname?.startsWith("/dashboard/plans") ? "btn-active" : ""
          }`}
        >
          Pricing & Plans
        </Link>
      </nav>

      <div className="p-3 border-t border-base-300">
        <a
          className="btn btn-outline w-full justify-center gap-2"
          href="mailto:?subject=Request%20support"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5 opacity-80"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902.848.137 1.705.248 2.57.331v3.443a.75.75 0 001.28.53l3.58-3.579a.78.78 0 01.527-.224 41.202 41.202 0 005.183-.5c1.437-.232 2.43-1.49 2.43-2.903V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0010 2zm0 7a1 1 0 100-2 1 1 0 000 2zM8 8a1 1 0 11-2 0 1 1 0 012 0zm5 1a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
          Request support
        </a>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
