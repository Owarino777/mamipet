import { DomainError } from "@/shared/errors/domain-error";

export type PetSitterCareOptionId =
  | "home_visits"
  | "home_sitting"
  | "owner_home_stay"
  | "walks"
  | "daycare";

export type PetSitterAnimalOptionId =
  | "cat"
  | "dog"
  | "rodent"
  | "bird"
  | "reptile"
  | "amphibian"
  | "fish"
  | "small_mammal"
  | "insect"
  | "invertebrate"
  | "farm_animal"
  | "sick_animals";

export type PetSitterOnboardingPreferenceInput = {
  animalOptionIds: PetSitterAnimalOptionId[];
  careOptionIds: PetSitterCareOptionId[];
};

export type PetSitterOfferReferenceCodes = {
  additionalServiceCodes: string[];
  careCapabilityCodes: string[];
  careFormatCodes: string[];
  careLocationCodes: string[];
  speciesCodes: string[];
};

export type PetSitterAnimalAssessmentCard = {
  animalOptionId: PetSitterAnimalOptionId;
  competencyTrackId: string;
  label: string;
};

export const petSitterCareOptions: Array<{
  id: PetSitterCareOptionId;
  label: string;
}> = [
  { id: "home_visits", label: "Visites à domicile" },
  { id: "home_sitting", label: "Garde à domicile" },
  { id: "owner_home_stay", label: "Garde chez le propriétaire" },
  { id: "walks", label: "Promenades" },
  { id: "daycare", label: "Garderie" },
];

export const petSitterAnimalOptions: Array<{
  id: PetSitterAnimalOptionId;
  label: string;
}> = [
  { id: "cat", label: "Chat" },
  { id: "dog", label: "Chien" },
  { id: "rodent", label: "Rongeur" },
  { id: "bird", label: "Oiseau" },
  { id: "reptile", label: "Reptile" },
  { id: "amphibian", label: "Amphibien" },
  { id: "fish", label: "Poisson" },
  { id: "small_mammal", label: "Petit mammifère" },
  { id: "insect", label: "Insecte" },
  { id: "invertebrate", label: "Invertébré" },
  { id: "farm_animal", label: "Animaux de la ferme" },
  { id: "sick_animals", label: "Animaux malades" },
];

const competencyTrackIdsByAnimal: Record<PetSitterAnimalOptionId, string[]> = {
  amphibian: ["nacs"],
  bird: ["birds"],
  cat: ["cats"],
  dog: ["dogs"],
  farm_animal: ["nacs"],
  fish: ["nacs"],
  insect: ["nacs"],
  invertebrate: ["nacs"],
  reptile: ["nacs"],
  rodent: ["nacs"],
  sick_animals: ["senior"],
  small_mammal: ["nacs"],
};

const offerCodesByCareOption: Record<
  PetSitterCareOptionId,
  Partial<PetSitterOfferReferenceCodes>
> = {
  daycare: {
    careFormatCodes: ["day"],
    careLocationCodes: ["pet_sitter_home"],
  },
  home_sitting: {
    careFormatCodes: ["day", "night"],
    careLocationCodes: ["owner_home"],
  },
  home_visits: {
    careFormatCodes: ["day"],
    careLocationCodes: ["visit"],
  },
  owner_home_stay: {
    careFormatCodes: ["night", "long_stay"],
    careLocationCodes: ["owner_home"],
  },
  walks: {
    additionalServiceCodes: ["extra_walk"],
    careFormatCodes: ["day"],
    careLocationCodes: ["visit"],
  },
};

const offerCodesByAnimalOption: Record<
  PetSitterAnimalOptionId,
  Partial<PetSitterOfferReferenceCodes>
> = {
  amphibian: { speciesCodes: ["amphibian"] },
  bird: { speciesCodes: ["bird"] },
  cat: { speciesCodes: ["cat"] },
  dog: { speciesCodes: ["dog"] },
  farm_animal: { speciesCodes: ["farm_animal"] },
  fish: {},
  insect: { speciesCodes: ["invertebrate"] },
  invertebrate: { speciesCodes: ["invertebrate"] },
  reptile: { speciesCodes: ["reptile"] },
  rodent: { speciesCodes: ["small_mammal"] },
  sick_animals: {
    careCapabilityCodes: [
      "enhanced_monitoring",
      "light_veterinary_protocol",
      "medical_treatment",
    ],
  },
  small_mammal: { speciesCodes: ["small_mammal"] },
};

export class PetSitterOnboardingPreferences {
  private constructor(
    private readonly careOptionIds: PetSitterCareOptionId[],
    private readonly animalOptionIds: PetSitterAnimalOptionId[],
  ) {}

  static create(
    input: PetSitterOnboardingPreferenceInput,
  ): PetSitterOnboardingPreferences {
    return new PetSitterOnboardingPreferences(
      unique(input.careOptionIds),
      unique(input.animalOptionIds),
    );
  }

  assertReadyForTests() {
    if (this.careOptionIds.length === 0) {
      throw new DomainError(
        "Sélectionnez au moins un type de garde.",
        "PET_SITTER_CARE_OPTION_REQUIRED",
      );
    }

    if (this.animalOptionIds.length === 0) {
      throw new DomainError(
        "Sélectionnez au moins une famille d'animaux.",
        "PET_SITTER_ANIMAL_OPTION_REQUIRED",
      );
    }
  }

  getAnimalOptionIds(): PetSitterAnimalOptionId[] {
    return [...this.animalOptionIds];
  }

  getCareOptionIds(): PetSitterCareOptionId[] {
    return [...this.careOptionIds];
  }

  getCompetencyTrackIds(): string[] {
    return unique(
      this.animalOptionIds.flatMap((animalId) => competencyTrackIdsByAnimal[animalId]),
    );
  }

  getAnimalAssessmentCards(): PetSitterAnimalAssessmentCard[] {
    return this.animalOptionIds.map((animalId) => ({
      animalOptionId: animalId,
      competencyTrackId: competencyTrackIdsByAnimal[animalId][0] ?? "nacs",
      label:
        petSitterAnimalOptions.find((option) => option.id === animalId)?.label ??
        animalId,
    }));
  }

  toOfferReferenceCodes(): PetSitterOfferReferenceCodes {
    return [
      ...this.careOptionIds.map((optionId) => offerCodesByCareOption[optionId]),
      ...this.animalOptionIds.map((optionId) => offerCodesByAnimalOption[optionId]),
    ].reduce<PetSitterOfferReferenceCodes>(
      (codes, partialCodes) => ({
        additionalServiceCodes: unique([
          ...codes.additionalServiceCodes,
          ...(partialCodes.additionalServiceCodes ?? []),
        ]),
        careCapabilityCodes: unique([
          ...codes.careCapabilityCodes,
          ...(partialCodes.careCapabilityCodes ?? []),
        ]),
        careFormatCodes: unique([
          ...codes.careFormatCodes,
          ...(partialCodes.careFormatCodes ?? []),
        ]),
        careLocationCodes: unique([
          ...codes.careLocationCodes,
          ...(partialCodes.careLocationCodes ?? []),
        ]),
        speciesCodes: unique([
          ...codes.speciesCodes,
          ...(partialCodes.speciesCodes ?? []),
        ]),
      }),
      {
        additionalServiceCodes: [],
        careCapabilityCodes: [],
        careFormatCodes: [],
        careLocationCodes: [],
        speciesCodes: [],
      },
    );
  }
}

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}
