import { DomainError } from "@/shared/errors/domain-error";

export const validationTestScopes = ["species", "care_capability"] as const;

export type ValidationTestScope = (typeof validationTestScopes)[number];

type ValidationTestTarget = {
  scope: ValidationTestScope;
  speciesId?: string | null;
  careCapabilityId?: string | null;
};

export function assertValidationTestTarget(target: ValidationTestTarget): void {
  const hasSpecies = Boolean(target.speciesId);
  const hasCareCapability = Boolean(target.careCapabilityId);

  if (target.scope === "species" && (!hasSpecies || hasCareCapability)) {
    throw new DomainError(
      "A species validation test must target one species and no care capability.",
      "INVALID_VALIDATION_TEST_TARGET",
    );
  }

  if (target.scope === "care_capability" && (!hasCareCapability || hasSpecies)) {
    throw new DomainError(
      "A care capability validation test must target one care capability and no species.",
      "INVALID_VALIDATION_TEST_TARGET",
    );
  }
}
