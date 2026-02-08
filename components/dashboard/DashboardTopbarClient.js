"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { createClient } from "@/libs/supabase/client";

export default function DashboardTopbarClient({
  userLabel,
  userInitial,
  avatarUrl,
  availableCredit,
}) {
  const supabase = useMemo(() => createClient(), []);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await supabase.auth.signOut();
    } finally {
      window.location.href = "/signin";
    }
  };

  return (
    <header className="h-16 border-b border-base-300 bg-base-100">
      <div className="h-full px-6 flex items-center justify-end gap-6">
        <div className="flex items-center gap-2">
	          <div className="flex items-center gap-1">
	            <Link
	              href="/dashboard/plans"
	              className="inline-flex items-center h-6 text-sm text-base-content/70 hover:text-base-content transition-colors whitespace-nowrap"
	            >
	              Credits:{" "}
	              <span className="font-semibold text-base-content">
	                {availableCredit === null ? "—" : availableCredit.toLocaleString()} credits
	              </span>
	            </Link>

	            <span
	              className="tooltip tooltip-bottom flex items-center h-6"
	              data-tip="Credits can be used for validation. 1 credit = 1 successfully processed email address"
	            >
              <button
                type="button"
                className="inline-flex items-center justify-center w-6 h-6 text-base-content/70 hover:text-base-content transition-colors"
                aria-label="Credits info"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                  aria-hidden="true"
                >
                  <path d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                </svg>
              </button>
            </span>
          </div>
          <Link className="btn btn-xs btn-primary" href="/dashboard/plans">
            Buy credits
          </Link>
        </div>
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="flex items-center gap-3 min-w-0 px-2 py-1 rounded-lg hover:bg-base-200 transition-colors"
            aria-label="Account menu"
          >
            {avatarUrl ? (
              <div className="avatar">
                <div className="w-9 rounded-full">
                  <img
                    alt={userLabel}
                    src={avatarUrl}
                    className="w-9 h-9"
                    referrerPolicy="no-referrer"
                    width={36}
                    height={36}
                  />
                </div>
              </div>
            ) : (
              <div className="avatar placeholder">
                <div className="bg-base-200 text-base-content w-9 h-9 rounded-full flex items-center justify-center">
                  <span className="text-sm leading-none">{userInitial}</span>
                </div>
              </div>
            )}
            <div className="text-sm font-medium truncate flex items-center h-9 leading-none">
              {userLabel}
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4 opacity-60 shrink-0"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content menu p-2 shadow-xl bg-base-100 rounded-xl w-48 mt-2 border border-base-200"
          >
            <li>
              <button
                type="button"
                className="text-error"
                onClick={handleSignOut}
                disabled={isSigningOut}
              >
                {isSigningOut ? "Logging out..." : "Log out"}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
