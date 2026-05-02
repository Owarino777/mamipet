import { ensureAccount } from "@/modules/identity-access/application/ensure-account";
import { mapPetSitterProfileRow } from "@/modules/pet-sitters/presentation/pet-sitter-profile.mapper";
import { createPetSitterProfileSchema } from "@/modules/pet-sitters/presentation/pet-sitter-profile.schemas";
import { requireAuthenticatedUser } from "@/shared/auth/current-user";
import { ConflictError } from "@/shared/errors/http-error";
import { parseJsonBody } from "@/shared/http/request-json";
import { jsonCreated, jsonError } from "@/shared/http/route-response";
import { throwIfSupabaseError } from "@/shared/supabase/errors";

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireAuthenticatedUser(request);
    const input = await parseJsonBody(request, createPetSitterProfileSchema);
    await ensureAccount(supabase, user);

    const { data: existingProfile, error: existingError } = await supabase
      .from("profil_pet_sitter")
      .select("id_profil_pet_sitter")
      .eq("id_compte", user.id)
      .maybeSingle();

    throwIfSupabaseError(existingError, "Unable to verify pet-sitter profile.");

    if (existingProfile) {
      throw new ConflictError("This account already has a pet-sitter profile.");
    }

    const { data, error } = await supabase
      .from("profil_pet_sitter")
      .insert({
        id_compte: user.id,
        pseudo: input.pseudo ?? null,
        prenom: input.firstName,
        telephone: input.phone ?? null,
        photo_url: input.photoUrl ?? null,
        description: input.description ?? null,
        adresse_ligne1: input.addressLine1 ?? null,
        adresse_ligne2: input.addressLine2 ?? null,
        code_postal: input.postalCode ?? null,
        ville: input.city,
        pays: input.country,
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null,
        tarif_base: input.basePriceCents / 100,
        rayon_km: input.interventionRadiusKm,
        statut_verification: "draft",
        visibilite_publique: input.publicVisibility,
      })
      .select("*")
      .single();

    throwIfSupabaseError(error, "Unable to create pet-sitter profile.");

    return jsonCreated(mapPetSitterProfileRow(data));
  } catch (error) {
    return jsonError(error);
  }
}
