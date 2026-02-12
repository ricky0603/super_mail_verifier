import "server-only";

import { getCloudflareContext } from "@opennextjs/cloudflare";

export const getServerEnv = (name) => {
  const fromProcess = process.env?.[name];
  if (typeof fromProcess === "string" && fromProcess) return fromProcess;

  try {
    const ctx = getCloudflareContext();
    const fromCf = ctx?.env?.[name];
    if (typeof fromCf === "string" && fromCf) return fromCf;
  } catch {
    // Ignore if Cloudflare context isn't available (e.g. during build).
  }

  return undefined;
};

export const requireServerEnv = (name) => {
  const value = getServerEnv(name);
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
};

