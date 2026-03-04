import { createCheckout } from "@/libs/stripe";
import { sendGa4EventServer } from "@/libs/analytics/ga4-server";
import { getGaSessionIdFromRequestCookie, resolveGaClientId } from "@/libs/analytics/ga4-request";
import { createClient } from "@/libs/supabase/server";
import { NextResponse } from "next/server";
import config from "@/config";

const isActiveSubscription = (subExpiredAt) => {
  if (!subExpiredAt) return false;
  const ms = new Date(subExpiredAt).getTime();
  return Number.isFinite(ms) && ms > Date.now();
};

// This function is used to create a Stripe Checkout Session (one-time payment or subscription)
// It's called by the <ButtonCheckout /> component
// Users must be authenticated. It will prefill the Checkout data with their email and/or credit card (if any)
export async function POST(req) {
  const body = await req.json();

  if (!body.priceId) {
    return NextResponse.json(
      { error: "Price ID is required" },
      { status: 400 }
    );
  } else if (!body.successUrl || !body.cancelUrl) {
    return NextResponse.json(
      { error: "Success and cancel URLs are required" },
      { status: 400 }
    );
  } else if (!body.mode) {
    return NextResponse.json(
      {
        error:
          "Mode is required (either 'payment' for one-time payments or 'subscription' for recurring subscription)",
      },
      { status: 400 }
    );
  }

  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { priceId, mode, successUrl, cancelUrl, gaClientId: gaClientIdFromBody } = body;
    const { clientId: gaClientId } = resolveGaClientId({
      req,
      bodyValue: gaClientIdFromBody,
    });
    const gaSessionId = getGaSessionIdFromRequestCookie(req);

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user?.id)
      .maybeSingle();

    if (body.mode === "subscription" && isActiveSubscription(data?.sub_expired_at)) {
      return NextResponse.json(
        { error: "Already subscribed. Use Manage billing to change plans." },
        { status: 409 }
      );
    }

    const stripeSession = await createCheckout({
      priceId,
      mode,
      successUrl,
      cancelUrl,
      // If user is logged in, it will pass the user ID to the Stripe Session so it can be retrieved in the webhook later
      clientReferenceId: user?.id,
      user: {
        email: data?.email || user?.email,
        // If the user has already purchased, it will automatically prefill it's credit card
        customerId: data?.customer_id,
      },
      metadata: gaClientId
        ? {
            ga_client_id: String(gaClientId),
          }
        : undefined,
      // If you send coupons from the frontend, you can pass it here
      // couponId: body.couponId,
    });

    const plan = config?.stripe?.plans?.find((p) => p.priceId === priceId);
    const currency = (stripeSession?.currency || "usd").toUpperCase();
    const amountFromSession = Number.isFinite(stripeSession?.amountTotal)
      ? Number(stripeSession.amountTotal) / 100
      : null;
    const amountValue =
      Number.isFinite(amountFromSession) && amountFromSession > 0
        ? amountFromSession
        : plan?.price || undefined;
    const checkoutItem = {
      item_id: priceId,
      item_name:
        plan?.name || (mode === "subscription" ? "Subscription Plan" : "One-time Payment"),
      item_category: mode === "subscription" ? "subscription" : "one_time",
      quantity: 1,
      ...(Number.isFinite(amountValue) ? { price: amountValue } : {}),
    };

    await sendGa4EventServer({
      clientId: gaClientId,
      userId: user.id,
      eventName: "begin_checkout",
      params: {
        currency,
        value: amountValue,
        items: [checkoutItem],
        session_id: gaSessionId,
        engagement_time_msec: 100,
      },
    });

    return NextResponse.json({ url: stripeSession?.url });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
