import config from "@/config";
import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { requireServerEnv } from "@/libs/env";

const getPlanCreditsByPriceId = (priceId) => {
  const plan = config?.stripe?.plans?.find((p) => p.priceId === priceId);
  const credits = plan?.creditsPerCycle;
  return Number.isFinite(credits) ? credits : null;
};

const toIsoFromEpochSeconds = (seconds) => {
  if (!Number.isFinite(seconds)) return null;
  return new Date(seconds * 1000).toISOString();
};

const epochSecondsFromIso = (iso) => {
  if (!iso) return null;
  const ms = new Date(iso).getTime();
  if (!Number.isFinite(ms)) return null;
  return Math.floor(ms / 1000);
};

const isDuplicateKeyError = (error) => error?.code === "23505";

const extractSubscriptionIdFromInvoice = (invoice) => {
  const direct = invoice?.subscription;
  if (typeof direct === "string" && direct) return direct;

  // Stripe API versions >= 2025 may omit `invoice.subscription`.
  // For subscription invoices, the subscription id is available on line items.
  const lines = invoice?.lines?.data;
  if (Array.isArray(lines)) {
    for (const line of lines) {
      const sub =
        line?.parent?.subscription_item_details?.subscription ||
        line?.parent?.subscription_item_details?.subscription_id;
      if (typeof sub === "string" && sub) return sub;
    }
  }

  return null;
};

const extractUserIdFromInvoice = (invoice) => {
  const lines = invoice?.lines?.data;
  if (!Array.isArray(lines)) return null;
  for (const line of lines) {
    const userId = line?.metadata?.user_id;
    if (typeof userId === "string" && userId) return userId;
  }
  return null;
};

export async function POST(req) {
  const stripe = new Stripe(requireServerEnv("STRIPE_SECRET_KEY"), {
    apiVersion: "2023-08-16",
    httpClient: Stripe.createFetchHttpClient(),
    timeout: 20000,
  });

  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");
  const webhookSecret = requireServerEnv("STRIPE_WEBHOOK_SECRET");

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
  } catch (err) {
    console.error(`Webhook signature verification failed. ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  const supabase = createClient(
    requireServerEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireServerEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: { persistSession: false },
      realtime: { disabled: true },
    }
  );

	try {
    switch (event.type) {
      case "invoice.paid": {
        let invoice = event.data.object;
        const invoiceId = invoice?.id;
        let subscriptionId = extractSubscriptionIdFromInvoice(invoice);

        if (!invoiceId) break;

        // Some webhook payloads don't include expanded line items; fetch the invoice to derive subscription id.
        if (!subscriptionId) {
          try {
            invoice = await stripe.invoices.retrieve(invoiceId, {
              expand: ["lines.data"],
            });
            subscriptionId = extractSubscriptionIdFromInvoice(invoice);
          } catch (e) {
            console.error("Failed to retrieve invoice for subscription lookup", {
              invoiceId,
              message: e?.message,
            });
          }
        }

        if (!subscriptionId) break;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const userId =
          subscription?.metadata?.user_id || extractUserIdFromInvoice(invoice);
        const customerId = subscription?.customer;
        const items = subscription?.items?.data || [];
        const priceId = items?.[0]?.price?.id || null;

        if (!userId || !priceId) {
          console.error("invoice.paid missing user_id metadata or priceId", {
            invoiceId,
            subscriptionId,
          });
          break;
        }

        const planCredits = getPlanCreditsByPriceId(priceId);
        if (!Number.isFinite(planCredits)) {
          console.error("Unknown subscription priceId (no credits mapping)", {
            priceId,
            invoiceId,
          });
          break;
        }

        const incomingStartEpoch = subscription?.current_period_start;
        const incomingEndEpoch = subscription?.current_period_end;
        const incomingStartIso = toIsoFromEpochSeconds(incomingStartEpoch);
        const incomingEndIso = toIsoFromEpochSeconds(incomingEndEpoch);

        const { data: existingProfile, error: profileError } = await supabase
          .from("profiles")
          .select("id,sub_period_start,total_credit,used_credit")
          .eq("id", userId)
          .maybeSingle();

        if (profileError) throw profileError;

				const storedStartEpoch = epochSecondsFromIso(
					existingProfile?.sub_period_start
				);

				// Ignore out-of-order events that refer to an older billing period.
				if (
					storedStartEpoch !== null &&
          Number.isFinite(incomingStartEpoch) &&
          incomingStartEpoch < storedStartEpoch
        ) {
          break;
        }

        const isNewPeriod =
          storedStartEpoch === null ||
          (Number.isFinite(incomingStartEpoch) && incomingStartEpoch > storedStartEpoch);

        const patch = {
          id: userId,
          customer_id: customerId || null,
          subscription_id: subscription?.id || null,
          price_id: priceId,
          sub_period_start: incomingStartIso,
          sub_expired_at: incomingEndIso,
          updated_at: new Date().toISOString(),
        };

        if (isNewPeriod) {
          patch.total_credit = planCredits;
          patch.used_credit = 0;
        } else {
          // Same billing period: upgrade should increase total_credit but not reset used_credit.
          const currentTotal = existingProfile?.total_credit || 0;
          patch.total_credit = Math.max(currentTotal, planCredits);
        }

				const { error: upsertError } = await supabase
					.from("profiles")
					.upsert(patch, { onConflict: "id" });

				if (upsertError) throw upsertError;

				// Audit/idempotency record (not relied upon for correctness).
				const { error: invoiceUpsertError } = await supabase
					.from("processed_invoices")
					.upsert(
						{
							invoice_id: invoiceId,
							user_id: userId,
							price_id: priceId,
							sub_period_start: incomingStartIso,
							sub_expired_at: incomingEndIso,
						},
						{ onConflict: "invoice_id", ignoreDuplicates: true }
					);

				if (invoiceUpsertError) throw invoiceUpsertError;

				break;
			}

      case "checkout.session.completed": {
        const session = event.data.object;
        const purpose = session?.metadata?.purpose;

        if (session?.mode !== "payment" || purpose !== "credit_topup") break;

        const userId = session?.metadata?.user_id;
        const credits = Number(session?.metadata?.credits);
        const checkoutSessionId = session?.id;

        if (!userId || !checkoutSessionId || !Number.isFinite(credits) || credits <= 0) {
          console.error("credit_topup missing metadata", {
            checkoutSessionId,
          });
          break;
        }

        const { error: grantError } = await supabase
          .from("credit_topup_grants")
          .insert({
            checkout_session_id: checkoutSessionId,
            user_id: userId,
            credits_granted: Math.floor(credits),
          });

        if (grantError) {
          if (isDuplicateKeyError(grantError)) break;
          throw grantError;
        }

        // Ensure profile exists, then add credits. If a subscription reset happens later, it will override as intended.
        await supabase.from("profiles").upsert(
          {
            id: userId,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );

        const { data: profile, error: readError } = await supabase
          .from("profiles")
          .select("total_credit")
          .eq("id", userId)
          .maybeSingle();

        if (readError) throw readError;

        const nextTotal = (profile?.total_credit || 0) + Math.floor(credits);

        const { error: updateError } = await supabase
          .from("profiles")
          .update({ total_credit: nextTotal, updated_at: new Date().toISOString() })
          .eq("id", userId);

        if (updateError) throw updateError;

        break;
      }

			default:
			// ignore
		}
	} catch (e) {
		console.error("stripe webhook error:", e?.message || e);
		// Return non-2xx so Stripe retries.
		return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
	}

	return NextResponse.json({ received: true });
}
