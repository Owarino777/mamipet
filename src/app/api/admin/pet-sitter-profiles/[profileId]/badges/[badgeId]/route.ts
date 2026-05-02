import { requireAdminAccount } from "@/modules/administration/application/require-admin-account";
import { NotFoundError } from "@/shared/errors/http-error";
import { jsonError, jsonOk } from "@/shared/http/route-response";
import { throwIfSupabaseError } from "@/shared/supabase/errors";

type RemoveBadgeRouteContext = {
  params: Promise<{
    profileId: string;
    badgeId: string;
  }>;
};

export async function DELETE(request: Request, context: RemoveBadgeRouteContext) {
  try {
    const { profileId, badgeId } = await context.params;
    const { supabase } = await requireAdminAccount(request);
    const { data, error } = await supabase
      .from("profil_pet_sitter_badge_public")
      .update({
        actif: false,
        date_retrait: new Date().toISOString(),
      })
      .eq("id_profil_pet_sitter", profileId)
      .eq("id_badge_public", badgeId)
      .eq("actif", true)
      .select("id_profil_pet_sitter_badge_public")
      .maybeSingle();

    throwIfSupabaseError(error, "Unable to remove badge.");

    if (!data) {
      throw new NotFoundError("Active badge assignment not found.");
    }

    return jsonOk({ removed: true, id: data.id_profil_pet_sitter_badge_public });
  } catch (error) {
    return jsonError(error);
  }
}
