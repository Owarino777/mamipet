"use client";

import dynamic from "next/dynamic";
import {
  PublicShell,
  TrustBadge,
} from "@/interface/shared/product-ui";
import { PetSitterResultsList } from "./components/pet-sitter-results-list";
import { PetSitterSearchFilters } from "./components/pet-sitter-search-filters";
import { usePetSitterSearch } from "./hooks/use-pet-sitter-search";

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
  const searchTitle = search.hasPendingMapMove
    ? "Pet-sitters dans la zone de la carte"
    : search.activeArea.title;

  return (
    <PublicShell compact>
      <main className="search-page">
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
              activeAreaId={search.activeArea.id}
              areas={search.areas}
              orderedAreaIds={search.orderedAreaIds}
              petSitters={search.results}
              selectedPetSitterId={search.selectedPetSitterId}
              viewport={search.mapViewport}
              zoomLevel={search.zoomLevel}
              onAreaChange={search.applyArea}
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
