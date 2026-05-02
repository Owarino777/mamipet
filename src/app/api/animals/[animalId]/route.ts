import { mapAnimalRow } from "@/modules/animals/presentation/animal.mapper";
import { updateAnimalSchema } from "@/modules/animals/presentation/animal.schemas";
import { requireOwnerProfile } from "@/modules/owners/application/require-owner-profile";
import { requireAuthenticatedUser } from "@/shared/auth/current-user";
import { NotFoundError } from "@/shared/errors/http-error";
import { parseJsonBody } from "@/shared/http/request-json";
import { jsonError, jsonOk } from "@/shared/http/route-response";
import { throwIfSupabaseError } from "@/shared/supabase/errors";

type AnimalRouteContext = {
  params: Promise<{
    animalId: string;
  }>;
};

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

export async function GET(request: Request, context: AnimalRouteContext) {
  try {
    const { animalId } = await context.params;
    const { supabase, user } = await requireAuthenticatedUser(request);
    const ownerProfile = await requireOwnerProfile(supabase, user.id);
    const { data, error } = await supabase
      .from("animal")
      .select(animalSelect)
      .eq("id_animal", animalId)
      .eq("id_profil_proprietaire", ownerProfile.id)
      .maybeSingle();

    throwIfSupabaseError(error, "Unable to read animal.");

    if (!data) {
      throw new NotFoundError("Animal not found.");
    }

    return jsonOk(mapAnimalRow(data));
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request, context: AnimalRouteContext) {
  try {
    const { animalId } = await context.params;
    const { supabase, user } = await requireAuthenticatedUser(request);
    const ownerProfile = await requireOwnerProfile(supabase, user.id);
    const input = await parseJsonBody(request, updateAnimalSchema);
    const updatePayload = {
      ...(input.speciesId !== undefined ? { id_espece: input.speciesId } : {}),
      ...(input.name !== undefined ? { nom: input.name } : {}),
      ...(input.sex !== undefined ? { sexe: input.sex } : {}),
      ...(input.birthDate !== undefined ? { date_naissance: input.birthDate } : {}),
      ...(input.color !== undefined ? { couleur: input.color } : {}),
      ...(input.weightKg !== undefined ? { poids_kg: input.weightKg } : {}),
      ...(input.temperament !== undefined ? { temperament: input.temperament } : {}),
      ...(input.specificNeeds !== undefined
        ? { besoins_specifiques: input.specificNeeds }
        : {}),
    };

    const { data, error } = await supabase
      .from("animal")
      .update(updatePayload)
      .eq("id_animal", animalId)
      .eq("id_profil_proprietaire", ownerProfile.id)
      .select(animalSelect)
      .maybeSingle();

    throwIfSupabaseError(error, "Unable to update animal.");

    if (!data) {
      throw new NotFoundError("Animal not found.");
    }

    return jsonOk(mapAnimalRow(data));
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request: Request, context: AnimalRouteContext) {
  try {
    const { animalId } = await context.params;
    const { supabase, user } = await requireAuthenticatedUser(request);
    const ownerProfile = await requireOwnerProfile(supabase, user.id);
    const { data, error } = await supabase
      .from("animal")
      .delete()
      .eq("id_animal", animalId)
      .eq("id_profil_proprietaire", ownerProfile.id)
      .select("id_animal")
      .maybeSingle();

    throwIfSupabaseError(error, "Unable to delete animal.");

    if (!data) {
      throw new NotFoundError("Animal not found.");
    }

    return jsonOk({ deleted: true, id: animalId });
  } catch (error) {
    return jsonError(error);
  }
}
