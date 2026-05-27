import Image from "next/image";
import { DogAssessmentHeadIcon } from "@/interface/app/dog-assessment-head-icon";
import { RabbitExpertHeadIcon } from "@/interface/app/rabbit-expert-head-icon";
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

type ExpertBadgeOverlay = AnimalIconAsset & {
  badgeHeight: number;
  badgeWidth: number;
  badgeX: number;
  badgeY: number;
};

export function ExpertBadge({ card }: { card: PetSitterAnimalAssessmentCard }) {
  const asset = getAnimalIconAsset(card.animalOptionId);

  if (!asset || asset.className === "cat") {
    return (
      <div className="pet-sitter-expert-badge pet-sitter-expert-badge--asset" aria-hidden="true">
        <Image alt="" height={372} priority src="/figma/expert-chat-badge.svg" unoptimized width={318} />
      </div>
    );
  }

  return <ExpertBadgeWithAnimal asset={getExpertBadgeOverlay(asset)} />;
}

function ExpertBadgeWithAnimal({ asset }: { asset: ExpertBadgeOverlay }) {
  return (
    <div className="pet-sitter-expert-badge pet-sitter-expert-badge--asset" aria-hidden="true">
      <svg className="pet-sitter-expert-medal" viewBox="0 0 318 372" focusable="false">
        <image height="372" href="/figma/expert-chat-badge.svg" width="318" x="0" y="0" />
        <rect className="pet-sitter-expert-medal__animal-cover" height="150" rx="18" width="142" x="88" y="112" />
        {renderExpertBadgeAnimal(asset)}
      </svg>
    </div>
  );
}

function renderExpertBadgeAnimal(asset: ExpertBadgeOverlay) {
  if (asset.className === "dog") {
    return (
      <DogAssessmentHeadIcon
        className="pet-sitter-expert-medal__animal"
        height={asset.badgeHeight}
        width={asset.badgeWidth}
        x={asset.badgeX}
        y={asset.badgeY}
      />
    );
  }

  if (asset.className === "rabbit") {
    return (
      <RabbitExpertHeadIcon
        className="pet-sitter-expert-medal__animal"
        height={asset.badgeHeight}
        width={asset.badgeWidth}
        x={asset.badgeX}
        y={asset.badgeY}
      />
    );
  }

  return (
    <image
      height={asset.badgeHeight}
      href={asset.src}
      preserveAspectRatio="xMidYMid meet"
      width={asset.badgeWidth}
      x={asset.badgeX}
      y={asset.badgeY}
    />
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

function getExpertBadgeOverlay(asset: AnimalIconAsset): ExpertBadgeOverlay {
  if (asset.className === "dog") {
    return { ...asset, badgeHeight: 116, badgeWidth: 176, badgeX: 71, badgeY: 142 };
  }

  if (asset.className === "rabbit") {
    return { ...asset, badgeHeight: 146, badgeWidth: 118, badgeX: 100, badgeY: 120 };
  }

  if (asset.className === "snake") {
    return { ...asset, badgeHeight: 150, badgeWidth: 104, badgeX: 107, badgeY: 116 };
  }

  return { ...asset, badgeHeight: 128, badgeWidth: 128, badgeX: 95, badgeY: 124 };
}

function renderFallbackAnimalAssessmentIcon() {
  return (
    <svg viewBox="0 0 48 48" focusable="false">
      <path d="M24 11c8 0 14 5.8 14 13s-6 13-14 13-14-5.8-14-13 6-13 14-13Z" />
      <path d="M19 24h.1M29 24h.1M21 30c1.6 1.2 4.4 1.2 6 0" />
    </svg>
  );
}
