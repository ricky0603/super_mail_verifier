"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import config from "@/config";
import apiClient from "@/libs/api";
import ButtonCheckout from "@/components/ButtonCheckout";
import { formatUsdPerCredit } from "@/libs/pricing";

const formatPrice = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "";
  return `$${n}`;
};

const getPlanByPriceId = (priceId) => {
  return (config?.stripe?.plans || []).find((p) => p.priceId === priceId) || null;
};

export default function DashboardPlans() {
  const [balance, setBalance] = useState({
    totalCredit: 0,
    usedCredit: 0,
    availableCredit: 0,
    subExpiredAt: null,
    isSubscriptionActive: false,
    priceId: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);

  const activePlan = useMemo(() => {
    if (!balance?.priceId) return null;
    return getPlanByPriceId(balance.priceId);
  }, [balance?.priceId]);

  const refreshBalance = async () => {
    const res = await fetch("/api/credits/balance");
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(body?.error || "Failed to load credit balance.");
    }
    setBalance({
      totalCredit: body?.totalCredit || 0,
      usedCredit: body?.usedCredit || 0,
      availableCredit: body?.availableCredit || 0,
      subExpiredAt: body?.subExpiredAt || null,
      isSubscriptionActive: Boolean(body?.isSubscriptionActive),
      priceId: body?.priceId || null,
    });
  };

  useEffect(() => {
    (async () => {
      try {
        await refreshBalance();
      } catch (e) {
        console.error(e);
        toast.error(e?.message || "Failed to load balance.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const openBillingPortal = async () => {
    setIsOpeningPortal(true);
    try {
      const { url } = await apiClient.post("/stripe/create-portal", {
        returnUrl: window.location.href,
      });
      window.location.href = url;
    } finally {
      setIsOpeningPortal(false);
    }
  };

  const openChangePlanFlow = async (priceId) => {
    setIsOpeningPortal(true);
    try {
      const { url } = await apiClient.post("/stripe/create-change-plan-portal", {
        priceId,
        returnUrl: window.location.href,
      });
      window.location.href = url;
    } finally {
      setIsOpeningPortal(false);
    }
  };

  const plans = config?.stripe?.plans || [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Pricing & Plans</h1>
          <div className="text-sm text-base-content/60">
            Dashboard <span className="mx-1">/</span> Pricing & Plans
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="btn btn-ghost"
            onClick={() => {
              setIsLoading(true);
              refreshBalance()
                .then(() => toast.success("Balance updated."))
                .catch((e) => toast.error(e?.message || "Failed to refresh."))
                .finally(() => setIsLoading(false));
            }}
            disabled={isLoading}
          >
            Refresh
          </button>
          <button
            className="btn btn-outline"
            onClick={() => openBillingPortal().catch(() => {})}
            disabled={isOpeningPortal}
          >
            {isOpeningPortal ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              "Manage billing"
            )}
          </button>
        </div>
      </div>

      {!balance?.isSubscriptionActive ? (
        <div className="alert alert-warning">
          <span>
            No active subscription. Subscribe to start validating email lists.
          </span>
        </div>
      ) : null}

      <div className="bg-base-100 border border-base-300 rounded-xl p-5">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="text-sm text-base-content/60">Current plan</div>
            <div className="text-lg font-semibold">
              {activePlan?.name || (balance?.isSubscriptionActive ? "Subscribed" : "None")}
            </div>
            {balance?.subExpiredAt ? (
              <div className="text-sm text-base-content/60">
                Renews on{" "}
                {new Intl.DateTimeFormat("en-US", {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                }).format(new Date(balance.subExpiredAt))}
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-base-200 rounded-lg p-3 text-center">
              <div className="text-xs text-base-content/60">Total</div>
              <div className="font-semibold">{balance.totalCredit.toLocaleString()}</div>
            </div>
            <div className="bg-base-200 rounded-lg p-3 text-center">
              <div className="text-xs text-base-content/60">Used</div>
              <div className="font-semibold">{balance.usedCredit.toLocaleString()}</div>
            </div>
            <div className="bg-base-200 rounded-lg p-3 text-center">
              <div className="text-xs text-base-content/60">Available</div>
              <div className="font-semibold">
                {balance.availableCredit.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = balance?.isSubscriptionActive && balance?.priceId === plan.priceId;
          const isFeatured = Boolean(plan.isFeatured);
          const unitPriceLabel = formatUsdPerCredit({
            priceUsd: plan.price,
            credits: plan.creditsPerCycle,
          });
          const features = Array.isArray(plan.features) ? plan.features : [];
          const restFeatures = features.filter((f) => {
            const name = String(f?.name || "").toLowerCase();
            return !name.includes("credits / month") && !name.includes("credits per month");
          });

          return (
            <div
              key={plan.priceId}
              className={`relative rounded-xl border bg-base-100 ${
                isFeatured ? "border-primary" : "border-base-300"
              }`}
            >
              {isFeatured ? (
                <div className="absolute top-4 right-4">
                  <span className="badge badge-primary">Popular</span>
                </div>
              ) : null}

              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <div className="text-lg font-bold">{plan.name}</div>
                  {plan.description ? (
                    <div className="text-sm text-base-content/60">
                      {plan.description}
                    </div>
                  ) : null}
                </div>

                <div className="flex items-end gap-2">
                  <div className="text-4xl font-extrabold tracking-tight">
                    {formatPrice(plan.price)}
                  </div>
                  <div className="text-sm text-base-content/60 mb-1">/ month</div>
                </div>

                <ul className="text-sm space-y-2">
                  <li className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-4 h-4 opacity-80"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>
                      {(plan.creditsPerCycle || 0).toLocaleString()} credits / month{" "}
                      {unitPriceLabel ? (
                        <span className="text-base-content/60">({unitPriceLabel})</span>
                      ) : null}
                    </span>
                  </li>
                  {restFeatures.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-4 h-4 opacity-80"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{feature.name}</span>
                    </li>
                  ))}
                </ul>

                {!Array.isArray(plan.features) ? (
                  <div className="text-sm text-base-content/60">
                    {(plan.creditsPerCycle || 0).toLocaleString()} credits / month{" "}
                    {unitPriceLabel ? (
                      <span className="text-base-content/60">({unitPriceLabel})</span>
                    ) : null}
                  </div>
                ) : null}

	                <div className="pt-2">
	                  {isCurrent ? (
	                    <button className="btn btn-disabled btn-block" disabled>
	                      Current plan
	                    </button>
	                  ) : balance?.isSubscriptionActive ? (
	                    <button
	                      className="btn btn-primary btn-block"
	                      onClick={() => openChangePlanFlow(plan.priceId).catch(() => {})}
	                      disabled={isOpeningPortal}
	                    >
	                      {isOpeningPortal ? (
	                        <span className="loading loading-spinner loading-sm" />
	                      ) : (
	                        `Upgrade to ${plan.name}`
	                      )}
	                    </button>
	                  ) : (
	                    <ButtonCheckout
	                      priceId={plan.priceId}
	                      mode="subscription"
                      label={`Subscribe to ${plan.name}`}
                      className="btn btn-primary btn-block"
                      showIcon={false}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
