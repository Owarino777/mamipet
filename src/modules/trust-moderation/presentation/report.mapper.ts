import type { reportCategories, reportStatuses } from "./report.schemas";

export type ReportCategory = (typeof reportCategories)[number];
export type ReportStatus = (typeof reportStatuses)[number];

export type ReportRow = {
  id_signalement: string;
  id_compte_createur: string;
  id_reservation: string | null;
  id_profil_pet_sitter: string | null;
  id_avis: string | null;
  categorie_signalement: ReportCategory;
  motif: string;
  statut_ticket: ReportStatus;
  commentaire_resolution: string | null;
  date_signalement: string;
  date_resolution: string | null;
};

export type ReportDto = {
  id: string;
  creatorAccountId: string;
  target: {
    reservationId: string | null;
    petSitterProfileId: string | null;
    reviewId: string | null;
  };
  category: ReportCategory;
  reason: string;
  status: ReportStatus;
  resolutionComment: string | null;
  reportedAt: string;
  resolvedAt: string | null;
};

export const reportSelect = `
  id_signalement,
  id_compte_createur,
  id_reservation,
  id_profil_pet_sitter,
  id_avis,
  categorie_signalement,
  motif,
  statut_ticket,
  commentaire_resolution,
  date_signalement,
  date_resolution
`;

export function mapReportRow(row: ReportRow): ReportDto {
  return {
    id: row.id_signalement,
    creatorAccountId: row.id_compte_createur,
    target: {
      reservationId: row.id_reservation,
      petSitterProfileId: row.id_profil_pet_sitter,
      reviewId: row.id_avis,
    },
    category: row.categorie_signalement,
    reason: row.motif,
    status: row.statut_ticket,
    resolutionComment: row.commentaire_resolution,
    reportedAt: row.date_signalement,
    resolvedAt: row.date_resolution,
  };
}
