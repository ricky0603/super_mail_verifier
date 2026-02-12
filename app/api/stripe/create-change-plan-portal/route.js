import { NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";
import Stripe from "stripe";
import { createCustomerPortalFlow } from "@/libs/stripe";

const isActiveSubscription = (subExpiredAt) => {
  if (!subExpiredAt) return false;
  const ms = new Date(subExpiredAt).getTime();
  return Number.isFinite(ms) && ms > Date.now();
};

export async function POST(req) {
  try {
    const supabase = await createClient();

    const body = await req.json().catch(() => ({}));
    const priceId = typeof body?.priceId === "string" ? body.priceId : "";
    const returnUrl = typeof body?.returnUrl === "string" ? body.returnUrl : "";

    if (!priceId) {
      return NextResponse.json({ error: "priceId is required" }, { status: 400 });
    }
    if (!returnUrl) {
      return NextResponse.json({ error: "returnUrl is required" }, { status: 400 });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id,customer_id,subscription_id,sub_expired_at")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    if (!profile?.customer_id) {
      return NextResponse.json(
        { error: "Missing Stripe customer. Make a purchase first." },
        { status: 400 }
      );
    }

    if (!profile?.subscription_id || !isActiveSubscription(profile?.sub_expired_at)) {
      return NextResponse.json(
        { error: "No active subscription. Subscribe first." },
        { status: 409 }
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Missing STRIPE_SECRET_KEY" }, { status: 500 });
    }

    // We need the subscription item id to build subscription_update_confirm flow.
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const subscription = await stripe.subscriptions.retrieve(profile.subscription_id);
    const subItemId = subscription?.items?.data?.[0]?.id;
    if (!subItemId) {
      return NextResponse.json(
        { error: "Missing subscription item id" },
        { status: 500 }
      );
    }

    const url = await createCustomerPortalFlow({
      customerId: profile.customer_id,
      returnUrl,
      flowData: {
        type: "subscription_update_confirm",
        subscription_update_confirm: {
          subscription: profile.subscription_id,
          items: [
            {
              id: subItemId,
              price: priceId,
              quantity: 1,
            },
          ],
        },
      },
    });

    if (!url) {
      return NextResponse.json(
        { error: "Failed to create billing portal session." },
        { status: 500 }
      );
    }

    return NextResponse.json({ url });
  } catch (e) {
    console.error("create-change-plan-portal failed", {
      message: e?.message,
      type: e?.type,
      code: e?.code,
      requestId: e?.requestId,
      statusCode: e?.statusCode,
    });
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
