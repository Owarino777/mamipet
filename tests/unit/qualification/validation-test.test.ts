import { describe, expect, it } from "vitest";
import { DomainError } from "@/shared/errors/domain-error";
import { assertValidationTestTarget } from "@/modules/qualification/domain/validation-test";

describe("assertValidationTestTarget", () => {
  it("accepts a species-only target", () => {
    expect(() =>
      assertValidationTestTarget({
        scope: "species",
        speciesId: "species-1",
      }),
    ).not.toThrow();
  });

  it("accepts a care-capability-only target", () => {
    expect(() =>
      assertValidationTestTarget({
        scope: "care_capability",
        careCapabilityId: "care-capability-1",
      }),
    ).not.toThrow();
  });

  it("rejects a target that mixes species and care capability", () => {
    expect(() =>
      assertValidationTestTarget({
        scope: "species",
        speciesId: "species-1",
        careCapabilityId: "care-capability-1",
      }),
    ).toThrowError(DomainError);
  });
});
