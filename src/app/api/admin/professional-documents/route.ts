import { requireAdminAccount } from "@/modules/administration/application/require-admin-account";
import {
  mapProfessionalDocumentRow,
  professionalDocumentSelect,
} from "@/modules/pet-sitters/presentation/professional-document.mapper";
import { jsonError, jsonOk } from "@/shared/http/route-response";
import { throwIfSupabaseError } from "@/shared/supabase/errors";

export async function GET(request: Request) {
  try {
    const { supabase } = await requireAdminAccount(request);
    const { data, error } = await supabase
      .from("document_professionnel")
      .select(professionalDocumentSelect)
      .order("date_soumission", { ascending: false });

    throwIfSupabaseError(error, "Unable to list professional documents.");

    return jsonOk((data ?? []).map(mapProfessionalDocumentRow));
  } catch (error) {
    return jsonError(error);
  }
}
