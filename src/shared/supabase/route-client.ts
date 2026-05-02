import { createClient } from "@supabase/supabase-js";
import { getSupabaseRouteConfig } from "@/shared/config/server-env";

export function createSupabaseRouteClient(request?: Request) {
  const config = getSupabaseRouteConfig();
  const authorization = request?.headers.get("authorization");

  return createClient(config.url, config.anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: authorization ? { Authorization: authorization } : {},
    },
  });
}
