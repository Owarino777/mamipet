import { requireAuthenticatedUser } from "@/shared/auth/current-user";
import { jsonError, jsonOk } from "@/shared/http/route-response";
import { throwIfSupabaseError } from "@/shared/supabase/errors";

type OwnerProfileRow = {
  id_profil_proprietaire: string;
};

type PetSitterProfileRow = {
  id_profil_pet_sitter: string;
};

export async function GET(request: Request) {
  try {
    const { supabase, user, account } = await requireAuthenticatedUser(request);

    const [ownerResult, sitterResult] = await Promise.all([supabase
      .from("profil_proprietaire")
      .select("id_profil_proprietaire")
      .eq("id_compte", user.id)
      .maybeSingle(), supabase
      .from("profil_pet_sitter")
      .select("id_profil_pet_sitter")
      .eq("id_compte", user.id)
      .maybeSingle()]);

    const { data: ownerProfile, error: ownerError } = ownerResult;
    const { data: petSitterProfile, error: petSitterError } = sitterResult;
    throwIfSupabaseError(ownerError, "Unable to read owner profile.");

    throwIfSupabaseError(petSitterError, "Unable to read pet-sitter profile.");

    return jsonOk({
      id: account.id_compte,
      email: account.email,
      isAdmin: account.est_administrateur,
      accountStatus: account.statut_compte,
      roles: {
        owner: Boolean(ownerProfile),
        petSitter: Boolean(petSitterProfile),
        admin: account.est_administrateur,
      },
      profiles: {
        ownerProfileId:
          (ownerProfile as OwnerProfileRow | null)?.id_profil_proprietaire ?? null,
        petSitterProfileId:
          (petSitterProfile as PetSitterProfileRow | null)?.id_profil_pet_sitter ??
          null,
      },
    });
  } catch (error) {
    return jsonError(error);
  }
}
