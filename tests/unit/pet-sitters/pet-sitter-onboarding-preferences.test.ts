import { describe, expect, it } from "vitest";
import { DomainError } from "@/shared/errors/domain-error";
import { PetSitterOnboardingPreferences } from "@/modules/pet-sitters/domain/pet-sitter-onboarding-preferences";

describe("PetSitterOnboardingPreferences", () => {
  it("requires at least one care option and one animal family before tests", () => {
    const preferences = PetSitterOnboardingPreferences.create({
      animalOptionIds: [],
      careOptionIds: ["home_visits"],
    });

    expect(() => preferences.assertReadyForTests()).toThrowError(DomainError);
  });

  it("deduplicates selected options and derives the matching competency tests", () => {
    const preferences = PetSitterOnboardingPreferences.create({
      animalOptionIds: ["dog", "dog", "cat", "reptile", "sick_animals"],
      careOptionIds: ["walks", "walks", "daycare"],
    });

    expect(preferences.getAnimalOptionIds()).toEqual([
      "dog",
      "cat",
      "reptile",
      "sick_animals",
    ]);
    expect(preferences.getCompetencyTrackIds()).toEqual([
      "dogs",
      "cats",
      "nacs",
      "senior",
    ]);
  });

  it("creates one assessment card per selected animal", () => {
    const preferences = PetSitterOnboardingPreferences.create({
      animalOptionIds: ["cat", "dog"],
      careOptionIds: ["home_visits"],
    });

    expect(preferences.getAnimalAssessmentCards()).toEqual([
      {
        animalOptionId: "cat",
        competencyTrackId: "cats",
        label: "Chat",
      },
      {
        animalOptionId: "dog",
        competencyTrackId: "dogs",
        label: "Chien",
      },
    ]);
  });

  it("maps setup choices to existing offer reference codes", () => {
    const preferences = PetSitterOnboardingPreferences.create({
      animalOptionIds: ["dog", "small_mammal", "sick_animals"],
      careOptionIds: ["home_visits", "walks"],
    });

    expect(preferences.toOfferReferenceCodes()).toEqual({
      additionalServiceCodes: ["extra_walk"],
      careCapabilityCodes: [
        "enhanced_monitoring",
        "light_veterinary_protocol",
        "medical_treatment",
      ],
      careFormatCodes: ["day"],
      careLocationCodes: ["visit"],
      speciesCodes: ["dog", "small_mammal"],
    });
  });
});
