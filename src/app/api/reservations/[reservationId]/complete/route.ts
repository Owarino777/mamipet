import { requireAdminAccount } from "@/modules/administration/application/require-admin-account";
import { mapReservationRow } from "@/modules/reservations/presentation/reservation.mapper";
import { readReservation } from "@/app/api/reservations/route";
import { ConflictError } from "@/shared/errors/http-error";
import { jsonError, jsonOk } from "@/shared/http/route-response";
import { throwIfSupabaseError } from "@/shared/supabase/errors";

type CompleteReservationRouteContext = {
  params: Promise<{
    reservationId: string;
  }>;
};

export async function PATCH(request: Request, context: CompleteReservationRouteContext) {
  try {
    const { reservationId } = await context.params;
    const { supabase } = await requireAdminAccount(request);
    const reservation = await readReservation(supabase, reservationId);

    if (reservation.statut_reservation !== "paid") {
      throw new ConflictError("Only paid reservations can be completed.");
    }

    const { error } = await supabase
      .from("reservation")
      .update({ statut_reservation: "completed" })
      .eq("id_reservation", reservationId);

    throwIfSupabaseError(error, "Unable to complete reservation.");

    const updated = await readReservation(supabase, reservationId);

    return jsonOk(mapReservationRow(updated));
  } catch (error) {
    return jsonError(error);
  }
}
