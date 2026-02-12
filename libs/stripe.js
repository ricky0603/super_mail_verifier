import "server-only";

import Stripe from "stripe";
import { requireServerEnv } from "@/libs/env";

const createStripeClient = () => {
  const secretKey = requireServerEnv("STRIPE_SECRET_KEY");
  return new Stripe(secretKey, {
    apiVersion: "2023-08-16",
    httpClient: Stripe.createFetchHttpClient(),
    timeout: 20000,
  });
};

// This is used to create a Stripe Checkout for one-time payments. It's usually triggered with the <ButtonCheckout /> component. Webhooks are used to update the user's state in the database.
export const createCheckout = async ({
  priceId,
  mode,
  successUrl,
  cancelUrl,
  couponId,
  clientReferenceId,
  user,
}) => {
  const stripe = createStripeClient();

  const extraParams = {};
  const sessionParams = {};

  if (user?.customerId) {
    extraParams.customer = user.customerId;
  } else {
    if (mode === "payment") {
      extraParams.customer_creation = "always";
      // The option below costs 0.4% (up to $2) per invoice. Alternatively, you can use https://zenvoice.io/ to create unlimited invoices automatically.
      // extraParams.invoice_creation = { enabled: true };
      extraParams.payment_intent_data = { setup_future_usage: "on_session" };
    }
    if (user?.email) {
      extraParams.customer_email = user.email;
    }
    extraParams.tax_id_collection = { enabled: true };
  }

  if (mode === "subscription" && clientReferenceId) {
    // Persist user id on the subscription so invoice.paid can map back to the user.
    sessionParams.subscription_data = {
      metadata: {
        user_id: String(clientReferenceId),
      },
    };
  }

  const stripeSession = await stripe.checkout.sessions.create({
    mode,
    allow_promotion_codes: true,
    client_reference_id: clientReferenceId,
    automatic_tax: { enabled: true },
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    discounts: couponId
      ? [
          {
            coupon: couponId,
          },
        ]
      : [],
    success_url: successUrl,
    cancel_url: cancelUrl,
    ...sessionParams,
    ...extraParams,
  });

  return stripeSession.url;
};

const parseDecimal = (value) => {
  const s = String(value || "").trim();
  if (!s) return null;
  if (!/^\d+(\.\d+)?$/.test(s)) return null;
  const [a, b = ""] = s.split(".");
  return { int: BigInt(a + b), scale: b.length };
};

const formatDecimal = ({ int, scale }) => {
  const sign = int < 0n ? "-" : "";
  const abs = int < 0n ? -int : int;
  const s = abs.toString();
  if (scale === 0) return `${sign}${s}`;
  const pad = s.padStart(scale + 1, "0");
  const left = pad.slice(0, -scale);
  const right = pad.slice(-scale);
  return `${sign}${left}.${right}`.replace(/\.$/, "");
};

const roundScaledToInt = ({ int, scale }) => {
  if (scale <= 0) return int;
  const factor = 10n ** BigInt(scale);
  const base = int / factor;
  const rem = int % factor;
  const shouldRoundUp = rem * 2n >= factor;
  return base + (shouldRoundUp ? 1n : 0n);
};

const centsDecimalToUsdDecimal = (centsDecimalStr) => {
  const d = parseDecimal(centsDecimalStr);
  if (!d) return null;
  // USD = cents / 100
  return formatDecimal({ int: d.int, scale: d.scale + 2 });
};

const roundDecimalToFixed = (decimalStr, decimals) => {
  const d = parseDecimal(decimalStr);
  if (!d) return null;
  const targetScale = Math.max(0, decimals);
  if (d.scale <= targetScale) {
    const zeros = "0".repeat(targetScale - d.scale);
    return `${formatDecimal(d)}${zeros ? `0.${zeros}`.slice(1) : ""}`;
  }
  const cut = d.scale - targetScale;
  const factor = 10n ** BigInt(cut);
  const base = d.int / factor;
  const rem = d.int % factor;
  const shouldRoundUp = rem * 2n >= factor;
  const rounded = base + (shouldRoundUp ? 1n : 0n);
  return formatDecimal({ int: rounded, scale: targetScale });
};

// Pay as you go credits top-up (one-time payment).
export const createCreditTopupCheckout = async ({
  priceId,
  quantity,
  successUrl,
  cancelUrl,
  clientReferenceId,
  user,
  metadata,
}) => {
  const stripe = createStripeClient();

  const extraParams = {};

  if (user?.customerId) {
    extraParams.customer = user.customerId;
  } else {
    extraParams.customer_creation = "always";
    extraParams.payment_intent_data = { setup_future_usage: "on_session" };
    if (user?.email) {
      extraParams.customer_email = user.email;
    }
    extraParams.tax_id_collection = { enabled: true };
  }

  // NOTE: Stripe Checkout payment mode doesn't support fractional cents for USD (e.g. 9.8 cents).
  // We use the configured Stripe price only as the unit price source-of-truth, then charge the
  // rounded total in integer cents via price_data.unit_amount.
  const price = await stripe.prices.retrieve(priceId, { expand: ["product"] });
  const currency = (price?.currency || "usd").toLowerCase();
  const unitAmountDecimalCents =
    price?.unit_amount_decimal ??
    (Number.isFinite(price?.unit_amount) ? String(price.unit_amount) : null);

  if (!unitAmountDecimalCents) {
    throw new Error("Stripe price missing unit amount");
  }

  const unitCents = parseDecimal(unitAmountDecimalCents);
  if (!unitCents) {
    throw new Error("Invalid Stripe unit amount");
  }

  const totalScaled = {
    int: unitCents.int * BigInt(quantity),
    scale: unitCents.scale,
  };
  const totalCents = roundScaledToInt(totalScaled);
  const totalCentsNumber = Number(totalCents);

  if (!Number.isFinite(totalCentsNumber) || totalCentsNumber <= 0) {
    throw new Error("Invalid total amount");
  }

  const productName =
    typeof price?.product === "object" && price.product
      ? price.product.name
      : "Extra Credits";
  const unitPriceUsd = centsDecimalToUsdDecimal(unitAmountDecimalCents);
  const unitPriceUsdFixed = unitPriceUsd ? roundDecimalToFixed(unitPriceUsd, 3) : null;
  const description = unitPriceUsdFixed
    ? `Charged for ${quantity} credits at $${unitPriceUsdFixed} per credit.`
    : `Charged for ${quantity} credits.`;

  const stripeSession = await stripe.checkout.sessions.create({
    mode: "payment",
    allow_promotion_codes: true,
    client_reference_id: clientReferenceId,
    metadata: {
      ...(metadata || {}),
      // For debugging/auditing in Stripe; not used for correctness.
      source_price_id: String(priceId),
    },
    automatic_tax: { enabled: true },
    line_items: [
      {
        price_data: {
          currency,
          product_data: {
            name: productName,
            description,
          },
          tax_behavior: "exclusive",
          unit_amount: totalCentsNumber,
        },
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    ...extraParams,
  });

  return stripeSession.url;
};

// This is used to create Customer Portal sessions, so users can manage their subscriptions (payment methods, cancel, etc..)
export const createCustomerPortal = async ({ customerId, returnUrl }) => {
  const stripe = createStripeClient();
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return portalSession.url;
};

export const createCustomerPortalFlow = async ({ customerId, returnUrl, flowData }) => {
  const stripe = createStripeClient();
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
    flow_data: flowData,
  });

  return portalSession.url;
};

// This is used to get the uesr checkout session and populate the data so we get the planId the user subscribed to
export const findCheckoutSession = async (sessionId) => {
  try {
    const stripe = createStripeClient();

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });

    return session;
  } catch (e) {
    console.error(e);
    return null;
  }
};
