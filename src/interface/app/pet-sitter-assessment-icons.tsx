import Image from "next/image";
import type {
  PetSitterAnimalAssessmentCard,
  PetSitterAnimalOptionId,
} from "@/modules/pet-sitters/domain/pet-sitter-onboarding-preferences";

type AnimalIconAsset = {
  className: string;
  height: number;
  src: string;
  width: number;
};

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
  const asset = getAnimalIconAsset(animalId);

  return (
    <span
      className={`pet-sitter-test-icon${asset ? ` pet-sitter-test-icon--${asset.className}` : ""}`}
      aria-hidden="true"
    >
      {asset ? (
        <Image
          alt=""
          className="pet-sitter-test-icon__asset"
          height={asset.height}
          src={asset.src}
          unoptimized
          width={asset.width}
        />
      ) : (
        renderFallbackAnimalAssessmentIcon()
      )}
    </span>
  );
}

function getAnimalIconAsset(animalId: PetSitterAnimalOptionId): AnimalIconAsset | null {
  if (animalId === "cat" || animalId === "sick_animals") {
    return {
      className: "cat",
      height: 40,
      src: "/figma/assessment-cat.svg",
      width: 39,
    };
  }

  if (animalId === "dog") {
    return {
      className: "dog",
      height: 34,
      src: "/figma/assessment-dog.svg",
      width: 52,
    };
  }

  if (animalId === "rodent" || animalId === "small_mammal") {
    return {
      className: "rabbit",
      height: 42,
      src: "/figma/assessment-rabbit.svg",
      width: 34,
    };
  }

  if (["reptile", "amphibian", "fish", "insect", "invertebrate"].includes(animalId)) {
    return {
      className: "snake",
      height: 42,
      src: "/figma/assessment-snake.svg",
      width: 29,
    };
  }

  return null;
}

function renderFallbackAnimalAssessmentIcon() {
  return (
    <svg viewBox="0 0 48 48" focusable="false">
      <path d="M24 11c8 0 14 5.8 14 13s-6 13-14 13-14-5.8-14-13 6-13 14-13Z" />
      <path d="M19 24h.1M29 24h.1M21 30c1.6 1.2 4.4 1.2 6 0" />
    </svg>
  );
}
