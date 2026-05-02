import { mapMedicalRecordRow } from "@/modules/animals/presentation/animal.mapper";
import { upsertMedicalRecordSchema } from "@/modules/animals/presentation/animal.schemas";
import { requireOwnerProfile } from "@/modules/owners/application/require-owner-profile";
import { requireAuthenticatedUser } from "@/shared/auth/current-user";
import { HttpError, NotFoundError } from "@/shared/errors/http-error";
import { parseJsonBody } from "@/shared/http/request-json";
import { jsonError, jsonOk } from "@/shared/http/route-response";
import { throwIfSupabaseError } from "@/shared/supabase/errors";

type MedicalRecordRouteContext = {
  params: Promise<{
    animalId: string;
  }>;
};

export async function PUT(request: Request, context: MedicalRecordRouteContext) {
  try {
    const { animalId } = await context.params;
    const { supabase, user } = await requireAuthenticatedUser(request);
    const ownerProfile = await requireOwnerProfile(supabase, user.id);
    const input = await parseJsonBody(request, upsertMedicalRecordSchema);

    const { data: animal, error: animalError } = await supabase
      .from("animal")
      .select("id_animal")
      .eq("id_animal", animalId)
      .eq("id_profil_proprietaire", ownerProfile.id)
      .maybeSingle();

    throwIfSupabaseError(animalError, "Unable to verify animal ownership.");

    if (!animal) {
      throw new NotFoundError("Animal not found.");
    }

    const { data, error } = await supabase
      .from("dossier_medical")
      .upsert(
        {
          id_animal: animalId,
          protocole_soin: input.careProtocol ?? null,
          frequence: input.frequency ?? null,
          consignes_confidentielles: input.confidentialInstructions ?? null,
        },
        { onConflict: "id_animal" },
      )
      .select(
        "id_dossier_medical,id_animal,protocole_soin,frequence,consignes_confidentielles,date_creation",
      )
      .single();

    throwIfSupabaseError(error, "Unable to upsert medical record.");

    if (!data) {
      throw new HttpError(
        "Medical record was not returned after upsert.",
        500,
        "EMPTY_RESPONSE",
      );
    }

    return jsonOk(mapMedicalRecordRow(data));
  } catch (error) {
    return jsonError(error);
  }
}
