import { requirePetSitterProfile } from "@/modules/pet-sitters/application/require-pet-sitter-profile";
import {
  availabilitySelect,
  mapAvailabilityRow,
} from "@/modules/pet-sitters/presentation/availability.mapper";
import { createAvailabilitySchema } from "@/modules/pet-sitters/presentation/availability.schemas";
import { requireAuthenticatedUser } from "@/shared/auth/current-user";
import { assertDateRange } from "@/shared/validation/dates";
import { HttpError } from "@/shared/errors/http-error";
import { parseJsonBody } from "@/shared/http/request-json";
import { jsonCreated, jsonError, jsonOk } from "@/shared/http/route-response";
import { throwIfSupabaseError } from "@/shared/supabase/errors";

export async function GET(request: Request) {
  try {
    const { supabase, user } = await requireAuthenticatedUser(request);
    const petSitterProfile = await requirePetSitterProfile(supabase, user.id);
    const { data, error } = await supabase
      .from("disponibilite")
      .select(availabilitySelect)
      .eq("id_profil_pet_sitter", petSitterProfile.id)
      .order("date_debut_disponibilite", { ascending: true });

    throwIfSupabaseError(error, "Unable to list availabilities.");

    return jsonOk((data ?? []).map((row) => mapAvailabilityRow(row)));
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireAuthenticatedUser(request);
    const petSitterProfile = await requirePetSitterProfile(supabase, user.id);
    const input = await parseJsonBody(request, createAvailabilitySchema);
    const startAt = new Date(input.startAt);
    const endAt = new Date(input.endAt);

    assertDateRange(startAt, endAt);

    const { data, error } = await supabase
      .from("disponibilite")
      .insert({
        id_profil_pet_sitter: petSitterProfile.id,
        date_debut_disponibilite: startAt.toISOString(),
        date_fin_disponibilite: endAt.toISOString(),
        statut_disponibilite: input.status,
        commentaire: input.comment ?? null,
      })
      .select(availabilitySelect)
      .single();

    throwIfSupabaseError(error, "Unable to create availability.");

    if (!data) {
      throw new HttpError(
        "Availability was not returned after creation.",
        500,
        "EMPTY_RESPONSE",
      );
    }

    return jsonCreated(mapAvailabilityRow(data));
  } catch (error) {
    return jsonError(error);
  }
}
