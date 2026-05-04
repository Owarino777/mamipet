"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  PublicPetSitterCard,
  PublicShell,
  TrustBadge,
} from "@/interface/shared/product-ui";
import { formatEuro } from "@/interface/shared/format";
import { demoPetSitters, type PublicPetSitter } from "@/interface/shared/product-data";

type ApiPetSitter = {
  id: string;
  firstName: string;
  pseudo: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  basePriceCents: number | null;
  description: string | null;
  verificationStatus: PublicPetSitter["verificationStatus"];
  badges: Array<{ id: string; code: string; label: string }>;
  offer: {
    species: Array<{ id: string; code: string; label: string }>;
    careCapabilities: Array<{ id: string; code: string; label: string }>;
    careLocations: Array<{ id: string; code: string; label: string }>;
    careFormats: Array<{ id: string; code: string; label: string }>;
    additionalServices: Array<{ id: string; code: string; label: string }>;
  };
};

export function SearchPage() {
  const [city, setCity] = useState("Caen");
  const [need, setNeed] = useState("all");
  const [activeAreaId, setActiveAreaId] = useState<MapAreaId>("caen");
  const [selectedPetSitterId, setSelectedPetSitterId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(13);
  const [petSitters, setPetSitters] = useState<PublicPetSitter[]>(demoPetSitters);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPetSitters() {
      setIsLoading(true);

      try {
        const searchParams = new URLSearchParams({
          city,
          pageSize: "12",
        });
        const response = await fetch(`/api/pet-sitters?${searchParams}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as { data: ApiPetSitter[] | null };
        const profiles = payload.data?.map(mapApiPetSitter).filter(Boolean);

        if (profiles && profiles.length > 0) {
          setPetSitters(profiles);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      } finally {
        setIsLoading(false);
      }
    }

    void loadPetSitters();

    return () => controller.abort();
  }, [city]);

  const filteredPetSitters = useMemo(() => {
    const profilesInCurrentArea = filterProfilesByMapArea(petSitters, activeAreaId);

    if (need === "all") {
      return profilesInCurrentArea;
    }

    return profilesInCurrentArea.filter((petSitter) =>
      petSitter.careCapabilities.some((capability) => capability.code === need),
    );
  }, [activeAreaId, need, petSitters]);

  const activeArea = mapAreas[activeAreaId];

  return (
    <PublicShell compact>
      <main className="search-page">
        <section className="search-bar-panel" aria-label="Critères de recherche">
          <label>
            Lieu
            <input
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder="Caen"
            />
          </label>
          <label>
            Dates
            <input type="date" />
          </label>
          <label>
            Espèce
            <select defaultValue="dog">
              <option value="dog">Chien</option>
              <option value="cat">Chat</option>
              <option value="nac">NAC</option>
            </select>
          </label>
          <label>
            Besoin
            <select value={need} onChange={(event) => setNeed(event.target.value)}>
              <option value="all">Tous les besoins</option>
              <option value="senior">Animal âgé</option>
              <option value="medication">Sous traitement</option>
              <option value="anxious">Anxieux</option>
              <option value="monitoring">Surveillance renforcée</option>
            </select>
          </label>
          <button className="primary-button" type="button">
            Rechercher
          </button>
        </section>

        <div className="search-layout">
          <section className="results-panel">
            <div className="section-heading section-heading--inline">
              <div>
                <p className="section-kicker">Recherche</p>
                <h1>{activeArea.title}</h1>
                <p>
                  Résultats classés selon la zone affichée sur la carte et les
                  besoins de votre animal.
                </p>
              </div>
              <span className="result-count">
                {isLoading ? "Recherche..." : `${filteredPetSitters.length} profils`}
              </span>
            </div>
            <div className="search-chip-row" aria-label="Filtres rapides">
              <FilterChip label="Identité vérifiée" />
              <FilterChip label="Pro" />
              <FilterChip label="Expert" />
              <FilterChip label="Animal âgé" />
              <FilterChip label="Sous traitement" />
              <FilterChip label="Anxieux" />
              <FilterChip label="À domicile" />
              <FilterChip label="Chez le pet-sitter" />
            </div>
            <div className="proof-row proof-row--compact">
              <TrustBadge label="Données publiques protégées" />
              <TrustBadge label="Badges vérifiés" />
              <TrustBadge label="Adresse exacte masquée" />
            </div>
            <div className="results-grid">
              {filteredPetSitters.map((petSitter) => (
                <div
                  className={
                    selectedPetSitterId === petSitter.id
                      ? "result-card-shell result-card-shell--active"
                      : "result-card-shell"
                  }
                  key={petSitter.id}
                  onMouseEnter={() => setSelectedPetSitterId(petSitter.id)}
                  onFocus={() => setSelectedPetSitterId(petSitter.id)}
                >
                  <PublicPetSitterCard petSitter={petSitter} layout="grid" />
                </div>
              ))}
            </div>
          </section>

          <aside className="map-column" aria-label="Carte synchronisée">
            <InteractiveSearchMap
              activeAreaId={activeAreaId}
              petSitters={filteredPetSitters}
              selectedPetSitterId={selectedPetSitterId}
              onAreaChange={(areaId) => {
                setActiveAreaId(areaId);
                setSelectedPetSitterId(null);
                setCity(mapAreas[areaId].searchCity);
              }}
              onPetSitterSelect={setSelectedPetSitterId}
              onZoomChange={setZoomLevel}
              zoomLevel={zoomLevel}
            />
          </aside>
        </div>
      </main>
    </PublicShell>
  );
}

function FilterChip({ label }: { label: string }) {
  return (
    <button className="filter-chip" type="button">
      {label}
    </button>
  );
}

type MapAreaId = "caen" | "north" | "east";

type MapArea = {
  id: MapAreaId;
  title: string;
  searchCity: string;
  label: string;
  viewport: MapViewport;
};

const mapAreas: Record<MapAreaId, MapArea> = {
  caen: {
    id: "caen",
    title: "Pet-sitters disponibles près de Caen",
    searchCity: "Caen",
    label: "Centre de Caen",
    viewport: {
      latitude: 49.1842,
      longitude: -0.3619,
      radiusKm: 6.2,
    },
  },
  north: {
    id: "north",
    title: "Pet-sitters dans le nord de Caen",
    searchCity: "Hérouville-Saint-Clair",
    label: "Nord de Caen",
    viewport: {
      latitude: 49.2038,
      longitude: -0.3374,
      radiusKm: 4.4,
    },
  },
  east: {
    id: "east",
    title: "Pet-sitters dans l'est de Caen",
    searchCity: "Mondeville",
    label: "Est de Caen",
    viewport: {
      latitude: 49.1743,
      longitude: -0.3198,
      radiusKm: 4.2,
    },
  },
};

type MapViewport = {
  latitude: number;
  longitude: number;
  radiusKm: number;
};

type TileDescriptor = {
  id: string;
  x: number;
  y: number;
  url: string;
};

function InteractiveSearchMap({
  activeAreaId,
  petSitters,
  selectedPetSitterId,
  zoomLevel,
  onAreaChange,
  onPetSitterSelect,
  onZoomChange,
}: {
  activeAreaId: MapAreaId;
  petSitters: PublicPetSitter[];
  selectedPetSitterId: string | null;
  zoomLevel: number;
  onAreaChange: (areaId: MapAreaId) => void;
  onPetSitterSelect: (petSitterId: string | null) => void;
  onZoomChange: (zoomLevel: number) => void;
}) {
  const activeArea = mapAreas[activeAreaId];
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapSize, setMapSize] = useState({ width: 900, height: 760 });
  const selectedPetSitter = petSitters.find(
    (petSitter) => petSitter.id === selectedPetSitterId,
  );
  const tiles = getVisibleTiles(activeArea.viewport, zoomLevel);
  const centerWorld = lonLatToWorldPixel(
    activeArea.viewport.longitude,
    activeArea.viewport.latitude,
    zoomLevel,
  );

  useEffect(() => {
    const element = mapRef.current;

    if (!element) {
      return;
    }

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];

      if (!entry) {
        return;
      }

      setMapSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });

    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div className="synced-map" ref={mapRef}>
      <div className="map-tile-layer" aria-hidden="true">
        {tiles.map((tile) => (
          <span
            aria-hidden="true"
            className="map-tile"
            key={tile.id}
            style={{
              backgroundImage: `url(${tile.url})`,
              left: `calc(50% + ${tile.x * 256 - centerWorld.x}px)`,
              top: `calc(50% + ${tile.y * 256 - centerWorld.y}px)`,
            }}
          />
        ))}
      </div>
      <div className="map-area-controls" aria-label="Déplacer la carte">
        {Object.values(mapAreas).map((area) => (
          <button
            className={
              area.id === activeAreaId
                ? "map-area-button map-area-button--active"
                : "map-area-button"
            }
            type="button"
            key={area.id}
            onClick={() => onAreaChange(area.id)}
          >
            {area.label}
          </button>
        ))}
      </div>
      <button
        className="map-search-button"
        type="button"
        onClick={() => onAreaChange(nextMapArea(activeAreaId))}
      >
        Rechercher dans cette zone
      </button>
      <div className="map-zoom-controls" aria-label="Contrôles de zoom">
        <button
          type="button"
          onClick={() => onZoomChange(Math.min(15, zoomLevel + 1))}
          aria-label="Zoomer"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => onZoomChange(Math.max(11, zoomLevel - 1))}
          aria-label="Dézoomer"
        >
          -
        </button>
      </div>
      {petSitters.map((petSitter) => {
        const position = projectCoordinatesToMap(
          activeArea.viewport,
          zoomLevel,
          mapSize,
          petSitter.latitude,
          petSitter.longitude,
        );

        return (
          <button
            className={
              selectedPetSitterId === petSitter.id
                ? "map-marker map-marker--active"
                : "map-marker"
            }
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
            }}
            type="button"
            key={petSitter.id}
            onClick={() => onPetSitterSelect(petSitter.id)}
            aria-label={`Sélectionner ${petSitter.firstName} ${petSitter.lastInitial}`}
          >
            {formatEuro(petSitter.basePriceCents)}
          </button>
        );
      })}
      {selectedPetSitter ? (
        <article className="map-popup">
          <button
            className="map-popup__close"
            type="button"
            onClick={() => onPetSitterSelect(null)}
            aria-label="Fermer la fiche carte"
          >
            ×
          </button>
          <Image
            src={selectedPetSitter.imageUrl}
            alt={selectedPetSitter.imageAlt}
            width={320}
            height={190}
          />
          <div>
            <h2>
              {selectedPetSitter.firstName} {selectedPetSitter.lastInitial}
            </h2>
            <p>
              {selectedPetSitter.city} · {selectedPetSitter.approximateAddress}
            </p>
            <strong>
              {formatEuro(selectedPetSitter.basePriceCents)} /{" "}
              {selectedPetSitter.priceUnit}
            </strong>
          </div>
        </article>
      ) : null}
      <p className="map-privacy-label">Zone approximative, adresse masquée</p>
    </div>
  );
}

function filterProfilesByMapArea(
  profiles: PublicPetSitter[],
  areaId: MapAreaId,
): PublicPetSitter[] {
  const filteredProfiles = profiles.filter((profile) =>
    isInsideViewport(mapAreas[areaId].viewport, profile.latitude, profile.longitude),
  );

  return filteredProfiles.length > 0 ? filteredProfiles : profiles;
}

function projectCoordinatesToMap(
  viewport: MapViewport,
  zoomLevel: number,
  mapSize: { width: number; height: number },
  latitude: number,
  longitude: number,
): { x: number; y: number } {
  const center = lonLatToWorldPixel(viewport.longitude, viewport.latitude, zoomLevel);
  const point = lonLatToWorldPixel(longitude, latitude, zoomLevel);

  return {
    x: clampPercentage(50 + ((point.x - center.x) / mapSize.width) * 100),
    y: clampPercentage(50 + ((point.y - center.y) / mapSize.height) * 100),
  };
}

function isInsideViewport(
  viewport: MapViewport,
  latitude: number,
  longitude: number,
): boolean {
  return getDistanceKm(
    viewport.latitude,
    viewport.longitude,
    latitude,
    longitude,
  ) <= viewport.radiusKm;
}

function lonLatToWorldPixel(
  longitude: number,
  latitude: number,
  zoomLevel: number,
): { x: number; y: number } {
  const sinLatitude = Math.sin((latitude * Math.PI) / 180);
  const scale = 256 * 2 ** zoomLevel;

  return {
    x: ((longitude + 180) / 360) * scale,
    y:
      (0.5 -
        Math.log((1 + sinLatitude) / (1 - sinLatitude)) / (4 * Math.PI)) *
      scale,
  };
}

function worldPixelToTile(value: number): number {
  return Math.floor(value / 256);
}

function getVisibleTiles(
  viewport: MapViewport,
  zoomLevel: number,
): TileDescriptor[] {
  const center = lonLatToWorldPixel(viewport.longitude, viewport.latitude, zoomLevel);
  const tileX = worldPixelToTile(center.x);
  const tileY = worldPixelToTile(center.y);
  const tiles: TileDescriptor[] = [];

  for (let x = tileX - 2; x <= tileX + 2; x += 1) {
    for (let y = tileY - 2; y <= tileY + 2; y += 1) {
      tiles.push({
        id: `${zoomLevel}-${x}-${y}`,
        x,
        y,
        url: `https://tile.openstreetmap.org/${zoomLevel}/${x}/${y}.png`,
      });
    }
  }

  return tiles;
}

function getDistanceKm(
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number,
): number {
  const earthRadiusKm = 6371;
  const deltaLatitude = toRadians(latitudeB - latitudeA);
  const deltaLongitude = toRadians(longitudeB - longitudeA);
  const normalizedLatitudeA = toRadians(latitudeA);
  const normalizedLatitudeB = toRadians(latitudeB);
  const haversine =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(normalizedLatitudeA) *
      Math.cos(normalizedLatitudeB) *
      Math.sin(deltaLongitude / 2) ** 2;

  return (
    2 *
    earthRadiusKm *
    Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  );
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function clampPercentage(value: number): number {
  return Math.min(92, Math.max(8, value));
}

function nextMapArea(areaId: MapAreaId): MapAreaId {
  if (areaId === "caen") {
    return "north";
  }

  if (areaId === "north") {
    return "east";
  }

  return "caen";
}

function mapApiPetSitter(profile: ApiPetSitter): PublicPetSitter {
  return {
    id: profile.id,
    firstName: profile.pseudo ?? profile.firstName,
    lastInitial: "",
    city: profile.city ?? "Zone non précisée",
    approximateAddress: profile.city
      ? `${profile.city}, adresse exacte masquée`
      : "Zone approximative, adresse exacte masquée",
    latitude: profile.latitude ?? 49.1842,
    longitude: profile.longitude ?? -0.3619,
    distanceLabel: "Zone proche",
    rating: 4.8,
    reviewCount: 0,
    basePriceCents: profile.basePriceCents ?? 2500,
    priceUnit: "jour",
    responseTime: "À confirmer",
    availabilitySummary: "Disponibilités à vérifier",
    description:
      profile.description ??
      "Profil public renseigné pour une garde adaptée aux besoins de votre animal.",
    verificationStatus: profile.verificationStatus,
    badges: profile.badges,
    species: profile.offer.species,
    careCapabilities: profile.offer.careCapabilities,
    careLocations: profile.offer.careLocations,
    careFormats: profile.offer.careFormats,
    services: profile.offer.additionalServices,
    imageUrl:
      "https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=1800&q=82",
    imageAlt: "Pet-sitter avec un animal dans un intérieur lumineux",
    gallery: [],
  };
}
