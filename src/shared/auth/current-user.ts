import type { SupabaseClient, User } from "@supabase/supabase-js";
import { UnauthorizedError } from "@/shared/errors/http-error";
import { createSupabaseServerClient } from "@/shared/supabase/server-client";

export type AuthenticatedContext = {
  supabase: SupabaseClient;
  user: User;
};

export async function requireAuthenticatedUser(
  _request: Request,
): Promise<AuthenticatedContext> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    throw new UnauthorizedError();
  }

  return {
    supabase,
    user: data.user,
  };
}
