"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  hasPurchaseSent,
  markPurchaseSent,
  trackEvent,
} from "@/libs/analytics/ga4-client";

const SuccessPage = () => {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const source = searchParams.get("source") || "unknown";

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [transactionId, setTransactionId] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!sessionId) {
        setError("Missing checkout session id.");
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `/api/analytics/checkout-session?session_id=${encodeURIComponent(
            sessionId
          )}&source=${encodeURIComponent(source)}`
        );
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(body?.error || "Failed to load purchase payload.");
        }

        const transactionId = body?.transaction_id;
        if (!transactionId) {
          throw new Error("Missing transaction id.");
        }
        setTransactionId(transactionId);

        if (!hasPurchaseSent(transactionId)) {
          trackEvent("purchase_client_ack", {
            transaction_id: transactionId,
            value: body?.value,
            currency: body?.currency || "USD",
            source,
            items: Array.isArray(body?.items) ? body.items : undefined,
          });
          markPurchaseSent(transactionId);
        }
      } catch (e) {
        setError(e?.message || "Failed to report purchase event.");
      } finally {
        setIsLoading(false);
      }
    };

    load().catch(() => {});
  }, [sessionId, source]);

  const targetHref = useMemo(() => {
    if (source === "topup") return "/dashboard?topup=success";
    return "/dashboard";
  }, [source]);

  return (
    <main className="relative min-h-[75vh] overflow-hidden px-4 py-10 sm:px-6 sm:py-14">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(59,130,246,0.16),transparent_35%),radial-gradient(circle_at_85%_10%,rgba(16,185,129,0.16),transparent_32%),radial-gradient(circle_at_50%_100%,rgba(245,158,11,0.1),transparent_40%)]" />

      <section className="relative mx-auto w-full max-w-2xl rounded-3xl border border-base-300/70 bg-base-100/95 p-6 shadow-2xl backdrop-blur sm:p-10">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-success/15 text-success shadow-md shadow-success/20">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-9 w-9"
          >
            <path
              fillRule="evenodd"
              d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm14.28-2.03a.75.75 0 1 0-1.06-1.06l-4.22 4.22-1.72-1.72a.75.75 0 1 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.06 0l4.75-4.75Z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <p className="mx-auto mb-3 flex w-fit rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-success">
          Payment Confirmed
        </p>

        <h1 className="text-balance text-center text-3xl font-black tracking-tight sm:text-4xl">
          You are all set
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-pretty text-center text-base text-base-content/70 sm:text-lg">
          Your payment went through successfully. We have activated everything and you can continue in your dashboard.
        </p>

        <div className="mt-7 rounded-2xl border border-base-300/70 bg-base-200/40 p-4 sm:p-5">
          {isLoading ? (
            <div className="flex items-center justify-center gap-3 text-sm text-base-content/70">
              <span className="loading loading-spinner loading-sm" />
              <span>Syncing analytics event...</span>
            </div>
          ) : error ? (
            <p className="text-center text-sm font-medium text-error">
              Analytics sync issue: {error}
            </p>
          ) : (
            <div className="text-sm">
              <div className="flex items-start justify-between gap-3">
                <span className="text-base-content/60">Transaction ID</span>
                <span className="max-w-[62%] break-all text-right font-mono text-xs text-base-content/80 sm:text-sm">
                  {transactionId}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            href={targetHref}
            className="btn btn-primary btn-wide rounded-xl text-sm font-bold tracking-wide sm:text-base"
          >
            Continue to Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
};

export default SuccessPage;
