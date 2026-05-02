import { requireOwnerProfile } from "@/modules/owners/application/require-owner-profile";
import { assertReviewCanBeCreated } from "@/modules/trust-moderation/domain/review-policy";
import {
  mapReviewRow,
  reviewSelect,
} from "@/modules/trust-moderation/presentation/review.mapper";
import { createReviewSchema } from "@/modules/trust-moderation/presentation/review.schemas";
import { readReservation } from "@/app/api/reservations/route";
import { requireAuthenticatedUser } from "@/shared/auth/current-user";
import { ConflictError, ForbiddenError, HttpError } from "@/shared/errors/http-error";
import { parseJsonBody } from "@/shared/http/request-json";
import { jsonCreated, jsonError } from "@/shared/http/route-response";
import { throwIfSupabaseError } from "@/shared/supabase/errors";

type ReviewRouteContext = {
  params: Promise<{
    reservationId: string;
  }>;
};

export async function POST(request: Request, context: ReviewRouteContext) {
  try {
    const { reservationId } = await context.params;
    const { supabase, user } = await requireAuthenticatedUser(request);
    const ownerProfile = await requireOwnerProfile(supabase, user.id);
    const input = await parseJsonBody(request, createReviewSchema);
    const reservation = await readReservation(supabase, reservationId);

    if (reservation.id_profil_proprietaire !== ownerProfile.id) {
      throw new ForbiddenError("Only the reservation owner can create a review.");
    }

    assertReviewCanBeCreated(reservation.statut_reservation);

    const { data: existingReview, error: existingError } = await supabase
      .from("avis")
      .select("id_avis")
      .eq("id_reservation", reservationId)
      .maybeSingle();

    throwIfSupabaseError(existingError, "Unable to verify reservation review.");

    if (existingReview) {
      throw new ConflictError("This reservation already has a review.");
    }

    const { data, error } = await supabase
      .from("avis")
      .insert({
        id_reservation: reservationId,
        note_globale: input.rating,
        commentaire: input.comment ?? null,
        note_ponctualite: input.punctualityRating ?? null,
        note_communication: input.communicationRating ?? null,
        note_soins: input.careRating ?? null,
        note_confiance: input.trustRating ?? null,
      })
      .select(reviewSelect)
      .single();

    throwIfSupabaseError(error, "Unable to create review.");

    if (!data) {
      throw new HttpError("Review was not returned after creation.", 500, "EMPTY_RESPONSE");
    }

    return jsonCreated(mapReviewRow(data));
  } catch (error) {
    return jsonError(error);
  }
}
