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

    const responseAt = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("reservation")
      .update({
        statut_reservation: "accepted",
        date_reponse: responseAt,
      })
      .eq("id_reservation", reservationId);

    throwIfSupabaseError(updateError, "Unable to accept reservation.");

    const { error: availabilityError } = await supabase.from("disponibilite").insert({
      id_profil_pet_sitter: petSitterProfile.id,
      id_reservation: reservationId,
      date_debut_disponibilite: reservation.date_debut_reservation,
      date_fin_disponibilite: reservation.date_fin_reservation,
      statut_disponibilite: "blocked_reservation",
    });

    throwIfSupabaseError(availabilityError, "Unable to block accepted slot.");

    const updated = await readReservation(supabase, reservationId);

    return jsonOk(mapReservationRow(updated));
  } catch (error) {
    return jsonError(error);
  }
}
