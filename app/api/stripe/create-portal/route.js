import { NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";
import { createCustomerPortal } from "@/libs/stripe";

export async function POST(req) {
  try {
    const supabase = await createClient();

    const body = await req.json().catch(() => ({}));
    const returnUrl = typeof body?.returnUrl === "string" ? body.returnUrl : "";
    if (!returnUrl) {
      return NextResponse.json({ error: "returnUrl is required" }, { status: 400 });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // User who are not logged in can't make a purchase
    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to view billing information." },
        { status: 401 }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("customer_id")
      .eq("id", user?.id)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    if (!profile?.customer_id) {
      return NextResponse.json(
        {
          error:
            "You don't have a billing account yet. Make a purchase first.",
        },
        { status: 400 }
      );
    }

    const stripePortalUrl = await createCustomerPortal({
      customerId: profile.customer_id,
      returnUrl,
    });

    if (!stripePortalUrl) {
      return NextResponse.json(
        {
          error:
            "Failed to create billing portal session. Make sure Stripe Customer Portal is enabled.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: stripePortalUrl,
    });
  } catch (e) {
    console.error("create-portal failed", {
      message: e?.message,
      type: e?.type,
      code: e?.code,
      requestId: e?.requestId,
      statusCode: e?.statusCode,
    });
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
