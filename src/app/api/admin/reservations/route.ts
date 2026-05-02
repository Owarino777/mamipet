import { requireAdminAccount } from "@/modules/administration/application/require-admin-account";
import {
  mapReservationRow,
  reservationSelect,
} from "@/modules/reservations/presentation/reservation.mapper";
import { jsonError, jsonOk } from "@/shared/http/route-response";
import { throwIfSupabaseError } from "@/shared/supabase/errors";

export async function GET(request: Request) {
  try {
    const { supabase } = await requireAdminAccount(request);
    const { data, error } = await supabase
      .from("reservation")
      .select(reservationSelect)
      .order("date_demande", { ascending: false });

    throwIfSupabaseError(error, "Unable to list reservations.");

    return jsonOk((data ?? []).map((row) => mapReservationRow(row)));
  } catch (error) {
    return jsonError(error);
  }
}
