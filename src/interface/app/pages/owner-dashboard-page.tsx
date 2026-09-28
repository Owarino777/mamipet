"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { demoPetSitters } from "@/interface/shared/product-data";
import { DemoSessionGreeting } from "@/interface/shared/demo-session-client";
import {
  demoWorkspaceActions,
  useDemoWorkspace,
} from "@/interface/shared/demo-workspace-client";
import { getBookingStatusLabel } from "@/interface/shared/demo-workspace-state";
import { formatEuro, formatRating } from "@/interface/shared/format";
import {
  ButtonLink,
  SensitiveDataNotice,
  TrustBadge,
} from "@/interface/shared/product-ui";
import {
  ConnectedShell,
  useRoleAccess,
} from "@/interface/app/connected/connected-shell";
import {
  BookingDocumentsPanel,
  BookingHistoryList,
  BookingActionPanel,
  PetMiniCard,
  ReviewForm,
} from "@/interface/app/connected/workspace-components";
import {
  createPetById,
  formatBookingTitle,
  formatShortDate,
} from "@/interface/app/connected/workspace-formatters";

export function OwnerDashboardPage() {
  const workspace = useDemoWorkspace();
  const router = useRouter();
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);

  const nextBooking = workspace.bookings.find(
    (booking) => booking.status !== "completed" && booking.status !== "refused",
  );

  const completedBookingToReview = workspace.bookings.find(
    (booking) => booking.status === "completed" && !booking.review,
  );
  const incompleteMedicalPets = workspace.pets.filter(
    (pet) => pet.medicalRecordStatus === "incomplete",
  );

  const petById = useMemo(
    () => createPetById(workspace.pets),
    [workspace.pets],
  );

  const blockedContent = useRoleAccess("owner");

  useEffect(() => {
    const currentUrl = new URL(window.location.href);
    const checkoutStatus = currentUrl.searchParams.get("demoCheckout");
    const bookingId = currentUrl.searchParams.get("bookingId");

    if (!checkoutStatus || !bookingId) {
      return;
    }

    window.setTimeout(() => setCheckoutMessage(
      "Un retour de paiement ne confirme pas une transaction. Aucun statut de réservation n’a été modifié.",
    ));

    router.replace("/dashboard", { scroll: false });
  }, [router, workspace.bookings]);

  if (blockedContent) {
    return blockedContent;
  }

  return (
    <ConnectedShell role="Propriétaire" active="Tableau de bord">
      <main className="workspace-main">
        <div className="workspace-heading">
          <div>
            <DemoSessionGreeting
              className="section-kicker"
              fallbackName="Olivia"
            />

            <h1>Votre espace</h1>
          </div>

          <ButtonLink href="/reservations/new">Nouvelle réservation</ButtonLink>
        </div>

        {checkoutMessage ? (
          <p className="workspace-status">{checkoutMessage}</p>
        ) : null}

        <section className="workspace-grid workspace-grid--hero">
          <article className="workspace-card upcoming-card">
            <div>
              <p className="section-kicker">Prochaine garde</p>

              {nextBooking ? (
                <>
                  <h2>{formatBookingTitle(nextBooking, petById)}</h2>

                  <p>
                    Du {formatShortDate(nextBooking.startDate)} au{" "}
                    {formatShortDate(nextBooking.endDate)} ·{" "}
                    {nextBooking.petSitterName}
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
                  <TrustBadge
                    label={getBookingStatusLabel(nextBooking.status)}
                  />

                  <TrustBadge
                    label={`Assurance ${nextBooking.insuranceLevel}`}
                  />

                  <TrustBadge
                    label={`Commission ${formatEuro(nextBooking.platformCommissionCents)}`}
                  />
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

              <ButtonLink href="/owner/animals" variant="secondary">
                Voir tout
              </ButtonLink>
            </div>

            {workspace.pets.length > 0 ? (
              <div className="pet-mini-grid">
                {workspace.pets.map((pet) => (
                  <PetMiniCard key={pet.id} pet={pet} href="/owner/animals" />
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
          {workspace.bookings.length > 0 ? <BookingDocumentsPanel bookings={workspace.bookings} petById={petById} /> : null}

          {workspace.bookings.length > 0 ? <BookingHistoryList bookings={workspace.bookings} petById={petById} /> : null}

          <article className="workspace-card">
            <div className="card-heading-row">
              <h2>Pet-sitters à découvrir</h2>
              <Link href="/pet-sitters">Voir la recherche</Link>
            </div>

            <div className="recommendation-list">
              {demoPetSitters.slice(0, 3).map((profile) => (
                <Link
                  className="recommendation-item"
                  href={`/pet-sitters/${profile.id}`}
                  key={profile.id}
                >
                  <strong>
                    {profile.firstName} {profile.lastInitial}
                  </strong>
                  <span>
                    {formatRating(profile.rating)} / 5 · {profile.city}
                  </span>
                  <span>Dès {formatEuro(profile.basePriceCents)} / {profile.priceUnit}</span>
                </Link>
              ))}
            </div>
          </article>

          {workspace.pets.length > 0 ? <article className="workspace-card">
            <h2>Dossier médical</h2>

            <SensitiveDataNotice />

            <p>
              {incompleteMedicalPets.length} dossier(s) à compléter avant une
              garde sensible.
            </p>

            <div className="medical-action-list">
              {incompleteMedicalPets.slice(0, 3).map((pet) => (
                <button
                  key={pet.id}
                  type="button"
                  onClick={() =>
                    demoWorkspaceActions.completePetMedicalRecord(pet.id)
                  }
                >
                  Compléter {pet.name}
                </button>
              ))}

              <ButtonLink href="/owner/animals" variant="secondary">
                Gérer les dossiers
              </ButtonLink>
            </div>
          </article> : null}

          {completedBookingToReview ? <article className="workspace-card">
            <h2>Avis à déposer</h2>

            <ReviewForm booking={completedBookingToReview} />
          </article> : null}
        </section>
      </main>
    </ConnectedShell>
  );
}
