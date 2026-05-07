"use client";

import Image from "next/image";
import Link from "next/link";
import type React from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { demoPetSitters } from "@/interface/shared/product-data";
import {
  ConnectedShellIdentity,
  DemoSessionGreeting,
  DemoSessionLink,
  setDemoSessionById,
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
  PublicShell,
  SensitiveDataNotice,
  TrustBadge,
} from "@/interface/shared/product-ui";

export function OwnerDashboardPage() {
  const workspace = useDemoWorkspace();
  const nextBooking = workspace.bookings.find(
    (booking) => booking.status !== "completed" && booking.status !== "refused",
  );
  const completedBookingToReview = workspace.bookings.find(
    (booking) => booking.status === "completed" && !booking.review,
  );
  const petById = useMemo(() => createPetById(workspace.pets), [workspace.pets]);

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

          <article className="workspace-card">
            <div className="card-heading-row">
              <h2>Mes animaux</h2>
              <Link href="/owner/animals">Voir tout</Link>
            </div>
            <div className="pet-mini-grid">
              {workspace.pets.map((pet) => (
                <PetMiniCard key={pet.id} pet={pet} />
              ))}
            </div>
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
                  image:
                    "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1200&q=82",
                });
                setStatusMessage(`${name} a été ajouté au dossier propriétaire.`);
                event.currentTarget.reset();
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
            <button className="primary-button" type="submit">
              Enregistrer l&apos;animal
            </button>
          </form>
        ) : null}
        {statusMessage ? <p className="workspace-status">{statusMessage}</p> : null}
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
      </main>
    </ConnectedShell>
  );
}

export function BookingFlowPage() {
  const workspace = useDemoWorkspace();
  const sitter = getPrimaryPetSitter();
  const [selectedPetIds, setSelectedPetIds] = useState(
    workspace.pets.map((pet) => pet.id),
  );
  const [requestStatus, setRequestStatus] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("2026-05-24");
  const [endDate, setEndDate] = useState("2026-05-26");
  const [careType, setCareType] = useState("Garde chez le pet-sitter");
  const [insuranceLevel, setInsuranceLevel] = useState<"standard" | "premium">(
    "standard",
  );
  const selectedPets = workspace.pets.filter((pet) => selectedPetIds.includes(pet.id));
  const estimatedTotalCents =
    selectedPets.length > 0
      ? 7600 + selectedPets.length * 1500 + (insuranceLevel === "premium" ? 900 : 0)
      : 0;

  return (
    <ConnectedShell role="Propriétaire" active="Réservation">
      <main className="booking-workspace">
        <section className="booking-steps" aria-label="Étapes de réservation">
          {["Animaux", "Garde", "Consignes", "Vérification"].map((step, index) => (
            <span className={index === 0 ? "step-pill step-pill--active" : "step-pill"} key={step}>
              {index + 1}. {step}
            </span>
          ))}
        </section>

        <div className="booking-layout">
          <section className="workspace-card booking-form-card">
            <h1>Quels animaux seront gardés ?</h1>
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
                  <PetMiniCard pet={pet} />
                </label>
              ))}
            </div>
            <div className="inline-workspace-form inline-workspace-form--compact">
              <label>
                Début
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                />
              </label>
              <label>
                Fin
                <input
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                />
              </label>
              <label>
                Type de garde
                <select
                  value={careType}
                  onChange={(event) => setCareType(event.target.value)}
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
                  onChange={(event) =>
                    setInsuranceLevel(event.target.value as "standard" | "premium")
                  }
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
                placeholder="Traitement, alimentation, comportement, urgence..."
              />
            </label>
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
                <dt>Total estimé</dt>
                <dd>{formatEuro(estimatedTotalCents)}</dd>
              </div>
            </dl>
            <button
              className="primary-button"
              type="button"
              disabled={selectedPets.length === 0}
              onClick={() => {
                const instructions = document.querySelector<HTMLTextAreaElement>(
                  "textarea[name='instructions']",
                );

                try {
                  demoWorkspaceActions.createBooking({
                    petIds: selectedPetIds,
                    petSitterId: sitter.id,
                    petSitterName: `${sitter.firstName} ${sitter.lastInitial}`,
                    startDate,
                    endDate,
                    careType,
                    instructions: instructions?.value ?? "",
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
            <small>Paiement uniquement après acceptation.</small>
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

  return (
    <ConnectedShell role="Pet-sitter" active="Pet-sitter">
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

  return (
    <ConnectedShell role="Admin" active="Admin">
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
  const [loginError, setLoginError] = useState<string | null>(null);

  return (
    <PublicShell compact>
      <main className="auth-page">
        <section className="auth-card">
          <Link className="brand-mark" href="/">
            <span className="brand-symbol" aria-hidden="true">
              M
            </span>
            <span>
              Mami<span>Pet</span>
            </span>
          </Link>
          <div>
            <p className="section-kicker">Accès sécurisé</p>
            <h1>Connectez-vous pour réserver ou gérer vos gardes.</h1>
          </div>
          <form
            className="auth-form"
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              const email = String(formData.get("email") ?? "").toLowerCase();

              if (!email) {
                setLoginError("Renseignez un email pour accéder à votre espace.");
                return;
              }

              if (email.includes("pet") || email.includes("sarah")) {
                setDemoSessionById("petSitter");
                router.push("/pet-sitter/dashboard");
                return;
              }

              if (email.includes("admin")) {
                setDemoSessionById("admin");
                router.push("/admin/dashboard");
                return;
              }

              setDemoSessionById("owner");
              router.push("/dashboard");
            }}
          >
            <label>
              Email
              <input name="email" type="email" placeholder="olivia.owner@mamipet.test" />
            </label>
            <label>
              Mot de passe
              <input name="password" type="password" placeholder="••••••••" />
            </label>
            <button className="primary-button" type="submit">
              Continuer
            </button>
            {loginError ? <p className="workspace-status">{loginError}</p> : null}
          </form>
          <div className="auth-shortcuts">
            <DemoSessionLink className="secondary-button" href="/dashboard" sessionId="owner">
              Accéder à l&apos;espace propriétaire
            </DemoSessionLink>
            <DemoSessionLink
              className="secondary-button"
              href="/pet-sitter/dashboard"
              sessionId="petSitter"
            >
              Accéder à l&apos;espace pet-sitter
            </DemoSessionLink>
            <DemoSessionLink className="secondary-button" href="/admin/dashboard" sessionId="admin">
              Accéder au back-office
            </DemoSessionLink>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}

export function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"owner" | "petSitter">("owner");

  return (
    <PublicShell compact>
      <main className="auth-page">
        <section className="auth-card">
          <Link className="brand-mark" href="/">
            <span className="brand-symbol" aria-hidden="true">M</span>
            <span>Mami<span>Pet</span></span>
          </Link>
          <div>
            <p className="section-kicker">Créer un compte</p>
            <h1>
              Rejoignez MamiPet en tant que{" "}
              {role === "owner" ? "propriétaire" : "pet-sitter"}.
            </h1>
          </div>
          <div className="role-picker">
            <button
              className={role === "owner" ? "secondary-button role-button--active" : "secondary-button"}
              type="button"
              onClick={() => setRole("owner")}
            >
              🐾 Je suis propriétaire
            </button>
            <button
              className={role === "petSitter" ? "secondary-button role-button--active" : "secondary-button"}
              type="button"
              onClick={() => setRole("petSitter")}
            >
              🏠 Je suis pet-sitter
            </button>
          </div>
          <form
            className="auth-form"
            onSubmit={(event) => {
              event.preventDefault();
              setDemoSessionById(role);
              router.push(role === "petSitter" ? "/pet-sitter/dashboard" : "/dashboard");
            }}
          >
            <label>
              Prénom
              <input name="firstName" type="text" placeholder="Olivia" required />
            </label>
            <label>
              Nom
              <input name="lastName" type="text" placeholder="Martin" required />
            </label>
            <label>
              Email
              <input name="email" type="email" placeholder="olivia@example.com" required />
            </label>
            <label>
              Mot de passe
              <input name="password" type="password" placeholder="••••••••" minLength={8} required />
            </label>
            <label>
              Ville
              <input name="city" type="text" placeholder="Caen" />
            </label>
            {role === "petSitter" ? (
              <>
                <label>
                  Type de garde proposée
                  <select name="serviceType">
                    <option value="home">Garde à domicile</option>
                    <option value="onsite">Garde sur place (chez moi)</option>
                    <option value="walk">Promenades</option>
                  </select>
                </label>
                <label>
                  Soins spéciaux possibles
                  <select name="specialCare">
                    <option value="none">Aucun</option>
                    <option value="medication">Administration de médicaments</option>
                    <option value="senior">Animaux âgés</option>
                    <option value="anxious">Animaux anxieux</option>
                  </select>
                </label>
              </>
            ) : (
              <label>
                Type d&apos;animal
                <select name="animalType">
                  <option value="dog">Chien</option>
                  <option value="cat">Chat</option>
                  <option value="rabbit">Lapin</option>
                  <option value="other">Autre</option>
                </select>
              </label>
            )}
            <button className="primary-button" type="submit">
              Créer mon compte
            </button>
          </form>
          <p>
            Déjà un compte ?{" "}
            <Link href="/login">Se connecter</Link>
          </p>
        </section>
      </main>
    </PublicShell>
  );
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
  const links: Array<[string, string]> = [
    ["Tableau de bord", "/dashboard"],
    ["Mes animaux", "/owner/animals"],
    ["Recherche", "/pet-sitters"],
    ["Réservation", "/reservations/new"],
    ["Pet-sitter", "/pet-sitter/dashboard"],
    ["Admin", "/admin/dashboard"],
  ];

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
        <nav aria-label="Navigation espace connecté">
          {links.map(([label, href]) => (
            <Link className={active === label ? "active" : ""} href={href} key={href}>
              {label}
            </Link>
          ))}
        </nav>
        {session ? (
          <button
            className="secondary-button"
            type="button"
            onClick={() => demoWorkspaceActions.reset()}
          >
            Réinitialiser l&apos;espace
          </button>
        ) : null}
      </aside>
      {children}
    </div>
  );
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
