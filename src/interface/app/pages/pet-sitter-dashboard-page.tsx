"use client";

import { useMemo, useState } from "react";
import {
  DemoSessionGreeting,
  type DemoSession,
  useDemoSession,
} from "@/interface/shared/demo-session-client";
import {
  demoWorkspaceActions,
  useDemoWorkspace,
} from "@/interface/shared/demo-workspace-client";
import { getBookingStatusLabel } from "@/interface/shared/demo-workspace-state";
import { ButtonLink, TrustBadge } from "@/interface/shared/product-ui";
import { CatExpertHeadIcon } from "@/interface/app/cat-expert-head-icon";
import {
  ConnectedShell,
  useRoleAccess,
} from "@/interface/app/connected/connected-shell";
import { DogAssessmentHeadIcon } from "@/interface/app/dog-assessment-head-icon";
import {
  BookingDocumentsPanel,
  BookingHistoryList,
  MetricCard,
  PetSitterPayoutPanel,
} from "@/interface/app/connected/workspace-components";
import { RabbitExpertHeadIcon } from "@/interface/app/rabbit-expert-head-icon";
import {
  createPetById,
  formatBookingTitle,
  formatShortDate,
} from "@/interface/app/connected/workspace-formatters";

export function PetSitterDashboardPage() {
  const workspace = useDemoWorkspace();
  const session = useDemoSession();
  const [isBadgePanelOpen, setIsBadgePanelOpen] = useState(false);

  const petById = useMemo(
    () => createPetById(workspace.pets),
    [workspace.pets],
  );
  const currentPetSitterId = getCurrentDemoPetSitterProfileId(session);

  const activeRequests = workspace.bookings.filter(
    (booking) =>
      booking.petSitterId === currentPetSitterId &&
      (booking.status === "awaiting_response" ||
        booking.status === "accepted" ||
        booking.status === "paid"),
  );

  const acceptedCount = workspace.bookings.filter(
    (booking) =>
      booking.petSitterId === currentPetSitterId &&
      (booking.status === "accepted" || booking.status === "paid"),
  ).length;
  const petSitterBookings = workspace.bookings.filter(
    (booking) => booking.petSitterId === currentPetSitterId,
  );
  const dashboardBadges = getPetSitterAchievementBadges(session);
  const unlockedBadges = dashboardBadges.filter((badge) => badge.isUnlocked);
  const hasPremiumInsurance = session?.petSitterSubscriptionPlan === "premium";

  const blockedContent = useRoleAccess("petSitter");

  if (blockedContent) {
    return blockedContent;
  }

  return (
    <ConnectedShell role="Pet-sitter" active="Tableau de bord">
      <main className="workspace-main">
        <div className="workspace-heading">
          <div>
            <DemoSessionGreeting
              className="section-kicker"
              fallbackName="Sarah"
            />

            <h1>Votre activité de garde est prête.</h1>
          </div>

          <ButtonLink href="/pet-sitter/dashboard">
            Modifier mon profil
          </ButtonLink>
        </div>

        <section className="workspace-grid workspace-grid--four">
          <MetricCard
            title="Complétion profil"
            value="85 %"
            detail="Encore quelques documents"
          />

          <MetricCard
            title="Statut"
            value="Vérifiée"
            detail="Identité validée"
          />

          <MetricCard title="Réponse" value="98 %" detail="Temps moyen : 1 h" />

          <MetricCard
            title="Demandes actives"
            value={String(activeRequests.length)}
            detail={`${acceptedCount} acceptée(s)`}
          />
        </section>

        <section className="workspace-grid">
          <article className="workspace-card">
            <h2>Demandes reçues</h2>

            {activeRequests.length === 0 ? (
              <p>Aucune demande en attente.</p>
            ) : null}

            {activeRequests.map((booking) => (
              <div className="request-row" key={booking.id}>
                <div className="request-summary">
                  <strong>{formatBookingTitle(booking, petById)}</strong>

                  <span>
                    {formatShortDate(booking.startDate)} -{" "}
                    {formatShortDate(booking.endDate)}
                  </span>

                  <small>
                    {booking.instructions || "Aucune consigne complémentaire"}
                  </small>
                </div>

                <div className="request-actions">
                  {booking.status === "awaiting_response" ? (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          demoWorkspaceActions.refuseBooking(booking.id)
                        }
                      >
                        Refuser
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          demoWorkspaceActions.acceptBooking(booking.id)
                        }
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
            <div className="card-heading-row">
              <h2>Documents & badges</h2>
              <button
                className="secondary-button"
                type="button"
                onClick={() => setIsBadgePanelOpen(true)}
              >
                Voir mes badges
              </button>
            </div>

            <div className="badge-row">
              {unlockedBadges.map((badge) => (
                <TrustBadge key={badge.id} label={badge.label} />
              ))}
            </div>

            <p className="workspace-muted-note">
              {hasPremiumInsurance
                ? "Assurance premium active."
                : "Aucune assurance premium active."}
            </p>
          </article>
        </section>

        <section className="workspace-grid">
          <PetSitterPayoutPanel bookings={petSitterBookings} />

          <BookingDocumentsPanel
            bookings={petSitterBookings}
            petById={petById}
            title="Documents de mission"
          />

          <BookingHistoryList
            bookings={petSitterBookings}
            petById={petById}
            title="Historique pet-sitter"
          />
        </section>

        {isBadgePanelOpen ? (
          <AchievementBadgeDialog
            badges={dashboardBadges}
            onClose={() => setIsBadgePanelOpen(false)}
          />
        ) : null}
      </main>
    </ConnectedShell>
  );
}

type AchievementBadge = {
  description: string;
  id: AchievementBadgeId;
  isUnlocked: boolean;
  label: string;
};

type AchievementBadgeId =
  | "birds"
  | "cats"
  | "dogs"
  | "identity"
  | "insurance"
  | "nacs"
  | "senior";

function AchievementBadgeDialog({
  badges,
  onClose,
}: {
  badges: AchievementBadge[];
  onClose: () => void;
}) {
  const unlockedCount = badges.filter((badge) => badge.isUnlocked).length;

  return (
    <div className="achievement-dialog-backdrop" role="presentation">
      <section
        className="achievement-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="achievement-dialog-title"
      >
        <div className="achievement-dialog__header">
          <div>
            <p className="section-kicker">Succès pet-sitter</p>
            <h2 id="achievement-dialog-title">Badges débloqués</h2>
            <p>
              {unlockedCount} badge(s) obtenu(s) sur {badges.length}. Les badges
              non validés restent grisés.
            </p>
          </div>
          <button className="ghost-button" type="button" onClick={onClose}>
            Fermer
          </button>
        </div>

        <div className="achievement-grid">
          {badges.map((badge) => (
            <article
              className={
                badge.isUnlocked
                  ? "achievement-badge achievement-badge--unlocked"
                  : "achievement-badge achievement-badge--locked"
              }
              key={badge.id}
            >
              <AchievementBadgeMark badgeId={badge.id} />
              <strong>{badge.label}</strong>
              <p>{badge.description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function AchievementBadgeMark({ badgeId }: { badgeId: AchievementBadgeId }) {
  return (
    <span
      className={`achievement-badge__mark achievement-badge__mark--${badgeId}`}
      aria-hidden="true"
    >
      {renderAchievementBadgeIcon(badgeId)}
    </span>
  );
}

function renderAchievementBadgeIcon(badgeId: AchievementBadgeId) {
  if (badgeId === "dogs") {
    return <DogAssessmentHeadIcon />;
  }

  if (badgeId === "cats") {
    return <CatExpertHeadIcon />;
  }

  if (badgeId === "nacs") {
    return <RabbitExpertHeadIcon />;
  }

  if (badgeId === "identity") {
    return (
      <svg viewBox="0 0 64 64" focusable="false">
        <path d="M32 6 52 14v15c0 13.4-8.2 24-20 29C20.2 53 12 42.4 12 29V14L32 6Z" />
        <path d="M23 33c2.5-3.7 6-5.5 9-5.5s6.5 1.8 9 5.5" />
        <path d="M32 25.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Z" />
      </svg>
    );
  }

  if (badgeId === "insurance") {
    return (
      <svg viewBox="0 0 64 64" focusable="false">
        <path d="M10 31c3-10.5 11-17 22-17s19 6.5 22 17" />
        <path d="M10 31c5-4 10-4 15 0 4.7-4 9.3-4 14 0 5-4 10-4 15 0" />
        <path d="M32 31v13c0 4.5 3 7 7 7 3.2 0 5.8-1.8 6.7-4.5" />
      </svg>
    );
  }

  if (badgeId === "senior") {
    return (
      <svg viewBox="0 0 64 64" focusable="false">
        <path d="M32 9c11 0 20 8.4 20 19.3 0 15.1-17.2 24.7-20 26.1-2.8-1.4-20-11-20-26.1C12 17.4 21 9 32 9Z" />
        <path d="M32 22v19" />
        <path d="M22.5 31.5h19" />
      </svg>
    );
  }

  if (badgeId === "birds") {
    return (
      <svg viewBox="0 0 64 64" focusable="false">
        <path d="M15 41c9.4-1.1 16.7-6.5 21.9-16.2 2 9.7-2.8 20.5-13.6 27.2" />
        <path d="M34 26.5c6.9-8 14.6-11.9 23-11.7-1.9 10.2-8.7 18.1-20.4 23.7" />
        <path d="M33.2 28.4C28.6 22 22.5 18.7 15 18.6c1.5 7.4 6.2 13.1 14 17.1" />
        <path d="M39.5 21.5c.2 2.8 1.5 5 3.9 6.5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 64 64" focusable="false">
      <path d="M18 42c8-10 18-14 30-12-6 8-15 12.5-27 13.5" />
      <path d="M18 42c-2.8-9 .4-17.5 9.6-25.5 2.6 11.1-.5 19.6-9.6 25.5Z" />
      <path d="M22 39 12 49" />
    </svg>
  );
}

function getPetSitterAchievementBadges(
  session: ReturnType<typeof useDemoSession>,
): AchievementBadge[] {
  const validatedTests = new Set(session?.petSitterValidatedTests ?? []);
  const hasPremiumInsurance = session?.petSitterSubscriptionPlan === "premium";

  return [
    {
      description: "Compte pet-sitter activé et identité renseignée.",
      id: "identity",
      isUnlocked: true,
      label: "Identité vérifiée",
    },
    {
      description: "Formule professionnelle avec assurance premium incluse.",
      id: "insurance",
      isUnlocked: hasPremiumInsurance,
      label: "Assurance active",
    },
    {
      description: "Questionnaire chien validé sans faute.",
      id: "dogs",
      isUnlocked: validatedTests.has("dogs"),
      label: "Expert chien",
    },
    {
      description: "Questionnaire chat validé sans faute.",
      id: "cats",
      isUnlocked: validatedTests.has("cats"),
      label: "Expert chat",
    },
    {
      description: "Questionnaire animaux âgés ou fragiles validé.",
      id: "senior",
      isUnlocked: validatedTests.has("senior"),
      label: "Expert animaux âgés",
    },
    {
      description: "Questionnaire oiseaux validé.",
      id: "birds",
      isUnlocked: validatedTests.has("birds"),
      label: "Expert oiseaux",
    },
    {
      description: "Questionnaire nouveaux animaux de compagnie validé.",
      id: "nacs",
      isUnlocked: validatedTests.has("nacs"),
      label: "Expert NAC",
    },
  ];
}

function getCurrentDemoPetSitterProfileId(
  session: DemoSession | null,
): string | null {
  if (!session?.enabledRoles?.includes("petSitter")) {
    return null;
  }

  if (session.source === "fixture" && session.id === "petSitter") {
    return "sarah-johnson";
  }

  if (session.id.toLowerCase().includes("sarah.sitter@mamipet.test")) {
    return "sarah-johnson";
  }

  if (session.id.toLowerCase().includes("amelie.sitter@mamipet.test")) {
    return "amelie-bernard";
  }

  if (session.id.toLowerCase().includes("hugo.sitter@mamipet.test")) {
    return "hugo-martin";
  }

  return `local-pet-sitter-${session.id}`;
}
