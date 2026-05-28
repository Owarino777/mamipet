"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { demoPetSitters } from "@/interface/shared/product-data";
import {
  demoWorkspaceActions,
  useDemoWorkspace,
} from "@/interface/shared/demo-workspace-client";
import { formatEuro } from "@/interface/shared/format";
import { ButtonLink, SensitiveDataNotice } from "@/interface/shared/product-ui";
import { calculatePaymentBreakdown } from "@/modules/payments/domain/platform-commission";
import {
  ConnectedShell,
  useRoleAccess,
} from "@/interface/app/connected/connected-shell";
import { PetMiniCard } from "@/interface/app/connected/workspace-components";
import {
  createPetById,
  formatShortDate,
  getErrorMessage,
  getPrimaryPetSitter,
} from "@/interface/app/connected/workspace-formatters";

export function BookingFlowPage() {
  const workspace = useDemoWorkspace();

  const searchParams = useSearchParams();

  const sitterId = searchParams.get("sitter");
  const isGeneralRequest = !sitterId;

  const sitter =
    sitterId ? demoPetSitters.find((s) => s.id === sitterId) ?? getPrimaryPetSitter() : null;

  const [selectedPetIds, setSelectedPetIds] = useState(
    workspace.pets.map((pet) => pet.id),
  );

  const [requestStatus, setRequestStatus] = useState<string | null>(null);

  const [startDate, setStartDate] = useState("2026-05-24");

  const [endDate, setEndDate] = useState("2026-05-26");

  const [careType, setCareType] = useState("Garde chez le pet-sitter");

  const [instructions, setInstructions] = useState("");

  const [insuranceLevel, setInsuranceLevel] = useState<"standard" | "premium">(
    "standard",
  );

  const selectedPets = workspace.pets.filter((pet) =>
    selectedPetIds.includes(pet.id),
  );

  const estimatedTotalCents =
    selectedPets.length > 0
      ? 7600 +
        selectedPets.length * 1500 +
        (insuranceLevel === "premium" ? 900 : 0)
      : 0;

  const paymentBreakdown =
    estimatedTotalCents > 0
      ? calculatePaymentBreakdown(estimatedTotalCents)
      : null;

  const hasInvalidDates = endDate < startDate;

  const canSubmitRequest = selectedPets.length > 0 && !hasInvalidDates;

  const bookingStepIndex =
    selectedPets.length === 0 ? 0 : hasInvalidDates ? 1 : 3;

  const blockedContent = useRoleAccess("owner");

  if (blockedContent) {
    return blockedContent;
  }

  return (
    <ConnectedShell role="Propriétaire" active="Réservation">
      <main className="booking-workspace">
        <section className="booking-steps" aria-label="Étapes de réservation">
          {["Animaux", "Garde", "Consignes", "Vérification"].map(
            (step, index) => (
              <span
                className={
                  index <= bookingStepIndex
                    ? "step-pill step-pill--active"
                    : "step-pill"
                }
                key={step}
              >
                {index + 1}. {step}
              </span>
            ),
          )}
        </section>

        <div className="booking-layout">
          <section className="workspace-card booking-form-card">
            <div className="booking-form-card__header">
              <p className="section-kicker">
                {isGeneralRequest ? "Annonce générale" : "Demande directe"}
              </p>

              <h1>
                {isGeneralRequest
                  ? "Publiez une annonce claire pour les pet-sitters."
                  : `Préparez une demande claire pour ${sitter?.firstName}.`}
              </h1>

              <p>
                Les informations sensibles servent uniquement à vérifier la
                faisabilité de la garde. Le paiement test sera proposé après
                acceptation par un pet-sitter.
              </p>
            </div>

            {workspace.pets.length > 0 ? (
              <div className="pet-mini-grid">
                {workspace.pets.map((pet) => (
                  <label className="selectable-pet" key={pet.id}>
                    <input
                      type="checkbox"
                      checked={selectedPetIds.includes(pet.id)}
                      onChange={(event) => {
                        setSelectedPetIds((currentIds) =>
                          event.target.checked
                            ? [...currentIds, pet.id]
                            : currentIds.filter((id) => id !== pet.id),
                        );

                        setRequestStatus(null);
                      }}
                    />

                    <div>
                      <PetMiniCard pet={pet} />

                      <p>{pet.needs.join(" · ")}</p>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="workspace-empty-state">
                <p>
                  Ajoutez d&apos;abord un animal pour lancer une demande de
                  garde.
                </p>

                <ButtonLink href="/owner/animals" variant="secondary">
                  Ajouter un animal
                </ButtonLink>
              </div>
            )}

            <div className="inline-workspace-form inline-workspace-form--compact">
              <label>
                Début
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => {
                    setStartDate(event.target.value);

                    setRequestStatus(null);
                  }}
                />
              </label>

              <label>
                Fin
                <input
                  type="date"
                  value={endDate}
                  onChange={(event) => {
                    setEndDate(event.target.value);

                    setRequestStatus(null);
                  }}
                />
              </label>

              <label>
                Type de garde
                <select
                  value={careType}
                  onChange={(event) => {
                    setCareType(event.target.value);

                    setRequestStatus(null);
                  }}
                >
                  <option>Garde chez le pet-sitter</option>

                  <option>Garde à domicile</option>

                  <option>Visite</option>

                  <option>Promenade</option>
                </select>
              </label>

              <label>
                Assurance
                <select
                  value={insuranceLevel}
                  onChange={(event) => {
                    setInsuranceLevel(
                      event.target.value as "standard" | "premium",
                    );

                    setRequestStatus(null);
                  }}
                >
                  <option value="standard">Standard</option>

                  <option value="premium">Premium</option>
                </select>
              </label>
            </div>

            <label>
              Consignes propres à cette garde
              <textarea
                name="instructions"
                rows={5}
                value={instructions}
                onChange={(event) => {
                  setInstructions(event.target.value);

                  setRequestStatus(null);
                }}
                placeholder="Ex. traitement le matin, alimentation spécifique, comportement à surveiller..."
              />
            </label>

            {hasInvalidDates ? (
              <p className="workspace-status workspace-status--warning">
                La date de fin doit être identique ou postérieure à la date de
                début.
              </p>
            ) : null}

            <SensitiveDataNotice />
          </section>

          <aside className="workspace-card booking-summary-card">
            <h2>Récapitulatif</h2>

            {sitter ? (
              <Image
                src={sitter.imageUrl}
                alt={sitter.imageAlt}
                width={96}
                height={96}
              />
            ) : (
              <span className="booking-summary-card__marketplace-icon" aria-hidden="true">
                +
              </span>
            )}

            <p>
              {sitter
                ? `${sitter.firstName} ${sitter.lastInitial} · ${sitter.city}`
                : "Annonce visible par les pet-sitters disponibles"}
            </p>

            <dl>
              <div>
                <dt>Dates</dt>

                <dd>
                  {formatShortDate(startDate)} - {formatShortDate(endDate)}
                </dd>
              </div>

              <div>
                <dt>Animaux</dt>

                <dd>
                  {selectedPets.map((pet) => pet.name).join(", ") ||
                    "Aucun animal"}
                </dd>
              </div>

              <div>
                <dt>Type</dt>

                <dd>{careType}</dd>
              </div>

              <div>
                <dt>Total estimé</dt>

                <dd>{formatEuro(paymentBreakdown?.totalAmountCents ?? 0)}</dd>
              </div>

              <div>
                <dt>Commission MamiPet</dt>

                <dd>
                  {formatEuro(paymentBreakdown?.platformCommissionCents ?? 0)}
                </dd>
              </div>
            </dl>

            <div className="booking-next-step-note">
              <strong>Après envoi</strong>

              <p>
                {isGeneralRequest
                  ? "Un pet-sitter disponible peut accepter l'annonce. Ensuite le créneau est bloqué et vous confirmez par paiement test."
                  : `${sitter?.firstName} accepte ou refuse. En cas d'acceptation, le créneau est bloqué et vous confirmez par paiement test.`}
              </p>
            </div>

            <button
              className="primary-button"
              type="button"
              disabled={!canSubmitRequest}
              onClick={() => {
                try {
                  demoWorkspaceActions.createBooking({
                    petIds: selectedPetIds,

                    requestKind: isGeneralRequest ? "open" : "direct",

                    petSitterId: sitter?.id ?? null,

                    petSitterName: sitter
                      ? `${sitter.firstName} ${sitter.lastInitial}`
                      : "À attribuer",

                    startDate,

                    endDate,

                    careType,

                    instructions,

                    baseAmountCents: estimatedTotalCents,

                    insuranceLevel,
                  });

                  setRequestStatus(
                    isGeneralRequest
                      ? "Annonce publiée. Les pet-sitters peuvent maintenant la voir et l'accepter."
                      : "Demande envoyée. Elle apparaît maintenant côté pet-sitter.",
                  );
                } catch (error) {
                  setRequestStatus(getErrorMessage(error));
                }
              }}
            >
              Envoyer la demande
            </button>

            <small>
              Demande gratuite. Paiement uniquement après acceptation.
            </small>

            {requestStatus ? (
              <p className="workspace-status">{requestStatus}</p>
            ) : null}
          </aside>
        </div>
      </main>
    </ConnectedShell>
  );
}
