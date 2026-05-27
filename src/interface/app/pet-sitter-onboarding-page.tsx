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
} from "@/modules/pet-sitters/domain/pet-sitter-competency-tests";
import { AuthBackButton } from "@/interface/shared/auth-back-button";
import { AnimalAssessmentIcon } from "@/interface/app/pet-sitter-assessment-icons";
import {
  AssessmentOutcomeScreen,
  type AssessmentOutcome,
} from "@/interface/app/pet-sitter-assessment-outcome";
import { PetSitterSubscriptionScreen } from "@/interface/app/pet-sitter-subscription-screen";

export function PetSitterOnboardingPage() {
  const router = useRouter();
  const session = useDemoSession();
  const [localOnboardingPhase, setLocalOnboardingPhase] = useState<
    "setup" | "tests" | "subscription" | null
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
    setAssessmentOutcome(null);
    setLocalOnboardingPhase("subscription");
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

  if (onboardingPhase === "subscription") {
    return (
      <PetSitterSubscriptionScreen
        onContinueWithoutPlan={publishPetSitterAfterAssessments}
        onProfessionalPlan={publishPetSitterAfterAssessments}
      />
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

function hasPassedAssessment(score: number, questionCount: number): boolean {
  return score === questionCount;
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
