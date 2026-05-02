import type { InsuranceLevel } from "@/modules/reservations/domain/insurance-level";
import type { ReservationStatus } from "@/modules/reservations/domain/reservation-status";

export type ReservationRow = {
  id_reservation: string;
  id_profil_proprietaire: string;
  id_profil_pet_sitter: string;
  id_lieu_garde: string;
  id_format_garde: string;
  date_demande: string;
  date_debut_reservation: string;
  date_fin_reservation: string;
  statut_reservation: ReservationStatus;
  niveau_assurance_applique: InsuranceLevel;
  tarif_convenu: number | string;
  taux_commission_plateforme: number | string;
  consignes_reservation: string | null;
  motif_refus: string | null;
  motif_annulation: string | null;
  date_reponse: string | null;
  paiement?: PaymentRelation[] | null;
  contrat_recapitulatif?: ContractRelation[] | null;
  reservation_animal?: ReservationAnimalRelation[] | null;
};

type PaymentRelation = {
  id_paiement: string;
  statut_paiement: string;
  montant_total: number | string;
  commission_plateforme: number | string;
  montant_prestataire: number | string;
  stripe_payment_intent_id: string | null;
};

type ContractRelation = {
  id_contrat_recapitulatif: string;
  niveau_assurance: InsuranceLevel;
  clauses_standard: string;
  chemin_fichier: string | null;
};

type ReservationAnimalRelation = {
  id_animal: string;
  tarif_animal: number | string;
  notes_animal_reservation: string | null;
  animal?: MaybeOneOrMany<{
    id_animal: string;
    nom: string;
  }> | null;
};

type MaybeOneOrMany<T> = T | T[];

export type ReservationDto = {
  id: string;
  ownerProfileId: string;
  petSitterProfileId: string;
  careLocationId: string;
  careFormatId: string;
  requestedAt: string;
  startAt: string;
  endAt: string;
  status: ReservationStatus;
  insuranceLevel: InsuranceLevel;
  agreedPriceCents: number;
  platformCommissionRate: number;
  instructions: string | null;
  refusalReason: string | null;
  cancellationReason: string | null;
  responseAt: string | null;
  animals: {
    id: string;
    name: string | null;
    priceCents: number;
    notes: string | null;
  }[];
  payment: {
    id: string;
    status: string;
    totalAmountCents: number;
    platformCommissionCents: number;
    providerAmountCents: number;
    externalPaymentIntentId: string | null;
  } | null;
  contract: {
    id: string;
    insuranceLevel: InsuranceLevel;
    clauses: string;
    filePath: string | null;
  } | null;
};

export const reservationSelect = `
  id_reservation,
  id_profil_proprietaire,
  id_profil_pet_sitter,
  id_lieu_garde,
  id_format_garde,
  date_demande,
  date_debut_reservation,
  date_fin_reservation,
  statut_reservation,
  niveau_assurance_applique,
  tarif_convenu,
  taux_commission_plateforme,
  consignes_reservation,
  motif_refus,
  motif_annulation,
  date_reponse,
  reservation_animal(id_animal,tarif_animal,notes_animal_reservation,animal(id_animal,nom)),
  paiement(id_paiement,statut_paiement,montant_total,commission_plateforme,montant_prestataire,stripe_payment_intent_id),
  contrat_recapitulatif(id_contrat_recapitulatif,niveau_assurance,clauses_standard,chemin_fichier)
`;

export function mapReservationRow(row: ReservationRow): ReservationDto {
  const payment = firstRelation(row.paiement);
  const contract = firstRelation(row.contrat_recapitulatif);

  return {
    id: row.id_reservation,
    ownerProfileId: row.id_profil_proprietaire,
    petSitterProfileId: row.id_profil_pet_sitter,
    careLocationId: row.id_lieu_garde,
    careFormatId: row.id_format_garde,
    requestedAt: row.date_demande,
    startAt: row.date_debut_reservation,
    endAt: row.date_fin_reservation,
    status: row.statut_reservation,
    insuranceLevel: row.niveau_assurance_applique,
    agreedPriceCents: Math.round(Number(row.tarif_convenu) * 100),
    platformCommissionRate: Number(row.taux_commission_plateforme),
    instructions: row.consignes_reservation,
    refusalReason: row.motif_refus,
    cancellationReason: row.motif_annulation,
    responseAt: row.date_reponse,
    animals: (row.reservation_animal ?? []).map((relation) => {
      const animal = firstMaybeRelation(relation.animal);

      return {
        id: relation.id_animal,
        name: animal?.nom ?? null,
        priceCents: Math.round(Number(relation.tarif_animal) * 100),
        notes: relation.notes_animal_reservation,
      };
    }),
    payment: payment
      ? {
          id: payment.id_paiement,
          status: payment.statut_paiement,
          totalAmountCents: Math.round(Number(payment.montant_total) * 100),
          platformCommissionCents: Math.round(Number(payment.commission_plateforme) * 100),
          providerAmountCents: Math.round(Number(payment.montant_prestataire) * 100),
          externalPaymentIntentId: payment.stripe_payment_intent_id,
        }
      : null,
    contract: contract
      ? {
          id: contract.id_contrat_recapitulatif,
          insuranceLevel: contract.niveau_assurance,
          clauses: contract.clauses_standard,
          filePath: contract.chemin_fichier,
        }
      : null,
  };
}

function firstRelation<T>(relation: T[] | null | undefined): T | null {
  return relation?.[0] ?? null;
}

function firstMaybeRelation<T>(
  relation: MaybeOneOrMany<T> | null | undefined,
): T | null {
  if (!relation) {
    return null;
  }

  return Array.isArray(relation) ? (relation[0] ?? null) : relation;
}
