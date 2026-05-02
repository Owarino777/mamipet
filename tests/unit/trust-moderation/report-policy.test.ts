import { describe, expect, it } from "vitest";
import { DomainError } from "@/shared/errors/domain-error";
import { assertReportTarget } from "@/modules/trust-moderation/domain/report-policy";

describe("assertReportTarget", () => {
  it("accepts a general report without direct target", () => {
    expect(() => assertReportTarget({})).not.toThrow();
  });

  it("accepts one targeted report", () => {
    expect(() =>
      assertReportTarget({
        reservationId: "reservation-1",
      }),
    ).not.toThrow();
  });

  it("rejects reports with several direct targets", () => {
    expect(() =>
      assertReportTarget({
        reservationId: "reservation-1",
        reviewId: "review-1",
      }),
    ).toThrowError(DomainError);
  });
});
