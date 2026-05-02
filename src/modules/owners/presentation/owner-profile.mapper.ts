export type OwnerProfileRow = {
  id_profil_proprietaire: string;
  pseudo: string | null;
  prenom: string;
  telephone: string | null;
  ville: string | null;
  pays: string | null;
  date_creation: string;
};

export type OwnerProfileDto = {
  id: string;
  pseudo: string | null;
  firstName: string;
  phone: string | null;
  city: string | null;
  country: string | null;
  createdAt: string;
  updatedAt: string | null;
};

export function mapOwnerProfileRow(row: OwnerProfileRow): OwnerProfileDto {
  return {
    id: row.id_profil_proprietaire,
    pseudo: row.pseudo,
    firstName: row.prenom,
    phone: row.telephone,
    city: row.ville,
    country: row.pays,
    createdAt: row.date_creation,
    updatedAt: null,
  };
}
