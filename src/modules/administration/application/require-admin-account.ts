import { ensureAccount } from "@/modules/identity-access/application/ensure-account";
import { requireAuthenticatedUser } from "@/shared/auth/current-user";
import { ForbiddenError } from "@/shared/errors/http-error";

export async function requireAdminAccount(request: Request) {
  const { supabase, user } = await requireAuthenticatedUser(request);
  const account = await ensureAccount(supabase, user);

  if (!account.est_administrateur) {
    throw new ForbiddenError("An administrator account is required.");
  }

  return {
    supabase,
    user,
    account,
  };
}
