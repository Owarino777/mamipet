import { mapAnimalRow } from "@/modules/animals/presentation/animal.mapper";
import { createAnimalSchema } from "@/modules/animals/presentation/animal.schemas";
import { requireOwnerProfile } from "@/modules/owners/application/require-owner-profile";
import { requireAuthenticatedUser } from "@/shared/auth/current-user";
import { HttpError } from "@/shared/errors/http-error";
import { parseJsonBody } from "@/shared/http/request-json";
import { jsonCreated, jsonError, jsonOk } from "@/shared/http/route-response";
import { throwIfSupabaseError } from "@/shared/supabase/errors";

const animalSelect = `
  id_animal,
  id_profil_proprietaire,
  id_espece,
  nom,
  sexe,
  date_naissance,
  couleur,
  poids_kg,
  temperament,
  besoins_specifiques,
  date_creation,
  espece(id_espece,code_espece,libelle_espece),
  dossier_medical(id_dossier_medical)
`;

export async function GET(request: Request) {
  try {
    const { supabase, user } = await requireAuthenticatedUser(request);
    const ownerProfile = await requireOwnerProfile(supabase, user.id);
    const { data, error } = await supabase
      .from("animal")
      .select(animalSelect)
      .eq("id_profil_proprietaire", ownerProfile.id)
      .order("date_creation", { ascending: false });

    throwIfSupabaseError(error, "Unable to list animals.");

    return jsonOk((data ?? []).map((row) => mapAnimalRow(row)));
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireAuthenticatedUser(request);
    const ownerProfile = await requireOwnerProfile(supabase, user.id);
    const input = await parseJsonBody(request, createAnimalSchema);
    const { data, error } = await supabase
      .from("animal")
      .insert({
        id_profil_proprietaire: ownerProfile.id,
        id_espece: input.speciesId,
        nom: input.name,
        sexe: input.sex ?? null,
        date_naissance: input.birthDate ?? null,
        couleur: input.color ?? null,
        poids_kg: input.weightKg ?? null,
        temperament: input.temperament ?? null,
        besoins_specifiques: input.specificNeeds ?? null,
      })
      .select(animalSelect)
      .single();

    throwIfSupabaseError(error, "Unable to create animal.");

    if (!data) {
      throw new HttpError("Animal was not returned after creation.", 500, "EMPTY_RESPONSE");
    }

    return jsonCreated(mapAnimalRow(data));
  } catch (error) {
    return jsonError(error);
  }
}
