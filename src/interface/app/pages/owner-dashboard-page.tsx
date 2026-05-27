"use client";

import Image from "next/image";
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
  CareCapabilityTag,
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

    const booking = workspace.bookings.find(
      (candidate) => candidate.id === bookingId,
    );

    if (checkoutStatus === "success") {
      if (booking?.status === "accepted") {
        demoWorkspaceActions.payBooking(bookingId);
        window.setTimeout(() =>
          setCheckoutMessage(
            "Paiement Stripe test validé. Le contrat récapitulatif est généré.",
          ),
        );
      } else if (booking?.status === "paid") {
        window.setTimeout(() =>
          setCheckoutMessage("Cette réservation est déjà marquée comme payée."),
        );
      } else {
        window.setTimeout(() =>
          setCheckoutMessage(
            "Paiement Stripe reçu, mais la réservation n’est plus en état payable.",
          ),
        );
      }
    }

    if (checkoutStatus === "cancelled") {
      window.setTimeout(() =>
        setCheckoutMessage(
          "Paiement Stripe annulé. La réservation reste acceptée.",
        ),
      );
    }

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

            <h1>Vos gardes et animaux sont à jour.</h1>
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
          <BookingDocumentsPanel
            bookings={workspace.bookings}
            petById={petById}
          />

          <BookingHistoryList
            bookings={workspace.bookings}
            petById={petById}
          />

          <article className="workspace-card">
            <h2>Pet-sitters adaptés</h2>

            <div className="recommendation-row">
              {demoPetSitters.slice(0, 6).map((profile) => (
                <Link
                  className="mini-sitter-card"
                  href={`/pet-sitters/${profile.id}`}
                  key={profile.id}
                >
                  <Image
                    src={profile.imageUrl}
                    alt={profile.imageAlt}
                    fill
                    sizes="180px"
                  />

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
                workspace.pets.filter(
                  (pet) => pet.medicalRecordStatus === "incomplete",
                ).length
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
