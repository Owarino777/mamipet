import { randomUUID } from "node:crypto";
import { calculatePaymentBreakdown } from "@/modules/payments/domain/platform-commission";
import { requireOwnerProfile } from "@/modules/owners/application/require-owner-profile";
import { mapReservationRow } from "@/modules/reservations/presentation/reservation.mapper";
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

export async function POST(request: Request, context: ReservationActionContext) {
  try {
    const { reservationId } = await context.params;
    const { supabase, user } = await requireAuthenticatedUser(request);
    const ownerProfile = await requireOwnerProfile(supabase, user.id);
    const reservation = await readReservation(supabase, reservationId);

    if (reservation.id_profil_proprietaire !== ownerProfile.id) {
      throw new ForbiddenError("Only the owner can pay this reservation.");
    }

    if (reservation.statut_reservation === "paid") {
      return jsonOk(mapReservationRow(reservation));
    }

    if (reservation.statut_reservation !== "accepted" && reservation.statut_reservation !== "awaiting_payment") {
      throw new ConflictError("Only accepted reservations can be paid.");
    }

    const totalAmountCents = Math.round(Number(reservation.tarif_convenu) * 100);
    const payment = calculatePaymentBreakdown(totalAmountCents);
    const simulatedPaymentIntentId = `pi_mamipet_test_${randomUUID()}`;

    const { error: statusError } = await supabase
      .from("reservation")
      .update({ statut_reservation: "paid" })
      .eq("id_reservation", reservationId);

    throwIfSupabaseError(statusError, "Unable to mark reservation as paid.");

    const { error: paymentError } = await supabase.from("paiement").insert({
      id_reservation: reservationId,
      statut_paiement: "succeeded",
      montant_total: payment.totalAmountCents / 100,
      commission_plateforme: payment.platformCommissionCents / 100,
      stripe_payment_intent_id: simulatedPaymentIntentId,
      stripe_transfer_group: `reservation_${reservationId}`,
      date_paiement: new Date().toISOString(),
    });

    throwIfSupabaseError(paymentError, "Unable to create simulated payment.");

    const { error: contractError } = await supabase.from("contrat_recapitulatif").insert({
      id_reservation: reservationId,
      niveau_assurance: reservation.niveau_assurance_applique,
      clauses_standard:
        "Récapitulatif contractuel MVP MamiPet: prestation acceptée, paiement test validé, commission plateforme 15%, assurance appliquée selon le niveau de réservation.",
    });

    throwIfSupabaseError(contractError, "Unable to generate reservation contract.");

    const updated = await readReservation(supabase, reservationId);

    return jsonOk(mapReservationRow(updated));
  } catch (error) {
    return jsonError(error);
  }
}
