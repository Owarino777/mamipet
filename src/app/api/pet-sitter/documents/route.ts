import { requirePetSitterProfile } from "@/modules/pet-sitters/application/require-pet-sitter-profile";
import {
  mapProfessionalDocumentRow,
  professionalDocumentSelect,
} from "@/modules/pet-sitters/presentation/professional-document.mapper";
import { createProfessionalDocumentSchema } from "@/modules/pet-sitters/presentation/professional-document.schemas";
import { requireAuthenticatedUser } from "@/shared/auth/current-user";
import { HttpError } from "@/shared/errors/http-error";
import { parseJsonBody } from "@/shared/http/request-json";
import { jsonCreated, jsonError, jsonOk } from "@/shared/http/route-response";
import { throwIfSupabaseError } from "@/shared/supabase/errors";

export async function GET(request: Request) {
  try {
    const { supabase, user } = await requireAuthenticatedUser(request);
    const petSitterProfile = await requirePetSitterProfile(supabase, user.id);
    const { data, error } = await supabase
      .from("document_professionnel")
      .select(professionalDocumentSelect)
      .eq("id_profil_pet_sitter", petSitterProfile.id)
      .order("date_soumission", { ascending: false });

    throwIfSupabaseError(error, "Unable to list professional documents.");

    return jsonOk((data ?? []).map((row) => mapProfessionalDocumentRow(row)));
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireAuthenticatedUser(request);
    const petSitterProfile = await requirePetSitterProfile(supabase, user.id);
    const input = await parseJsonBody(request, createProfessionalDocumentSchema);
    const { data, error } = await supabase
      .from("document_professionnel")
      .insert({
        id_profil_pet_sitter: petSitterProfile.id,
        type_document_professionnel: input.type,
        statut_document: "submitted",
        nom_fichier: input.fileName ?? null,
        chemin_fichier: input.filePath ?? null,
      })
      .select(professionalDocumentSelect)
      .single();

    throwIfSupabaseError(error, "Unable to create professional document.");

    if (!data) {
      throw new HttpError(
        "Professional document was not returned after creation.",
        500,
        "EMPTY_RESPONSE",
      );
    }

    return jsonCreated(mapProfessionalDocumentRow(data));
  } catch (error) {
    return jsonError(error);
  }
}
