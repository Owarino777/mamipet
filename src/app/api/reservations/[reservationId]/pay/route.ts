import { calculatePaymentBreakdown } from "@/modules/payments/domain/platform-commission";
import { createStripeCheckoutSession } from "@/modules/payments/infrastructure/stripe-checkout";
import { requireOwnerProfile } from "@/modules/owners/application/require-owner-profile";
import { mapReservationRow } from "@/modules/reservations/presentation/reservation.mapper";
import { readReservation } from "@/app/api/reservations/route";
import { requireAuthenticatedUser } from "@/shared/auth/current-user";
import { getSiteUrl } from "@/shared/config/site";
import { ConflictError, ForbiddenError } from "@/shared/errors/http-error";
import { jsonError, jsonOk } from "@/shared/http/route-response";

type ReservationActionContext = {
  params: Promise<{
    reservationId: string;
  }>;
};

export async function POST(
  request: Request,
  context: ReservationActionContext,
) {
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

    if (
      reservation.statut_reservation !== "accepted" &&
      reservation.statut_reservation !== "awaiting_payment"
    ) {
      throw new ConflictError("Only accepted reservations can be paid.");
    }

    const totalAmountCents = Math.round(
      Number(reservation.tarif_convenu) * 100,
    );
    const payment = calculatePaymentBreakdown(totalAmountCents);
    const siteUrl = getSiteUrl();
    const successUrl = new URL("/dashboard", siteUrl);
    successUrl.searchParams.set("reservationCheckout", "success");
    successUrl.searchParams.set("reservationId", reservationId);
    const cancelUrl = new URL("/dashboard", siteUrl);
    cancelUrl.searchParams.set("reservationCheckout", "cancelled");
    cancelUrl.searchParams.set("reservationId", reservationId);
    const checkout = await createStripeCheckoutSession({
      cancelUrl: cancelUrl.toString(),
      clientReferenceId: reservationId,
      lineItem: {
        amountCents: payment.totalAmountCents,
        description: `Réservation MamiPet du ${reservation.date_debut_reservation} au ${reservation.date_fin_reservation}`,
        name: "Réservation MamiPet",
      },
      metadata: {
        checkoutKind: "reservation",
        reservationId,
      },
      successUrl: successUrl.toString(),
    });

    return jsonOk({
      checkoutSessionId: checkout.id,
      checkoutUrl: checkout.url,
      reservation: mapReservationRow(reservation),
    });
  } catch (error) {
    return jsonError(error);
  }
}
