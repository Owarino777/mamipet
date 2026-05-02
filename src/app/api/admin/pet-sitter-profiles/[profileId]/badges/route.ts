import { requireAdminAccount } from "@/modules/administration/application/require-admin-account";
import { assignBadgeSchema } from "@/modules/administration/presentation/admin.schemas";
import { HttpError } from "@/shared/errors/http-error";
import { parseJsonBody } from "@/shared/http/request-json";
import { jsonCreated, jsonError } from "@/shared/http/route-response";
import { throwIfSupabaseError } from "@/shared/supabase/errors";

type AssignBadgeRouteContext = {
  params: Promise<{
    profileId: string;
  }>;
};

export async function POST(request: Request, context: AssignBadgeRouteContext) {
  try {
    const { profileId } = await context.params;
    const { supabase } = await requireAdminAccount(request);
    const input = await parseJsonBody(request, assignBadgeSchema);
    const { data, error } = await supabase
      .from("profil_pet_sitter_badge_public")
      .insert({
        id_profil_pet_sitter: profileId,
        id_badge_public: input.badgeId,
        origine_badge: input.origin,
        actif: true,
      })
      .select(
        "id_profil_pet_sitter_badge_public,id_profil_pet_sitter,id_badge_public,origine_badge,actif,date_obtention,date_retrait",
      )
      .single();

    throwIfSupabaseError(error, "Unable to assign badge.");

    if (!data) {
      throw new HttpError("Badge assignment was not returned.", 500, "EMPTY_RESPONSE");
    }

    return jsonCreated({
      id: data.id_profil_pet_sitter_badge_public,
      petSitterProfileId: data.id_profil_pet_sitter,
      badgeId: data.id_badge_public,
      origin: data.origine_badge,
      active: data.actif,
      obtainedAt: data.date_obtention,
      removedAt: data.date_retrait,
    });
  } catch (error) {
    return jsonError(error);
  }
}
