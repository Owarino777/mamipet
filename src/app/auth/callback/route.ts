import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/shared/supabase/server-client";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error)
      return NextResponse.redirect(new URL("/reset-password", url.origin));
  }
  return NextResponse.redirect(
    new URL("/reset-password?error=invalid-link", url.origin),
  );
}
