import { describe, expect, it } from "vitest";
import { DomainError } from "@/shared/errors/domain-error";
import { assertReviewCanBeCreated } from "@/modules/trust-moderation/domain/review-policy";

describe("assertReviewCanBeCreated", () => {
  it("accepts reviews after completed reservations", () => {
    expect(() => assertReviewCanBeCreated("completed")).not.toThrow();
  });

  it("rejects reviews before completion", () => {
    expect(() => assertReviewCanBeCreated("paid")).toThrowError(DomainError);
  });
});
