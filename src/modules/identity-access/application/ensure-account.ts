import type { SupabaseClient, User } from "@supabase/supabase-js";
import { throwIfSupabaseError } from "@/shared/supabase/errors";
import { ForbiddenError, HttpError } from "@/shared/errors/http-error";

export type AccountRow = {
  id_compte: string;
  email: string;
  statut_compte: "active" | "suspended" | "deleted";
  est_administrateur: boolean;
};

export async function ensureAccount(
  supabase: SupabaseClient,
  user: User,
): Promise<AccountRow> {
  const { data: existingAccount, error: readError } = await supabase
    .from("compte_utilisateur")
    .select("id_compte,email,statut_compte,est_administrateur")
    .eq("id_compte", user.id)
    .maybeSingle();

  throwIfSupabaseError(readError, "Unable to read current account.");

  if (existingAccount) {
    if (existingAccount.statut_compte !== "active") throw new ForbiddenError("Ce compte n’est pas actif.");
    return existingAccount as AccountRow;
  }

  const { data: createdAccount, error: createError } = await supabase
    .from("compte_utilisateur")
    .insert({
      id_compte: user.id,
      email: user.email ?? "",
    })
    .select("id_compte,email,statut_compte,est_administrateur")
    .single();

  // Two requests may initialize the account at the same time.
  if (createError?.code === "23505") {
    const { data, error } = await supabase.from("compte_utilisateur")
      .select("id_compte,email,statut_compte,est_administrateur").eq("id_compte", user.id).single();
    throwIfSupabaseError(error, "Unable to synchronize current account.");
    if (!data) throw new HttpError("Account unavailable.", 500, "ACCOUNT_UNAVAILABLE");
    if (data.statut_compte !== "active") throw new ForbiddenError("Ce compte n’est pas actif.");
    return data as AccountRow;
  }
  throwIfSupabaseError(createError, "Unable to synchronize current account.");
  if (!createdAccount) throw new HttpError("Account unavailable.", 500, "ACCOUNT_UNAVAILABLE");

  return createdAccount as AccountRow;
}
