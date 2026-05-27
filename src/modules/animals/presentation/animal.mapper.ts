import type { ReferenceItemDto } from "@/modules/reference-data/presentation/reference-data.mapper";

type SpeciesRelation =
  | {
      id_espece: string;
      code_espece: string;
      libelle_espece: string;
    }
  | {
      id_espece: string;
      code_espece: string;
      libelle_espece: string;
    }[]
  | null;

export type AnimalRow = {
  id_animal: string;
  id_profil_proprietaire: string;
  id_espece: string;
  nom: string;
  sexe: string | null;
  date_naissance: string | null;
  couleur: string | null;
  photo_url: string | null;
  poids_kg: number | string | null;
  temperament: string | null;
  besoins_specifiques: string | null;
  date_creation: string;
  espece?: SpeciesRelation;
  dossier_medical?: { id_dossier_medical: string } | { id_dossier_medical: string }[] | null;
};

export type AnimalDto = {
  id: string;
  ownerProfileId: string;
  species: ReferenceItemDto;
  name: string;
  sex: string | null;
  birthDate: string | null;
  color: string | null;
  photoUrl: string | null;
  weightKg: number | null;
  temperament: string | null;
  specificNeeds: string | null;
  hasMedicalRecord: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export type MedicalRecordRow = {
  id_dossier_medical: string;
  id_animal: string;
  protocole_soin: string | null;
  frequence: string | null;
  consignes_confidentielles: string | null;
  date_creation: string;
};

export type MedicalRecordDto = {
  id: string;
  animalId: string;
  careProtocol: string | null;
  frequency: string | null;
  confidentialInstructions: string | null;
  documents: [];
  createdAt: string;
  updatedAt: string | null;
};

export function mapAnimalRow(row: AnimalRow): AnimalDto {
  const speciesRelation = Array.isArray(row.espece) ? row.espece[0] : row.espece;
  const medicalRelation = Array.isArray(row.dossier_medical)
    ? row.dossier_medical[0]
    : row.dossier_medical;

  return {
    id: row.id_animal,
    ownerProfileId: row.id_profil_proprietaire,
    species: {
      id: speciesRelation?.id_espece ?? row.id_espece,
      code: speciesRelation?.code_espece ?? "",
      label: speciesRelation?.libelle_espece ?? "",
    },
    name: row.nom,
    sex: row.sexe,
    birthDate: row.date_naissance,
    color: row.couleur,
    photoUrl: row.photo_url,
    weightKg: row.poids_kg === null ? null : Number(row.poids_kg),
    temperament: row.temperament,
    specificNeeds: row.besoins_specifiques,
    hasMedicalRecord: Boolean(medicalRelation),
    createdAt: row.date_creation,
    updatedAt: null,
  };
}

export function mapMedicalRecordRow(row: MedicalRecordRow): MedicalRecordDto {
  return {
    id: row.id_dossier_medical,
    animalId: row.id_animal,
    careProtocol: row.protocole_soin,
    frequency: row.frequence,
    confidentialInstructions: row.consignes_confidentielles,
    documents: [],
    createdAt: row.date_creation,
    updatedAt: null,
  };
}
