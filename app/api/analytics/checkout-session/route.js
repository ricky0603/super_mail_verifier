import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/libs/supabase/server";
import { requireServerEnv } from "@/libs/env";

export const dynamic = "force-dynamic";

const getStripe = () =>
  new Stripe(requireServerEnv("STRIPE_SECRET_KEY"), {
    apiVersion: "2023-08-16",
    httpClient: Stripe.createFetchHttpClient(),
    timeout: 20000,
  });

const toAmount = (value) => {
  if (!Number.isFinite(value)) return undefined;
  return Number(value) / 100;
};

const parseString = (value) => {
  if (typeof value === "string" && value) return value;
  return undefined;
};

const buildItem = ({
  itemId,
  itemName,
  itemCategory,
  price,
  quantity,
}) => ({
  item_id: itemId || itemName || "item",
  ...(itemName ? { item_name: itemName } : {}),
  ...(itemCategory ? { item_category: itemCategory } : {}),
  ...(Number.isFinite(price) ? { price } : {}),
  ...(Number.isFinite(quantity) && quantity > 0 ? { quantity } : { quantity: 1 }),
});

const getInvoiceId = (invoice) => {
  if (typeof invoice === "string" && invoice) return invoice;
  if (invoice && typeof invoice === "object" && typeof invoice.id === "string") {
    return invoice.id;
  }
  return undefined;
};

const getSubscriptionId = (subscription) => {
  if (typeof subscription === "string" && subscription) return subscription;
  if (
    subscription &&
    typeof subscription === "object" &&
    typeof subscription.id === "string"
  ) {
    return subscription.id;
  }
  return undefined;
};

const resolveSubscriptionInvoiceId = async (stripe, subscriptionId) => {
  if (!subscriptionId) return undefined;

  const invoices = await stripe.invoices.list({
    subscription: subscriptionId,
    limit: 10,
  });

  const paidInvoice = invoices.data.find((invoice) => invoice?.status === "paid");
  if (paidInvoice?.id) return paidInvoice.id;

  return invoices.data[0]?.id;
};

export async function GET(req) {
  try {
    const requestUrl = new URL(req.url);
    const sessionId = requestUrl.searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json({ error: "session_id is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["invoice", "subscription", "line_items.data.price"],
    });

    const ownerId = parseString(session?.client_reference_id) || parseString(session?.metadata?.user_id);
    if (ownerId && ownerId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const mode = session?.mode;
    const firstLinePriceId = session?.line_items?.data?.[0]?.price?.id;

    if (mode === "subscription") {
      const invoiceIdDirect = getInvoiceId(session?.invoice);
      const subscriptionId = getSubscriptionId(session?.subscription);
      const invoiceId =
        invoiceIdDirect || (await resolveSubscriptionInvoiceId(stripe, subscriptionId));

      if (!invoiceId) {
        return NextResponse.json(
          { error: "Invoice not ready yet, please refresh in a few seconds." },
          { status: 409 }
        );
      }

      const value = toAmount(session?.amount_total);
      const subscriptionItem = buildItem({
        itemId: firstLinePriceId || "subscription",
        itemName: "Subscription Plan",
        itemCategory: "subscription",
        price: value,
        quantity: 1,
      });

      return NextResponse.json({
        transaction_id: invoiceId,
        value,
        currency: (session?.currency || "usd").toUpperCase(),
        items: [subscriptionItem],
      });
    }

    const value = toAmount(session?.amount_total);
    const credits = Number(session?.metadata?.credits);
    const unitPrice =
      Number.isFinite(value) && Number.isFinite(credits) && credits > 0
        ? value / Math.floor(credits)
        : value;
    const topupItem = buildItem({
      itemId: firstLinePriceId || parseString(session?.metadata?.source_price_id) || "credit_topup",
      itemName: "Credit Topup",
      itemCategory: "credits",
      price: unitPrice,
      quantity: Number.isFinite(credits) && credits > 0 ? Math.floor(credits) : 1,
    });

    return NextResponse.json({
      transaction_id: session.id,
      value,
      currency: (session?.currency || "usd").toUpperCase(),
      items: [topupItem],
    });
  } catch (error) {
    console.error("checkout-session analytics error:", error?.message || error);
    return NextResponse.json({ error: "Failed to load checkout session" }, { status: 500 });
  }
}
