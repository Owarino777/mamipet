"use client";

import Image from "next/image";
import Link from "next/link";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { demoPetSitters } from "@/interface/shared/product-data";
import {
  activateDemoSessionRole,
  clearDemoSession,
  ConnectedShellIdentity,
  DemoSessionGreeting,
  publishDemoPetSitterProfile,
  saveDemoPetSitterSetupPreferences,
  saveDemoPetSitterValidatedTests,
  type DemoSessionRole,
  setLocalDemoSession,
  switchDemoSessionRole,
  useDemoSession,
} from "@/interface/shared/demo-session-client";
import {
  demoWorkspaceActions,
  useDemoWorkspace,
} from "@/interface/shared/demo-workspace-client";
import {
  getBookingStatusLabel,
  type DemoAdminTask,
  type DemoBooking,
  type DemoPet,
} from "@/interface/shared/demo-workspace-state";
import { formatEuro, formatRating } from "@/interface/shared/format";
import {
  ButtonLink,
  CareCapabilityTag,
  SensitiveDataNotice,
  TrustBadge,
} from "@/interface/shared/product-ui";
import { calculatePaymentBreakdown } from "@/modules/payments/domain/platform-commission";
import {
  PetSitterOnboardingPreferences,
  petSitterAnimalOptions,
  petSitterCareOptions,
  type PetSitterAnimalOptionId,
  type PetSitterCareOptionId,
  type PetSitterOfferReferenceCodes,
} from "@/modules/pet-sitters/domain/pet-sitter-onboarding-preferences";
import { createSupabaseBrowserClient } from "@/shared/supabase/browser-client";

const defaultPetImageUrl =
  "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1200&q=82";

export function OwnerDashboardPage() {
  const workspace = useDemoWorkspace();
  const nextBooking = workspace.bookings.find(
    (booking) => booking.status !== "completed" && booking.status !== "refused",
  );
  const completedBookingToReview = workspace.bookings.find(
    (booking) => booking.status === "completed" && !booking.review,
  );
  const petById = useMemo(() => createPetById(workspace.pets), [workspace.pets]);

  const blockedContent = useRoleAccess("owner");
  if (blockedContent) {
    return blockedContent;
  }

  return (
    <ConnectedShell role="Propriétaire" active="Tableau de bord">
      <main className="workspace-main">
        <div className="workspace-heading">
          <div>
            <DemoSessionGreeting className="section-kicker" fallbackName="Olivia" />
            <h1>Vos gardes et animaux sont à jour.</h1>
          </div>
          <ButtonLink href="/reservations/new">Nouvelle réservation</ButtonLink>
        </div>

        <section className="workspace-grid workspace-grid--hero">
          <article className="workspace-card upcoming-card">
            <div>
              <p className="section-kicker">Prochaine garde</p>
              {nextBooking ? (
                <>
                  <h2>{formatBookingTitle(nextBooking, petById)}</h2>
                  <p>
                    Du {formatShortDate(nextBooking.startDate)} au{" "}
                    {formatShortDate(nextBooking.endDate)} · {nextBooking.petSitterName}
                  </p>
                </>
              ) : (
                <>
                  <h2>Aucune garde active</h2>
                  <p>Votre prochaine demande apparaîtra ici après création.</p>
                </>
              )}
            </div>
            {nextBooking ? (
              <>
                <div className="badge-row">
                  <TrustBadge label={getBookingStatusLabel(nextBooking.status)} />
                  <TrustBadge label={`Assurance ${nextBooking.insuranceLevel}`} />
                  <TrustBadge label={`Commission ${formatEuro(nextBooking.platformCommissionCents)}`} />
                </div>
                <BookingActionPanel booking={nextBooking} />
              </>
            ) : (
              <ButtonLink href="/pet-sitters" variant="secondary">
                Trouver un pet-sitter
              </ButtonLink>
            )}
          </article>

          <article className="workspace-card journey-card">
            <div className="card-heading-row">
              <h2>Parcours recommandé</h2>
              <Link href="/pet-sitters">Rechercher</Link>
            </div>
            <ol className="journey-list" aria-label="Parcours propriétaire">
              <li className="journey-list__item journey-list__item--done">
                <span>1</span>
                <div>
                  <strong>Compléter les animaux</strong>
                  <p>Besoins, tempérament et informations médicales restent prêts.</p>
                </div>
              </li>
              <li
                className={
                  nextBooking
                    ? "journey-list__item journey-list__item--done"
                    : "journey-list__item journey-list__item--active"
                }
              >
                <span>2</span>
                <div>
                  <strong>Comparer les profils</strong>
                  <p>Ville, badges, disponibilités et types de garde en premier.</p>
                </div>
              </li>
              <li
                className={
                  nextBooking
                    ? "journey-list__item journey-list__item--active"
                    : "journey-list__item"
                }
              >
                <span>3</span>
                <div>
                  <strong>Envoyer une demande claire</strong>
                  <p>Le paiement arrive seulement après acceptation du pet-sitter.</p>
                </div>
              </li>
            </ol>
          </article>

          <article className="workspace-card">
            <div className="card-heading-row">
              <h2>Mes animaux</h2>
              <Link href="/owner/animals">Voir tout</Link>
            </div>
            {workspace.pets.length > 0 ? (
              <div className="pet-mini-grid">
                {workspace.pets.map((pet) => (
                  <PetMiniCard key={pet.id} pet={pet} />
                ))}
              </div>
            ) : (
              <div className="workspace-empty-state">
                <p>Aucun animal enregistré pour le moment.</p>
                <ButtonLink href="/owner/animals" variant="secondary">
                  Ajouter mon premier animal
                </ButtonLink>
              </div>
            )}
          </article>
        </section>

        <section className="workspace-grid">
          <article className="workspace-card">
            <h2>Pet-sitters adaptés</h2>
            <div className="recommendation-row">
              {demoPetSitters.slice(0, 6).map((profile) => (
                <Link
                  className="mini-sitter-card"
                  href={`/pet-sitters/${profile.id}`}
                  key={profile.id}
                >
                  <Image src={profile.imageUrl} alt={profile.imageAlt} fill sizes="180px" />
                  <span>
                    {profile.firstName} {profile.lastInitial}
                  </span>
                  <small>
                    {formatRating(profile.rating)} / 5 · {profile.city}
                  </small>
                </Link>
              ))}
            </div>
          </article>

          <article className="workspace-card">
            <h2>Dossier médical</h2>
            <SensitiveDataNotice />
            <p>
              {
                workspace.pets.filter((pet) => pet.medicalRecordStatus === "incomplete")
                  .length
              }{" "}
              dossier(s) à compléter avant une garde sensible.
            </p>
            <ButtonLink href="/owner/animals" variant="secondary">
              Compléter
            </ButtonLink>
          </article>

          <article className="workspace-card">
            <h2>Avis à déposer</h2>
            {completedBookingToReview ? (
              <ReviewForm booking={completedBookingToReview} />
            ) : (
              <>
                <p>Aucun avis en attente pour le moment.</p>
                <ButtonLink href="/dashboard" variant="secondary">
                  Voir l&apos;historique
                </ButtonLink>
              </>
            )}
          </article>
        </section>
      </main>
    </ConnectedShell>
  );
}

export function OwnerAnimalsPage() {
  const workspace = useDemoWorkspace();
  const [isAddingPet, setIsAddingPet] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [petImagePreview, setPetImagePreview] = useState(defaultPetImageUrl);

  const blockedContent = useRoleAccess("owner");
  if (blockedContent) {
    return blockedContent;
  }

  return (
    <ConnectedShell role="Propriétaire" active="Mes animaux">
      <main className="workspace-main">
        <div className="workspace-heading">
          <div>
            <p className="section-kicker">Animaux</p>
            <h1>Les besoins de chaque animal restent visibles au bon moment.</h1>
          </div>
          <button
            className="primary-button"
            type="button"
            onClick={() => {
              setIsAddingPet((current) => !current);
              setStatusMessage(null);
            }}
          >
            Ajouter un animal
          </button>
        </div>
        {isAddingPet ? (
          <form
            className="workspace-card inline-workspace-form"
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              const name = String(formData.get("name") ?? "").trim();
              const species = String(formData.get("species") ?? "").trim();
              const age = String(formData.get("age") ?? "").trim();
              const imageUrl = String(formData.get("imageUrl") ?? "").trim();
              const needs = String(formData.get("needs") ?? "")
                .split(",")
                .map((need) => need.trim())
                .filter(Boolean);

              try {
                demoWorkspaceActions.addPet({
                  name,
                  species,
                  age,
                  needs: needs.length > 0 ? needs : ["Consignes à compléter"],
                  image: imageUrl.startsWith("https://images.unsplash.com/")
                    ? imageUrl
                    : petImagePreview,
                });
                setStatusMessage(`${name} a été ajouté au dossier propriétaire.`);
                event.currentTarget.reset();
                setPetImagePreview(defaultPetImageUrl);
                setIsAddingPet(false);
              } catch (error) {
                setStatusMessage(getErrorMessage(error));
              }
            }}
          >
            <label>
              Nom
              <input name="name" placeholder="Nala" />
            </label>
            <label>
              Espèce
              <input name="species" placeholder="Chien, chat, lapin..." />
            </label>
            <label>
              Âge
              <input name="age" placeholder="4 ans" />
            </label>
            <label>
              Besoins, séparés par des virgules
              <input name="needs" placeholder="Sous traitement, anxieux" />
            </label>
            <label>
              Photo de l&apos;animal
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (!file) {
                    return;
                  }

                  if (file.size > 900_000) {
                    setStatusMessage(
                      "Image trop lourde pour la démo locale. Utilisez une image de moins de 900 Ko.",
                    );
                    event.target.value = "";
                    return;
                  }

                  const reader = new FileReader();
                  reader.addEventListener("load", () => {
                    if (typeof reader.result === "string") {
                      setPetImagePreview(reader.result);
                      setStatusMessage(null);
                    }
                  });
                  reader.readAsDataURL(file);
                }}
              />
            </label>
            <label>
              URL Unsplash optionnelle
              <input name="imageUrl" placeholder="https://images.unsplash.com/..." />
            </label>
            <div className="pet-image-preview" aria-label="Aperçu de la photo">
              <Image src={petImagePreview} alt="Aperçu de l'animal" fill sizes="180px" />
            </div>
            <button className="primary-button" type="submit">
              Enregistrer l&apos;animal
            </button>
          </form>
        ) : null}
        {statusMessage ? <p className="workspace-status">{statusMessage}</p> : null}
        {workspace.pets.length > 0 ? (
          <section className="workspace-grid">
            {workspace.pets.map((pet) => (
              <article className="workspace-card animal-detail-card" key={pet.id}>
                <PetMiniCard pet={pet} />
                <h2>Dossier médical {pet.name}</h2>
                <div className="tag-row">
                  {pet.needs.map((need) => (
                    <CareCapabilityTag key={need} label={need} />
                  ))}
                </div>
                <TrustBadge
                  label={
                    pet.medicalRecordStatus === "complete"
                      ? "Dossier complet"
                      : "Dossier à compléter"
                  }
                />
                <SensitiveDataNotice />
              </article>
            ))}
          </section>
        ) : (
          <section className="workspace-card workspace-empty-state">
            <h2>Votre espace est vide</h2>
            <p>
              Ajoutez votre premier animal pour préparer une réservation avec ses
              besoins, consignes et informations de soin.
            </p>
          </section>
        )}
      </main>
    </ConnectedShell>
  );
}

export function BookingFlowPage() {
  const workspace = useDemoWorkspace();
  const searchParams = useSearchParams();
  const sitterId = searchParams.get("sitter");
  const sitter = demoPetSitters.find((s) => s.id === sitterId) ?? getPrimaryPetSitter();
  const [selectedPetIds, setSelectedPetIds] = useState(
    workspace.pets.map((pet) => pet.id),
  );
  const [requestStatus, setRequestStatus] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("2026-05-24");
  const [endDate, setEndDate] = useState("2026-05-26");
  const [careType, setCareType] = useState("Garde chez le pet-sitter");
  const [instructions, setInstructions] = useState(
    "Luna devient anxieuse pendant les orages. Milo doit rester à l'intérieur.",
  );
  const [insuranceLevel, setInsuranceLevel] = useState<"standard" | "premium">(
    "standard",
  );
  const selectedPets = workspace.pets.filter((pet) => selectedPetIds.includes(pet.id));
  const estimatedTotalCents =
    selectedPets.length > 0
      ? 7600 + selectedPets.length * 1500 + (insuranceLevel === "premium" ? 900 : 0)
      : 0;
  const paymentBreakdown =
    estimatedTotalCents > 0 ? calculatePaymentBreakdown(estimatedTotalCents) : null;
  const hasInvalidDates = endDate < startDate;
  const canSubmitRequest = selectedPets.length > 0 && !hasInvalidDates;
  const bookingStepIndex = selectedPets.length === 0 ? 0 : hasInvalidDates ? 1 : 3;

  const blockedContent = useRoleAccess("owner");
  if (blockedContent) {
    return blockedContent;
  }

  return (
    <ConnectedShell role="Propriétaire" active="Réservation">
      <main className="booking-workspace">
        <section className="booking-steps" aria-label="Étapes de réservation">
          {["Animaux", "Garde", "Consignes", "Vérification"].map((step, index) => (
            <span
              className={
                index <= bookingStepIndex ? "step-pill step-pill--active" : "step-pill"
              }
              key={step}
            >
              {index + 1}. {step}
            </span>
          ))}
        </section>

        <div className="booking-layout">
          <section className="workspace-card booking-form-card">
            <div className="booking-form-card__header">
              <p className="section-kicker">Demande directe</p>
              <h1>Préparez une demande claire pour {sitter.firstName}.</h1>
              <p>
                Les informations sensibles servent uniquement à vérifier la faisabilité
                de la garde. Le paiement test sera proposé après acceptation.
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
                <p>Ajoutez d&apos;abord un animal pour lancer une demande de garde.</p>
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
                    setInsuranceLevel(event.target.value as "standard" | "premium");
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
                placeholder="Traitement, alimentation, comportement, urgence..."
              />
            </label>
            {hasInvalidDates ? (
              <p className="workspace-status workspace-status--warning">
                La date de fin doit être identique ou postérieure à la date de début.
              </p>
            ) : null}
            <SensitiveDataNotice />
          </section>

          <aside className="workspace-card booking-summary-card">
            <h2>Récapitulatif</h2>
            <Image src={sitter.imageUrl} alt={sitter.imageAlt} width={96} height={96} />
            <p>
              {sitter.firstName} {sitter.lastInitial} · {sitter.city}
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
                <dd>{selectedPets.map((pet) => pet.name).join(", ") || "Aucun animal"}</dd>
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
                <dd>{formatEuro(paymentBreakdown?.platformCommissionCents ?? 0)}</dd>
              </div>
            </dl>
            <div className="booking-next-step-note">
              <strong>Après envoi</strong>
              <p>
                {sitter.firstName} accepte ou refuse. En cas d&apos;acceptation, le
                créneau est bloqué et vous confirmez par paiement test.
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
                    petSitterId: sitter.id,
                    petSitterName: `${sitter.firstName} ${sitter.lastInitial}`,
                    startDate,
                    endDate,
                    careType,
                    instructions,
                    baseAmountCents: estimatedTotalCents,
                    insuranceLevel,
                  });
                  setRequestStatus(
                    "Demande envoyée. Elle apparaît maintenant côté pet-sitter.",
                  );
                } catch (error) {
                  setRequestStatus(getErrorMessage(error));
                }
              }}
            >
              Envoyer la demande
            </button>
            <small>Demande gratuite. Paiement uniquement après acceptation.</small>
            {requestStatus ? <p className="workspace-status">{requestStatus}</p> : null}
          </aside>
        </div>
      </main>
    </ConnectedShell>
  );
}

export function PetSitterDashboardPage() {
  const workspace = useDemoWorkspace();
  const petById = useMemo(() => createPetById(workspace.pets), [workspace.pets]);
  const activeRequests = workspace.bookings.filter(
    (booking) =>
      booking.status === "awaiting_response" ||
      booking.status === "accepted" ||
      booking.status === "paid",
  );
  const acceptedCount = workspace.bookings.filter(
    (booking) => booking.status === "accepted" || booking.status === "paid",
  ).length;

  const blockedContent = useRoleAccess("petSitter");
  if (blockedContent) {
    return blockedContent;
  }

  return (
    <ConnectedShell role="Pet-sitter" active="Tableau de bord">
      <main className="workspace-main">
        <div className="workspace-heading">
          <div>
            <DemoSessionGreeting className="section-kicker" fallbackName="Sarah" />
            <h1>Votre activité de garde est prête.</h1>
          </div>
          <ButtonLink href="/pet-sitter/dashboard">Modifier mon profil</ButtonLink>
        </div>
        <section className="workspace-grid workspace-grid--four">
          <MetricCard title="Complétion profil" value="85 %" detail="Encore quelques documents" />
          <MetricCard title="Statut" value="Vérifiée" detail="Identité validée" />
          <MetricCard title="Réponse" value="98 %" detail="Temps moyen : 1 h" />
          <MetricCard title="Demandes actives" value={String(activeRequests.length)} detail={`${acceptedCount} acceptée(s)`} />
        </section>
        <section className="workspace-card pet-sitter-workflow">
          <div>
            <p className="section-kicker">Parcours pet-sitter</p>
            <h2>Priorisez les demandes qui correspondent vraiment à vos compétences.</h2>
          </div>
          <ol className="journey-list journey-list--horizontal" aria-label="Parcours pet-sitter">
            <li className="journey-list__item journey-list__item--active">
              <span>1</span>
              <div>
                <strong>Lire besoins et consignes</strong>
                <p>Espèces, dates, soins et contexte avant toute réponse.</p>
              </div>
            </li>
            <li className="journey-list__item">
              <span>2</span>
              <div>
                <strong>Accepter uniquement si faisable</strong>
                <p>Une acceptation bloque le créneau dans le parcours MVP.</p>
              </div>
            </li>
            <li className="journey-list__item">
              <span>3</span>
              <div>
                <strong>Suivre paiement et contrat</strong>
                <p>Le récapitulatif encadre parties, tarif, assurance et consignes.</p>
              </div>
            </li>
          </ol>
        </section>
        <section className="workspace-grid">
          <article className="workspace-card">
            <h2>Demandes reçues</h2>
            {activeRequests.length === 0 ? <p>Aucune demande en attente.</p> : null}
            {activeRequests.map((booking) => (
              <div className="request-row" key={booking.id}>
                <div className="request-summary">
                  <strong>{formatBookingTitle(booking, petById)}</strong>
                  <span>
                    {formatShortDate(booking.startDate)} - {formatShortDate(booking.endDate)}
                  </span>
                  <small>{booking.instructions || "Aucune consigne complémentaire"}</small>
                </div>
                <div className="request-actions">
                  {booking.status === "awaiting_response" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => demoWorkspaceActions.refuseBooking(booking.id)}
                      >
                        Refuser
                      </button>
                      <button
                        type="button"
                        onClick={() => demoWorkspaceActions.acceptBooking(booking.id)}
                      >
                        Accepter
                      </button>
                    </>
                  ) : (
                    <TrustBadge label={getBookingStatusLabel(booking.status)} />
                  )}
                </div>
              </div>
            ))}
          </article>
          <article className="workspace-card">
            <h2>Documents & badges</h2>
            <div className="badge-row">
              <TrustBadge label="Identité vérifiée" />
              <TrustBadge label="Assurance active" />
              <TrustBadge label="Expert animaux âgés" />
            </div>
            <p>
              Les demandes sensibles restent réservées aux profils avec garanties
              visibles et documents validés.
            </p>
          </article>
        </section>
      </main>
    </ConnectedShell>
  );
}

type CompetencyAnswer = {
  label: string;
  isCorrect: boolean;
  feedback: string;
};

type CompetencyQuestion = {
  scenario: string;
  answers: CompetencyAnswer[];
};

type CompetencyTrack = {
  detail: string;
  id: string;
  label: string;
  publicBadge: string;
  questions: CompetencyQuestion[];
};

const petSitterCompetencyTests: CompetencyTrack[] = [
  {
    id: "dogs",
    label: "Chiens",
    detail: "Promenades, signaux de stress, rappel des consignes.",
    publicBadge: "Expert chiens",
    questions: [
      {
        scenario:
          "Le propriétaire signale que son chien devient anxieux quand il croise d'autres chiens. Pendant la promenade, le chien se fige et tire vers l'arrière. Que faites-vous ?",
        answers: [
          {
            label:
              "Je réduis la distance, je garde une laisse détendue et je contacte le propriétaire si la consigne manque.",
            isCorrect: true,
            feedback:
              "Bonne réponse : vous protégez l'animal, respectez ses limites et restez dans le cadre des consignes.",
          },
          {
            label:
              "Je force la promenade pour respecter la durée prévue et éviter d'inquiéter le propriétaire.",
            isCorrect: false,
            feedback:
              "À éviter : forcer un animal anxieux peut aggraver le stress et créer un risque de fuite ou de morsure.",
          },
          {
            label:
              "Je détache le chien pour qu'il se calme plus vite et choisisse lui-même son chemin.",
            isCorrect: false,
            feedback:
              "Non : un chien anxieux ne doit pas être détaché sans autorisation explicite et environnement maîtrisé.",
          },
        ],
      },
      {
        scenario:
          "Le chien refuse sa gamelle ce matin alors que le propriétaire ne signale aucun changement de régime. Il semble apathique. Comment réagissez-vous ?",
        answers: [
          {
            label:
              "J'observe et je note les comportements, je donne de l'eau fraîche, et je contacte le propriétaire pour signaler le changement.",
            isCorrect: true,
            feedback:
              "Bonne réponse : signaler rapidement tout changement de comportement alimentaire est essentiel.",
          },
          {
            label:
              "Je lui propose de la nourriture humaine pour relancer l'appétit, car l'essentiel est qu'il mange quelque chose.",
            isCorrect: false,
            feedback:
              "À éviter : modifier le régime sans autorisation peut aggraver les troubles digestifs.",
          },
          {
            label:
              "Je ne dis rien au propriétaire pour éviter de l'inquiéter si c'est passager.",
            isCorrect: false,
            feedback:
              "Non : le propriétaire doit toujours être informé de tout changement de comportement ou d'alimentation.",
          },
        ],
      },
      {
        scenario:
          "Au retour d'une promenade, vous remarquez que le chien boite légèrement d'une patte arrière. Il n'a pas crié et continue de marcher. Que faites-vous ?",
        answers: [
          {
            label:
              "Je le laisse se reposer et continue les promenades habituelles le lendemain sans changer le programme.",
            isCorrect: false,
            feedback:
              "À éviter : continuer une activité normale peut aggraver une blessure non diagnostiquée.",
          },
          {
            label:
              "Je cesse l'effort, j'examine visuellement la patte, je note la symptomatologie et je préviens le propriétaire immédiatement.",
            isCorrect: true,
            feedback:
              "Bonne réponse : toute boiterie soudaine doit être signalée sans délai pour évaluation vétérinaire si nécessaire.",
          },
          {
            label:
              "Je lui mets un bandage avec du matériel disponible sur place pour éviter d'aggraver.",
            isCorrect: false,
            feedback:
              "Non : appliquer un bandage sans diagnostic peut masquer la blessure ou gêner la circulation.",
          },
        ],
      },
      {
        scenario:
          "Un livreur sonne à la porte. Le chien aboie fortement et saute vers la sortie dès que vous entrouvrez. Il n'y a pas de consigne spéciale dans le dossier. Que faites-vous ?",
        answers: [
          {
            label:
              "Je maîtrise le chien avant d'ouvrir, demande au livreur de déposer le colis et ne laisse pas entrer de visiteur non prévu.",
            isCorrect: true,
            feedback:
              "Bonne réponse : sécuriser l'animal avant toute ouverture de porte est une règle fondamentale.",
          },
          {
            label:
              "J'ouvre la porte en laissant le chien accueillir le livreur pour le socialiser.",
            isCorrect: false,
            feedback:
              "À éviter : exposer un chien excité à un inconnu sans consigne préalable est un risque de morsure ou de fuite.",
          },
          {
            label:
              "Je laisse le livreur entrer pour montrer que le chien est inoffensif.",
            isCorrect: false,
            feedback:
              "Non : vous n'avez pas l'autorisation d'introduire des tiers dans le domicile sans consigne du propriétaire.",
          },
        ],
      },
      {
        scenario:
          "Vous gardez deux chiens qui vivent normalement ensemble. Dans le jardin, ils s'élancent l'un vers l'autre avec des grognements intenses. Que faites-vous ?",
        answers: [
          {
            label:
              "Je me glisse entre les deux pour les séparer manuellement et immédiatement.",
            isCorrect: false,
            feedback:
              "Dangereux : s'interposer physiquement lors d'un conflit canin est la principale cause de morsures accidentelles.",
          },
          {
            label:
              "Je fais du bruit fort pour interrompre le conflit, j'utilise un obstacle (chaise, panneau) et j'alerte le propriétaire sans retard.",
            isCorrect: true,
            feedback:
              "Bonne réponse : une distraction sonore et un obstacle physique permettent une séparation sécurisée.",
          },
          {
            label:
              "J'attends qu'ils se calment seuls, car les chiens du même foyer se réconcillient toujours d'eux-mêmes.",
            isCorrect: false,
            feedback:
              "À éviter : sans intervention sécurisée, un conflit peut s'aggraver et blesser les deux animaux.",
          },
        ],
      },
    ],
  },
  {
    id: "cats",
    label: "Chats",
    detail: "Territoire, litière, alimentation, manipulation douce.",
    publicBadge: "Expert chats",
    questions: [
      {
        scenario:
          "Vous arrivez pour une visite à domicile. Le chat sous traitement se cache sous un meuble et refuse le contact. Quelle est la meilleure conduite ?",
        answers: [
          {
            label:
              "Je vérifie le protocole, je limite les gestes brusques et je préviens le propriétaire si la prise n'est pas faisable sereinement.",
            isCorrect: true,
            feedback:
              "Bonne réponse : la sécurité et la traçabilité priment, surtout avec un traitement médical.",
          },
          {
            label:
              "Je le sors rapidement de sa cachette pour terminer la visite dans le temps prévu.",
            isCorrect: false,
            feedback:
              "À éviter : sortir un chat de force peut provoquer griffures, fuite et perte de confiance.",
          },
          {
            label:
              "Je publie la situation sur un groupe pour demander comment donner le médicament.",
            isCorrect: false,
            feedback:
              "Non : les informations médicales et le domicile restent confidentiels.",
          },
        ],
      },
      {
        scenario:
          "Le chat urine à côté de sa litière depuis votre arrivée, alors que le propriétaire ne mentionne pas ce comportement. Que faites-vous ?",
        answers: [
          {
            label:
              "Je nettoie avec un produit adapté, je note la fréquence et je signale au propriétaire ; si cela persiste, je mentionne la possibilité d'une consultation.",
            isCorrect: true,
            feedback:
              "Bonne réponse : tout changement éliminatoire doit être tracé et signalé au propriétaire.",
          },
          {
            label:
              "Je pense que c'est une erreur ponctuelle et j'attends la fin de la garde pour en parler.",
            isCorrect: false,
            feedback:
              "À éviter : attendre peut laisser passer un signe d'infection urinaire ou de stress pathologique.",
          },
          {
            label:
              "Je change complètement la position et le type de litière pour corriger le problème moi-même.",
            isCorrect: false,
            feedback:
              "Non : modifier l'environnement sans consigne peut aggraver le comportement et perturber davantage le chat.",
          },
        ],
      },
      {
        scenario:
          "En arrivant pour la visite du soir, vous observez que le chat respire vite, en ouvrant légèrement la bouche. Il n'y a pas de consigne spécifique dans le dossier. Que faites-vous ?",
        answers: [
          {
            label:
              "Je suppose que c'est du stress lié à ma présence et je pars après avoir changé la gamelle.",
            isCorrect: false,
            feedback:
              "Dangereux : une respiration buccale chez un chat peut indiquer une détresse respiratoire grave nécessitant une urgence.",
          },
          {
            label:
              "Je contacte immédiatement le propriétaire et, si non joignable, j'appelle un vétérinaire d'urgence.",
            isCorrect: true,
            feedback:
              "Bonne réponse : la respiration buccale est une alerte vétérinaire prioritaire chez le chat.",
          },
          {
            label:
              "Je mets le chat dans une pièce sombre pour qu'il se calme, en attendant de voir si ça passe.",
            isCorrect: false,
            feedback:
              "Non : isoler un chat en détresse respiratoire retarde la prise en charge urgente.",
          },
        ],
      },
      {
        scenario:
          "Chaque fois que vous entrez par la porte principale, le chat se précipite vers la sortie. Le propriétaire ne mentionne pas de gestion spécifique. Comment évitez-vous la fugue ?",
        answers: [
          {
            label:
              "J'entre en deux temps : je bloque d'abord le passage avec mon corps, je dépose mes affaires, puis j'ouvre pleinement une fois l'espace maîtrisé.",
            isCorrect: true,
            feedback:
              "Bonne réponse : anticiper le comportement de fuite et contrôler l'espace permet d'éviter l'accident.",
          },
          {
            label:
              "Je laisse la porte entrouverte pour ne pas stresser le chat avec un bruit de claquement.",
            isCorrect: false,
            feedback:
              "À éviter : une porte entrouverte est une invitation à s'échapper pour un chat curieux ou stressé.",
          },
          {
            label:
              "Je laisse le chat sortir un court moment et je le rappelle ensuite.",
            isCorrect: false,
            feedback:
              "Non : laisser sortir un chat sans autorisation vous rend responsable de toute fugue ou accident.",
          },
        ],
      },
      {
        scenario:
          "Lors d'une caresse, le chat se retourne brutalement et vous griffe profondément la main. Il siffle et recule dans un coin. Quelle est votre réaction ?",
        answers: [
          {
            label:
              "Je ne le suis pas, je désinfecte la blessure, je note l'heure et le comportement, et je préviens le propriétaire.",
            isCorrect: true,
            feedback:
              "Bonne réponse : ne pas forcer le contact et documenter l'incident est la conduite professionnelle attendue.",
          },
          {
            label:
              "Je punis verbalement le chat pour qu'il comprenne que ce comportement est inacceptable.",
            isCorrect: false,
            feedback:
              "À éviter : punir un chat l'agresse davantage et peut provoquer une nouvelle agression.",
          },
          {
            label:
              "Je ne préviens pas le propriétaire car une égratignure de chat est normale.",
            isCorrect: false,
            feedback:
              "Non : tout incident, même mineur, doit être documenté et signalé pour traçabilité et sécurité.",
          },
        ],
      },
    ],
  },
  {
    id: "birds",
    label: "Oiseaux",
    detail: "Cage, sorties contrôlées, prévention des fuites.",
    publicBadge: "Expert oiseaux",
    questions: [
      {
        scenario:
          "Un propriétaire demande une sortie quotidienne pour son oiseau. En arrivant, une fenêtre est entrouverte. Que faites-vous avant d'ouvrir la cage ?",
        answers: [
          {
            label:
              "Je sécurise la pièce, ferme les ouvertures, vérifie les consignes puis seulement ensuite j'ouvre la cage.",
            isCorrect: true,
            feedback:
              "Bonne réponse : l'environnement doit être sécurisé avant toute manipulation.",
          },
          {
            label:
              "J'ouvre la cage tout de suite pour respecter l'habitude de sortie.",
            isCorrect: false,
            feedback:
              "À éviter : une ouverture non sécurisée suffit pour perdre l'animal.",
          },
          {
            label:
              "Je déplace la cage dans une autre pièce sans prévenir, même si ce n'est pas prévu.",
            isCorrect: false,
            feedback:
              "Non : modifier l'environnement sans consigne peut stresser l'animal.",
          },
        ],
      },
      {
        scenario:
          "En arrivant le matin, vous trouvez l'oiseau au fond de la cage. Il est debout mais ne monte pas sur son perchoir et reste immobile. Que faites-vous ?",
        answers: [
          {
            label:
              "Je contacte immédiatement le propriétaire et je surveille l'évolution en documentant les signes observés, sans manipuler l'oiseau.",
            isCorrect: true,
            feedback:
              "Bonne réponse : un oiseau immobile au fond de sa cage est un signe d'alerte ; le documenter et alerter est la bonne conduite.",
          },
          {
            label:
              "Je sors l'oiseau de la cage et je le tiens dans mes mains pour l'aider à récupérer.",
            isCorrect: false,
            feedback:
              "À éviter : manipuler un oiseau affaibli peut aggraver son état de stress et masquer les symptômes.",
          },
          {
            label:
              "Je lui donne de l'eau sucrée car c'est souvent suffisant pour les oiseaux affaiblis.",
            isCorrect: false,
            feedback:
              "Non : administrer quoi que ce soit sans consigne vétérinaire est interdit dans le protocole de garde.",
          },
        ],
      },
      {
        scenario:
          "L'oiseau n'a pas touché à ses graines depuis deux repas. Sa mangeoire est pleine et l'eau est fraîche. Comment réagissez-vous ?",
        answers: [
          {
            label:
              "J'ajoute une friandise sucrée non prévue pour relancer l'appétit.",
            isCorrect: false,
            feedback:
              "À éviter : modifier l'alimentation sans consigne peut déséquilibrer le régime d'un oiseau fragile.",
          },
          {
            label:
              "Je note la durée sans alimentation, vérifie que tout est en ordre et signale au propriétaire en mentionnant d'autres signes éventuels.",
            isCorrect: true,
            feedback:
              "Bonne réponse : chez les oiseaux, un jeûne de deux repas doit toujours être signalé au propriétaire.",
          },
          {
            label:
              "Je pense que l'oiseau fait un caprice et j'attends la fin de la garde sans intervenir.",
            isCorrect: false,
            feedback:
              "Non : les oiseaux dissimulent souvent leurs symptômes ; ne pas signaler une anorexie peut être dangereux.",
          },
        ],
      },
      {
        scenario:
          "Vous remarquez que l'oiseau tire sur ses propres plumes depuis votre arrivée, créant de petites zones dégarnies. Le dossier ne mentionne pas ce comportement. Que faites-vous ?",
        answers: [
          {
            label:
              "Je note le comportement, j'évite de stresser davantage l'animal, et je préviens le propriétaire car le plumage peut signaler stress ou pathologie.",
            isCorrect: true,
            feedback:
              "Bonne réponse : le plumage compulsif est un indicateur important de stress ou de maladie à signaler sans délai.",
          },
          {
            label:
              "Je rajoute des jouets dans la cage pour que l'oiseau se distraie et arrête.",
            isCorrect: false,
            feedback:
              "À éviter : introduire des objets non prévus peut perturber davantage un oiseau déjà stressé.",
          },
          {
            label:
              "C'est normal en période de mue : je ne dis rien au propriétaire pour ne pas l'inquiéter.",
            isCorrect: false,
            feedback:
              "Non : le plumage auto-infligé n'est pas de la mue normale ; confondre les deux peut retarder un traitement nécessaire.",
          },
        ],
      },
      {
        scenario:
          "En observant l'oiseau sur son perchoir, vous remarquez qu'il tient une patte de manière anormale et sautille sur l'autre. Il semble par ailleurs actif. Que faites-vous ?",
        answers: [
          {
            label:
              "Je préviens rapidement le propriétaire en décrivant précisément la posture, et je demande s'il y a des instructions d'urgence à suivre.",
            isCorrect: true,
            feedback:
              "Bonne réponse : toute anomalie de posture chez un oiseau doit être signalée ; seul le propriétaire ou le vétérinaire peut évaluer la suite.",
          },
          {
            label:
              "Je stabilise la patte moi-même avec un peu de ruban adhésif pour éviter qu'il l'aggrave.",
            isCorrect: false,
            feedback:
              "Dangereux : manipuler et ligaturer la patte d'un oiseau sans formation peut causer une nécrose ou aggraver la blessure.",
          },
          {
            label:
              "Je pense que c'est une position habituelle et j'attends la fin de la garde.",
            isCorrect: false,
            feedback:
              "À éviter : ignorer un comportement anormal retarde une prise en charge pouvant être urgente.",
          },
        ],
      },
    ],
  },
  {
    id: "nacs",
    label: "NAC",
    detail: "Lapins, rongeurs, reptiles, température et alimentation.",
    publicBadge: "Expert NAC",
    questions: [
      {
        scenario:
          "Vous gardez un lapin. Il mange peu depuis le matin et reste immobile, alors que le propriétaire indique qu'il mange normalement beaucoup de foin. Quelle réaction est attendue ?",
        answers: [
          {
            label:
              "Je signale rapidement le changement, je suis les consignes d'urgence et je ne modifie pas l'alimentation au hasard.",
            isCorrect: true,
            feedback:
              "Bonne réponse : chez les NAC, une baisse d'alimentation peut devenir urgente.",
          },
          {
            label:
              "J'attends le lendemain, car les petits animaux changent souvent de rythme.",
            isCorrect: false,
            feedback:
              "À éviter : attendre peut être dangereux, surtout pour un lapin qui ne s'alimente plus.",
          },
          {
            label:
              "Je donne une friandise non prévue pour relancer l'appétit.",
            isCorrect: false,
            feedback:
              "Non : l'alimentation spécifique doit respecter les consignes du propriétaire.",
          },
        ],
      },
      {
        scenario:
          "Le cochon d'Inde émet des couinements inhabituels et répétés depuis plusieurs minutes. Il ne semble pas blessé mais est très agité. Que faites-vous ?",
        answers: [
          {
            label:
              "Je vérifie son environnement (température, eau, nourriture), je note les comportements et je contacte le propriétaire pour obtenir des consignes précises.",
            isCorrect: true,
            feedback:
              "Bonne réponse : une vocalisation inhabituelle peut indiquer de la douleur, du stress ou un besoin urgent de soins.",
          },
          {
            label:
              "Je couvre la cage pour le calmer, car les rongeurs ont souvent besoin d'obscurité.",
            isCorrect: false,
            feedback:
              "À éviter : couvrir la cage peut aggraver le stress si l'animal souffre, et retarder l'identification du problème.",
          },
          {
            label:
              "Je pense que c'est normal et j'attends qu'il se calme sans intervenir.",
            isCorrect: false,
            feedback:
              "Non : ignorer une vocalisation inhabituelle prolongée peut laisser passer une urgence médicale.",
          },
        ],
      },
      {
        scenario:
          "En arrivant, vous constatez que la lampe chauffante du terrarium est éteinte. Le reptile est au fond, immobile. La température est en dessous des normes indiquées dans le dossier. Que faites-vous ?",
        answers: [
          {
            label:
              "Je prends le reptile dans mes mains pour le réchauffer en attendant de trouver une solution.",
            isCorrect: false,
            feedback:
              "À éviter : manipuler un reptile hypothermique peut le stresser encore davantage et aggraver son état.",
          },
          {
            label:
              "Je contacte immédiatement le propriétaire, je ne manipule pas l'animal et je tente de rétablir la source de chaleur selon les consignes du dossier.",
            isCorrect: true,
            feedback:
              "Bonne réponse : les reptiles sont ectothermes ; une panne de chauffage est une urgence à traiter selon le protocole.",
          },
          {
            label:
              "Je mets le terrarium en plein soleil pour compenser rapidement la chaleur manquante.",
            isCorrect: false,
            feedback:
              "Non : une chaleur directe non contrôlée peut tuer un reptile ; seul le dispositif prévu doit être utilisé.",
          },
        ],
      },
      {
        scenario:
          "Le hamster ne se réveille pas alors qu'il devrait être actif. Il est froid au toucher, immobile et ne réagit pas au bruit. La pièce est à 16 °C. Que faites-vous ?",
        answers: [
          {
            label:
              "Je note l'heure, je vérifie la température de la pièce (possible torpeur), je contacte le propriétaire sans déplacer l'animal brutalement.",
            isCorrect: true,
            feedback:
              "Bonne réponse : à basse température un hamster peut entrer en torpeur ; un réchauffement progressif sous consigne est nécessaire.",
          },
          {
            label:
              "Je pose l'animal directement sous une lampe chauffante pour le réchauffer vite.",
            isCorrect: false,
            feedback:
              "Dangereux : un réchauffement trop rapide peut être fatal pour un petit rongeur en torpeur.",
          },
          {
            label:
              "Je suppose qu'il est mort et je l'enterre dans le jardin avant de prévenir le propriétaire.",
            isCorrect: false,
            feedback:
              "Non : agir sans vérification est une faute grave ; un animal en torpeur peut être sauvé si pris en charge correctement.",
          },
        ],
      },
      {
        scenario:
          "En arrivant, vous constatez que le furet a échappé de son enclos et se cache quelque part dans la maison. Le propriétaire n'est pas joignable immédiatement. Que faites-vous ?",
        answers: [
          {
            label:
              "Je ferme toutes les pièces pour limiter ses déplacements, je le retrouve calmement avec sa récompense habituelle, et je laisse un message détaillé au propriétaire.",
            isCorrect: true,
            feedback:
              "Bonne réponse : limiter la zone de recherche et utiliser les repères olfactifs connus de l'animal est la méthode la plus efficace.",
          },
          {
            label:
              "Je laisse la maison ouverte pour qu'il sorte si nécessaire et revienne de lui-même.",
            isCorrect: false,
            feedback:
              "Non : laisser la maison ouverte expose le furet à un risque de fugue permanente et vous engage en responsabilité.",
          },
          {
            label:
              "Je ne fais rien et j'attends le retour du propriétaire car les furets retrouvent toujours leur chemin.",
            isCorrect: false,
            feedback:
              "À éviter : un furet peut se blesser ou s'échapper définitivement si on ne sécurise pas la situation immédiatement.",
          },
        ],
      },
    ],
  },
  {
    id: "senior",
    label: "Animaux âgés",
    detail: "Mobilité, traitement, surveillance et fatigue.",
    publicBadge: "Expert animaux âgés",
    questions: [
      {
        scenario:
          "Un chien âgé sous surveillance renforcée se lève difficilement et semble plus fatigué que d'habitude. Que devez-vous faire ?",
        answers: [
          {
            label:
              "Je note l'évolution, j'adapte l'effort, je respecte le protocole et je préviens le propriétaire si l'état change.",
            isCorrect: true,
            feedback:
              "Bonne réponse : les animaux âgés demandent une observation calme, documentée et prudente.",
          },
          {
            label:
              "Je maintiens exactement la même activité pour éviter de changer ses habitudes.",
            isCorrect: false,
            feedback:
              "À éviter : une routine doit rester adaptée à l'état réel de l'animal.",
          },
          {
            label:
              "Je lui donne un médicament que j'ai déjà utilisé pour un autre animal âgé.",
            isCorrect: false,
            feedback:
              "Non : aucun traitement ne doit être donné hors protocole vétérinaire transmis.",
          },
        ],
      },
      {
        scenario:
          "Le chien âgé a vomi deux fois depuis le matin. Il a bu de l'eau mais refusé sa gamelle. Le protocole ne mentionne pas de traitement anti-nausée. Comment agissez-vous ?",
        answers: [
          {
            label:
              "Je cesse de proposer de la nourriture solide, je surveille l'hydratation, je note la fréquence des vomissements et j'avertis le propriétaire.",
            isCorrect: true,
            feedback:
              "Bonne réponse : les vomissements répétés chez un animal âgé doivent être signalés rapidement et l'alimentation adaptée.",
          },
          {
            label:
              "Je lui donne de l'eau gazeuse pour aider la digestion car c'est souvent efficace chez les chiens.",
            isCorrect: false,
            feedback:
              "Non : l'eau gazeuse peut aggraver les troubles digestifs et n'est pas un traitement reconnu en garde animale.",
          },
          {
            label:
              "J'augmente la ration alimentaire pour compenser la perte et maintenir son poids.",
            isCorrect: false,
            feedback:
              "À éviter : forcer l'alimentation d'un animal nauséeux peut provoquer de nouveaux vomissements.",
          },
        ],
      },
      {
        scenario:
          "Le chien âgé a fait ses besoins à l'intérieur alors que vous veniez juste de rentrer d'une sortie. C'est la première fois. Que faites-vous ?",
        answers: [
          {
            label:
              "Je nettoie sans le gronder, je note l'heure et la fréquence, je propose des sorties plus régulières et je préviens le propriétaire de cet épisode.",
            isCorrect: true,
            feedback:
              "Bonne réponse : un accident isolé chez un animal âgé peut être le premier signe d'une incontinence à surveiller ou d'une infection.",
          },
          {
            label:
              "Je réprimande le chien pour qu'il comprenne que ce n'est pas acceptable à l'intérieur.",
            isCorrect: false,
            feedback:
              "À éviter : punir un animal âgé pour un accident involontaire est contre-productif et peut aggraver l'anxiété.",
          },
          {
            label:
              "Je ne note rien car c'est ponctuel et ne mérite pas d'être signalé au propriétaire.",
            isCorrect: false,
            feedback:
              "Non : tout incident doit être documenté ; chez un animal âgé, un premier accident peut annoncer un suivi médical nécessaire.",
          },
        ],
      },
      {
        scenario:
          "La chatte âgée n'a pas touché à sa gamelle depuis hier soir. Elle reste couchée et ne réagit plus à ses jouets habituels. Que faites-vous ?",
        answers: [
          {
            label:
              "Je contacte le propriétaire pour signaler la situation, je surveille la respiration et l'hydratation, et je demande s'il faut consulter un vétérinaire.",
            isCorrect: true,
            feedback:
              "Bonne réponse : chez un animal âgé, une anorexie combinée à une léthargie est une urgence potentielle à signaler sans délai.",
          },
          {
            label:
              "Je change son alimentation par une autre marque plus appétente que j'ai à disposition.",
            isCorrect: false,
            feedback:
              "Non : modifier le régime sans consigne peut perturber un animal âgé dont la digestion est souvent sensible.",
          },
          {
            label:
              "J'attends un jour de plus car les chats âgés ont souvent des variations d'appétit normales.",
            isCorrect: false,
            feedback:
              "À éviter : attendre face à une anorexie prolongée chez un animal âgé peut laisser passer un état grave.",
          },
        ],
      },
      {
        scenario:
          "Le chien âgé marche en cercle, semble désorienté et ne reconnaît pas les pièces habituelles de la maison. Il n'a pas eu de choc apparent. Que faites-vous ?",
        answers: [
          {
            label:
              "Je contacte immédiatement le propriétaire et, si non joignable, le vétérinaire indiqué dans le protocole ; je reste avec l'animal et j'empêche qu'il se blesse.",
            isCorrect: true,
            feedback:
              "Bonne réponse : une désorientation soudaine chez un animal âgé peut indiquer un accident vasculaire ou une crise neurologique nécessitant une urgence vétérinaire.",
          },
          {
            label:
              "Je pense que c'est de la vieillesse normale et j'évite d'inquiéter le propriétaire inutilement.",
            isCorrect: false,
            feedback:
              "Non : une désorientation soudaine n'est pas normale ; confondre un symptôme neurologique avec la vieillesse peut coûter la vie à l'animal.",
          },
          {
            label:
              "Je lui donne un médicament calmant disponible dans la maison pour éviter qu'il se blesse.",
            isCorrect: false,
            feedback:
              "Dangereux : administrer un médicament non prescrit à un animal en crise peut interagir fatalement avec ses traitements actuels.",
          },
        ],
      },
    ],
  },
];

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
  const [localSelectedTests, setLocalSelectedTests] = useState<string[] | null>(null);
  const [activeTestId, setActiveTestId] = useState("dogs");
  const [localValidatedTestIds, setLocalValidatedTestIds] = useState<string[] | null>(
    null,
  );
  const [questionIndices, setQuestionIndices] = useState<Record<string, number>>({});
  const [selectedAnswerLabel, setSelectedAnswerLabel] = useState<string | null>(null);
  const [correctCounts, setCorrectCounts] = useState<Record<string, number>>({});
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const selectedCareOptionIds =
    localCareOptionIds ?? session?.petSitterSetupPreferences?.careOptionIds ?? [];
  const selectedAnimalOptionIds =
    localAnimalOptionIds ?? session?.petSitterSetupPreferences?.animalOptionIds ?? [];
  const setupSelectedTests =
    selectedCareOptionIds.length > 0 && selectedAnimalOptionIds.length > 0
      ? PetSitterOnboardingPreferences.create({
          animalOptionIds: selectedAnimalOptionIds,
          careOptionIds: selectedCareOptionIds,
        }).getCompetencyTrackIds()
      : [];
  const sessionValidatedTests = session?.petSitterValidatedTests ?? [];
  const selectedTests =
    localSelectedTests ??
    (sessionValidatedTests.length > 0 ? sessionValidatedTests : setupSelectedTests);
  const validatedTestIds = localValidatedTestIds ?? sessionValidatedTests;
  const resolvedOnboardingPhase =
    session?.petSitterProfileStatus === "published" ||
    sessionValidatedTests.length > 0 ||
    setupSelectedTests.length > 0
      ? "tests"
      : "setup";
  const onboardingPhase = localOnboardingPhase ?? resolvedOnboardingPhase;

  const activeTest =
    petSitterCompetencyTests.find((test) => test.id === activeTestId) ??
    petSitterCompetencyTests[0];

  if (!activeTest) {
    throw new Error("At least one pet-sitter competency test is required.");
  }

  const selectedTracks = petSitterCompetencyTests.filter((test) =>
    selectedTests.includes(test.id),
  );
  const selectedTestLabels = selectedTracks.map((test) => test.label);
  const validatedTestLabels = petSitterCompetencyTests
    .filter((test) => selectedTests.includes(test.id))
    .filter((test) => validatedTestIds.includes(test.id))
    .map((test) => test.label);

  const totalQuestions = activeTest.questions.length;
  const qIdx = questionIndices[activeTestId] ?? 0;
  const testCompleted = qIdx >= totalQuestions;
  const currentQuestion = testCompleted ? undefined : activeTest.questions[qIdx];
  const selectedAnswer = currentQuestion?.answers.find(
    (answer) => answer.label === selectedAnswerLabel,
  );
  const isLastQuestion = qIdx === totalQuestions - 1;

  const remainingTestsCount = selectedTests.filter(
    (testId) => !validatedTestIds.includes(testId),
  ).length;
  const canActivateProfile =
    selectedTests.length > 0 && selectedTests.every((testId) => validatedTestIds.includes(testId));
  const selectedCareLabels = petSitterCareOptions
    .filter((option) => selectedCareOptionIds.includes(option.id))
    .map((option) => option.label);
  const activeTestScore = correctCounts[activeTestId] ?? 0;
  const activeTestThreshold = Math.ceil(totalQuestions * 0.6);
  const activeTestProgressPercent = Math.min((qIdx / totalQuestions) * 100, 100);

  useEffect(() => {
    if (!isTestModalOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsTestModalOpen(false);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isTestModalOpen]);

  function openTest(testId: string) {
    setActiveTestId(testId);
    setSelectedAnswerLabel(null);
    setIsTestModalOpen(true);
  }

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

    const nextSelectedTests = preferences.getCompetencyTrackIds();
    saveDemoPetSitterSetupPreferences({
      animalOptionIds: preferences.getAnimalOptionIds(),
      careOptionIds: preferences.getCareOptionIds(),
    });
    setLocalSelectedTests(nextSelectedTests);
    setActiveTestId(nextSelectedTests[0] ?? "dogs");
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

  function toggleSelectedTest(testId: string, checked: boolean) {
    setLocalSelectedTests((currentIds) => {
      const nextCurrentIds = currentIds ?? selectedTests;

      return checked
        ? Array.from(new Set([...nextCurrentIds, testId]))
        : nextCurrentIds.filter((id) => id !== testId);
    });
  }

  function replaceValidatedTests(testIds: string[]) {
    setLocalValidatedTestIds(testIds);
    saveDemoPetSitterValidatedTests(testIds);
  }

  function removeValidatedTest(testId: string) {
    const nextValidatedTests = validatedTestIds.filter((id) => id !== testId);

    replaceValidatedTests(nextValidatedTests);
  }

  function ensureTestSelectionStillActive(testId: string, nextSelectedTests: string[]) {
    if (nextSelectedTests.includes(testId)) {
      setActiveTestId(testId);
      return;
    }

    setActiveTestId(nextSelectedTests[0] ?? "dogs");
  }

  function handleNextQuestion() {
    const wasCorrect = selectedAnswer?.isCorrect ?? false;
    const newCount = (correctCounts[activeTestId] ?? 0) + (wasCorrect ? 1 : 0);
    setCorrectCounts((prev) => ({ ...prev, [activeTestId]: newCount }));

    if (isLastQuestion) {
      setQuestionIndices((prev) => ({ ...prev, [activeTestId]: totalQuestions }));
      const threshold = Math.ceil(totalQuestions * 0.6);
      if (newCount >= threshold) {
        const nextValidatedTests = validatedTestIds.includes(activeTestId)
          ? validatedTestIds
          : [...validatedTestIds, activeTestId];

        replaceValidatedTests(nextValidatedTests);
      }
    } else {
      setQuestionIndices((prev) => ({ ...prev, [activeTestId]: qIdx + 1 }));
    }
    setSelectedAnswerLabel(null);
  }

  function handleRetryTest() {
    setQuestionIndices((prev) => ({ ...prev, [activeTestId]: 0 }));
    setCorrectCounts((prev) => ({ ...prev, [activeTestId]: 0 }));
    const nextValidatedTests = validatedTestIds.filter((id) => id !== activeTestId);

    replaceValidatedTests(nextValidatedTests);
    setSelectedAnswerLabel(null);
  }

  if (onboardingPhase === "setup") {
    return (
      <main className="pet-sitter-setup-screen">
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

  return (
    <ConnectedShell role="Pet-sitter" active="Tests & profil">
      <main className="workspace-main">
        <div className="workspace-heading">
          <div>
            <p className="section-kicker">Activation pet-sitter</p>
            <h1>Construisez un profil fiable avant d&apos;apparaître en recherche.</h1>
          </div>
        </div>

        <ol className="onboarding-stepper" aria-label="Étapes d'activation pet-sitter">
          <li className="onboarding-stepper__item onboarding-stepper__item--active">
            Configuration
          </li>
          <li
            className={
              validatedTestIds.length > 0
                ? "onboarding-stepper__item onboarding-stepper__item--active"
                : "onboarding-stepper__item"
            }
          >
            Tests
          </li>
          <li
            className={
              canActivateProfile
                ? "onboarding-stepper__item onboarding-stepper__item--active"
                : "onboarding-stepper__item"
            }
          >
            Profil
          </li>
          <li className="onboarding-stepper__item">Publication</li>
        </ol>

        <section className="onboarding-layout">
          <article className="workspace-card onboarding-panel onboarding-panel--blue">
            <p className="section-kicker">Étape 1 sur 4</p>
            <h2>Espèces et besoins pris en charge</h2>
            <p>
              Choisissez uniquement les familles d&apos;animaux que vous pouvez
              réellement garder. Chaque sélection déclenche un test adapté.
            </p>
            <div className="competency-grid">
              {petSitterCompetencyTests.map((test) => (
                <label
                  className={
                    activeTestId === test.id
                      ? "competency-card competency-card--active"
                      : "competency-card"
                  }
                  key={test.id}
                >
                  <input
                    type="checkbox"
                    checked={selectedTests.includes(test.id)}
                    onChange={(event) => {
                      const nextSelectedTests = event.target.checked
                        ? Array.from(new Set([...selectedTests, test.id]))
                        : selectedTests.filter((testId) => testId !== test.id);

                      toggleSelectedTest(test.id, event.target.checked);
                      if (!nextSelectedTests.includes(test.id)) {
                        removeValidatedTest(test.id);
                      }
                      if (event.target.checked) {
                        setActiveTestId(test.id);
                      }
                      if (!event.target.checked && activeTestId === test.id) {
                        ensureTestSelectionStillActive(test.id, nextSelectedTests);
                      }
                      setSelectedAnswerLabel(null);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTestId(test.id);
                      setSelectedAnswerLabel(null);
                    }}
                  >
                    {test.label}
                  </button>
                  <span>{test.detail}</span>
                  <em>
                    {validatedTestIds.includes(test.id)
                      ? `${test.publicBadge} validé`
                      : selectedTests.includes(test.id)
                        ? `Test à passer (${test.questions.length} questions)`
                        : "Non proposé sur mon profil"}
                  </em>
                </label>
              ))}
            </div>
          </article>

          <article className="workspace-card onboarding-panel onboarding-panel--pink">
            <p className="section-kicker">Étape 2 sur 4</p>
            <h2>Évaluations de compétence</h2>
            <p>
              Chaque questionnaire s&apos;ouvre en plein écran pour éviter les réponses
              rapides et garder le candidat concentré sur le cas pratique.
            </p>
            <div className="assessment-list">
              {selectedTracks.length > 0 ? (
                selectedTracks.map((test) => {
                  const isValidated = validatedTestIds.includes(test.id);
                  const currentIndex = questionIndices[test.id] ?? 0;

                  return (
                    <article className="assessment-card" key={test.id}>
                      <div>
                        <strong>{test.publicBadge}</strong>
                        <p>{test.detail}</p>
                        <span>
                          {isValidated
                            ? "Validé et conservé dans la session"
                            : `${Math.min(currentIndex + 1, test.questions.length)} / ${test.questions.length} questions`}
                        </span>
                      </div>
                      <button
                        className={isValidated ? "secondary-button" : "primary-button"}
                        type="button"
                        onClick={() => openTest(test.id)}
                      >
                        {isValidated ? "Revoir le test" : "Démarrer le questionnaire"}
                      </button>
                    </article>
                  );
                })
              ) : (
                <p className="workspace-status">
                  Sélectionnez au moins une famille d&apos;animaux pour préparer un
                  questionnaire.
                </p>
              )}
            </div>
          </article>

          <aside className="workspace-card onboarding-summary">
            <p className="section-kicker">Étape 3 et 4</p>
            <h2>Profil et abonnement</h2>
            <p>
              Votre profil public ne mettra en avant que les garanties validées :
              espèces, badges Expert, formule et documents professionnels.
            </p>
            <dl>
              <div>
                <dt>Compte</dt>
                <dd>{session?.name ?? "Compte MamiPet"}</dd>
              </div>
              <div>
                <dt>Gardes sélectionnées</dt>
                <dd>{selectedCareLabels.join(", ") || "Aucune"}</dd>
              </div>
              <div>
                <dt>Espèces sélectionnées</dt>
                <dd>{selectedTestLabels.join(", ") || "Aucun"}</dd>
              </div>
              <div>
                <dt>Tests validés</dt>
                <dd>{validatedTestLabels.join(", ") || "Aucun test validé"}</dd>
              </div>
              <div>
                <dt>Formule</dt>
                <dd>Classique 0 € · Pro préparé après justificatif</dd>
              </div>
            </dl>
            <button
              className="secondary-button"
              type="button"
              onClick={() => {
                setLocalOnboardingPhase("setup");
                setSetupError(null);
              }}
            >
              Modifier mes choix
            </button>
            <button
              className="primary-button"
              type="button"
              disabled={!canActivateProfile}
              onClick={() => {
                publishDemoPetSitterProfile(
                  validatedTestIds.filter((testId) => selectedTests.includes(testId)),
                );
                router.push("/pet-sitter/dashboard");
              }}
            >
              Valider mon profil pet-sitter
            </button>
            {!canActivateProfile ? (
              <p className="workspace-status">
                {selectedTests.length === 0
                  ? "Sélectionnez au moins une famille d'animaux à proposer."
                  : `${remainingTestsCount} test(s) sélectionné(s) restent à valider avant publication.`}
              </p>
            ) : null}
          </aside>
        </section>

        {isTestModalOpen ? (
          <div
            className="assessment-modal-backdrop"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setIsTestModalOpen(false);
              }
            }}
          >
            <section
              className="assessment-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="assessment-modal-title"
            >
              <div className="assessment-modal__header">
                <div>
                  <p className="section-kicker">Évaluation MamiPet</p>
                  <h2 id="assessment-modal-title">
                    {activeTest.publicBadge} · cas pratiques
                  </h2>
                  <p>
                    Score minimum : {activeTestThreshold} bonne(s) réponse(s) sur{" "}
                    {totalQuestions}. Une validation réussie reste enregistrée même
                    si vous quittez cette page.
                  </p>
                </div>
                <button
                  className="icon-button"
                  type="button"
                  onClick={() => setIsTestModalOpen(false)}
                  aria-label="Fermer le questionnaire"
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>

              <div className="assessment-progress" aria-hidden="true">
                <span style={{ width: `${activeTestProgressPercent}%` }} />
              </div>

              {testCompleted ? (
                <div className="assessment-modal__body">
                  <p className="test-scenario">
                    Questionnaire terminé :{" "}
                    <strong>
                      {activeTestScore} / {totalQuestions}
                    </strong>{" "}
                    bonne(s) réponse(s).
                  </p>
                  {validatedTestIds.includes(activeTestId) ? (
                    <p className="test-feedback test-feedback--success">
                      Badge « {activeTest.publicBadge} » validé et enregistré. Vous
                      pouvez changer de page sans devoir refaire ce questionnaire.
                    </p>
                  ) : (
                    <p className="test-feedback test-feedback--warning">
                      Score insuffisant. Reprenez le questionnaire pour afficher ce
                      badge sur votre profil public.
                    </p>
                  )}
                  <div className="assessment-modal__actions">
                    {!validatedTestIds.includes(activeTestId) ? (
                      <button
                        className="secondary-button"
                        type="button"
                        onClick={handleRetryTest}
                      >
                        Recommencer
                      </button>
                    ) : null}
                    <button
                      className="primary-button"
                      type="button"
                      onClick={() => setIsTestModalOpen(false)}
                    >
                      Revenir au profil
                    </button>
                  </div>
                </div>
              ) : (
                <div className="assessment-modal__body">
                  <p className="test-progress">
                    Question {qIdx + 1} / {totalQuestions} · score actuel{" "}
                    {activeTestScore}
                  </p>
                  <p className="test-scenario">{currentQuestion?.scenario}</p>
                  <div className="test-answer-list">
                    {currentQuestion?.answers.map((answer) => (
                      <button
                        className={
                          selectedAnswerLabel === answer.label
                            ? "test-answer test-answer--selected"
                            : "test-answer"
                        }
                        type="button"
                        key={answer.label}
                        onClick={() => {
                          setSelectedAnswerLabel(answer.label);
                        }}
                      >
                        {answer.label}
                      </button>
                    ))}
                  </div>
                  {selectedAnswer ? (
                    <>
                      <p
                        className={
                          selectedAnswer.isCorrect
                            ? "test-feedback test-feedback--success"
                            : "test-feedback test-feedback--warning"
                        }
                      >
                        {selectedAnswer.feedback}
                      </p>
                      <button
                        className="primary-button"
                        type="button"
                        onClick={handleNextQuestion}
                      >
                        {isLastQuestion ? "Terminer et enregistrer" : "Question suivante"}
                      </button>
                    </>
                  ) : (
                    <p className="test-feedback">
                      Sélectionnez la réponse la plus prudente et la plus conforme aux
                      consignes transmises par le propriétaire.
                    </p>
                  )}
                </div>
              )}
            </section>
          </div>
        ) : null}
      </main>
    </ConnectedShell>
  );
}

export function AdminDashboardPage() {
  const workspace = useDemoWorkspace();
  const pendingDocuments = workspace.documents.filter((task) => task.status === "pending");
  const pendingReports = workspace.reports.filter((task) => task.status === "pending");
  const paidBookings = workspace.bookings.filter((booking) => booking.status === "paid");

  const blockedContent = useRoleAccess("admin");
  if (blockedContent) {
    return blockedContent;
  }

  return (
    <ConnectedShell role="Admin" active="Tableau de bord">
      <main className="workspace-main">
        <div className="workspace-heading">
          <div>
            <p className="section-kicker">Back-office</p>
            <h1>Validation, modération et suivi des actions sensibles.</h1>
          </div>
        </div>
        <section className="workspace-grid workspace-grid--four">
          <MetricCard title="Documents" value={String(pendingDocuments.length)} detail="À valider" />
          <MetricCard title="Profils" value="5" detail="En attente" />
          <MetricCard title="Signalements" value={String(pendingReports.length)} detail="Ouverts" />
          <MetricCard title="Paiements" value={String(paidBookings.length)} detail="Mode test" />
        </section>
        <section className="workspace-grid">
          <AdminList collection="documents" title="Documents en attente" items={workspace.documents} />
          <AdminList collection="reports" title="Signalements ouverts" items={workspace.reports} />
        </section>
      </main>
    </ConnectedShell>
  );
}

export function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"choice" | "login">("choice");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <main className="login-screen">
      <button className="auth-back-button" type="button" onClick={() => navigateBack(router, "/")}>
        <span>Retour</span>
      </button>
      <div className="login-device-notch" aria-hidden="true" />
      <section className="login-panel" aria-labelledby="login-title">
        <Link className="login-logo" href="/" aria-label="Accueil MamiPet" id="login-title">
          <Image
            alt=""
            height={294}
            priority
            src="/figma/login-logo-mamipet.avif"
            width={294}
          />
        </Link>

        <div
          className={
            mode === "choice" ? "login-action-card" : "login-action-card login-action-card--form"
          }
        >
          {mode === "choice" ? (
            <>
              <Link className="login-primary-action" href="/register">
                S&rsquo;inscrire
              </Link>
              <button
                className="login-secondary-action"
                type="button"
                onClick={() => {
                  setLoginError(null);
                  setMode("login");
                }}
              >
                Se Connecter
              </button>
              <button className="login-forgot-action" type="button">
                Mot de passe oublié ?
              </button>
            </>
          ) : (
            <form
              className="login-form"
              onSubmit={async (event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                const email = String(formData.get("email") ?? "").trim().toLowerCase();
                const password = String(formData.get("password") ?? "");

                if (!email || !password) {
                  setLoginError("Renseigne ton email et ton mot de passe.");
                  return;
                }

                setIsSubmitting(true);
                setLoginError(null);

                try {
                  const supabase = createSupabaseBrowserClient();
                  const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                  });

                  if (error) {
                    setLoginError(error.message);
                    return;
                  }

                  const dashboardRoute = await resolveDashboardRoute();
                  const { data } = await supabase.auth.getUser();
                  completeLocalLogin({
                    email,
                    metadata: data.user?.user_metadata,
                    route: dashboardRoute,
                  });
                  router.push(dashboardRoute);
                  return;
                } catch (error) {
                  setLoginError(getErrorMessage(error));
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              <label>
                Email
                <input
                  autoComplete="email"
                  name="email"
                  placeholder="margo.mamipet@gmail.com"
                  type="email"
                />
              </label>
              <label>
                Mot de passe
                <input
                  autoComplete="current-password"
                  name="password"
                  placeholder="********"
                  type="password"
                />
              </label>
              <button className="login-primary-action" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Connexion..." : "Se connecter"}
              </button>
              {loginError ? <p className="workspace-status">{loginError}</p> : null}
              <button
                className="login-forgot-action"
                type="button"
                onClick={() => setMode("choice")}
              >
                Retour
              </button>
            </form>
          )}
          <Link className="login-close-action" href="/" aria-label="Fermer">
            <span aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}

export function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"owner" | "petSitter">("petSitter");
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  function selectRole(nextRole: "owner" | "petSitter") {
    setRole(nextRole);
    setRegisterError(null);
    setRegisterSuccess(null);
  }

  const kinshipOptions =
    role === "petSitter"
      ? ["Mamipet", "Papipet", "Amipet"]
      : ["Maman", "Papa", "Ami"];

  return (
    <main className="register-screen">
      <button
        className="auth-back-button"
        type="button"
        onClick={() => navigateBack(router, "/login")}
      >
        <span>Retour</span>
      </button>
      <div className="register-animal register-animal--left" aria-hidden="true">
        <Image
          alt=""
          fill
          sizes="(min-width: 1024px) 30vw, 0px"
          src="/figma/register-pet-left.avif"
        />
      </div>
      <div className="register-animal register-animal--right" aria-hidden="true">
        <Image
          alt=""
          fill
          sizes="(min-width: 1024px) 30vw, 0px"
          src="/figma/register-pet-right.avif"
        />
      </div>
      <section className="register-panel" aria-labelledby="register-title">
        <h1 id="register-title">
          Rejoindre
          <span>en tant que...</span>
        </h1>

        <div className="register-role-tabs" aria-label="Choisir un type de compte">
          <button
            className={role === "petSitter" ? "register-role-tab is-active" : "register-role-tab"}
            type="button"
            aria-pressed={role === "petSitter"}
            onPointerDown={(event) => {
              event.preventDefault();
              selectRole("petSitter");
            }}
            onClick={() => selectRole("petSitter")}
          >
            Petsitter
          </button>
          <button
            className={role === "owner" ? "register-role-tab is-active" : "register-role-tab"}
            type="button"
            aria-pressed={role === "owner"}
            onPointerDown={(event) => {
              event.preventDefault();
              selectRole("owner");
            }}
            onClick={() => selectRole("owner")}
          >
            Propriétaire
          </button>
        </div>

        <section className="register-card" key={role}>
          <form
            className="register-form"
            onSubmit={async (event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              const firstName = String(formData.get("firstName") ?? "").trim();
              const lastName = String(formData.get("lastName") ?? "").trim();
              const email = String(formData.get("email") ?? "").trim().toLowerCase();
              const password = String(formData.get("password") ?? "");
              const age = String(formData.get("age") ?? "").trim();
              const city = String(formData.get("city") ?? "").trim() || "Caen";
              const postalCode = String(formData.get("postalCode") ?? "").trim();
              const identityKind = String(formData.get("identityKind") ?? "").trim();

              setRegisterError(null);
              setRegisterSuccess(null);

              if (!firstName || !email || !password) {
                setRegisterError("Prénom, email et mot de passe sont requis.");
                return;
              }

              setIsSubmitting(true);

              try {
                const supabase = createSupabaseBrowserClient();
                const { data, error } = await supabase.auth.signUp({
                  email,
                  password,
                  options: {
                    data: {
                      age,
                      firstName,
                      identityKind,
                      lastName,
                      postalCode,
                      role,
                      city,
                    },
                  },
                });

                if (error) {
                  if (isAuthRateLimitError(error)) {
                    completeLocalRegistration({
                      email,
                      firstName,
                      role,
                    });
                    router.push(role === "owner" ? "/dashboard" : "/pet-sitter/onboarding");
                    return;
                  }

                  setRegisterError(error.message);
                  return;
                }

                if (!data.session) {
                  completeLocalRegistration({
                    email,
                    firstName,
                    role,
                  });
                  if (role === "petSitter") {
                    router.push("/pet-sitter/onboarding");
                    return;
                  }

                  setRegisterSuccess("Compte créé. Votre espace propriétaire est prêt.");
                  router.push("/dashboard");
                  return;
                }

                if (role === "owner") {
                  completeLocalRegistration({
                    email,
                    firstName,
                    role,
                  });
                  await ensureOwnerProfile({ firstName, city, postalCode });
                  router.push("/dashboard");
                  return;
                }

                completeLocalRegistration({
                  email,
                  firstName,
                  role,
                });
                await ensurePetSitterProfile({ firstName, city, postalCode });
                router.push("/pet-sitter/onboarding");
              } catch (error) {
                setRegisterError(getErrorMessage(error));
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            <fieldset className="register-kind-fieldset">
              <legend>Je suis...</legend>
              <div className="register-kind-options">
                {kinshipOptions.map((option, index) => (
                  <label className="register-chip" key={option}>
                    <input
                      defaultChecked={index === 0}
                      name="identityKind"
                      type="radio"
                      value={option}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="register-form-grid">
              <label>
                Prénom
                <input name="firstName" type="text" placeholder="Margo" required />
              </label>
              <label>
                Nom
                <input name="lastName" type="text" placeholder="Da Silva" required />
              </label>
              <label className="register-field-wide">
                Adresse mail
                <input
                  name="email"
                  type="email"
                  placeholder="margo.mamipet@gmail.com"
                  required
                />
              </label>
              <label>
                Âge
                <input name="age" type="number" min="16" placeholder="24" />
              </label>
              <label>
                Ville
                <input name="city" type="text" placeholder="Caen" />
              </label>
              <label>
                Code postale
                <input name="postalCode" type="text" inputMode="numeric" placeholder="14000" />
              </label>
              <label className="register-password-field">
                Mot de passe
                <input
                  name="password"
                  type="password"
                  placeholder="********"
                  minLength={8}
                  required
                />
              </label>
            </div>

            <button className="register-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Création en cours..."
                : role === "petSitter"
                  ? "Devenir mamipet"
                  : "Créer mon compte"}
            </button>
          </form>
          {registerError ? <p className="workspace-status">{registerError}</p> : null}
          {registerSuccess ? <p className="workspace-status">{registerSuccess}</p> : null}
        </section>
      </section>
    </main>
  );
}

function navigateBack(router: ReturnType<typeof useRouter>, fallbackHref: string) {
  router.push(fallbackHref);
}

function BookingActionPanel({ booking }: { booking: DemoBooking }) {
  const [message, setMessage] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");

  return (
    <div className="booking-action-panel">
      {booking.status === "accepted" ? (
        <button
          className="primary-button"
          type="button"
          onClick={() => {
            demoWorkspaceActions.payBooking(booking.id);
            setMessage("Paiement test validé. Le contrat récapitulatif est généré.");
          }}
        >
          Payer et confirmer
        </button>
      ) : null}
      {booking.status === "paid" ? (
        <button
          className="secondary-button"
          type="button"
          onClick={() => {
            demoWorkspaceActions.completeBooking(booking.id);
            setMessage("Garde terminée. Vous pouvez maintenant déposer un avis.");
          }}
        >
          Marquer la garde terminée
        </button>
      ) : null}
      {booking.contractSummary ? <p>{booking.contractSummary}</p> : null}
      <details className="report-details">
        <summary>Signaler un problème</summary>
        <label>
          Motif
          <textarea
            value={reportReason}
            onChange={(event) => setReportReason(event.target.value)}
            placeholder="Expliquez brièvement le problème."
          />
        </label>
        <button
          className="secondary-button"
          type="button"
          onClick={() => {
            try {
              demoWorkspaceActions.openReport(booking.id, reportReason);
              setMessage("Signalement ouvert côté administration.");
              setReportReason("");
            } catch (error) {
              setMessage(getErrorMessage(error));
            }
          }}
        >
          Ouvrir le ticket
        </button>
      </details>
      {message ? <p className="workspace-status">{message}</p> : null}
    </div>
  );
}

function ReviewForm({ booking }: { booking: DemoBooking }) {
  const [message, setMessage] = useState<string | null>(null);

  return (
    <form
      className="review-form"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const comment = String(formData.get("comment") ?? "").trim();

        try {
          demoWorkspaceActions.submitReview(booking.id, {
            rating: 5,
            comment,
            careScore: 5,
            communicationScore: 5,
            trustScore: 5,
          });
          setMessage("Avis publié sur la réservation terminée.");
          event.currentTarget.reset();
        } catch (error) {
          setMessage(getErrorMessage(error));
        }
      }}
    >
      <p>{booking.petSitterName} · garde terminée</p>
      <label>
        Votre avis
        <textarea name="comment" placeholder="Décrivez la garde en quelques mots." />
      </label>
      <button className="primary-button" type="submit">
        Publier l&apos;avis
      </button>
      {message ? <p className="workspace-status">{message}</p> : null}
    </form>
  );
}

function ConnectedShell({
  role,
  active,
  children,
}: {
  role: string;
  active: string;
  children: React.ReactNode;
}) {
  const session = useDemoSession();
  const router = useRouter();
  const links = getConnectedLinks(session, role);
  const sessionActiveRole = session?.activeRole;
  const sessionEnabledRolesKey = session?.enabledRoles?.join("|") ?? "";

  useEffect(() => {
    let isMounted = true;
    const supabase = createSupabaseBrowserClient();
    const renderedRole = getWorkspaceKindFromRoleLabel(role);
    const isPetSitterActivationPage =
      renderedRole === "petSitter" && active === "Tests & profil";

    if (session?.source === "local" && isPetSitterActivationPage) {
      if (!sessionEnabledRolesKey.split("|").includes("petSitter")) {
        activateDemoSessionRole("petSitter");
      } else if (sessionActiveRole !== "petSitter") {
        switchDemoSessionRole("petSitter");
      }
      return;
    }

    if (session?.source === "local" && sessionEnabledRolesKey.split("|").includes(renderedRole)) {
      if (sessionActiveRole !== renderedRole) {
        switchDemoSessionRole(renderedRole);
      }
      return;
    }

    void supabase.auth
      .getUser()
      .then(async ({ data }) => {
        const user = data.user;

        if (!isMounted || !user?.email) {
          return;
        }

        const sessionProfile = await resolveSessionProfile(renderedRole);
        const roleKind = sessionProfile.activeRole;
        const nextSession = {
          activeRole: roleKind,
          enabledRoles: sessionProfile.enabledRoles,
          id: buildLocalSessionId(roleKind, user.email),
          name: getDisplayNameFromAuth(user.email, user.user_metadata),
          roleLabel: getRoleLabelFromWorkspaceKind(roleKind),
          route: getDefaultWorkspaceRoute(roleKind),
        };

        if (
          session?.source === "local" &&
          session.id === nextSession.id &&
          session.name === nextSession.name &&
          session.route === nextSession.route
        ) {
          return;
        }

        setLocalDemoSession(nextSession);
        demoWorkspaceActions.ensureWorkspaceForCurrentSession();
      })
      .catch(() => {
        // Connected demo state remains usable when Supabase is unavailable locally.
      });

    return () => {
      isMounted = false;
    };
  }, [
    active,
    role,
    sessionActiveRole,
    sessionEnabledRolesKey,
    session?.id,
    session?.name,
    session?.route,
    session?.source,
  ]);

  return (
    <div className="connected-shell">
      <aside className="connected-sidebar">
        <Link className="brand-mark" href="/">
          <span className="brand-symbol" aria-hidden="true">
            M
          </span>
          <span>
            Mami<span>Pet</span>
          </span>
        </Link>
        <ConnectedShellIdentity workspaceRole={role} />
        {session && (session.enabledRoles?.length ?? 0) > 1 ? (
          <div className="connected-role-switcher" aria-label="Changer de profil actif">
            {session.enabledRoles?.map((enabledRole) => (
              <button
                className={
                  session.activeRole === enabledRole
                    ? "connected-role-switcher__button connected-role-switcher__button--active"
                    : "connected-role-switcher__button"
                }
                type="button"
                key={enabledRole}
                onClick={() => {
                  switchDemoSessionRole(enabledRole);
                  router.push(getDefaultWorkspaceRoute(enabledRole));
                }}
              >
                {getShortRoleLabel(enabledRole)}
              </button>
            ))}
          </div>
        ) : null}
        <nav aria-label="Navigation espace connecté">
          {links.map(([label, href]) => (
            <Link className={active === label ? "active" : ""} href={href} key={href}>
              {label}
            </Link>
          ))}
        </nav>
        {session ? (
          <div className="connected-sidebar-actions">
            <button
              className="secondary-button"
              type="button"
              onClick={() => demoWorkspaceActions.reset()}
            >
              Réinitialiser l&apos;espace
            </button>
            <button
              className="ghost-button"
              type="button"
              onClick={() => {
                const supabase = createSupabaseBrowserClient();
                void supabase.auth.signOut();
                clearDemoSession();
                router.push("/login");
              }}
            >
              Déconnexion
            </button>
          </div>
        ) : null}
      </aside>
      {children}
    </div>
  );
}

type WorkspaceKind = DemoSessionRole;

function useRoleAccess(expectedRole: WorkspaceKind): React.ReactNode | null {
  const session = useDemoSession();
  const router = useRouter();

  if (!session || hasWorkspaceAccess(session, expectedRole)) {
    return null;
  }

  const currentRole = getWorkspaceKindFromRoleLabel(session.roleLabel);
  const currentRoute = getDefaultWorkspaceRoute(currentRole);

  return (
    <ConnectedShell role={session.roleLabel} active="Tableau de bord">
      <main className="workspace-main">
        <section className="workspace-card workspace-empty-state">
          <p className="section-kicker">Accès non actif</p>
          <h1>{getWorkspaceAccessTitle(expectedRole)}</h1>
          <p>
            Votre session actuelle est un espace {session.roleLabel}. Pour garder une
            séparation claire des rôles, MamiPet ne mélange pas les données propriétaire,
            pet-sitter et administration dans le même dashboard.
          </p>
          {expectedRole !== "admin" ? (
            <button
              className="primary-button"
              type="button"
              onClick={() => {
                if (expectedRole === "petSitter") {
                  router.push("/pet-sitter/onboarding");
                  return;
                }

                activateDemoSessionRole(expectedRole);
                router.push(getDefaultWorkspaceRoute(expectedRole));
              }}
            >
              {expectedRole === "petSitter"
                ? "Passer les tests pet-sitter"
                : "Activer ce rôle sur mon compte"}
            </button>
          ) : null}
          <ButtonLink href={currentRoute} variant="secondary">
            Revenir à mon espace
          </ButtonLink>
        </section>
      </main>
    </ConnectedShell>
  );
}

function getConnectedLinks(
  session: ReturnType<typeof useDemoSession>,
  fallbackRole: string,
): Array<[string, string]> {
  const workspaceKind = session
    ? (session.activeRole ?? getWorkspaceKindFromRoleLabel(session.roleLabel))
    : getWorkspaceKindFromRoleLabel(fallbackRole);
  const enabledRoles = session?.enabledRoles ?? [];

  if (workspaceKind === "admin") {
    return [["Tableau de bord", "/admin/dashboard"]];
  }

  if (workspaceKind === "petSitter") {
    const links: Array<[string, string]> = [
      ["Tableau de bord", "/pet-sitter/dashboard"],
      ["Tests & profil", "/pet-sitter/onboarding"],
      ["Recherche", "/pet-sitters"],
    ];

    if (!enabledRoles.includes("owner")) {
      links.push(["Activer propriétaire", "/owner/animals"]);
    }

    return links;
  }

  const links: Array<[string, string]> = [
    ["Tableau de bord", "/dashboard"],
    ["Mes animaux", "/owner/animals"],
    ["Recherche", "/pet-sitters"],
    ["Réservation", "/reservations/new"],
  ];

  if (!isPetSitterProfilePublished(session)) {
    links.push([
      enabledRoles.includes("petSitter") ? "Finaliser profil pet-sitter" : "Devenir pet-sitter",
      "/pet-sitter/onboarding",
    ]);
  }

  return links;
}

function hasWorkspaceAccess(
  session: ReturnType<typeof useDemoSession>,
  role: WorkspaceKind,
): boolean {
  if (!session?.enabledRoles?.includes(role)) {
    return false;
  }

  if (role === "petSitter") {
    return isPetSitterProfilePublished(session);
  }

  return true;
}

function isPetSitterProfilePublished(
  session: ReturnType<typeof useDemoSession>,
): boolean {
  return Boolean(
    session?.enabledRoles?.includes("petSitter") &&
    session.petSitterProfileStatus === "published",
  );
}

function getWorkspaceKindFromRoleLabel(roleLabel: string): WorkspaceKind {
  const normalizedRole = roleLabel.toLowerCase();

  if (normalizedRole.includes("admin")) {
    return "admin";
  }

  if (normalizedRole.includes("pet-sitter")) {
    return "petSitter";
  }

  return "owner";
}

function getDefaultWorkspaceRoute(role: WorkspaceKind): string {
  if (role === "admin") {
    return "/admin/dashboard";
  }

  if (role === "petSitter") {
    return "/pet-sitter/dashboard";
  }

  return "/dashboard";
}

function getWorkspaceAccessTitle(expectedRole: WorkspaceKind): string {
  if (expectedRole === "admin") {
    return "Cet espace est réservé à l'administration.";
  }

  if (expectedRole === "petSitter") {
    return "Cet espace est réservé aux pet-sitters.";
  }

  return "Cet espace est réservé aux propriétaires.";
}

type SessionProfile = {
  activeRole: WorkspaceKind;
  enabledRoles: WorkspaceKind[];
};

async function resolveSessionProfile(preferredRole: WorkspaceKind): Promise<SessionProfile> {
  const response = await fetch("/api/me", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    return {
      activeRole: preferredRole,
      enabledRoles: [preferredRole],
    };
  }

  const payload = (await response.json()) as {
    data?: {
      isAdmin: boolean;
      roles: {
        admin?: boolean;
        owner: boolean;
        petSitter: boolean;
      };
    };
  };
  const enabledRoles = getEnabledRolesFromApi(payload.data);

  if (enabledRoles.includes(preferredRole)) {
    return {
      activeRole: preferredRole,
      enabledRoles,
    };
  }

  return {
    activeRole: enabledRoles[0] ?? "owner",
    enabledRoles,
  };
}

function getEnabledRolesFromApi(
  data:
    | {
      isAdmin: boolean;
      roles: {
        admin?: boolean;
        owner: boolean;
        petSitter: boolean;
      };
    }
    | undefined,
): WorkspaceKind[] {
  if (!data) {
    return ["owner"];
  }

  if (data.roles.admin || data.isAdmin) {
    return ["admin"];
  }

  const roles: WorkspaceKind[] = [];

  if (data.roles.owner) {
    roles.push("owner");
  }

  if (data.roles.petSitter) {
    roles.push("petSitter");
  }

  return roles.length > 0 ? roles : ["owner"];
}

function getPrimaryPetSitter() {
  const petSitter = demoPetSitters[0];

  if (!petSitter) {
    throw new Error("At least one demo pet-sitter profile is required.");
  }

  return petSitter;
}

function PetMiniCard({ pet }: { pet: DemoPet }) {
  return (
    <div className="pet-mini-card">
      <Image src={pet.image} alt={`${pet.name}, ${pet.species}`} width={104} height={104} />
      <div>
        <strong>{pet.name}</strong>
        <span>
          {pet.species} · {pet.age}
        </span>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  detail,
}: {
  title: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="workspace-card metric-card">
      <span>{title}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}

function AdminList({
  title,
  items,
  collection,
}: {
  title: string;
  items: DemoAdminTask[];
  collection: "documents" | "reports";
}) {
  return (
    <article className="workspace-card admin-list">
      <h2>{title}</h2>
      {items.map((row) => (
        <div className="admin-row" key={row.id}>
          <span>
            <strong>{row.label}</strong>
            <small>{row.detail}</small>
          </span>
          <div>
            {row.status === "pending" ? (
              <>
                <button
                  type="button"
                  onClick={() =>
                    demoWorkspaceActions.updateAdminTask(
                      collection,
                      row.id,
                      collection === "reports" ? "resolved" : "validated",
                    )
                  }
                >
                  {collection === "reports" ? "Traiter" : "Valider"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    demoWorkspaceActions.updateAdminTask(collection, row.id, "rejected")
                  }
                >
                  Refuser
                </button>
              </>
            ) : (
              <TrustBadge label={formatAdminStatus(row.status)} />
            )}
          </div>
        </div>
      ))}
    </article>
  );
}

function createPetById(pets: DemoPet[]): Map<string, DemoPet> {
  return new Map(pets.map((pet) => [pet.id, pet]));
}

function formatBookingTitle(
  booking: DemoBooking,
  petById: Map<string, DemoPet>,
): string {
  const petNames = booking.petIds
    .map((petId) => petById.get(petId)?.name)
    .filter(Boolean)
    .join(" et ");

  return petNames ? `Garde de ${petNames}` : "Garde sans animal sélectionné";
}

function formatShortDate(date: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
  }).format(new Date(`${date}T12:00:00.000Z`));
}

function formatAdminStatus(status: DemoAdminTask["status"]): string {
  const labels: Record<DemoAdminTask["status"], string> = {
    pending: "En attente",
    validated: "Validé",
    rejected: "Refusé",
    resolved: "Traité",
  };

  return labels[status];
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Action impossible.";
}

function completeLocalRegistration(input: {
  email: string;
  firstName: string;
  role: "owner" | "petSitter";
}) {
  const roleKind: WorkspaceKind = input.role === "owner" ? "owner" : "petSitter";
  const route = roleKind === "petSitter" ? "/pet-sitter/onboarding" : "/dashboard";

  setLocalDemoSession({
    activeRole: roleKind,
    enabledRoles: [roleKind],
    id: buildLocalSessionId(roleKind, input.email),
    name: input.firstName,
    petSitterProfileStatus: roleKind === "petSitter" ? "draft" : undefined,
    roleLabel: getRoleLabelFromWorkspaceKind(roleKind),
    route,
  });
  demoWorkspaceActions.startEmptyWorkspace();
}

function completeLocalLogin(input: {
  email: string;
  metadata: Record<string, unknown> | undefined;
  route: string;
}) {
  const roleKind = getWorkspaceKindFromRoute(input.route);

  setLocalDemoSession({
    activeRole: roleKind,
    enabledRoles: [roleKind],
    id: buildLocalSessionId(roleKind, input.email),
    name: getDisplayNameFromAuth(input.email, input.metadata),
    roleLabel: getRoleLabelFromWorkspaceKind(roleKind),
    route: input.route,
  });
  demoWorkspaceActions.ensureWorkspaceForCurrentSession();
}

function buildLocalSessionId(role: WorkspaceKind, email: string): string {
  return `local-${role}-${email.toLowerCase()}`;
}

function getWorkspaceKindFromRoute(route: string): WorkspaceKind {
  if (route.startsWith("/admin")) {
    return "admin";
  }

  if (route.startsWith("/pet-sitter")) {
    return "petSitter";
  }

  return "owner";
}

function getRoleLabelFromWorkspaceKind(role: WorkspaceKind): string {
  if (role === "admin") {
    return "Administration";
  }

  if (role === "petSitter") {
    return "Pet-sitter";
  }

  return "Propriétaire";
}

function getShortRoleLabel(role: WorkspaceKind): string {
  if (role === "admin") {
    return "Admin";
  }

  if (role === "petSitter") {
    return "Pet-sitter";
  }

  return "Propriétaire";
}

function getDisplayNameFromAuth(
  email: string,
  metadata: Record<string, unknown> | undefined,
): string {
  const firstName = metadata?.firstName;
  const fullName = metadata?.full_name ?? metadata?.name;

  if (typeof firstName === "string" && firstName.trim()) {
    return firstName.trim();
  }

  if (typeof fullName === "string" && fullName.trim()) {
    return fullName.trim();
  }

  const emailName = email.split("@")[0] ?? "Compte MamiPet";

  return emailName
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function isAuthRateLimitError(error: {
  message?: string | undefined;
  status?: number | undefined;
}): boolean {
  const message = error.message?.toLowerCase() ?? "";

  return error.status === 429 || message.includes("rate limit");
}

type ApiFailure = {
  error?: {
    message?: string;
  } | null;
};

async function resolveDashboardRoute(): Promise<string> {
  const response = await fetch("/api/me", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    return "/dashboard";
  }

  const payload = (await response.json()) as {
    data?: {
      isAdmin: boolean;
      roles: {
        owner: boolean;
        petSitter: boolean;
      };
    };
  };

  if (payload.data?.isAdmin) {
    return "/admin/dashboard";
  }

  if (payload.data?.roles.owner) {
    return "/dashboard";
  }

  if (payload.data?.roles.petSitter) {
    return "/pet-sitter/dashboard";
  }

  return "/dashboard";
}

async function ensureOwnerProfile(input: {
  firstName: string;
  city: string;
  postalCode: string;
}) {
  const response = await fetch("/api/profiles/owner", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      firstName: input.firstName,
      city: input.city,
      postalCode: input.postalCode || null,
      country: "France",
    }),
  });

  if (response.ok || response.status === 409) {
    return;
  }

  const payload = (await response.json()) as ApiFailure;
  throw new Error(payload.error?.message ?? "Impossible de créer le profil propriétaire.");
}

async function ensurePetSitterProfile(input: {
  firstName: string;
  city: string;
  postalCode: string;
}) {
  const response = await fetch("/api/profiles/pet-sitter", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      firstName: input.firstName,
      city: input.city,
      postalCode: input.postalCode || null,
      country: "France",
      basePriceCents: 2800,
      interventionRadiusKm: 15,
      publicVisibility: false,
      description: "Profil créé depuis le parcours d'inscription.",
    }),
  });

  if (response.ok || response.status === 409) {
    return;
  }

  const payload = (await response.json()) as ApiFailure;
  throw new Error(payload.error?.message ?? "Impossible de créer le profil pet-sitter.");
}

type ReferenceItem = {
  code: string;
  id: string;
  label: string;
};

async function syncPetSitterOfferSelection(codes: PetSitterOfferReferenceCodes) {
  const [
    species,
    careCapabilities,
    careLocations,
    careFormats,
    additionalServices,
  ] = await Promise.all([
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
