import { DomainError } from "@/shared/errors/domain-error";

type ReportTarget = {
  reservationId?: string | null;
  petSitterProfileId?: string | null;
  reviewId?: string | null;
};

export function assertReportTarget(target: ReportTarget): void {
  const targetCount = [
    target.reservationId,
    target.petSitterProfileId,
    target.reviewId,
  ].filter(Boolean).length;

  if (targetCount > 1) {
    throw new DomainError(
      "A report can target at most one reservation, pet-sitter profile or review.",
      "REPORT_TARGET_CONFLICT",
    );
  }
}
