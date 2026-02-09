import { createBrowserClient } from "@supabase/ssr";

const createMissingSupabaseEnvProxy = () => {
  const error = new Error(
    "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
  );

  const handler = {
    get(_target, prop) {
      if (prop === "__missingSupabaseEnv") return true;
      if (prop === "toJSON") return () => ({ __missingSupabaseEnv: true });
      if (prop === Symbol.toStringTag) return "SupabaseClient";
      return new Proxy(() => {
        throw error;
      }, handler);
    },
    apply() {
      throw error;
    },
  };

  return new Proxy(() => {
    throw error;
  }, handler);
};

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return createMissingSupabaseEnvProxy();
  }

  return createBrowserClient(url, anonKey);
}
