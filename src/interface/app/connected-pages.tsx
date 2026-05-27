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
import { AuthBackButton } from "@/interface/shared/auth-back-button";
import {
  defaultOwnerPetImageUrl,
  OwnerRegistrationFlow,
  type OwnerAccountDraft,
  type OwnerAnimalDraft,
  type OwnerRegistrationStep,
} from "@/interface/app/owner-registration-flow";
import { calculatePaymentBreakdown } from "@/modules/payments/domain/platform-commission";
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
      <AuthBackButton onClick={() => navigateBack(router, "/")} />
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
  const [ownerStep, setOwnerStep] = useState<OwnerRegistrationStep>("account");
  const [ownerAccountDraft, setOwnerAccountDraft] = useState<OwnerAccountDraft | null>(null);
  const [ownerAnimalDraft, setOwnerAnimalDraft] = useState<OwnerAnimalDraft | null>(null);
  const [ownerPetImagePreview, setOwnerPetImagePreview] = useState(defaultOwnerPetImageUrl);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  function selectRole(nextRole: "owner" | "petSitter") {
    setRole(nextRole);
    setOwnerStep("account");
    setRegisterError(null);
    setRegisterSuccess(null);
  }

  const kinshipOptions =
    role === "petSitter"
      ? ["Mamipet", "Papipet", "Amipet"]
      : ["Maman", "Papa", "Ami"];

  return (
    <main className="register-screen">
      <AuthBackButton onClick={() => navigateBack(router, "/login")} />
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
      <section
        className={`register-panel${role === "owner" && ownerStep !== "account" ? " register-panel--focused" : ""}`}
        aria-labelledby="register-title"
      >
        {role === "owner" && ownerStep !== "account" ? null : (
          <h1 id="register-title">
            Rejoindre
            <span>en tant que...</span>
          </h1>
        )}

        {role === "owner" && ownerStep !== "account" ? null : (
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
        )}

        <section className={`register-card${role === "owner" ? ` register-card--owner-${ownerStep}` : ""}`} key={`${role}-${ownerStep}`}>
          {role === "owner" ? (
            <OwnerRegistrationFlow
              accountDraft={ownerAccountDraft}
              animalDraft={ownerAnimalDraft}
              imagePreview={ownerPetImagePreview}
              isSubmitting={isSubmitting}
              onAccountDraftChange={setOwnerAccountDraft}
              onAnimalDraftChange={setOwnerAnimalDraft}
              onCompleteLocalRegistration={completeLocalRegistration}
              onError={setRegisterError}
              onImagePreviewChange={setOwnerPetImagePreview}
              onNavigate={(href) => router.push(href)}
              onSubmittingChange={setIsSubmitting}
              onSuccess={setRegisterSuccess}
              onStepChange={setOwnerStep}
              step={ownerStep}
            />
          ) : (
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
                    router.push("/pet-sitter/onboarding");
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
                  router.push("/pet-sitter/onboarding");
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
          )}
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

