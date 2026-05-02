import { DomainError } from "@/shared/errors/domain-error";

type ReportTarget = {
  reservationId?: string | null | undefined;
  petSitterProfileId?: string | null | undefined;
  reviewId?: string | null | undefined;
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
