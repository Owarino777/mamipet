export type ProfessionalDocumentRow = {
  id_document_professionnel: string;
  id_profil_pet_sitter: string;
  type_document_professionnel: string;
  statut_document: "submitted" | "validated" | "rejected" | "expired";
  nom_fichier: string | null;
  chemin_fichier: string | null;
  date_soumission: string;
  date_validation: string | null;
  commentaire_admin: string | null;
};

export type ProfessionalDocumentDto = {
  id: string;
  petSitterProfileId: string;
  type: string;
  status: ProfessionalDocumentRow["statut_document"];
  fileName: string | null;
  filePath: string | null;
  submittedAt: string;
  validatedAt: string | null;
  adminComment: string | null;
};

export const professionalDocumentSelect = `
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

export function mapProfessionalDocumentRow(
  row: ProfessionalDocumentRow,
): ProfessionalDocumentDto {
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
