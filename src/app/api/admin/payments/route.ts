import { requireAdminAccount } from "@/modules/administration/application/require-admin-account";
import { jsonError, jsonOk } from "@/shared/http/route-response";
import { throwIfSupabaseError } from "@/shared/supabase/errors";

export async function GET(request: Request) {
  try {
    const { supabase } = await requireAdminAccount(request);
    const { data, error } = await supabase
      .from("paiement")
      .select(
        "id_paiement,id_reservation,statut_paiement,montant_total,commission_plateforme,montant_prestataire,stripe_payment_intent_id,stripe_transfer_group,date_paiement,date_expiration,date_remboursement",
      )
      .order("date_paiement", { ascending: false, nullsFirst: false });

    throwIfSupabaseError(error, "Unable to list payments.");

    return jsonOk(
      (data ?? []).map((payment) => ({
        id: payment.id_paiement,
        reservationId: payment.id_reservation,
        status: payment.statut_paiement,
        totalAmountCents: Math.round(Number(payment.montant_total) * 100),
        platformCommissionCents: Math.round(
          Number(payment.commission_plateforme) * 100,
        ),
        providerAmountCents: Math.round(Number(payment.montant_prestataire) * 100),
        externalPaymentIntentId: payment.stripe_payment_intent_id,
        transferGroup: payment.stripe_transfer_group,
        paidAt: payment.date_paiement,
        expiresAt: payment.date_expiration,
        refundedAt: payment.date_remboursement,
      })),
    );
  } catch (error) {
    return jsonError(error);
  }
}
