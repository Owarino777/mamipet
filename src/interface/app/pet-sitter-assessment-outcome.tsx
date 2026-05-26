import { AuthBackButton } from "@/interface/shared/auth-back-button";
import { ExpertBadge } from "@/interface/app/pet-sitter-assessment-icons";
import type { CompetencyTrack } from "@/modules/pet-sitters/domain/pet-sitter-competency-tests";
import type { PetSitterAnimalAssessmentCard } from "@/modules/pet-sitters/domain/pet-sitter-onboarding-preferences";

export type AssessmentOutcome = {
  card: PetSitterAnimalAssessmentCard;
  status: "success" | "failure";
  track: CompetencyTrack;
};

type AssessmentOutcomeScreenProps = {
  onBack: () => void;
  onFinish: () => void;
  onOpenTraining: () => void;
  onSuccessConfirm: () => void;
  outcome: AssessmentOutcome;
};

export function AssessmentOutcomeScreen(props: AssessmentOutcomeScreenProps) {
  if (props.outcome.status === "success") {
    return (
      <main className="pet-sitter-outcome pet-sitter-outcome--success">
        <AuthBackButton onClick={props.onBack} />
        <div className="pet-sitter-outcome-copy">
          <h1>Félicitation&nbsp;!</h1>
          <p>Tu as obtenues le badge “{getExpertBadgeLabel(props.outcome.card)}”</p>
        </div>
        <ExpertBadge card={props.outcome.card} />
        <button
          aria-label="Continuer"
          className="pet-sitter-outcome-check"
          onClick={props.onSuccessConfirm}
          type="button"
        >
          ✓
        </button>
      </main>
    );
  }

  return (
    <main className="pet-sitter-outcome pet-sitter-outcome--failure">
      <AuthBackButton onClick={props.onBack} />
      <div className="pet-sitter-failure-seal">MINCE</div>
      <div className="pet-sitter-failure-copy">
        <p>Tu n’as pas réussi à obtenir le badge “{getExpertBadgeLabel(props.outcome.card)}”</p>
        <strong>Retente ta chance dans 7 jours&nbsp;!</strong>
      </div>
      <div className="pet-sitter-failure-actions">
        <button className="pet-sitter-training-button" onClick={props.onOpenTraining} type="button">
          Voir les formations
        </button>
        <button className="pet-sitter-finish-button" onClick={props.onFinish} type="button">
          Terminer
        </button>
      </div>
    </main>
  );
}

function getExpertBadgeLabel(card: PetSitterAnimalAssessmentCard): string {
  return `Expert ${card.label.toLowerCase()}`;
}
