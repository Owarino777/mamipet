import type { SupabaseClient, User } from "@supabase/supabase-js";
import { UnauthorizedError } from "@/shared/errors/http-error";
import { createSupabaseServerClient } from "@/shared/supabase/server-client";
import { ensureAccount, type AccountRow } from "@/modules/identity-access/application/ensure-account";
import { assertSameOrigin } from "@/shared/http/same-origin";

export type AuthenticatedContext = {
  supabase: SupabaseClient;
  user: User;
  account: AccountRow;
};

export async function requireAuthenticatedUser(
  request: Request,
): Promise<AuthenticatedContext> {
  assertSameOrigin(request);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    throw new UnauthorizedError();
  }

  return {
    supabase,
    user: data.user,
    account: await ensureAccount(supabase, data.user),
  };
}
