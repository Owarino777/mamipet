import { ensureAccount } from "@/modules/identity-access/application/ensure-account";
import { assertReportTarget } from "@/modules/trust-moderation/domain/report-policy";
import {
  mapReportRow,
  reportSelect,
} from "@/modules/trust-moderation/presentation/report.mapper";
import { createReportSchema } from "@/modules/trust-moderation/presentation/report.schemas";
import { requireAuthenticatedUser } from "@/shared/auth/current-user";
import { HttpError } from "@/shared/errors/http-error";
import { parseJsonBody } from "@/shared/http/request-json";
import { jsonCreated, jsonError } from "@/shared/http/route-response";
import { throwIfSupabaseError } from "@/shared/supabase/errors";

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireAuthenticatedUser(request);
    const account = await ensureAccount(supabase, user);
    const input = await parseJsonBody(request, createReportSchema);

    assertReportTarget({
      reservationId: input.reservationId,
      petSitterProfileId: input.petSitterProfileId,
      reviewId: input.reviewId,
    });

    const { data, error } = await supabase
      .from("signalement")
      .insert({
        id_compte_createur: account.id_compte,
        id_reservation: input.reservationId ?? null,
        id_profil_pet_sitter: input.petSitterProfileId ?? null,
        id_avis: input.reviewId ?? null,
        categorie_signalement: input.category,
        motif: input.reason,
      })
      .select(reportSelect)
      .single();

    throwIfSupabaseError(error, "Unable to create report.");

    if (!data) {
      throw new HttpError("Report was not returned after creation.", 500, "EMPTY_RESPONSE");
    }

    return jsonCreated(mapReportRow(data));
  } catch (error) {
    return jsonError(error);
  }
}
