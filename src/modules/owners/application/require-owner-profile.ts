import type { SupabaseClient } from "@supabase/supabase-js";
import { ForbiddenError } from "@/shared/errors/http-error";
import { throwIfSupabaseError } from "@/shared/supabase/errors";

export type CurrentOwnerProfile = {
  id: string;
  accountId: string;
};

export async function requireOwnerProfile(
  supabase: SupabaseClient,
  accountId: string,
): Promise<CurrentOwnerProfile> {
  const { data, error } = await supabase
    .from("profil_proprietaire")
    .select("id_profil_proprietaire,id_compte")
    .eq("id_compte", accountId)
    .maybeSingle();

  throwIfSupabaseError(error, "Unable to read owner profile.");

  if (!data) {
    throw new ForbiddenError("An owner profile is required for this action.");
  }

  return {
    id: String(data.id_profil_proprietaire),
    accountId: String(data.id_compte),
  };
}
