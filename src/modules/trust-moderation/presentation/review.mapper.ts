export type ReviewRow = {
  id_avis: string;
  id_reservation: string;
  note_globale: number;
  commentaire: string | null;
  note_ponctualite: number | null;
  note_communication: number | null;
  note_soins: number | null;
  note_confiance: number | null;
  date_avis: string;
  reponse_pet_sitter: string | null;
  date_reponse_pet_sitter: string | null;
};

export type ReviewDto = {
  id: string;
  reservationId: string;
  rating: number;
  comment: string | null;
  punctualityRating: number | null;
  communicationRating: number | null;
  careRating: number | null;
  trustRating: number | null;
  reviewedAt: string;
  petSitterReply: string | null;
  petSitterRepliedAt: string | null;
};

export const reviewSelect = `
  id_avis,
  id_reservation,
  note_globale,
  commentaire,
  note_ponctualite,
  note_communication,
  note_soins,
  note_confiance,
  date_avis,
  reponse_pet_sitter,
  date_reponse_pet_sitter
`;

export function mapReviewRow(row: ReviewRow): ReviewDto {
  return {
    id: row.id_avis,
    reservationId: row.id_reservation,
    rating: row.note_globale,
    comment: row.commentaire,
    punctualityRating: row.note_ponctualite,
    communicationRating: row.note_communication,
    careRating: row.note_soins,
    trustRating: row.note_confiance,
    reviewedAt: row.date_avis,
    petSitterReply: row.reponse_pet_sitter,
    petSitterRepliedAt: row.date_reponse_pet_sitter,
  };
}
