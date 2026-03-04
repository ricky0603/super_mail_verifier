import "server-only";

import { getServerEnv } from "@/libs/env";

const GA_MP_ENDPOINT = "https://www.google-analytics.com/mp/collect";
const GA_MP_DEBUG_ENDPOINT = "https://www.google-analytics.com/debug/mp/collect";
const SIGNUP_NEW_USER_WINDOW_MS = 10 * 60 * 1000;
const isProduction = process.env.NODE_ENV === "production";

const sanitizeParams = (params = {}) => {
  return Object.entries(params).reduce((acc, [key, value]) => {
    if (value === undefined || value === null || value === "") return acc;
    acc[key] = value;
    return acc;
  }, {});
};

const getGaConfig = () => {
  const measurementId = getServerEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID");
  const apiSecret = getServerEnv("GA4_API_SECRET");
  return { measurementId, apiSecret };
};

const resolveServerClientId = ({ clientId, userId }) => {
  if (clientId) return String(clientId);
  if (userId) return `user.${String(userId)}`;
  return undefined;
};

const toMs = (value) => {
  if (!value) return NaN;
  const ms = new Date(value).getTime();
  return Number.isFinite(ms) ? ms : NaN;
};

export const isLikelyNewUser = ({
  createdAt,
  lastSignInAt,
  now = Date.now(),
} = {}) => {
  const createdMs = toMs(createdAt);
  if (!Number.isFinite(createdMs)) return false;

  const lastSignInMs = toMs(lastSignInAt);
  if (Number.isFinite(lastSignInMs)) {
    return Math.abs(lastSignInMs - createdMs) <= SIGNUP_NEW_USER_WINDOW_MS;
  }

  return Math.abs(now - createdMs) <= SIGNUP_NEW_USER_WINDOW_MS;
};

export const sendGa4EventServer = async ({
  clientId,
  userId,
  eventName,
  params = {},
}) => {
  if (!eventName) return false;

  const { measurementId, apiSecret } = getGaConfig();
  if (!measurementId) {
    console.warn("[ga4] Missing NEXT_PUBLIC_GA_MEASUREMENT_ID, skip server event", {
      eventName,
    });
    return false;
  }
  if (!apiSecret) {
    console.warn("[ga4] Missing GA4_API_SECRET, skip server event", { eventName });
    return false;
  }

  const resolvedClientId = resolveServerClientId({ clientId, userId });
  if (!resolvedClientId) {
    console.warn("[ga4] Missing client_id and user_id, skip server event", {
      eventName,
    });
    return false;
  }

  const payload = {
    client_id: resolvedClientId,
    consent: {
      ad_user_data: "GRANTED",
      ad_personalization: "GRANTED",
    },
    events: [
      {
        name: eventName,
        params: sanitizeParams({
          ...params,
          ...(isProduction ? {} : { debug_mode: 1 }),
        }),
      },
    ],
  };

  if (userId) {
    payload.user_id = String(userId);
  }

  const endpoint = `${GA_MP_ENDPOINT}?measurement_id=${encodeURIComponent(
    measurementId
  )}&api_secret=${encodeURIComponent(apiSecret)}`;
  const debugEndpoint = `${GA_MP_DEBUG_ENDPOINT}?measurement_id=${encodeURIComponent(
    measurementId
  )}&api_secret=${encodeURIComponent(apiSecret)}`;

  try {
    if (!isProduction) {
      try {
        const debugResponse = await fetch(debugEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...payload,
            validation_behavior: "ENFORCE_RECOMMENDATIONS",
          }),
        });

        const debugBody = await debugResponse.json().catch(() => ({}));
        const validationMessages = Array.isArray(debugBody?.validationMessages)
          ? debugBody.validationMessages
          : [];

        if (validationMessages.length > 0) {
          console.warn("[ga4] Validation messages", {
            eventName,
            validationMessages,
          });
        }
      } catch (error) {
        console.warn("[ga4] Debug validation failed", {
          eventName,
          message: error?.message,
        });
      }
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.error("[ga4] Server event failed", {
        eventName,
        status: response.status,
        body,
      });
      return false;
    }

    if (!isProduction) {
      console.info("[ga4] Server event sent", {
        eventName,
        measurementId,
        clientId: payload.client_id,
        userId: payload.user_id,
      });
    }

    return true;
  } catch (error) {
    console.error("[ga4] Server event error", {
      eventName,
      message: error?.message,
    });
    return false;
  }
};
