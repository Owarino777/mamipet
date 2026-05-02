import { requireAdminAccount } from "@/modules/administration/application/require-admin-account";
import { jsonError, jsonOk } from "@/shared/http/route-response";
import { throwIfSupabaseError } from "@/shared/supabase/errors";

const professionalDocumentSelect = `
  id_document_professionnel,
  id_profil_pet_sitter,
  type_document_professionnel,
  statut_document,
  nom_fichier,
  chemin_fichier,
  date_soumission,
  date_validation,
  commentaire_admin
`;

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

export function mapProfessionalDocumentRow(row: {
  id_document_professionnel: string;
  id_profil_pet_sitter: string;
  type_document_professionnel: string;
  statut_document: string;
  nom_fichier: string | null;
  chemin_fichier: string | null;
  date_soumission: string;
  date_validation: string | null;
  commentaire_admin: string | null;
}) {
  return {
    id: row.id_document_professionnel,
    petSitterProfileId: row.id_profil_pet_sitter,
    type: row.type_document_professionnel,
    status: row.statut_document,
    fileName: row.nom_fichier,
    filePath: row.chemin_fichier,
    submittedAt: row.date_soumission,
    validatedAt: row.date_validation,
    adminComment: row.commentaire_admin,
  };
}

export { professionalDocumentSelect };
