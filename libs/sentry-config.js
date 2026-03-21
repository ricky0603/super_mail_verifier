const DEFAULT_SENTRY_DSN =
  "https://ff11d9296fad9e5e43af5076e2a43198@o4507906232942592.ingest.us.sentry.io/4511082808344576";

const isProduction = process.env.NODE_ENV === "production";

const parseBooleanEnv = (value, fallback) => {
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return fallback;
};

const parseNumberEnv = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const sentryRuntimeConfig = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || DEFAULT_SENTRY_DSN,
  tracesSampleRate: parseNumberEnv(
    process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE,
    isProduction ? 0.1 : 1.0
  ),
  enableLogs: parseBooleanEnv(
    process.env.NEXT_PUBLIC_SENTRY_ENABLE_LOGS,
    !isProduction
  ),
  sendDefaultPii: parseBooleanEnv(
    process.env.NEXT_PUBLIC_SENTRY_SEND_DEFAULT_PII,
    false
  ),
};
