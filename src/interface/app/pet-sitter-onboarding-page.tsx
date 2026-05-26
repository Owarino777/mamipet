"use client";

import { useState } from "react";
import type React from "react";
import { useRouter } from "next/navigation";
import {
  publishDemoPetSitterProfile,
  saveDemoPetSitterSetupPreferences,
  saveDemoPetSitterValidatedTests,
  useDemoSession,
} from "@/interface/shared/demo-session-client";
import {
  PetSitterOnboardingPreferences,
  petSitterAnimalOptions,
  petSitterCareOptions,
  type PetSitterAnimalAssessmentCard,
  type PetSitterAnimalOptionId,
  type PetSitterCareOptionId,
  type PetSitterOfferReferenceCodes,
} from "@/modules/pet-sitters/domain/pet-sitter-onboarding-preferences";
import {
  petSitterCompetencyTests,
  type CompetencyTrack,
} from "@/modules/pet-sitters/domain/pet-sitter-competency-tests";
import { AuthBackButton } from "@/interface/shared/auth-back-button";


type AssessmentOutcome = {
  card: PetSitterAnimalAssessmentCard;
  status: "success" | "failure";
  track: CompetencyTrack;
};

export function PetSitterOnboardingPage() {
  const router = useRouter();
  const session = useDemoSession();
  const [localOnboardingPhase, setLocalOnboardingPhase] = useState<
    "setup" | "tests" | null
  >(null);
  const [localCareOptionIds, setLocalCareOptionIds] = useState<
    PetSitterCareOptionId[] | null
  >(null);
  const [localAnimalOptionIds, setLocalAnimalOptionIds] = useState<
    PetSitterAnimalOptionId[] | null
  >(null);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [isSyncingOffer, setIsSyncingOffer] = useState(false);
  const [activeAssessmentId, setActiveAssessmentId] =
    useState<PetSitterAnimalOptionId | null>(null);
  const [assessmentQuestionIndices, setAssessmentQuestionIndices] = useState<
    Record<string, number>
  >({});
  const [selectedAssessmentAnswers, setSelectedAssessmentAnswers] = useState<string[]>(
    [],
  );
  const [completedAssessmentIds, setCompletedAssessmentIds] = useState<
    PetSitterAnimalOptionId[]
  >([]);
  const [assessmentScores, setAssessmentScores] = useState<Record<string, number>>({});
  const [assessmentOutcome, setAssessmentOutcome] =
    useState<AssessmentOutcome | null>(null);
  const [assessmentFeedback, setAssessmentFeedback] = useState<string | null>(null);
  const selectedCareOptionIds =
    localCareOptionIds ?? session?.petSitterSetupPreferences?.careOptionIds ?? [];
  const selectedAnimalOptionIds =
    localAnimalOptionIds ?? session?.petSitterSetupPreferences?.animalOptionIds ?? [];
  const onboardingPreferences =
    selectedCareOptionIds.length > 0 && selectedAnimalOptionIds.length > 0
      ? PetSitterOnboardingPreferences.create({
        animalOptionIds: selectedAnimalOptionIds,
        careOptionIds: selectedCareOptionIds,
      })
      : null;
  const assessmentCards = onboardingPreferences?.getAnimalAssessmentCards() ?? [];
  const setupSelectedTests = onboardingPreferences?.getCompetencyTrackIds() ?? [];
  const sessionValidatedTests = session?.petSitterValidatedTests ?? [];
  const selectedTests =
    setupSelectedTests.length > 0 ? setupSelectedTests : sessionValidatedTests;
  const completedAssessmentSet = new Set(completedAssessmentIds);
  const activeAssessmentCard =
    assessmentCards.find((card) => card.animalOptionId === activeAssessmentId) ??
    assessmentCards.find((card) => !completedAssessmentSet.has(card.animalOptionId)) ??
    assessmentCards[0];
  const activeAssessmentTrack = activeAssessmentCard
    ? petSitterCompetencyTests.find(
      (test) => test.id === activeAssessmentCard.competencyTrackId,
    )
    : undefined;
  const activeAssessmentQuestionIndex = activeAssessmentCard
    ? assessmentQuestionIndices[activeAssessmentCard.animalOptionId] ?? 0
    : 0;
  const activeAssessmentQuestion =
    activeAssessmentTrack?.questions[activeAssessmentQuestionIndex];
  const activeAssessmentIsLastQuestion =
    activeAssessmentTrack !== undefined &&
    activeAssessmentQuestionIndex === activeAssessmentTrack.questions.length - 1;
  const resolvedOnboardingPhase =
    session?.petSitterProfileStatus === "published" ||
      sessionValidatedTests.length > 0 ||
      setupSelectedTests.length > 0
      ? "tests"
      : "setup";
  const onboardingPhase = localOnboardingPhase ?? resolvedOnboardingPhase;

  async function handleStartTests() {
    const preferences = PetSitterOnboardingPreferences.create({
      animalOptionIds: selectedAnimalOptionIds,
      careOptionIds: selectedCareOptionIds,
    });

    try {
      preferences.assertReadyForTests();
    } catch (error) {
      setSetupError(getErrorMessage(error));
      return;
    }

    saveDemoPetSitterSetupPreferences({
      animalOptionIds: preferences.getAnimalOptionIds(),
      careOptionIds: preferences.getCareOptionIds(),
    });
    setActiveAssessmentId(preferences.getAnimalOptionIds()[0] ?? null);
    setCompletedAssessmentIds([]);
    setAssessmentScores({});
    setAssessmentOutcome(null);
    setAssessmentQuestionIndices({});
    setSelectedAssessmentAnswers([]);
    setAssessmentFeedback(null);
    setSetupError(null);
    setIsSyncingOffer(true);

    try {
      await syncPetSitterOfferSelection(preferences.toOfferReferenceCodes());
    } catch {
      // The local demo must stay usable when the API is unavailable or unauthenticated.
    } finally {
      setIsSyncingOffer(false);
      setLocalOnboardingPhase("tests");
    }
  }

  function toggleCareOption(optionId: PetSitterCareOptionId, checked: boolean) {
    setLocalCareOptionIds((currentIds) => {
      const nextCurrentIds = currentIds ?? selectedCareOptionIds;

      return checked
        ? Array.from(new Set([...nextCurrentIds, optionId]))
        : nextCurrentIds.filter((id) => id !== optionId);
    });
    setLocalOnboardingPhase("setup");
    setSetupError(null);
  }

  function toggleAnimalOption(optionId: PetSitterAnimalOptionId, checked: boolean) {
    setLocalAnimalOptionIds((currentIds) => {
      const nextCurrentIds = currentIds ?? selectedAnimalOptionIds;

      return checked
        ? Array.from(new Set([...nextCurrentIds, optionId]))
        : nextCurrentIds.filter((id) => id !== optionId);
    });
    setLocalOnboardingPhase("setup");
    setSetupError(null);
  }

  function toggleAssessmentAnswer(answerLabel: string, checked: boolean) {
    setSelectedAssessmentAnswers((currentAnswers) =>
      checked
        ? Array.from(new Set([...currentAnswers, answerLabel]))
        : currentAnswers.filter((label) => label !== answerLabel),
    );
    setAssessmentFeedback(null);
  }

  function selectAssessmentCard(cardId: PetSitterAnimalOptionId) {
    setActiveAssessmentId(cardId);
    setAssessmentOutcome(null);
    setSelectedAssessmentAnswers([]);
    setAssessmentFeedback(null);
  }

  function returnToSetup() {
    setLocalOnboardingPhase("setup");
    setAssessmentOutcome(null);
    setAssessmentFeedback(null);
  }

  function handleValidateAssessmentQuestion() {
    if (!activeAssessmentCard || !activeAssessmentQuestion || !activeAssessmentTrack) {
      return;
    }

    if (selectedAssessmentAnswers.length === 0) {
      setAssessmentFeedback("Coche au moins une réponse avant de valider.");
      return;
    }

    const correctAnswerLabels = activeAssessmentQuestion.answers
      .filter((answer) => answer.isCorrect)
      .map((answer) => answer.label);
    const isCorrect = hasSameStringSet(selectedAssessmentAnswers, correctAnswerLabels);
    const nextScore =
      (assessmentScores[activeAssessmentCard.animalOptionId] ?? 0) +
      (isCorrect ? 1 : 0);

    setAssessmentScores((currentScores) => ({
      ...currentScores,
      [activeAssessmentCard.animalOptionId]: nextScore,
    }));

    if (!activeAssessmentIsLastQuestion) {
      setAssessmentQuestionIndices((currentIndices) => ({
        ...currentIndices,
        [activeAssessmentCard.animalOptionId]: activeAssessmentQuestionIndex + 1,
      }));
      setSelectedAssessmentAnswers([]);
      setAssessmentFeedback(null);
      return;
    }

    if (!hasPassedAssessment(nextScore, activeAssessmentTrack.questions.length)) {
      setAssessmentOutcome({
        card: activeAssessmentCard,
        status: "failure",
        track: activeAssessmentTrack,
      });
      setSelectedAssessmentAnswers([]);
      setAssessmentFeedback(null);
      return;
    }

    const nextCompletedAssessmentIds = Array.from(
      new Set([...completedAssessmentIds, activeAssessmentCard.animalOptionId]),
    );

    setCompletedAssessmentIds(nextCompletedAssessmentIds);
    setSelectedAssessmentAnswers([]);
    setAssessmentFeedback(null);
    setAssessmentOutcome({
      card: activeAssessmentCard,
      status: "success",
      track: activeAssessmentTrack,
    });
  }

  function continueAfterAssessmentSuccess() {
    if (!assessmentOutcome || assessmentOutcome.status !== "success") {
      return;
    }

    const nextCompletedSet = new Set(completedAssessmentIds);
    const nextAssessmentCard = assessmentCards.find(
      (card) => !nextCompletedSet.has(card.animalOptionId),
    );

    if (nextAssessmentCard) {
      setActiveAssessmentId(nextAssessmentCard.animalOptionId);
      setAssessmentOutcome(null);
      return;
    }

    saveDemoPetSitterValidatedTests(selectedTests);
    publishPetSitterAfterAssessments();
  }

  function publishPetSitterAfterAssessments() {
    publishDemoPetSitterProfile(selectedTests);
    router.push("/pet-sitter/dashboard");
  }

  if (onboardingPhase === "setup") {
    return (
      <main className="pet-sitter-setup-screen">
        <AuthBackButton onClick={() => router.push("/register")} />
        <section className="pet-sitter-setup-frame" aria-labelledby="pet-sitter-setup-title">
          <form
            className="pet-sitter-setup-card"
            onSubmit={(event) => {
              event.preventDefault();
              void handleStartTests();
            }}
          >
            <fieldset className="pet-sitter-setup-group">
              <legend id="pet-sitter-setup-title">
                Quelles gardes
                <span>souhaites-tu faire ?</span>
              </legend>
              <div className="pet-sitter-setup-options">
                {petSitterCareOptions.map((option) => (
                  <label className="pet-sitter-setup-check" key={option.id}>
                    <input
                      type="checkbox"
                      checked={selectedCareOptionIds.includes(option.id)}
                      onChange={(event) =>
                        toggleCareOption(option.id, event.target.checked)
                      }
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="pet-sitter-setup-group">
              <legend>
                Quels animaux
                <span>souhaites-tu garder ?</span>
              </legend>
              <div className="pet-sitter-setup-options pet-sitter-setup-options--animals">
                {[petSitterAnimalOptions.slice(0, 7), petSitterAnimalOptions.slice(7)].map(
                  (column, columnIndex) => (
                    <div className="pet-sitter-setup-column" key={columnIndex}>
                      {column.map((option) => (
                        <label className="pet-sitter-setup-check" key={option.id}>
                          <input
                            type="checkbox"
                            checked={selectedAnimalOptionIds.includes(option.id)}
                            onChange={(event) =>
                              toggleAnimalOption(option.id, event.target.checked)
                            }
                          />
                          <span>{option.label}</span>
                        </label>
                      ))}
                    </div>
                  ),
                )}
              </div>
            </fieldset>

            {setupError ? (
              <p className="pet-sitter-setup-error" role="alert">
                {setupError}
              </p>
            ) : null}

            <button className="pet-sitter-setup-submit" type="submit" disabled={isSyncingOffer}>
              Passer les tests
            </button>
          </form>
        </section>
      </main>
    );
  }

  if (assessmentOutcome) {
    return (
      <AssessmentOutcomeScreen
        outcome={assessmentOutcome}
        onBack={returnToSetup}
        onFinish={() => router.push("/pet-sitter/dashboard")}
        onOpenTraining={() => router.push("/pet-sitter/dashboard")}
        onSuccessConfirm={continueAfterAssessmentSuccess}
      />
    );
  }

  return (
    <main className="pet-sitter-tests-screen">
      <AuthBackButton onClick={returnToSetup} />
      <section
        className="pet-sitter-tests-stage"
        data-card-count={Math.min(assessmentCards.length, 4)}
        aria-label="Questionnaires animaux"
      >
        {assessmentCards.length === 0 || !activeAssessmentCard || !activeAssessmentTrack ? (
          <div className="pet-sitter-test-empty">
            <p>Aucun animal sélectionné.</p>
            <button
              className="pet-sitter-test-secondary"
              type="button"
              onClick={() => setLocalOnboardingPhase("setup")}
            >
              Modifier mes choix
            </button>
          </div>
        ) : (
          <>
            {assessmentCards
              .filter((card) => card.animalOptionId !== activeAssessmentCard.animalOptionId)
              .map((card, index) => (
                <button
                  aria-label={`Ouvrir les questions ${card.label}`}
                  className={`pet-sitter-test-tab pet-sitter-test-tab--${getAssessmentTheme(card)}`}
                  key={card.animalOptionId}
                  onClick={() => selectAssessmentCard(card.animalOptionId)}
                  style={{
                    "--stack-offset": assessmentCards.length - 1 - index,
                  } as React.CSSProperties}
                  type="button"
                >
                  <AnimalAssessmentIcon animalId={card.animalOptionId} />
                </button>
              ))}

            <article
              className={`pet-sitter-test-card pet-sitter-test-card--${getAssessmentTheme(activeAssessmentCard)}`}
            >
              <AnimalAssessmentIcon animalId={activeAssessmentCard.animalOptionId} />

              <div className="pet-sitter-test-question-card">
                <p className="pet-sitter-test-question-index">
                  Question {activeAssessmentQuestionIndex + 1}
                </p>
                <h1>{activeAssessmentQuestion?.scenario}</h1>
                <p>Coche la ou les bonnes réponses.</p>
                <div className="pet-sitter-test-answer-list">
                  {activeAssessmentQuestion?.answers.map((answer) => (
                    <label className="pet-sitter-test-answer" key={answer.label}>
                      <input
                        checked={selectedAssessmentAnswers.includes(answer.label)}
                        onChange={(event) =>
                          toggleAssessmentAnswer(answer.label, event.target.checked)
                        }
                        type="checkbox"
                      />
                      <span>{answer.label}</span>
                    </label>
                  ))}
                </div>
                {assessmentFeedback ? (
                  <p className="pet-sitter-test-feedback" role="alert">
                    {assessmentFeedback}
                  </p>
                ) : null}
              </div>

              <button
                aria-label="Valider la réponse"
                className="pet-sitter-test-submit"
                onClick={handleValidateAssessmentQuestion}
                type="button"
              >
                <span aria-hidden="true">✓</span>
              </button>
            </article>
          </>
        )}
      </section>
    </main>
  );
}

function AnimalAssessmentIcon({
  animalId,
}: {
  animalId: PetSitterAnimalOptionId;
}) {
  return (
    <span className="pet-sitter-test-icon" aria-hidden="true">
      {renderAnimalAssessmentIcon(animalId)}
    </span>
  );
}

function AssessmentOutcomeScreen({
  onBack,
  onFinish,
  onOpenTraining,
  onSuccessConfirm,
  outcome,
}: {
  onBack: () => void;
  onFinish: () => void;
  onOpenTraining: () => void;
  onSuccessConfirm: () => void;
  outcome: AssessmentOutcome;
}) {
  if (outcome.status === "success") {
    return (
      <main className="pet-sitter-outcome pet-sitter-outcome--success">
        <AuthBackButton onClick={onBack} />
        <div className="pet-sitter-outcome-copy">
          <h1>Félicitation&nbsp;!</h1>
          <p>Tu as obtenues le badge “{getExpertBadgeLabel(outcome.card)}”</p>
        </div>
        <div className="pet-sitter-expert-badge" aria-hidden="true">
          <AnimalAssessmentIcon animalId={outcome.card.animalOptionId} />
          <span>EXPERT</span>
        </div>
        <button
          aria-label="Continuer"
          className="pet-sitter-outcome-check"
          onClick={onSuccessConfirm}
          type="button"
        >
          ✓
        </button>
      </main>
    );
  }

  return (
    <main className="pet-sitter-outcome pet-sitter-outcome--failure">
      <AuthBackButton onClick={onBack} />
      <div className="pet-sitter-failure-seal">MINCE</div>
      <div className="pet-sitter-failure-copy">
        <p>Tu n’as pas réussi à obtenir le badge “{getExpertBadgeLabel(outcome.card)}”</p>
        <strong>Retente ta chance dans 7 jours&nbsp;!</strong>
      </div>
      <div className="pet-sitter-failure-actions">
        <button className="pet-sitter-training-button" onClick={onOpenTraining} type="button">
          Voir les formations
        </button>
        <button className="pet-sitter-finish-button" onClick={onFinish} type="button">
          Terminer
        </button>
      </div>
    </main>
  );
}

function getAssessmentTheme(card: PetSitterAnimalAssessmentCard): string {
  const themes: Record<PetSitterAnimalOptionId, string> = {
    amphibian: "green",
    bird: "blue",
    cat: "pink",
    dog: "blue",
    farm_animal: "green",
    fish: "blue",
    insect: "green",
    invertebrate: "green",
    reptile: "green",
    rodent: "coral",
    sick_animals: "pink",
    small_mammal: "coral",
  };

  return themes[card.animalOptionId];
}

function getExpertBadgeLabel(card: PetSitterAnimalAssessmentCard): string {
  return `Expert ${card.label.toLowerCase()}`;
}

function hasPassedAssessment(score: number, questionCount: number): boolean {
  return score === questionCount;
}

function renderAnimalAssessmentIcon(animalId: PetSitterAnimalOptionId): React.ReactNode {
  if (animalId === "cat" || animalId === "sick_animals") {
    return (
      <svg viewBox="0 0 48 48" focusable="false">
        <path d="M15 19 12 10c-.4-1.2 1-2.2 2-1.4l6.2 5.1a18 18 0 0 1 7.6 0L34 8.6c1-.8 2.4.2 2 1.4l-3 9" />
        <path d="M11 26c0-8 5.8-13 13-13s13 5 13 13-5.8 13-13 13-13-5-13-13Z" />
        <path d="M19 24h.1M29 24h.1M22 30c1.1 1 2.9 1 4 0M15 29l-5 1.5M15 33l-4 3M33 29l5 1.5M33 33l4 3" />
      </svg>
    );
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

  if (
    animalId === "reptile" ||
    animalId === "amphibian" ||
    animalId === "fish" ||
    animalId === "insect" ||
    animalId === "invertebrate"
  ) {
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

function hasSameStringSet(left: string[], right: string[]): boolean {
  if (left.length !== right.length) {
    return false;
  }

  const rightValues = new Set(right);

  return left.every((value) => rightValues.has(value));
}


type ApiFailure = {
  error?: {
    message?: string;
  } | null;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Une erreur est survenue.";
}

async function syncPetSitterOfferSelection(codes: PetSitterOfferReferenceCodes) {
  const [species, careCapabilities, careLocations, careFormats, additionalServices] =
    await Promise.all([
      fetchReferenceItems("/api/reference-data/species"),
      fetchReferenceItems("/api/reference-data/care-capabilities"),
      fetchReferenceItems("/api/reference-data/care-locations"),
      fetchReferenceItems("/api/reference-data/care-formats"),
      fetchReferenceItems("/api/reference-data/additional-services"),
    ]);

  const response = await fetch("/api/profiles/pet-sitter/me/offer", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      additionalServiceIds: resolveReferenceIds(additionalServices, codes.additionalServiceCodes),
      careCapabilityIds: resolveReferenceIds(careCapabilities, codes.careCapabilityCodes),
      careFormatIds: resolveReferenceIds(careFormats, codes.careFormatCodes),
      careLocationIds: resolveReferenceIds(careLocations, codes.careLocationCodes),
      speciesIds: resolveReferenceIds(species, codes.speciesCodes),
    }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as ApiFailure | null;
    throw new Error(
      payload?.error?.message ?? "Impossible d'enregistrer les choix pet-sitter.",
    );
  }
}

type ReferenceItem = {
  code: string;
  id: string;
  label: string;
};

async function fetchReferenceItems(endpoint: string): Promise<ReferenceItem[]> {
  const response = await fetch(endpoint, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Impossible de charger les références pet-sitter.");
  }

  const payload = (await response.json()) as { data?: ReferenceItem[] };

  return payload.data ?? [];
}

function resolveReferenceIds(items: ReferenceItem[], codes: string[]): string[] {
  const itemByCode = new Map(items.map((item) => [item.code, item.id]));

  return codes.flatMap((code) => {
    const id = itemByCode.get(code);

    return id ? [id] : [];
  });
}
