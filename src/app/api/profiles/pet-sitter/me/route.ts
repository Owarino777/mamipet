import {
  mapPetSitterProfileRow,
  petSitterProfileSelect,
} from "@/modules/pet-sitters/presentation/pet-sitter-profile.mapper";
import { updatePetSitterProfileSchema } from "@/modules/pet-sitters/presentation/pet-sitter-profile.schemas";
import { requireAuthenticatedUser } from "@/shared/auth/current-user";
import { NotFoundError } from "@/shared/errors/http-error";
import { parseJsonBody } from "@/shared/http/request-json";
import { jsonError, jsonOk } from "@/shared/http/route-response";
import { throwIfSupabaseError } from "@/shared/supabase/errors";

export async function GET(request: Request) {
  try {
    const { supabase, user } = await requireAuthenticatedUser(request);
    const { data, error } = await supabase
      .from("profil_pet_sitter")
      .select(petSitterProfileSelect)
      .eq("id_compte", user.id)
      .maybeSingle();

    throwIfSupabaseError(error, "Unable to read pet-sitter profile.");

    if (!data) {
      throw new NotFoundError("Pet-sitter profile not found.");
    }

    return jsonOk(mapPetSitterProfileRow(data));
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const { supabase, user } = await requireAuthenticatedUser(request);
    const input = await parseJsonBody(request, updatePetSitterProfileSchema);
    const updatePayload = {
      ...(input.pseudo !== undefined ? { pseudo: input.pseudo } : {}),
      ...(input.firstName !== undefined ? { prenom: input.firstName } : {}),
      ...(input.phone !== undefined ? { telephone: input.phone } : {}),
      ...(input.photoUrl !== undefined ? { photo_url: input.photoUrl } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.addressLine1 !== undefined
        ? { adresse_ligne1: input.addressLine1 }
        : {}),
      ...(input.addressLine2 !== undefined
        ? { adresse_ligne2: input.addressLine2 }
        : {}),
      ...(input.postalCode !== undefined ? { code_postal: input.postalCode } : {}),
      ...(input.city !== undefined ? { ville: input.city } : {}),
      ...(input.country !== undefined ? { pays: input.country } : {}),
      ...(input.latitude !== undefined ? { latitude: input.latitude } : {}),
      ...(input.longitude !== undefined ? { longitude: input.longitude } : {}),
      ...(input.basePriceCents !== undefined
        ? { tarif_base: input.basePriceCents / 100 }
        : {}),
      ...(input.interventionRadiusKm !== undefined
        ? { rayon_km: input.interventionRadiusKm }
        : {}),
      ...(input.publicVisibility !== undefined
        ? { visibilite_publique: input.publicVisibility }
        : {}),
    };

    const { data, error } = await supabase
      .from("profil_pet_sitter")
      .update(updatePayload)
      .eq("id_compte", user.id)
      .select(petSitterProfileSelect)
      .maybeSingle();

    throwIfSupabaseError(error, "Unable to update pet-sitter profile.");

    if (!data) {
      throw new NotFoundError("Pet-sitter profile not found.");
    }

    return jsonOk(mapPetSitterProfileRow(data));
  } catch (error) {
    return jsonError(error);
  }
}
