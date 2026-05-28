"use client";

import Image from "next/image";
import { useState } from "react";
import { demoWorkspaceActions } from "@/interface/shared/demo-workspace-client";
import type {
  DemoAdminTask,
  DemoBooking,
  DemoPet,
} from "@/interface/shared/demo-workspace-state";
import { formatEuro } from "@/interface/shared/format";
import { TrustBadge } from "@/interface/shared/product-ui";
import {
  formatAdminStatus,
  formatBookingTitle,
  formatShortDate,
  getErrorMessage,
} from "@/interface/app/connected/workspace-formatters";

export function BookingActionPanel({ booking }: { booking: DemoBooking }) {
  const [message, setMessage] = useState<string | null>(null);
  const [isStartingCheckout, setIsStartingCheckout] = useState(false);

  const [reportReason, setReportReason] = useState("");

  return (
    <div className="booking-action-panel">
      {booking.status === "accepted" ? (
        <button
          className="primary-button"
          type="button"
          disabled={isStartingCheckout}
          onClick={async () => {
            setIsStartingCheckout(true);
            setMessage(null);

            try {
              const response = await fetch("/api/demo-payments/checkout", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  bookingId: booking.id,
                  careType: booking.careType,
                  endDate: booking.endDate,
                  petSitterName: booking.petSitterName,
                  startDate: booking.startDate,
                  totalAmountCents: booking.totalAmountCents,
                }),
              });
              const payload = (await response.json()) as {
                data?: {
                  checkoutUrl?: string;
                };
                error?: {
                  message?: string;
                } | null;
              };

              if (!response.ok || !payload.data?.checkoutUrl) {
                throw new Error(
                  payload.error?.message ??
                    "Impossible de démarrer le paiement Stripe test.",
                );
              }

              window.location.assign(payload.data.checkoutUrl);
            } catch (error) {
              setMessage(getErrorMessage(error));
              setIsStartingCheckout(false);
            }
          }}
        >
          {isStartingCheckout ? "Ouverture Stripe..." : "Payer et confirmer"}
        </button>
      ) : null}

      {booking.status === "paid" ? (
        <button
          className="secondary-button"
          type="button"
          onClick={() => {
            demoWorkspaceActions.completeBooking(booking.id);

            setMessage(
              "Garde terminée. Vous pouvez maintenant déposer un avis.",
            );
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
            placeholder="Ex. retard, absence de nouvelle, document manquant..."
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

export function ReviewForm({ booking }: { booking: DemoBooking }) {
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
        <textarea
          name="comment"
          placeholder="Ex. garde rassurante, nouvelles régulières, animal détendu..."
        />
      </label>

      <button className="primary-button" type="submit">
        Publier l&apos;avis
      </button>

      {message ? <p className="workspace-status">{message}</p> : null}
    </form>
  );
}

export function BookingDocumentsPanel({
  bookings,
  petById,
  title = "Documents de garde",
}: {
  bookings: DemoBooking[];
  petById: Map<string, DemoPet>;
  title?: string;
}) {
  const [openDocument, setOpenDocument] = useState<BookingDocumentModal | null>(
    null,
  );
  const paidBookings = bookings.filter(
    (booking) =>
      booking.status === "paid" ||
      booking.status === "completed" ||
      booking.status === "incident_reported",
  );

  return (
    <article className="workspace-card booking-documents-card">
      <div className="card-heading-row">
        <h2>{title}</h2>
        <TrustBadge label={`${paidBookings.length} dossier(s)`} />
      </div>

      {paidBookings.length === 0 ? (
        <div className="booking-document-empty">
          <strong>Aucun dossier payé</strong>
          <span>Contrat, reçu et fiche de garde apparaîtront ici.</span>
        </div>
      ) : (
        <div className="booking-document-list">
          {paidBookings.map((booking) => (
            <article className="booking-dossier" key={booking.id}>
              <header className="booking-dossier__header">
                <span className="booking-dossier__icon" aria-hidden="true" />
                <span>
                  <strong>{formatBookingTitle(booking, petById)}</strong>
                  <small>{getBookingReference(booking.id)}</small>
                </span>
                <TrustBadge label="Complet" />
              </header>

              <dl className="booking-dossier__meta">
                <div>
                  <dt>Période</dt>
                  <dd>
                    {formatShortDate(booking.startDate)} -{" "}
                    {formatShortDate(booking.endDate)}
                  </dd>
                </div>
                <div>
                  <dt>Montant</dt>
                  <dd>{formatEuro(booking.totalAmountCents)}</dd>
                </div>
                <div>
                  <dt>Assurance</dt>
                  <dd>{booking.insuranceLevel}</dd>
                </div>
              </dl>

              <ul className="booking-piece-list">
                <li>
                  <span>
                    <strong>Contrat de mission</strong>
                    <small>{booking.contractSummary ?? "Contrat généré."}</small>
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setOpenDocument({
                        booking,
                        content:
                          booking.contractSummary ??
                          "Contrat généré après paiement.",
                        title: "Contrat de mission",
                      })
                    }
                  >
                    Consulter
                  </button>
                </li>
                <li>
                  <span>
                    <strong>Reçu Stripe test</strong>
                    <small>
                      Commission MamiPet{" "}
                      {formatEuro(booking.platformCommissionCents)}
                    </small>
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setOpenDocument({
                        booking,
                        content: `Paiement ${formatEuro(booking.totalAmountCents)}. Commission MamiPet ${formatEuro(booking.platformCommissionCents)}. Net pet-sitter ${formatEuro(booking.providerAmountCents)}.`,
                        title: "Reçu Stripe test",
                      })
                    }
                  >
                    Consulter
                  </button>
                </li>
                <li>
                  <span>
                    <strong>Fiche de garde</strong>
                    <small>
                      {booking.instructions || "Aucune consigne ajoutée."}
                    </small>
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setOpenDocument({
                        booking,
                        content:
                          booking.instructions ||
                          "Aucune consigne ajoutée pour cette garde.",
                        title: "Fiche de garde",
                      })
                    }
                  >
                    Consulter
                  </button>
                </li>
              </ul>
            </article>
          ))}
        </div>
      )}

      {openDocument ? (
        <BookingDocumentDialog
          document={openDocument}
          petById={petById}
          onClose={() => setOpenDocument(null)}
        />
      ) : null}
    </article>
  );
}

type BookingDocumentModal = {
  booking: DemoBooking;
  content: string;
  title: string;
};

function BookingDocumentDialog({
  document,
  onClose,
  petById,
}: {
  document: BookingDocumentModal;
  onClose: () => void;
  petById: Map<string, DemoPet>;
}) {
  const booking = document.booking;

  return (
    <div className="document-dialog-backdrop" role="presentation">
      <section
        className="document-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="document-dialog-title"
      >
        <header className="document-dialog__header">
          <div>
            <p className="section-kicker">{getBookingReference(booking.id)}</p>
            <h2 id="document-dialog-title">{document.title}</h2>
            <span>{formatBookingTitle(booking, petById)}</span>
          </div>
          <button className="ghost-button" type="button" onClick={onClose}>
            Fermer
          </button>
        </header>

        <div className="document-dialog__paper">
          <dl>
            <div>
              <dt>Période</dt>
              <dd>
                {formatShortDate(booking.startDate)} -{" "}
                {formatShortDate(booking.endDate)}
              </dd>
            </div>
            <div>
              <dt>Pet-sitter</dt>
              <dd>{booking.petSitterName}</dd>
            </div>
            <div>
              <dt>Montant</dt>
              <dd>{formatEuro(booking.totalAmountCents)}</dd>
            </div>
          </dl>
          <p>{document.content}</p>
        </div>
      </section>
    </div>
  );
}

export function BookingHistoryList({
  bookings,
  petById,
  title = "Historique de garde",
}: {
  bookings: DemoBooking[];
  petById: Map<string, DemoPet>;
  title?: string;
}) {
  return (
    <article className="workspace-card booking-history-card">
      <h2>{title}</h2>

      {bookings.length === 0 ? (
        <p>Aucune réservation enregistrée pour le moment.</p>
      ) : (
        <div className="booking-history-list">
          {bookings.map((booking) => (
            <div className="booking-history-row" key={booking.id}>
              <span>
                <strong>{formatBookingTitle(booking, petById)}</strong>
                <small>
                  {formatShortDate(booking.startDate)} -{" "}
                  {formatShortDate(booking.endDate)} · {booking.petSitterName}
                </small>
              </span>
              <span>{formatEuro(booking.totalAmountCents)}</span>
              <TrustBadge label={getBookingStatusDisplay(booking.status)} />
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

export function PetSitterPayoutPanel({
  bookings,
}: {
  bookings: DemoBooking[];
}) {
  const payableBookings = bookings.filter(
    (booking) =>
      booking.status === "paid" ||
      booking.status === "completed" ||
      booking.status === "incident_reported",
  );
  const netAmountCents = payableBookings.reduce(
    (total, booking) => total + booking.providerAmountCents,
    0,
  );
  const platformCommissionCents = payableBookings.reduce(
    (total, booking) => total + booking.platformCommissionCents,
    0,
  );

  return (
    <article className="workspace-card payout-card">
      <div>
        <p className="section-kicker">Versements</p>
        <h2>{formatEuro(netAmountCents)} à verser</h2>
      </div>

      <div className="payout-summary-grid">
        <span>
          <small>Solde pet-sitter</small>
          <strong>{formatEuro(netAmountCents)}</strong>
        </span>
        <span>
          <small>Commission MamiPet</small>
          <strong>{formatEuro(platformCommissionCents)}</strong>
        </span>
      </div>

      <ul
        className="payout-checklist"
        aria-label="Statut du compte de versement"
      >
        <li className="payout-checklist__done">Identité MamiPet vérifiée</li>
        <li>Compte bénéficiaire non connecté</li>
        <li>Coordonnées bancaires manquantes</li>
      </ul>

      <button className="secondary-button" type="button" disabled>
        Connecter le compte bancaire
      </button>
    </article>
  );
}

function getBookingReference(bookingId: string): string {
  return `Dossier ${bookingId.replace(/^booking-demo-/, "MP-").slice(0, 11).toUpperCase()}`;
}

function getBookingStatusDisplay(status: DemoBooking["status"]): string {
  const labels: Record<DemoBooking["status"], string> = {
    accepted: "Acceptée",
    awaiting_response: "En attente",
    cancelled: "Annulée",
    completed: "Terminée",
    incident_reported: "Incident",
    paid: "Payée",
    refused: "Refusée",
  };

  return labels[status];
}

export function PetMiniCard({
  href,
  pet,
}: {
  href?: string;
  pet: DemoPet;
}) {
  const content = (
    <>
      <Image
        src={pet.image}
        alt={`${pet.name}, ${pet.species}`}
        width={104}
        height={104}
      />

      <div>
        <strong>{pet.name}</strong>

        <span>
          {pet.species} · {pet.age}
        </span>
      </div>
    </>
  );

  if (href) {
    return (
      <a className="pet-mini-card pet-mini-card--interactive" href={href}>
        {content}
      </a>
    );
  }

  return (
    <div className="pet-mini-card">
      {content}
    </div>
  );
}

export function MetricCard({
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

export function AdminList({
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
                    demoWorkspaceActions.updateAdminTask(
                      collection,
                      row.id,
                      "rejected",
                    )
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
