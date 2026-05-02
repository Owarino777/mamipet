import { mapOwnerProfileRow } from "@/modules/owners/presentation/owner-profile.mapper";
import { updateOwnerProfileSchema } from "@/modules/owners/presentation/owner-profile.schemas";
import { requireAuthenticatedUser } from "@/shared/auth/current-user";
import { NotFoundError } from "@/shared/errors/http-error";
import { parseJsonBody } from "@/shared/http/request-json";
import { jsonError, jsonOk } from "@/shared/http/route-response";
import { throwIfSupabaseError } from "@/shared/supabase/errors";

const ownerSelect =
  "id_profil_proprietaire,pseudo,prenom,telephone,ville,pays,date_creation";

export async function GET(request: Request) {
  try {
    const { supabase, user } = await requireAuthenticatedUser(request);
    const { data, error } = await supabase
      .from("profil_proprietaire")
      .select(ownerSelect)
      .eq("id_compte", user.id)
      .maybeSingle();

    throwIfSupabaseError(error, "Unable to read owner profile.");

    if (!data) {
      throw new NotFoundError("Owner profile not found.");
    }

    return jsonOk(mapOwnerProfileRow(data));
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const { supabase, user } = await requireAuthenticatedUser(request);
    const input = await parseJsonBody(request, updateOwnerProfileSchema);
    const updatePayload = {
      ...(input.pseudo !== undefined ? { pseudo: input.pseudo } : {}),
      ...(input.firstName !== undefined ? { prenom: input.firstName } : {}),
      ...(input.phone !== undefined ? { telephone: input.phone } : {}),
      ...(input.addressLine1 !== undefined
        ? { adresse_ligne1: input.addressLine1 }
        : {}),
      ...(input.addressLine2 !== undefined
        ? { adresse_ligne2: input.addressLine2 }
        : {}),
      ...(input.postalCode !== undefined ? { code_postal: input.postalCode } : {}),
      ...(input.city !== undefined ? { ville: input.city } : {}),
      ...(input.country !== undefined ? { pays: input.country } : {}),
      ...(input.latitude !== undefined ? { latitude: input.latitude } : {}),
      ...(input.longitude !== undefined ? { longitude: input.longitude } : {}),
    };

    const { data, error } = await supabase
      .from("profil_proprietaire")
      .update(updatePayload)
      .eq("id_compte", user.id)
      .select(ownerSelect)
      .maybeSingle();

    throwIfSupabaseError(error, "Unable to update owner profile.");

    if (!data) {
      throw new NotFoundError("Owner profile not found.");
    }

    return jsonOk(mapOwnerProfileRow(data));
  } catch (error) {
    return jsonError(error);
  }
}
