"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo } from "react";
import { useDemoSession } from "@/interface/shared/demo-session-client";
import {
  demoWorkspaceActions,
  useDemoWorkspace,
} from "@/interface/shared/demo-workspace-client";
import { formatEuro } from "@/interface/shared/format";
import { PublicShell } from "@/interface/shared/product-ui";
import {
  createPetById,
  formatBookingTitle,
  formatShortDate,
} from "@/interface/app/connected/workspace-formatters";
import { usePetSitterSearch } from "./hooks/use-pet-sitter-search";

const GuardRequestMap = dynamic(
  () =>
    import("./components/guard-request-map").then(
      (module) => module.GuardRequestMap,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="maplibre-map-shell maplibre-map-shell--loading">
        <p>Chargement de la carte…</p>
      </div>
    ),
  },
);

export function PetSitterRequestsPage({
  search,
}: {
  search: ReturnType<typeof usePetSitterSearch>;
}) {
  const workspace = useDemoWorkspace();
  const session = useDemoSession();
  const petById = useMemo(
    () => createPetById(workspace.pets),
    [workspace.pets],
  );
  const openRequests = workspace.bookings.filter(
    (booking) =>
      booking.requestKind === "open" &&
      booking.status === "awaiting_response" &&
      !booking.petSitterId &&
      booking.ownerId !== session?.id,
  );

  return (
    <PublicShell compact>
      <main className="search-page search-page--public search-page--requests">
        <div className="search-request-heading">
          <p className="section-kicker">Pet-sitter</p>
          <h1>Demandes de garde ouvertes</h1>
          <p>Consultez les annonces disponibles avant d’accepter une garde.</p>
        </div>
        {openRequests.length > 0 ? (
          <div className="search-request-controls">
            <label>
              Centrer la carte sur une ville
              <input
                value={search.city}
                onChange={(event) => search.setCity(event.target.value)}
                placeholder="Ex. Caen"
              />
            </label>
            <button
              className="secondary-button"
              type="button"
              onClick={search.applyCitySearch}
            >
              Centrer la carte
            </button>
          </div>
        ) : null}
        <div className="search-layout search-layout--requests">
          <section className="results-panel" aria-label="Demandes ouvertes">
            <div className="section-heading">
              <h2>
                {openRequests.length} demande
                {openRequests.length > 1 ? "s" : ""} ouverte
                {openRequests.length > 1 ? "s" : ""}
              </h2>
            </div>
            {openRequests.length === 0 ? (
              <div className="search-request-empty">
                <p>
                  Aucune demande ouverte pour le moment. Les nouvelles annonces
                  apparaîtront ici.
                </p>
                <Link href="/pet-sitter/onboarding">
                  Mettre à jour mon profil
                </Link>
              </div>
            ) : null}
            <div className="search-request-list">
              {openRequests.map((booking) => (
                <article className="search-request-row" key={booking.id}>
                  <div>
                    <h3>{formatBookingTitle(booking, petById)}</h3>
                    <p>
                      {formatShortDate(booking.startDate)} –{" "}
                      {formatShortDate(booking.endDate)} ·{" "}
                      {formatEuro(booking.providerAmountCents)} net
                    </p>
                    <p>
                      {booking.instructions ||
                        "Aucune consigne complémentaire."}
                    </p>
                  </div>
                  <button
                    className="primary-button"
                    type="button"
                    onClick={() =>
                      demoWorkspaceActions.acceptBooking(booking.id)
                    }
                  >
                    Accepter la garde
                  </button>
                </article>
              ))}
            </div>
          </section>
          {openRequests.length > 0 ? (
            <aside className="map-column" aria-label="Carte des demandes">
              <GuardRequestMap
                bookings={openRequests}
                petById={petById}
                viewport={search.mapViewport}
                zoomLevel={search.zoomLevel}
                onMoveEnd={search.registerMapMove}
              />
            </aside>
          ) : null}
        </div>
      </main>
    </PublicShell>
  );
}
