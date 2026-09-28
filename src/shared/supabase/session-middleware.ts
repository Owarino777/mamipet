import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseServerConfig } from "@/shared/config/supabase-public-env";
import { fetchWithTimeout } from "@/shared/http/fetch-with-timeout";

type CookieToSet = {
  name: string;
  value: string;
  options: CookieOptions;
};

export async function updateSupabaseSession(request: NextRequest) {
  // Anonymous visitors have no session to refresh; authorization remains in server handlers.
  if (!request.cookies.getAll().some(({ name }) => /^sb-.*-auth-token(?:\.\d+)?$/.test(name))) {
    return NextResponse.next({ request });
  }
  const config = getSupabaseServerConfig();
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(config.url, config.publishableKey, {
    global: { fetch: fetchWithTimeout },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

        supabaseResponse = NextResponse.next({
          request,
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  await supabase.auth.getUser();

  return supabaseResponse;
}
