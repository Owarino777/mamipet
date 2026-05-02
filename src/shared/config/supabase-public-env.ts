import { ConfigurationError } from "@/shared/errors/http-error";

type SupabasePublicConfig = {
  url: string;
  publishableKey: string;
};

export function getSupabaseServerConfig(): SupabasePublicConfig {
  return readSupabasePublicConfig();
}

export function getSupabaseBrowserConfig(): SupabasePublicConfig {
  return readSupabasePublicConfig();
}

function readSupabasePublicConfig(): SupabasePublicConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !publishableKey) {
    throw new ConfigurationError(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY must be configured.",
    );
  }

  return {
    url,
    publishableKey,
  };
}
