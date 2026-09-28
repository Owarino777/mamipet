import { requirePetSitterProfile } from "@/modules/pet-sitters/application/require-pet-sitter-profile";
import {
  mapReservationRow,
} from "@/modules/reservations/presentation/reservation.mapper";
import { readReservation } from "@/app/api/reservations/route";
import { requireAuthenticatedUser } from "@/shared/auth/current-user";
import { ConflictError, ForbiddenError } from "@/shared/errors/http-error";
import { jsonError, jsonOk } from "@/shared/http/route-response";
import { throwIfSupabaseError } from "@/shared/supabase/errors";

type ReservationActionContext = {
  params: Promise<{
    reservationId: string;
  }>;
};

export async function PATCH(request: Request, context: ReservationActionContext) {
  try {
    const { reservationId } = await context.params;
    const { supabase, user } = await requireAuthenticatedUser(request);
    const petSitterProfile = await requirePetSitterProfile(supabase, user.id);
    const reservation = await readReservation(supabase, reservationId);

    if (reservation.id_profil_pet_sitter !== petSitterProfile.id) {
      throw new ForbiddenError("Only the requested pet-sitter can accept this reservation.");
    }

    if (reservation.statut_reservation !== "awaiting_response") {
      throw new ConflictError("Only awaiting reservations can be accepted.");
    }

    const { error } = await supabase.rpc("accept_reservation_and_block_slot", {
      p_id_reservation: reservationId,
    });
    throwIfSupabaseError(error, "Unable to accept reservation.");

    const updated = await readReservation(supabase, reservationId);

    return jsonOk(mapReservationRow(updated));
  } catch (error) {
    return jsonError(error);
  }
}
