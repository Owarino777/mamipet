import { mapReservationRow } from "@/modules/reservations/presentation/reservation.mapper";
import { cancelReservationSchema } from "@/modules/reservations/presentation/reservation.schemas";
import { readReservation } from "@/app/api/reservations/route";
import { requireAuthenticatedUser } from "@/shared/auth/current-user";
import { ConflictError } from "@/shared/errors/http-error";
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
    const { supabase } = await requireAuthenticatedUser(request);
    const input = await parseJsonBody(request, cancelReservationSchema);
    const reservation = await readReservation(supabase, reservationId);

    if (reservation.statut_reservation === "refused" || reservation.statut_reservation === "completed") {
      throw new ConflictError("This reservation cannot be cancelled from its current status.");
    }

    const { error } = await supabase
      .from("reservation")
      .update({
        statut_reservation: "cancelled",
        motif_annulation: input.reason,
      })
      .eq("id_reservation", reservationId);

    throwIfSupabaseError(error, "Unable to cancel reservation.");

    const updated = await readReservation(supabase, reservationId);

    return jsonOk(mapReservationRow(updated));
  } catch (error) {
    return jsonError(error);
  }
}
