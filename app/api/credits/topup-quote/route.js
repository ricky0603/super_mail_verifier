import { NextResponse } from "next/server";
import Stripe from "stripe";
import config from "@/config";
import { createClient } from "@/libs/supabase/server";

export const dynamic = "force-dynamic";

const MAX_REQUIRED_CREDITS = 200000;

const isActiveSubscription = (subExpiredAt) => {
  if (!subExpiredAt) return false;
  const ms = new Date(subExpiredAt).getTime();
  return Number.isFinite(ms) && ms > Date.now();
};

const parseDecimal = (value) => {
  const s = String(value || "").trim();
  if (!s) return null;
  if (!/^\d+(\.\d+)?$/.test(s)) return null;
  const [a, b = ""] = s.split(".");
  return { int: BigInt(a + b), scale: b.length };
};

const mulDecimalByInt = (decimalStr, n) => {
  const d = parseDecimal(decimalStr);
  if (!d) return null;
  const scaled = d.int * BigInt(n);
  return { int: scaled, scale: d.scale };
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

const roundDecimalToFixed = (decimalStr, decimals) => {
  // decimalStr is non-negative number in string form.
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

const centsDecimalToUsdDecimal = (centsDecimalStr) => {
  // USD = cents / 100
  const d = parseDecimal(centsDecimalStr);
  if (!d) return null;
  return formatDecimal({ int: d.int, scale: d.scale + 2 });
};

export async function GET(req) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const requiredCredits = Number(searchParams.get("requiredCredits"));

    if (!Number.isFinite(requiredCredits) || requiredCredits <= 0) {
      return NextResponse.json(
        { error: "requiredCredits must be a positive number" },
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
      .select("id,sub_expired_at,total_credit,used_credit")
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

    const priceId = config?.stripe?.creditTopupPriceId;
    if (!priceId) {
      return NextResponse.json(
        { error: "Missing config.stripe.creditTopupPriceId" },
        { status: 500 }
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Missing STRIPE_SECRET_KEY" },
        { status: 500 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const price = await stripe.prices.retrieve(priceId);

    const currency = (price?.currency || "usd").toLowerCase();
    const unitAmountDecimalCents =
      price?.unit_amount_decimal ??
      (Number.isFinite(price?.unit_amount) ? String(price.unit_amount) : null);

    if (!unitAmountDecimalCents) {
      return NextResponse.json(
        { error: "Stripe price missing unit amount" },
        { status: 500 }
      );
    }

    const unitPriceUsd = centsDecimalToUsdDecimal(unitAmountDecimalCents);
    const totalCents = mulDecimalByInt(unitAmountDecimalCents, shortage);
    const totalUsd = totalCents
      ? centsDecimalToUsdDecimal(formatDecimal(totalCents))
      : null;

    return NextResponse.json({
      requiredCredits,
      availableCredit,
      shortage,
      currency,
      unitPriceUsd: unitPriceUsd ? roundDecimalToFixed(unitPriceUsd, 3) : null,
      totalPriceUsd: totalUsd ? roundDecimalToFixed(totalUsd, 2) : null,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}

