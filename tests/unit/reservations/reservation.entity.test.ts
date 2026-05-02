import { describe, expect, it } from "vitest";
import { DomainError } from "@/shared/errors/domain-error";
import { Reservation } from "@/modules/reservations/domain/reservation.entity";

const reservationParams = {
  id: "reservation-1",
  ownerProfileId: "owner-1",
  petSitterProfileId: "pet-sitter-1",
  careLocationId: "care-location-1",
  careFormatId: "care-format-1",
  startDate: new Date("2026-05-20T09:00:00.000Z"),
  endDate: new Date("2026-05-22T18:00:00.000Z"),
  insuranceLevel: "standard" as const,
  agreedPriceCents: 15_000,
  animals: [
    {
      animalId: "animal-1",
      ownerProfileId: "owner-1",
      priceCents: 15_000,
    },
  ],
};

describe("Reservation", () => {
  it("creates a reservation with the expected initial status and commission rate", () => {
    const reservation = Reservation.create(reservationParams);

    expect(reservation.status).toBe("awaiting_response");
    expect(reservation.platformCommissionRate).toBe(0.15);
  });

  it("rejects a reservation without animals", () => {
    expect(() =>
      Reservation.create({
        ...reservationParams,
        animals: [],
      }),
    ).toThrowError(DomainError);
  });

  it("rejects an animal that does not belong to the owner", () => {
    expect(() =>
      Reservation.create({
        ...reservationParams,
        animals: [
          {
            animalId: "animal-2",
            ownerProfileId: "another-owner",
            priceCents: 15_000,
          },
        ],
      }),
    ).toThrowError(DomainError);
  });

  it("allows the concerned pet-sitter to accept and then mark awaiting payment", () => {
    const reservation = Reservation.create(reservationParams);

    reservation.accept("pet-sitter-1", new Date("2026-05-19T09:00:00.000Z"));
    reservation.markAwaitingPayment();

    expect(reservation.status).toBe("awaiting_payment");
  });

  it("rejects payment when the reservation is not awaiting payment", () => {
    const reservation = Reservation.create(reservationParams);

    expect(() => reservation.markPaid()).toThrowError(DomainError);
  });

  it("refuses actions from another pet-sitter", () => {
    const reservation = Reservation.create(reservationParams);

    expect(() =>
      reservation.accept("another-pet-sitter", new Date("2026-05-19T09:00:00.000Z")),
    ).toThrowError(DomainError);
  });
});
