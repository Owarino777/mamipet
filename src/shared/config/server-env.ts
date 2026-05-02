import { ConfigurationError } from "@/shared/errors/http-error";

type SupabaseRouteConfig = {
  url: string;
  anonKey: string;
};

export function getSupabaseRouteConfig(): SupabaseRouteConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new ConfigurationError(
      "Supabase URL and anon/publishable key must be configured.",
    );
  }

  return {
    url,
    anonKey,
  };
}
