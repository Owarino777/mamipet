"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { PublicShell } from "@/interface/shared/product-ui";
import {
  useDemoSession,
} from "@/interface/shared/demo-session-client";
import { PetSitterResultsList } from "./components/pet-sitter-results-list";
import { PetSitterSearchFilters } from "./components/pet-sitter-search-filters";
import { usePetSitterSearch } from "./hooks/use-pet-sitter-search";
import { PetSitterRequestsPage } from "./pet-sitter-requests-page";

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

export function SearchPage() {
  const search = usePetSitterSearch();
  const session = useDemoSession();
  const searchTitle = search.hasPendingMapMove
    ? "Pet-sitters dans la zone de la carte"
    : search.activeArea.title;

  if (session?.activeRole === "petSitter") {
    return <PetSitterRequestsPage search={search} />;
  }

  return (
    <PublicShell compact>
      <main className="search-page search-page--public">
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

        {session?.activeRole === "owner" ? (
          <div className="search-owner-action">
            <span>Vous préférez publier votre besoin ?</span>
            <Link href="/reservations/new">Créer une demande de garde</Link>
          </div>
        ) : null}

        <div className="search-layout">
          <section className="results-panel">
            <div className="section-heading section-heading--inline">
              <div>
                <p className="section-kicker">Recherche</p>
                <h1>{searchTitle}</h1>
                <p>Choisissez un profil adapté à votre animal.</p>
              </div>
              <span className="result-count">
                {search.isLoading ? "Recherche..." : `${search.results.length} profils`}
              </span>
            </div>
            {search.loadError ? (
              <div className="search-status search-status--error" role="alert">
                <p>{search.loadError}</p>
                <button className="secondary-button" type="button" onClick={search.retry}>
                  Réessayer
                </button>
              </div>
            ) : null}
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
