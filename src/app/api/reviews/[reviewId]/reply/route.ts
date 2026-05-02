import { requirePetSitterProfile } from "@/modules/pet-sitters/application/require-pet-sitter-profile";
import {
  mapReviewRow,
  reviewSelect,
} from "@/modules/trust-moderation/presentation/review.mapper";
import { replyToReviewSchema } from "@/modules/trust-moderation/presentation/review.schemas";
import { requireAuthenticatedUser } from "@/shared/auth/current-user";
import { ForbiddenError, HttpError, NotFoundError } from "@/shared/errors/http-error";
import { parseJsonBody } from "@/shared/http/request-json";
import { jsonError, jsonOk } from "@/shared/http/route-response";
import { throwIfSupabaseError } from "@/shared/supabase/errors";

type ReviewReplyRouteContext = {
  params: Promise<{
    reviewId: string;
  }>;
};

export async function PATCH(request: Request, context: ReviewReplyRouteContext) {
  try {
    const { reviewId } = await context.params;
    const { supabase, user } = await requireAuthenticatedUser(request);
    const petSitterProfile = await requirePetSitterProfile(supabase, user.id);
    const input = await parseJsonBody(request, replyToReviewSchema);

    const { data: review, error: readError } = await supabase
      .from("avis")
      .select("id_avis,id_reservation,reservation(id_reservation,id_profil_pet_sitter)")
      .eq("id_avis", reviewId)
      .maybeSingle();

    throwIfSupabaseError(readError, "Unable to read review.");

    if (!review) {
      throw new NotFoundError("Review not found.");
    }

    const reservation = Array.isArray(review.reservation)
      ? review.reservation[0]
      : review.reservation;

    if (!reservation || reservation.id_profil_pet_sitter !== petSitterProfile.id) {
      throw new ForbiddenError("Only the concerned pet-sitter can reply to this review.");
    }

    const { data, error } = await supabase
      .from("avis")
      .update({
        reponse_pet_sitter: input.reply,
        date_reponse_pet_sitter: new Date().toISOString(),
      })
      .eq("id_avis", reviewId)
      .select(reviewSelect)
      .single();

    throwIfSupabaseError(error, "Unable to reply to review.");

    if (!data) {
      throw new HttpError("Review was not returned after reply.", 500, "EMPTY_RESPONSE");
    }

    return jsonOk(mapReviewRow(data));
  } catch (error) {
    return jsonError(error);
  }
}
