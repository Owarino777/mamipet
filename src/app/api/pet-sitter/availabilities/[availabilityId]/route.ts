import { requirePetSitterProfile } from "@/modules/pet-sitters/application/require-pet-sitter-profile";
import {
  availabilitySelect,
  mapAvailabilityRow,
} from "@/modules/pet-sitters/presentation/availability.mapper";
import { updateAvailabilitySchema } from "@/modules/pet-sitters/presentation/availability.schemas";
import { requireAuthenticatedUser } from "@/shared/auth/current-user";
import { ConflictError, NotFoundError } from "@/shared/errors/http-error";
import { parseJsonBody } from "@/shared/http/request-json";
import { jsonError, jsonOk } from "@/shared/http/route-response";
import { throwIfSupabaseError } from "@/shared/supabase/errors";
import { assertDateRange } from "@/shared/validation/dates";

type AvailabilityRouteContext = {
  params: Promise<{
    availabilityId: string;
  }>;
};

export async function PATCH(request: Request, context: AvailabilityRouteContext) {
  try {
    const { availabilityId } = await context.params;
    const { supabase, user } = await requireAuthenticatedUser(request);
    const petSitterProfile = await requirePetSitterProfile(supabase, user.id);
    const input = await parseJsonBody(request, updateAvailabilitySchema);
    const current = await readEditableAvailability(
      supabase,
      availabilityId,
      petSitterProfile.id,
    );

    const startAt = input.startAt
      ? new Date(input.startAt)
      : new Date(current.date_debut_disponibilite);
    const endAt = input.endAt
      ? new Date(input.endAt)
      : new Date(current.date_fin_disponibilite);

    assertDateRange(startAt, endAt);

    const { data, error } = await supabase
      .from("disponibilite")
      .update({
        ...(input.startAt !== undefined
          ? { date_debut_disponibilite: startAt.toISOString() }
          : {}),
        ...(input.endAt !== undefined
          ? { date_fin_disponibilite: endAt.toISOString() }
          : {}),
        ...(input.status !== undefined ? { statut_disponibilite: input.status } : {}),
        ...(input.comment !== undefined ? { commentaire: input.comment } : {}),
      })
      .eq("id_disponibilite", availabilityId)
      .eq("id_profil_pet_sitter", petSitterProfile.id)
      .is("id_reservation", null)
      .select(availabilitySelect)
      .maybeSingle();

    throwIfSupabaseError(error, "Unable to update availability.");

    if (!data) {
      throw new NotFoundError("Availability not found.");
    }

    return jsonOk(mapAvailabilityRow(data));
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request: Request, context: AvailabilityRouteContext) {
  try {
    const { availabilityId } = await context.params;
    const { supabase, user } = await requireAuthenticatedUser(request);
    const petSitterProfile = await requirePetSitterProfile(supabase, user.id);
    await readEditableAvailability(supabase, availabilityId, petSitterProfile.id);

    const { data, error } = await supabase
      .from("disponibilite")
      .delete()
      .eq("id_disponibilite", availabilityId)
      .eq("id_profil_pet_sitter", petSitterProfile.id)
      .is("id_reservation", null)
      .select("id_disponibilite")
      .maybeSingle();

    throwIfSupabaseError(error, "Unable to delete availability.");

    if (!data) {
      throw new NotFoundError("Availability not found.");
    }

    return jsonOk({ deleted: true, id: availabilityId });
  } catch (error) {
    return jsonError(error);
  }
}

async function readEditableAvailability(
  supabase: Awaited<ReturnType<typeof requireAuthenticatedUser>>["supabase"],
  availabilityId: string,
  petSitterProfileId: string,
) {
  const { data, error } = await supabase
    .from("disponibilite")
    .select(availabilitySelect)
    .eq("id_disponibilite", availabilityId)
    .eq("id_profil_pet_sitter", petSitterProfileId)
    .maybeSingle();

  throwIfSupabaseError(error, "Unable to read availability.");

  if (!data) {
    throw new NotFoundError("Availability not found.");
  }

  if (data.id_reservation || data.statut_disponibilite === "blocked_reservation") {
    throw new ConflictError("A reservation-blocked availability cannot be edited directly.");
  }

  return data;
}
