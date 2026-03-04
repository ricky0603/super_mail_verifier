import "server-only";

export const parseGaClientId = (value) => {
  if (!value || typeof value !== "string") return undefined;
  const parts = value.split(".");
  if (parts.length < 4) return undefined;
  const clientId = `${parts[parts.length - 2]}.${parts[parts.length - 1]}`;
  return /^\d+\.\d+$/.test(clientId) ? clientId : undefined;
};

export const getGaClientIdFromRequestCookie = (req) => {
  const gaCookie = req?.cookies?.get("_ga")?.value;
  return parseGaClientId(gaCookie);
};

export const getGaSessionIdFromRequestCookie = (req) => {
  const entries = req?.cookies?.getAll?.() || [];
  const gaSessionCookie = entries.find((c) => c?.name?.startsWith("_ga_"));
  const raw = gaSessionCookie?.value;
  if (!raw || typeof raw !== "string") return undefined;

  // _ga_<MEASUREMENT_ID> format often looks like:
  // GS1.1.1740533123.4.1.1740533150.0.0.0
  const parts = raw.split(".");
  if (parts.length < 3) return undefined;

  const sessionId = parts[2];
  return /^\d+$/.test(sessionId) ? sessionId : undefined;
};

export const resolveGaClientId = ({ req, queryValue, bodyValue } = {}) => {
  const fromCookie = getGaClientIdFromRequestCookie(req);
  if (fromCookie) return { clientId: fromCookie, source: "cookie" };

  const fromQuery = queryValue ? String(queryValue) : undefined;
  if (fromQuery) return { clientId: fromQuery, source: "query" };

  const fromBody = bodyValue ? String(bodyValue) : undefined;
  if (fromBody) return { clientId: fromBody, source: "body" };

  return { clientId: undefined, source: "fallback" };
};
