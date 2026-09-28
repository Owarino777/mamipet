import type { NextRequest } from "next/server";
import { updateSupabaseSession } from "@/shared/supabase/session-middleware";

export function middleware(request: NextRequest) {
  return updateSupabaseSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|woff|woff2)$).*)",
  ],
};
