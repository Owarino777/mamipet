import { assertPositiveMoneyCents, type MoneyCents } from "@/shared/domain/money";
import { DomainError } from "@/shared/errors/domain-error";
import { assertDateRange } from "@/shared/validation/dates";
import {
  initialReservationStatus,
  type ReservationStatus,
} from "./reservation-status";
import type { InsuranceLevel } from "./insurance-level";

export const MAMIPET_PLATFORM_COMMISSION_RATE = 0.15;

type ReservationAnimal = {
  animalId: string;
  ownerProfileId: string;
  priceCents: MoneyCents;
};

type CreateReservationParams = {
  id: string;
  ownerProfileId: string;
  petSitterProfileId: string;
  careLocationId: string;
  careFormatId: string;
  startDate: Date;
  endDate: Date;
  insuranceLevel: InsuranceLevel;
  agreedPriceCents: MoneyCents;
  animals: ReservationAnimal[];
  instructions?: string | null;
};

export class Reservation {
  private constructor(
    public readonly id: string,
    public readonly ownerProfileId: string,
    public readonly petSitterProfileId: string,
    public readonly careLocationId: string,
    public readonly careFormatId: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly insuranceLevel: InsuranceLevel,
    public readonly agreedPriceCents: MoneyCents,
    public readonly platformCommissionRate: number,
    public readonly animals: ReservationAnimal[],
    public readonly instructions: string | null,
    public status: ReservationStatus,
    public refusalReason: string | null,
    public cancellationReason: string | null,
    public responseDate: Date | null,
  ) {}

  static create(params: CreateReservationParams): Reservation {
    assertDateRange(params.startDate, params.endDate);
    assertPositiveMoneyCents(params.agreedPriceCents, "agreedPriceCents");

    if (params.animals.length === 0) {
      throw new DomainError(
        "A reservation must include at least one animal.",
        "RESERVATION_WITHOUT_ANIMAL",
      );
    }

    for (const animal of params.animals) {
      assertPositiveMoneyCents(animal.priceCents, "animal.priceCents");

      if (animal.ownerProfileId !== params.ownerProfileId) {
        throw new DomainError(
          "All reservation animals must belong to the reservation owner.",
          "ANIMAL_OWNER_MISMATCH",
        );
      }
    }

    return new Reservation(
      params.id,
      params.ownerProfileId,
      params.petSitterProfileId,
      params.careLocationId,
      params.careFormatId,
      params.startDate,
      params.endDate,
      params.insuranceLevel,
      params.agreedPriceCents,
      MAMIPET_PLATFORM_COMMISSION_RATE,
      [...params.animals],
      params.instructions ?? null,
      initialReservationStatus,
      null,
      null,
      null,
    );
  }

  accept(actorPetSitterProfileId: string, responseDate: Date): void {
    this.assertActorIsPetSitter(actorPetSitterProfileId);
    this.assertStatus("awaiting_response", "Only awaiting reservations can be accepted.");
    this.status = "accepted";
    this.responseDate = responseDate;
  }

  markAwaitingPayment(): void {
    this.assertStatus("accepted", "Only accepted reservations can await payment.");
    this.status = "awaiting_payment";
  }

  markPaid(): void {
    this.assertStatus("awaiting_payment", "Only reservations awaiting payment can be paid.");
    this.status = "paid";
  }

  refuse(actorPetSitterProfileId: string, reason: string, responseDate: Date): void {
    this.assertActorIsPetSitter(actorPetSitterProfileId);
    this.assertStatus("awaiting_response", "Only awaiting reservations can be refused.");
    this.status = "refused";
    this.refusalReason = reason;
    this.responseDate = responseDate;
  }

  complete(): void {
    this.assertStatus("paid", "Only paid reservations can be completed.");
    this.status = "completed";
  }

  cancel(reason: string): void {
    if (this.status === "refused" || this.status === "completed") {
      throw new DomainError(
        "This reservation cannot be cancelled from its current status.",
        "INVALID_RESERVATION_TRANSITION",
      );
    }

    this.status = "cancelled";
    this.cancellationReason = reason;
  }

  reportIncident(): void {
    if (this.status !== "paid" && this.status !== "completed") {
      throw new DomainError(
        "Only paid or completed reservations can report an incident.",
        "INVALID_RESERVATION_TRANSITION",
      );
    }

    this.status = "incident_reported";
  }

  private assertActorIsPetSitter(actorPetSitterProfileId: string): void {
    if (actorPetSitterProfileId !== this.petSitterProfileId) {
      throw new DomainError(
        "Only the concerned pet-sitter can perform this action.",
        "FORBIDDEN_PET_SITTER_ACTION",
      );
    }
  }

  private assertStatus(expected: ReservationStatus, message: string): void {
    if (this.status !== expected) {
      throw new DomainError(message, "INVALID_RESERVATION_TRANSITION");
    }
  }
}
