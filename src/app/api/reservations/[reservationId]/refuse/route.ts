import { requirePetSitterProfile } from "@/modules/pet-sitters/application/require-pet-sitter-profile";
import { mapReservationRow } from "@/modules/reservations/presentation/reservation.mapper";
import { refuseReservationSchema } from "@/modules/reservations/presentation/reservation.schemas";
import { readReservation } from "@/app/api/reservations/route";
import { requireAuthenticatedUser } from "@/shared/auth/current-user";
import { ConflictError, ForbiddenError } from "@/shared/errors/http-error";
import { parseJsonBody } from "@/shared/http/request-json";
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
    const input = await parseJsonBody(request, refuseReservationSchema);
    const reservation = await readReservation(supabase, reservationId);

    if (reservation.id_profil_pet_sitter !== petSitterProfile.id) {
      throw new ForbiddenError("Only the requested pet-sitter can refuse this reservation.");
    }

    if (reservation.statut_reservation !== "awaiting_response") {
      throw new ConflictError("Only awaiting reservations can be refused.");
    }

    const { error } = await supabase
      .from("reservation")
      .update({
        statut_reservation: "refused",
        motif_refus: input.reason,
        date_reponse: new Date().toISOString(),
      })
      .eq("id_reservation", reservationId);

    throwIfSupabaseError(error, "Unable to refuse reservation.");

    const updated = await readReservation(supabase, reservationId);

    return jsonOk(mapReservationRow(updated));
  } catch (error) {
    return jsonError(error);
  }
}
