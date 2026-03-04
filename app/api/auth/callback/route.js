import { NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";
import { isLikelyNewUser, sendGa4EventServer } from "@/libs/analytics/ga4-server";
import { getGaSessionIdFromRequestCookie, resolveGaClientId } from "@/libs/analytics/ga4-request";
import config from "@/config";

export const dynamic = "force-dynamic";

// This route is called after a successful login. It exchanges the code for a session and redirects to the callback URL (see config.js).
export async function GET(req) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const otpType = requestUrl.searchParams.get("type");
  const { clientId: gaClientId, source: gaClientIdSource } = resolveGaClientId({
    req,
    queryValue: requestUrl.searchParams.get("ga_client_id"),
  });
  const gaSessionId = getGaSessionIdFromRequestCookie(req);

  if (code || (tokenHash && otpType)) {
    const supabase = await createClient();
    if (code) {
      await supabase.auth.exchangeCodeForSession(code);
    } else {
      await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: otpType,
      });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const isNewUser = isLikelyNewUser({
      createdAt: user?.created_at,
      lastSignInAt: user?.last_sign_in_at,
    });

    if (process.env.NODE_ENV !== "production") {
      console.info("[ga4] sign_up eligibility", {
        hasCode: Boolean(code),
        hasTokenHash: Boolean(tokenHash),
        otpType: otpType || null,
        gaClientIdSource,
        gaClientId: gaClientId || null,
        userId: user?.id || null,
        createdAt: user?.created_at || null,
        lastSignInAt: user?.last_sign_in_at || null,
        isNewUser,
      });
    }

    if (user && isNewUser) {
      const provider =
        user?.app_metadata?.provider ||
        user?.identities?.[0]?.provider ||
        "unknown";

      await sendGa4EventServer({
        clientId: gaClientId,
        userId: user.id,
        eventName: "sign_up",
        params: {
          method: provider,
          session_id: gaSessionId,
          engagement_time_msec: 100,
        },
      });
    } else if (process.env.NODE_ENV !== "production") {
      console.info("[ga4] sign_up skipped", {
        reason: user ? "not_new_user" : "no_user",
      });
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin + config.auth.callbackUrl);
}
