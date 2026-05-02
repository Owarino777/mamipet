import {
  mapPetSitterPublicProfileRow,
  petSitterProfileSelect,
} from "@/modules/pet-sitters/presentation/pet-sitter-profile.mapper";
import { NotFoundError } from "@/shared/errors/http-error";
import { jsonError, jsonOk } from "@/shared/http/route-response";
import { createSupabaseRouteClient } from "@/shared/supabase/route-client";
import { throwIfSupabaseError } from "@/shared/supabase/errors";

type PetSitterRouteContext = {
  params: Promise<{
    petSitterId: string;
  }>;
};

export async function GET(request: Request, context: PetSitterRouteContext) {
  try {
    const { petSitterId } = await context.params;
    const supabase = createSupabaseRouteClient(request);
    const { data, error } = await supabase
      .from("profil_pet_sitter")
      .select(petSitterProfileSelect)
      .eq("id_profil_pet_sitter", petSitterId)
      .eq("visibilite_publique", true)
      .not("statut_verification", "in", "(suspended,rejected)")
      .maybeSingle();

    throwIfSupabaseError(error, "Unable to read pet-sitter profile.");

    if (!data) {
      throw new NotFoundError("Pet-sitter profile not found.");
    }

    return jsonOk(mapPetSitterPublicProfileRow(data));
  } catch (error) {
    return jsonError(error);
  }
}
