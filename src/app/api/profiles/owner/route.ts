import { ensureAccount } from "@/modules/identity-access/application/ensure-account";
import { mapOwnerProfileRow } from "@/modules/owners/presentation/owner-profile.mapper";
import { createOwnerProfileSchema } from "@/modules/owners/presentation/owner-profile.schemas";
import { requireAuthenticatedUser } from "@/shared/auth/current-user";
import { ConflictError, HttpError } from "@/shared/errors/http-error";
import { parseJsonBody } from "@/shared/http/request-json";
import { jsonCreated, jsonError } from "@/shared/http/route-response";
import { throwIfSupabaseError } from "@/shared/supabase/errors";

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireAuthenticatedUser(request);
    const input = await parseJsonBody(request, createOwnerProfileSchema);
    await ensureAccount(supabase, user);

    const { data: existingProfile, error: existingError } = await supabase
      .from("profil_proprietaire")
      .select("id_profil_proprietaire")
      .eq("id_compte", user.id)
      .maybeSingle();

    throwIfSupabaseError(existingError, "Unable to verify owner profile.");

    if (existingProfile) {
      throw new ConflictError("This account already has an owner profile.");
    }

    const { data, error } = await supabase
      .from("profil_proprietaire")
      .insert({
        id_compte: user.id,
        pseudo: input.pseudo ?? null,
        prenom: input.firstName,
        telephone: input.phone ?? null,
        adresse_ligne1: input.addressLine1 ?? null,
        adresse_ligne2: input.addressLine2 ?? null,
        code_postal: input.postalCode ?? null,
        ville: input.city,
        pays: input.country,
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null,
      })
      .select("id_profil_proprietaire,pseudo,prenom,telephone,ville,pays,date_creation")
      .single();

    throwIfSupabaseError(error, "Unable to create owner profile.");

    if (!data) {
      throw new HttpError("Owner profile was not returned after creation.", 500, "EMPTY_RESPONSE");
    }

    return jsonCreated(mapOwnerProfileRow(data));
  } catch (error) {
    return jsonError(error);
  }
}
