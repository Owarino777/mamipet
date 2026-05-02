import { requireAdminAccount } from "@/modules/administration/application/require-admin-account";
import {
  mapPetSitterProfileRow,
  petSitterProfileSelect,
} from "@/modules/pet-sitters/presentation/pet-sitter-profile.mapper";
import { jsonError, jsonOk } from "@/shared/http/route-response";
import { throwIfSupabaseError } from "@/shared/supabase/errors";

export async function GET(request: Request) {
  try {
    const { supabase } = await requireAdminAccount(request);
    const { data, error } = await supabase
      .from("profil_pet_sitter")
      .select(petSitterProfileSelect)
      .order("date_creation", { ascending: false });

    throwIfSupabaseError(error, "Unable to list pet-sitter profiles.");

    return jsonOk((data ?? []).map((row) => mapPetSitterProfileRow(row)));
  } catch (error) {
    return jsonError(error);
  }
}
