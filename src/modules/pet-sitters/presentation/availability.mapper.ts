export type AvailabilityRow = {
  id_disponibilite: string;
  id_profil_pet_sitter: string;
  id_reservation: string | null;
  date_debut_disponibilite: string;
  date_fin_disponibilite: string;
  statut_disponibilite: "available" | "unavailable" | "blocked_reservation";
  commentaire: string | null;
};

export type AvailabilityDto = {
  id: string;
  petSitterProfileId: string;
  reservationId: string | null;
  startAt: string;
  endAt: string;
  status: AvailabilityRow["statut_disponibilite"];
  comment: string | null;
  lockedByReservation: boolean;
};

export const availabilitySelect = `
  id_disponibilite,
  id_profil_pet_sitter,
  id_reservation,
  date_debut_disponibilite,
  date_fin_disponibilite,
  statut_disponibilite,
  commentaire
`;

export function mapAvailabilityRow(row: AvailabilityRow): AvailabilityDto {
  return {
    id: row.id_disponibilite,
    petSitterProfileId: row.id_profil_pet_sitter,
    reservationId: row.id_reservation,
    startAt: row.date_debut_disponibilite,
    endAt: row.date_fin_disponibilite,
    status: row.statut_disponibilite,
    comment: row.commentaire,
    lockedByReservation: row.statut_disponibilite === "blocked_reservation",
  };
}
