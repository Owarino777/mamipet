import { requireAdminAccount } from "@/modules/administration/application/require-admin-account";
import { professionalDocumentDecisionSchema } from "@/modules/administration/presentation/admin.schemas";
import {
  mapProfessionalDocumentRow,
  professionalDocumentSelect,
} from "@/modules/pet-sitters/presentation/professional-document.mapper";
import { NotFoundError } from "@/shared/errors/http-error";
import { parseJsonBody } from "@/shared/http/request-json";
import { jsonError, jsonOk } from "@/shared/http/route-response";
import { throwIfSupabaseError } from "@/shared/supabase/errors";

type DocumentDecisionRouteContext = {
  params: Promise<{
    documentId: string;
  }>;
};

export async function POST(request: Request, context: DocumentDecisionRouteContext) {
  try {
    const { documentId } = await context.params;
    const { supabase } = await requireAdminAccount(request);
    const input = await parseJsonBody(request, professionalDocumentDecisionSchema);
    const { data, error } = await supabase
      .from("document_professionnel")
      .update({
        statut_document: "validated",
        date_validation: new Date().toISOString(),
        commentaire_admin: input.adminComment ?? null,
      })
      .eq("id_document_professionnel", documentId)
      .select(professionalDocumentSelect)
      .maybeSingle();

    throwIfSupabaseError(error, "Unable to validate professional document.");

    if (!data) {
      throw new NotFoundError("Professional document not found.");
    }

    return jsonOk(mapProfessionalDocumentRow(data));
  } catch (error) {
    return jsonError(error);
  }
}
