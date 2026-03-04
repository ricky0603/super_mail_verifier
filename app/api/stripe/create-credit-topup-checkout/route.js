import { NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";
import config from "@/config";
import { sendGa4EventServer } from "@/libs/analytics/ga4-server";
import { getGaSessionIdFromRequestCookie, resolveGaClientId } from "@/libs/analytics/ga4-request";
import { createCreditTopupCheckout } from "@/libs/stripe";

export const dynamic = "force-dynamic";

const MAX_REQUIRED_CREDITS = 200000;

const isActiveSubscription = (subExpiredAt) => {
  if (!subExpiredAt) return false;
  const ms = new Date(subExpiredAt).getTime();
  return Number.isFinite(ms) && ms > Date.now();
};

export async function POST(req) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const requiredCredits = Number(body?.requiredCredits);
    const successUrl = typeof body?.successUrl === "string" ? body.successUrl : "";
    const cancelUrl = typeof body?.cancelUrl === "string" ? body.cancelUrl : "";
    const { clientId: gaClientId } = resolveGaClientId({
      req,
      bodyValue: body?.gaClientId,
    });
    const gaSessionId = getGaSessionIdFromRequestCookie(req);

    if (!Number.isFinite(requiredCredits) || requiredCredits <= 0) {
      return NextResponse.json(
        { error: "requiredCredits must be a positive number" },
        { status: 400 }
      );
    }

    if (!successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: "successUrl and cancelUrl are required" },
        { status: 400 }
      );
    }

    if (requiredCredits > MAX_REQUIRED_CREDITS) {
      return NextResponse.json(
        { error: `requiredCredits too large (max ${MAX_REQUIRED_CREDITS})` },
        { status: 400 }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id,customer_id,sub_expired_at,total_credit,used_credit")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    if (!isActiveSubscription(profile?.sub_expired_at)) {
      return NextResponse.json(
        { error: "Subscription required" },
        { status: 403 }
      );
    }

    const availableCredit = Math.max(
      0,
      (profile?.total_credit || 0) - (profile?.used_credit || 0)
    );
    const shortage = Math.max(0, requiredCredits - availableCredit);

    if (shortage === 0) {
      return NextResponse.json({ error: "No credits needed" }, { status: 400 });
    }

    const priceId = config?.stripe?.creditTopupPriceId;
    if (!priceId) {
      return NextResponse.json(
        { error: "Missing config.stripe.creditTopupPriceId" },
        { status: 500 }
      );
    }

    const stripeSession = await createCreditTopupCheckout({
      priceId,
      quantity: shortage,
      successUrl,
      cancelUrl,
      clientReferenceId: user.id,
      user: {
        email: user.email,
        customerId: profile?.customer_id || null,
      },
      metadata: {
        purpose: "credit_topup",
        user_id: String(user.id),
        credits: String(shortage),
        ...(gaClientId ? { ga_client_id: gaClientId } : {}),
      },
    });

    const amountFromSession = Number.isFinite(stripeSession?.amountTotal)
      ? Number(stripeSession.amountTotal) / 100
      : undefined;
    const topupItem = {
      item_id: priceId,
      item_name: Number.isFinite(shortage)
        ? `Credit Topup (${Math.floor(shortage)} credits)`
        : "Credit Topup",
      item_category: "credits",
      quantity: 1,
      ...(Number.isFinite(amountFromSession) ? { price: amountFromSession } : {}),
    };

    await sendGa4EventServer({
      clientId: gaClientId,
      userId: user.id,
      eventName: "begin_checkout",
      params: {
        currency: (stripeSession?.currency || "usd").toUpperCase(),
        value: amountFromSession,
        items: [topupItem],
        session_id: gaSessionId,
        engagement_time_msec: 100,
      },
    });

    return NextResponse.json({ url: stripeSession?.url, shortage });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
