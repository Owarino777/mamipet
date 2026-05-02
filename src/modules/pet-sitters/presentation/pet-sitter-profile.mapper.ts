import type { ReferenceItemDto } from "@/modules/reference-data/presentation/reference-data.mapper";

export type PetSitterProfileRow = {
  id_profil_pet_sitter: string;
  pseudo: string | null;
  prenom: string;
  telephone: string | null;
  photo_url: string | null;
  description: string | null;
  adresse_ligne1: string | null;
  ville: string | null;
  pays: string | null;
  latitude: number | null;
  longitude: number | null;
  tarif_base: number | string | null;
  rayon_km: number | null;
  statut_verification:
    | "draft"
    | "published_unverified"
    | "identity_verified"
    | "professional_verified"
    | "suspended"
    | "rejected";
  visibilite_publique: boolean;
  date_creation: string;
};

export type PetSitterPrivateProfileDto = {
  id: string;
  pseudo: string | null;
  firstName: string;
  phone: string | null;
  photoUrl: string | null;
  description: string | null;
  addressLine: string | null;
  city: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  basePriceCents: number | null;
  interventionRadiusKm: number | null;
  verificationStatus: PetSitterProfileRow["statut_verification"];
  publicVisibility: boolean;
  offer: {
    species: ReferenceItemDto[];
    careCapabilities: ReferenceItemDto[];
    careLocations: ReferenceItemDto[];
    careFormats: ReferenceItemDto[];
    additionalServices: ReferenceItemDto[];
  };
  createdAt: string;
  updatedAt: string | null;
};

export function mapPetSitterProfileRow(
  row: PetSitterProfileRow,
): PetSitterPrivateProfileDto {
  return {
    id: row.id_profil_pet_sitter,
    pseudo: row.pseudo,
    firstName: row.prenom,
    phone: row.telephone,
    photoUrl: row.photo_url,
    description: row.description,
    addressLine: row.adresse_ligne1,
    city: row.ville,
    country: row.pays,
    latitude: row.latitude,
    longitude: row.longitude,
    basePriceCents:
      row.tarif_base === null ? null : Math.round(Number(row.tarif_base) * 100),
    interventionRadiusKm: row.rayon_km,
    verificationStatus: row.statut_verification,
    publicVisibility: row.visibilite_publique,
    offer: {
      species: [],
      careCapabilities: [],
      careLocations: [],
      careFormats: [],
      additionalServices: [],
    },
    createdAt: row.date_creation,
    updatedAt: null,
  };
}
