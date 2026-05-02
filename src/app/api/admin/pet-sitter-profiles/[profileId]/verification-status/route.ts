import { requireAdminAccount } from "@/modules/administration/application/require-admin-account";
import { updateVerificationStatusSchema } from "@/modules/administration/presentation/admin.schemas";
import {
  mapPetSitterProfileRow,
  petSitterProfileSelect,
} from "@/modules/pet-sitters/presentation/pet-sitter-profile.mapper";
import { NotFoundError } from "@/shared/errors/http-error";
import { parseJsonBody } from "@/shared/http/request-json";
import { jsonError, jsonOk } from "@/shared/http/route-response";
import { throwIfSupabaseError } from "@/shared/supabase/errors";

type VerificationStatusRouteContext = {
  params: Promise<{
    profileId: string;
  }>;
};

export async function PATCH(
  request: Request,
  context: VerificationStatusRouteContext,
) {
  try {
    const { profileId } = await context.params;
    const { supabase } = await requireAdminAccount(request);
    const input = await parseJsonBody(request, updateVerificationStatusSchema);
    const { data, error } = await supabase
      .from("profil_pet_sitter")
      .update({ statut_verification: input.status })
      .eq("id_profil_pet_sitter", profileId)
      .select(petSitterProfileSelect)
      .maybeSingle();

    throwIfSupabaseError(error, "Unable to update verification status.");

    if (!data) {
      throw new NotFoundError("Pet-sitter profile not found.");
    }

    return jsonOk(mapPetSitterProfileRow(data));
  } catch (error) {
    return jsonError(error);
  }
}
