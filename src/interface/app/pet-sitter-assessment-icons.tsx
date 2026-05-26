import Image from "next/image";
import { CatExpertHeadIcon } from "@/interface/app/cat-expert-head-icon";
import type {
  PetSitterAnimalAssessmentCard,
  PetSitterAnimalOptionId,
} from "@/modules/pet-sitters/domain/pet-sitter-onboarding-preferences";

export function ExpertBadge({ card }: { card: PetSitterAnimalAssessmentCard }) {
  if (card.animalOptionId === "cat" || card.animalOptionId === "sick_animals") {
    return (
      <div className="pet-sitter-expert-badge pet-sitter-expert-badge--asset" aria-hidden="true">
        <Image alt="" height={372} priority src="/figma/expert-chat-badge.svg" unoptimized width={318} />
      </div>
    );
  }

  return (
    <div className="pet-sitter-expert-badge" aria-hidden="true">
      <AnimalAssessmentIcon animalId={card.animalOptionId} />
      <span>EXPERT</span>
    </div>
  );
}

export function AnimalAssessmentIcon({ animalId }: { animalId: PetSitterAnimalOptionId }) {
  return (
    <span className="pet-sitter-test-icon" aria-hidden="true">
      {renderAnimalAssessmentIcon(animalId)}
    </span>
  );
}

function renderAnimalAssessmentIcon(animalId: PetSitterAnimalOptionId) {
  if (animalId === "cat" || animalId === "sick_animals") {
    return <CatExpertHeadIcon />;
  }

  if (animalId === "dog") {
    return (
      <svg viewBox="0 0 48 48" focusable="false">
        <path d="M13 17c2.8-4.2 7-6 11-6s8.2 1.8 11 6" />
        <path d="M13 17c-4 1.8-6.2 5.9-5.4 10.6.4 2.3 3.2 2.8 4.4.8l3.1-5.3" />
        <path d="M35 17c4 1.8 6.2 5.9 5.4 10.6-.4 2.3-3.2 2.8-4.4.8l-3.1-5.3" />
        <path d="M12.5 26.5C12.5 34 17.5 39 24 39s11.5-5 11.5-12.5" />
        <path d="M19 25h.1M29 25h.1M21 32c1.7 1.5 4.3 1.5 6 0" />
      </svg>
    );
  }

  if (["reptile", "amphibian", "fish", "insect", "invertebrate"].includes(animalId)) {
    return (
      <svg viewBox="0 0 48 48" focusable="false">
        <path d="M31 9c-8 0-9 7-4 10l4 2c7 3 6 12-3 12H14" />
        <path d="M17 39c8 0 9-7 4-10l-4-2c-7-3-6-12 3-12h10" />
        <path d="M33 11h.1" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 48 48" focusable="false">
      <path d="M24 11c8 0 14 5.8 14 13s-6 13-14 13-14-5.8-14-13 6-13 14-13Z" />
      <path d="M19 24h.1M29 24h.1M21 30c1.6 1.2 4.4 1.2 6 0" />
    </svg>
  );
}
