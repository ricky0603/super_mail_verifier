import { NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";

export const dynamic = "force-dynamic";

const isActiveSubscription = (subExpiredAt) => {
  if (!subExpiredAt) return false;
  const ms = new Date(subExpiredAt).getTime();
  return Number.isFinite(ms) && ms > Date.now();
};

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select(
        "id,total_credit,used_credit,sub_period_start,sub_expired_at,price_id"
      )
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const totalCredit = profile?.total_credit || 0;
    const usedCredit = profile?.used_credit || 0;
    const availableCredit = Math.max(0, totalCredit - usedCredit);

    return NextResponse.json({
      totalCredit,
      usedCredit,
      availableCredit,
      subPeriodStart: profile?.sub_period_start || null,
      subExpiredAt: profile?.sub_expired_at || null,
      isSubscriptionActive: isActiveSubscription(profile?.sub_expired_at),
      priceId: profile?.price_id || null,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}

