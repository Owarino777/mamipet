"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo } from "react";
import {
  PublicShell,
  TrustBadge,
} from "@/interface/shared/product-ui";
import {
  useDemoSession,
} from "@/interface/shared/demo-session-client";
import {
  demoWorkspaceActions,
  useDemoWorkspace,
} from "@/interface/shared/demo-workspace-client";
import { getBookingStatusLabel } from "@/interface/shared/demo-workspace-state";
import { formatEuro } from "@/interface/shared/format";
import { PetSitterResultsList } from "./components/pet-sitter-results-list";
import { PetSitterSearchFilters } from "./components/pet-sitter-search-filters";
import { usePetSitterSearch } from "./hooks/use-pet-sitter-search";
import {
  createPetById,
  formatBookingTitle,
  formatShortDate,
} from "@/interface/app/connected/workspace-formatters";

const PetSitterMap = dynamic(
  () => import("./components/pet-sitter-map").then((mod) => mod.PetSitterMap),
  {
    ssr: false,
    loading: () => (
      <div className="maplibre-map-shell maplibre-map-shell--loading">
        <p>Chargement de la carte...</p>
      </div>
    ),
  },
);

const GuardRequestMap = dynamic(
  () =>
    import("./components/guard-request-map").then((mod) => mod.GuardRequestMap),
  {
    ssr: false,
    loading: () => (
      <div className="maplibre-map-shell maplibre-map-shell--loading">
        <p>Chargement de la carte...</p>
      </div>
    ),
  },
);

export function SearchPage() {
  const search = usePetSitterSearch();
  const session = useDemoSession();
  const searchTitle = search.hasPendingMapMove
    ? "Pet-sitters dans la zone de la carte"
    : search.activeArea.title;

  if (session?.activeRole === "owner") {
    return <OwnerSearchExperience search={search} />;
  }

  if (session?.activeRole === "petSitter") {
    return <PetSitterSearchExperience search={search} />;
  }

  return (
    <PublicShell compact>
      <main className="search-page">
        <section className="search-journey-strip" aria-label="Parcours de recherche">
          <span>1. Filtrer selon l&apos;animal</span>
          <span>2. Comparer badges, distance et tarif</span>
          <span>3. Ouvrir un profil rassurant</span>
          <span>4. Envoyer une demande sans paiement immédiat</span>
        </section>

        <PetSitterSearchFilters
          city={search.city}
          need={search.need}
          species={search.species}
          activeQuickFilters={search.activeQuickFilters}
          quickFilters={search.quickFilters}
          onCityChange={search.setCity}
          onNeedChange={search.setNeed}
          onSearchSubmit={search.applyCitySearch}
          onSpeciesChange={search.setSpecies}
          onQuickFilterToggle={search.toggleQuickFilter}
        />

        <div className="search-layout">
          <section className="results-panel">
            <div className="section-heading section-heading--inline">
              <div>
                <p className="section-kicker">Recherche</p>
                <h1>{searchTitle}</h1>
                <p>
                  Résultats classés selon la zone validée, les disponibilités et
                  les besoins de votre animal.
                </p>
              </div>
              <span className="result-count">
                {search.isLoading ? "Recherche..." : `${search.results.length} profils`}
              </span>
            </div>
            <div className="proof-row proof-row--compact">
              <TrustBadge label="Données publiques protégées" />
              <TrustBadge label="Badges vérifiés" />
              <TrustBadge label="Adresse exacte masquée" />
            </div>
            {search.hasPendingMapMove ? (
              <div className="map-pending-results">
                <span>Zone déplacée</span>
                <p>
                  La liste reste stable pendant le déplacement. Lancez la recherche
                  quand la zone vous convient.
                </p>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={search.commitPendingViewport}
                >
                  Rechercher dans cette zone
                </button>
              </div>
            ) : null}
            <PetSitterResultsList
              isLoading={search.isLoading}
              petSitters={search.results}
              selectedPetSitterId={search.selectedPetSitterId}
              onPetSitterFocus={search.setSelectedPetSitterId}
            />
          </section>

          <aside className="map-column" aria-label="Carte synchronisée">
            <PetSitterMap
              petSitters={search.results}
              selectedPetSitterId={search.selectedPetSitterId}
              viewport={search.mapViewport}
              zoomLevel={search.zoomLevel}
              onMoveEnd={search.registerMapMove}
              onPetSitterSelect={search.setSelectedPetSitterId}
              onSearchArea={search.commitPendingViewport}
            />
          </aside>
        </div>
      </main>
    </PublicShell>
  );
}

type SearchState = ReturnType<typeof usePetSitterSearch>;

function OwnerSearchExperience({ search }: { search: SearchState }) {
  return (
    <PublicShell compact>
      <main className="search-page role-search-page role-search-page--owner">
        <section className="role-search-hero">
          <div>
            <p className="section-kicker">Accueil propriétaire</p>
            <h1>
              Rechercher
              <span>un mamipet...</span>
            </h1>
          </div>
          <Link className="role-switch-pill" href="/pet-sitter/onboarding">
            Devenir Petsitter
          </Link>
        </section>

        <RoleSearchControls
          city={search.city}
          dateLabel="18/05/2026"
          onCityChange={search.setCity}
          onSearchSubmit={search.applyCitySearch}
        />

        <div className="role-filter-row" aria-label="Filtres actifs">
          <TrustBadge label="Caen" />
          <TrustBadge label="À domicile" />
          <TrustBadge label="Confirmé" />
          <TrustBadge label="Professionnel" />
        </div>

        <section className="role-search-map-panel">
          <PetSitterMap
            petSitters={search.results}
            selectedPetSitterId={search.selectedPetSitterId}
            viewport={search.mapViewport}
            zoomLevel={search.zoomLevel}
            onMoveEnd={search.registerMapMove}
            onPetSitterSelect={search.setSelectedPetSitterId}
            onSearchArea={search.commitPendingViewport}
          />
          <button
            className="role-map-main-action"
            type="button"
            onClick={search.commitPendingViewport}
          >
            Voir les petsitters autour de moi
          </button>
        </section>

        <section className="role-owner-announcement">
          <div>
            <p className="section-kicker">Annonce</p>
            <h2>Ajouter une annonce</h2>
          </div>
          <Link href="/reservations/new" aria-label="Ajouter une annonce">
            +
          </Link>
        </section>

        <section className="role-search-results">
          <div className="section-heading section-heading--inline">
            <div>
              <p className="section-kicker">Disponibles</p>
              <h2>{search.results.length} profils autour de vous</h2>
            </div>
          </div>
          <PetSitterResultsList
            isLoading={search.isLoading}
            petSitters={search.results}
            selectedPetSitterId={search.selectedPetSitterId}
            onPetSitterFocus={search.setSelectedPetSitterId}
          />
        </section>
      </main>
    </PublicShell>
  );
}

function PetSitterSearchExperience({ search }: { search: SearchState }) {
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
  const days = Array.from({ length: 31 }, (_, index) => index + 1);

  return (
    <PublicShell compact>
      <main className="search-page role-search-page role-search-page--sitter">
        <section className="role-search-hero">
          <div>
            <p className="section-kicker">Accueil petsitter</p>
            <h1>
              Rechercher
              <span>une garde...</span>
            </h1>
          </div>
          <Link className="role-switch-pill" href="/owner/animals">
            Devenir Propriétaire
          </Link>
        </section>

        <RoleSearchControls
          city={search.city}
          dateLabel="05/2026"
          dateTitle="Mois"
          onCityChange={search.setCity}
          onSearchSubmit={search.applyCitySearch}
        />

        <section className="role-calendar-panel">
          <div className="role-calendar-head">
            <span aria-hidden="true" />
            <button type="button" aria-label="Ajouter une disponibilité">
              +
            </button>
          </div>
          <div className="role-calendar-grid" aria-label="Calendrier mai 2026">
            {days.map((day) => (
              <span
                className={
                  day === 24 || day === 30
                    ? "role-calendar-day role-calendar-day--active"
                    : "role-calendar-day"
                }
                key={day}
              >
                {day}
              </span>
            ))}
          </div>
        </section>

        <section className="role-search-map-panel">
          <GuardRequestMap
            bookings={openRequests}
            petById={petById}
            viewport={search.mapViewport}
            zoomLevel={search.zoomLevel}
            onMoveEnd={search.registerMapMove}
          />
          <a className="role-map-main-action" href="#guard-requests">
            Voir les demandes de garde
          </a>
        </section>

        <section className="role-guard-requests" id="guard-requests">
          <div className="section-heading section-heading--inline">
            <div>
              <p className="section-kicker">Demandes</p>
              <h2>{openRequests.length} garde(s) à traiter</h2>
            </div>
          </div>
          <div className="role-request-list">
            {openRequests.map((booking) => (
              <article className="role-request-card" key={booking.id}>
                <div>
                  <strong>{formatBookingTitle(booking, petById)}</strong>
                  <small>
                    {formatShortDate(booking.startDate)} -{" "}
                    {formatShortDate(booking.endDate)} ·{" "}
                    {formatEuro(booking.providerAmountCents)} net
                  </small>
                  <p>{booking.instructions || "Aucune consigne ajoutée."}</p>
                </div>
                <div className="role-request-card__actions">
                  <TrustBadge label={getBookingStatusLabel(booking.status)} />
                  <button
                    className="primary-button"
                    type="button"
                    onClick={() => demoWorkspaceActions.acceptBooking(booking.id)}
                  >
                    Accepter la garde
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </PublicShell>
  );
}

function RoleSearchControls({
  city,
  dateLabel,
  dateTitle = "Date",
  onCityChange,
  onSearchSubmit,
}: {
  city: string;
  dateLabel: string;
  dateTitle?: string;
  onCityChange: (city: string) => void;
  onSearchSubmit: () => void;
}) {
  return (
    <section className="role-search-controls" aria-label="Recherche">
      <label>
        Ville
        <input
          value={city}
          onChange={(event) => onCityChange(event.target.value)}
        />
      </label>
      <label>
        {dateTitle}
        <input defaultValue={dateLabel} />
      </label>
      <button type="button" onClick={onSearchSubmit} aria-label="Rechercher">
        +
      </button>
    </section>
  );
}
