import { DomainError } from "@/shared/errors/domain-error";

export function assertDateRange(startDate: Date, endDate: Date): void {
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    throw new DomainError("Dates must be valid.", "INVALID_DATE");
  }

  if (endDate <= startDate) {
    throw new DomainError(
      "The end date must be strictly after the start date.",
      "INVALID_DATE_RANGE",
    );
  }
}
