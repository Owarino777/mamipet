import {
  mapPetSitterPublicProfileRow,
  publicPetSitterProfileSelect,
} from "@/modules/pet-sitters/presentation/pet-sitter-profile.mapper";
import { NotFoundError } from "@/shared/errors/http-error";
import { jsonError, jsonOk } from "@/shared/http/route-response";
import { createSupabaseRouteClient } from "@/shared/supabase/route-client";
import { throwIfSupabaseError } from "@/shared/supabase/errors";
import { validateInput } from "@/shared/http/validate-input";
import { z } from "zod";

type PetSitterRouteContext = {
  params: Promise<{
    petSitterId: string;
  }>;
};

export async function GET(request: Request, context: PetSitterRouteContext) {
  try {
    const petSitterId = validateInput(z.string().uuid(), (await context.params).petSitterId);
    const supabase = createSupabaseRouteClient(request);
    const { data, error } = await supabase
      .from("pet_sitter_public_profile")
      .select(publicPetSitterProfileSelect)
      .eq("id_profil_pet_sitter", petSitterId)
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
