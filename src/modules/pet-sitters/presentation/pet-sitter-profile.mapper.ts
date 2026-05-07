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
  profil_pet_sitter_espece?: OfferSpeciesRelation[] | null;
  profil_pet_sitter_capacite_soin?: OfferCareCapabilityRelation[] | null;
  profil_pet_sitter_lieu_garde?: OfferCareLocationRelation[] | null;
  profil_pet_sitter_format_garde?: OfferCareFormatRelation[] | null;
  profil_pet_sitter_service_additionnel?: OfferAdditionalServiceRelation[] | null;
  profil_pet_sitter_badge_public?: OfferPublicBadgeRelation[] | null;
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

export type PetSitterPublicProfileDto = Omit<
  PetSitterPrivateProfileDto,
  "phone" | "addressLine" | "publicVisibility"
> & {
  badges: ReferenceItemDto[];
};

type OfferSpeciesRelation = {
  espece?: MaybeOneOrMany<{
    id_espece: string;
    code_espece: string;
    libelle_espece: string;
  }> | null;
};

type OfferCareCapabilityRelation = {
  capacite_soin?: MaybeOneOrMany<{
    id_capacite_soin: string;
    code_capacite_soin: string;
    libelle_capacite_soin: string;
  }> | null;
};

type OfferCareLocationRelation = {
  lieu_garde?: MaybeOneOrMany<{
    id_lieu_garde: string;
    code_lieu_garde: string;
    libelle_lieu_garde: string;
  }> | null;
};

type OfferCareFormatRelation = {
  format_garde?: MaybeOneOrMany<{
    id_format_garde: string;
    code_format_garde: string;
    libelle_format_garde: string;
  }> | null;
};

type OfferAdditionalServiceRelation = {
  service_additionnel?: MaybeOneOrMany<{
    id_service_additionnel: string;
    code_service_additionnel: string;
    libelle_service_additionnel: string;
  }> | null;
};

type OfferPublicBadgeRelation = {
  actif: boolean;
  badge_public?: MaybeOneOrMany<{
    id_badge_public: string;
    code_badge_public: string;
    libelle_badge_public: string;
  }> | null;
};

type MaybeOneOrMany<T> = T | T[];

export const petSitterProfileSelect = `
  id_profil_pet_sitter,
  pseudo,
  prenom,
  telephone,
  photo_url,
  description,
  adresse_ligne1,
  ville,
  pays,
  latitude,
  longitude,
  tarif_base,
  rayon_km,
  statut_verification,
  visibilite_publique,
  date_creation,
  profil_pet_sitter_espece(espece(id_espece,code_espece,libelle_espece)),
  profil_pet_sitter_capacite_soin(capacite_soin(id_capacite_soin,code_capacite_soin,libelle_capacite_soin)),
  profil_pet_sitter_lieu_garde(lieu_garde(id_lieu_garde,code_lieu_garde,libelle_lieu_garde)),
  profil_pet_sitter_format_garde(format_garde(id_format_garde,code_format_garde,libelle_format_garde)),
  profil_pet_sitter_service_additionnel(service_additionnel(id_service_additionnel,code_service_additionnel,libelle_service_additionnel)),
  profil_pet_sitter_badge_public(actif,badge_public(id_badge_public,code_badge_public,libelle_badge_public))
`;

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
    offer: mapPetSitterOffer(row),
    createdAt: row.date_creation,
    updatedAt: null,
  };
}

export function mapPetSitterPublicProfileRow(
  row: PetSitterProfileRow,
): PetSitterPublicProfileDto {
  const privateProfile = mapPetSitterProfileRow(row);

  return {
    id: privateProfile.id,
    pseudo: privateProfile.pseudo,
    firstName: privateProfile.firstName,
    photoUrl: privateProfile.photoUrl,
    description: privateProfile.description,
    city: privateProfile.city,
    country: privateProfile.country,
    latitude: toApproximateCoordinate(privateProfile.latitude),
    longitude: toApproximateCoordinate(privateProfile.longitude),
    basePriceCents: privateProfile.basePriceCents,
    interventionRadiusKm: privateProfile.interventionRadiusKm,
    verificationStatus: privateProfile.verificationStatus,
    offer: privateProfile.offer,
    badges: mapPublicBadges(row.profil_pet_sitter_badge_public ?? []),
    createdAt: privateProfile.createdAt,
    updatedAt: null,
  };
}

function toApproximateCoordinate(value: number | null): number | null {
  if (value === null) {
    return null;
  }

  return Math.round(value * 100) / 100;
}

function mapPetSitterOffer(row: PetSitterProfileRow): PetSitterPrivateProfileDto["offer"] {
  return {
    species: (row.profil_pet_sitter_espece ?? []).flatMap((relation) => {
      const species = firstRelation(relation.espece);

      if (!species) {
        return [];
      }

      return [
        {
          id: species.id_espece,
          code: species.code_espece,
          label: species.libelle_espece,
        },
      ];
    }),
    careCapabilities: (row.profil_pet_sitter_capacite_soin ?? []).flatMap(
      (relation) => {
        const careCapability = firstRelation(relation.capacite_soin);

        if (!careCapability) {
          return [];
        }

        return [
          {
            id: careCapability.id_capacite_soin,
            code: careCapability.code_capacite_soin,
            label: careCapability.libelle_capacite_soin,
          },
        ];
      },
    ),
    careLocations: (row.profil_pet_sitter_lieu_garde ?? []).flatMap((relation) => {
      const careLocation = firstRelation(relation.lieu_garde);

      if (!careLocation) {
        return [];
      }

      return [
        {
          id: careLocation.id_lieu_garde,
          code: careLocation.code_lieu_garde,
          label: careLocation.libelle_lieu_garde,
        },
      ];
    }),
    careFormats: (row.profil_pet_sitter_format_garde ?? []).flatMap((relation) => {
      const careFormat = firstRelation(relation.format_garde);

      if (!careFormat) {
        return [];
      }

      return [
        {
          id: careFormat.id_format_garde,
          code: careFormat.code_format_garde,
          label: careFormat.libelle_format_garde,
        },
      ];
    }),
    additionalServices: (
      row.profil_pet_sitter_service_additionnel ?? []
    ).flatMap((relation) => {
      const additionalService = firstRelation(relation.service_additionnel);

      if (!additionalService) {
        return [];
      }

      return [
        {
          id: additionalService.id_service_additionnel,
          code: additionalService.code_service_additionnel,
          label: additionalService.libelle_service_additionnel,
        },
      ];
    }),
  };
}

function mapPublicBadges(relations: OfferPublicBadgeRelation[]): ReferenceItemDto[] {
  return relations.flatMap((relation) => {
    const badge = firstRelation(relation.badge_public);

    if (!relation.actif || !badge) {
      return [];
    }

    return [
      {
        id: badge.id_badge_public,
        code: badge.code_badge_public,
        label: badge.libelle_badge_public,
      },
    ];
  });
}

function firstRelation<T>(relation: MaybeOneOrMany<T> | null | undefined): T | null {
  if (!relation) {
    return null;
  }

  return Array.isArray(relation) ? (relation[0] ?? null) : relation;
}
