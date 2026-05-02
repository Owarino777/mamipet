import type { SupabaseClient, User } from "@supabase/supabase-js";
import { throwIfSupabaseError } from "@/shared/supabase/errors";

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
    return existingAccount as AccountRow;
  }

  const { data: createdAccount, error: createError } = await supabase
    .from("compte_utilisateur")
    .insert({
      id_compte: user.id,
      email: user.email ?? "",
      statut_compte: "active",
      est_administrateur: false,
    })
    .select("id_compte,email,statut_compte,est_administrateur")
    .single();

  throwIfSupabaseError(createError, "Unable to synchronize current account.");

  return createdAccount as AccountRow;
}
