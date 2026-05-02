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
  const { data, error } = await supabase
    .from("compte_utilisateur")
    .upsert(
      {
        id_compte: user.id,
        email: user.email ?? "",
        statut_compte: "active",
        est_administrateur: false,
      },
      { onConflict: "id_compte" },
    )
    .select("id_compte,email,statut_compte,est_administrateur")
    .single();

  throwIfSupabaseError(error, "Unable to synchronize current account.");

  return data as AccountRow;
}
