import type { SupabaseClient } from "@supabase/supabase-js";
import { ForbiddenError } from "@/shared/errors/http-error";
import { throwIfSupabaseError } from "@/shared/supabase/errors";

export type CurrentPetSitterProfile = {
  id: string;
  accountId: string;
};

export async function requirePetSitterProfile(
  supabase: SupabaseClient,
  accountId: string,
): Promise<CurrentPetSitterProfile> {
  const { data, error } = await supabase
    .from("profil_pet_sitter")
    .select("id_profil_pet_sitter,id_compte")
    .eq("id_compte", accountId)
    .maybeSingle();

  throwIfSupabaseError(error, "Unable to read pet-sitter profile.");

  if (!data) {
    throw new ForbiddenError("A pet-sitter profile is required for this action.");
  }

  return {
    id: String(data.id_profil_pet_sitter),
    accountId: String(data.id_compte),
  };
}
