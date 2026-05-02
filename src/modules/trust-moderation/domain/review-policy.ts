import { DomainError } from "@/shared/errors/domain-error";
import type { ReservationStatus } from "@/modules/reservations/domain/reservation-status";

export function assertReviewCanBeCreated(reservationStatus: ReservationStatus): void {
  if (reservationStatus !== "completed") {
    throw new DomainError(
      "A review can only be created after a completed reservation.",
      "REVIEW_REQUIRES_COMPLETED_RESERVATION",
    );
  }
}
