import { useEffect, useMemo, useState } from "react";
import { demoPetSitters, type PublicPetSitter } from "@/interface/shared/product-data";
import {
  createViewportFromMapMove,
  filterProfilesByViewport,
  findAreaFromSearchText,
  mapAreas,
  orderedMapAreaIds,
  type MapAreaId,
  type MapMove,
  type MapViewport,
} from "./use-map-viewport";

export type SearchNeed = "all" | "senior" | "medication" | "anxious" | "monitoring";
export type SearchSpecies = "all" | "dog" | "cat" | "rabbit" | "bird" | "small_pet";

type ReferenceItemDto = {
  id: string;
  code: string;
  label: string;
};

type ApiPetSitterProfileDto = {
  id: string;
  pseudo: string | null;
  firstName: string;
  photoUrl: string | null;
  description: string | null;
  city: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  basePriceCents: number | null;
  interventionRadiusKm: number | null;
  verificationStatus: PublicPetSitter["verificationStatus"];
  offer: {
    species: ReferenceItemDto[];
    careCapabilities: ReferenceItemDto[];
    careLocations: ReferenceItemDto[];
    careFormats: ReferenceItemDto[];
    additionalServices: ReferenceItemDto[];
  };
  badges: ReferenceItemDto[];
};

type PetSitterSearchCacheEntry = {
  profiles?: PublicPetSitter[];
  promise?: Promise<PublicPetSitter[]>;
};

const petSitterSearchCache = new Map<string, PetSitterSearchCacheEntry>();

export const quickFilters = [
  { code: "verified_identity", label: "Identité vérifiée" },
  { code: "pro", label: "Pro" },
  { code: "expert", label: "Expert" },
  { code: "senior", label: "Animal âgé" },
  { code: "medication", label: "Sous traitement" },
  { code: "anxious", label: "Anxieux" },
  { code: "owner_home", label: "À domicile" },
  { code: "sitter_home", label: "Chez le pet-sitter" },
];

export const forbiddenPublicPetSitterFields = [
  "email",
  "phone",
  "telephone",
  "addressLine",
  "adresse_ligne1",
  "fullAddress",
  "documents",
  "medicalRecord",
  "medicalRecords",
  "payment",
  "adminComment",
  "reports",
] as const;

export function usePetSitterSearch() {
  const [city, setCity] = useState("Caen");
  const [species, setSpecies] = useState<SearchSpecies>("all");
  const [need, setNeed] = useState<SearchNeed>("all");
  const [activeQuickFilters, setActiveQuickFilters] = useState<string[]>([]);
  const [activeAreaId, setActiveAreaId] = useState<MapAreaId>("caen");
  const [mapViewport, setMapViewport] = useState<MapViewport>(mapAreas.caen.viewport);
  const [pendingViewport, setPendingViewport] = useState<MapViewport>(
    mapAreas.caen.viewport,
  );
  const [zoomLevel, setZoomLevel] = useState(mapAreas.caen.zoom);
  const [pendingZoomLevel, setPendingZoomLevel] = useState(mapAreas.caen.zoom);
  const [hasPendingMapMove, setHasPendingMapMove] = useState(false);
  const [selectedPetSitterId, setSelectedPetSitterId] = useState<string | null>(null);
  const [petSitters, setPetSitters] = useState<PublicPetSitter[]>(demoPetSitters);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    window.queueMicrotask(() => {
      const searchParams = new URLSearchParams(window.location.search);
      const requestedCity = searchParams.get("city");
      const requestedNeed = searchParams.get("need");
      const requestedSpecies = searchParams.get("species");

      if (requestedNeed && isKnownNeed(requestedNeed)) {
        setNeed(requestedNeed);
      }

      if (requestedSpecies && isKnownSpecies(requestedSpecies)) {
        setSpecies(requestedSpecies);
      }

      if (requestedCity) {
        const matchingArea = findAreaFromSearchText(requestedCity);

        setCity(requestedCity);

        if (matchingArea) {
          setActiveAreaId(matchingArea.id);
          setMapViewport(matchingArea.viewport);
          setPendingViewport(matchingArea.viewport);
          setZoomLevel(matchingArea.zoom);
          setPendingZoomLevel(matchingArea.zoom);
          setSelectedPetSitterId(null);
          setHasPendingMapMove(false);
        }
      }
    });
  }, []);

  useEffect(() => {
    let ignoreResult = false;

    async function loadPetSitters() {
      setIsLoading(true);

      try {
        const profiles = await loadPublicPetSitters(city);

        if (!ignoreResult && profiles.length > 0) {
          setPetSitters(profiles);
        }
      } finally {
        if (!ignoreResult) {
          setIsLoading(false);
        }
      }
    }

    void loadPetSitters();

    return () => {
      ignoreResult = true;
    };
  }, [city]);

  const results = useMemo(
    () =>
      filterPublicPetSitters(petSitters, {
        activeQuickFilters,
        need,
        species,
        viewport: mapViewport,
      }),
    [activeQuickFilters, mapViewport, need, petSitters, species],
  );

  return {
    activeArea: mapAreas[activeAreaId],
    activeQuickFilters,
    areas: mapAreas,
    city,
    hasPendingMapMove,
    isLoading,
    mapViewport: hasPendingMapMove ? pendingViewport : mapViewport,
    need,
    orderedAreaIds: orderedMapAreaIds,
    quickFilters,
    results,
    selectedPetSitterId,
    species,
    zoomLevel: hasPendingMapMove ? pendingZoomLevel : zoomLevel,
    applyArea,
    applyCitySearch,
    commitPendingViewport,
    registerMapMove,
    setCity,
    setNeed,
    setSelectedPetSitterId,
    setSpecies,
    toggleQuickFilter,
  };

  function applyArea(areaId: MapAreaId) {
    const area = mapAreas[areaId];

    setActiveAreaId(areaId);
    setCity(area.searchCity);
    setMapViewport(area.viewport);
    setPendingViewport(area.viewport);
    setZoomLevel(area.zoom);
    setPendingZoomLevel(area.zoom);
    setSelectedPetSitterId(null);
    setHasPendingMapMove(false);
  }

  function applyAreaFromCity(nextCity: string) {
    const matchingArea = findAreaFromSearchText(nextCity);

    if (!matchingArea) {
      return;
    }

    applyArea(matchingArea.id);
  }

  function applyCitySearch() {
    applyAreaFromCity(city);
  }

  function registerMapMove(move: MapMove) {
    setPendingViewport(createViewportFromMapMove(move));
    setPendingZoomLevel(move.zoom);
    setHasPendingMapMove(true);
  }

  function commitPendingViewport() {
    setMapViewport(pendingViewport);
    setZoomLevel(pendingZoomLevel);
    setSelectedPetSitterId(null);
    setHasPendingMapMove(false);
  }

  function toggleQuickFilter(filterCode: string) {
    setActiveQuickFilters((currentFilters) =>
      currentFilters.includes(filterCode)
        ? currentFilters.filter((code) => code !== filterCode)
        : [...currentFilters, filterCode],
    );
  }
}

async function loadPublicPetSitters(city: string): Promise<PublicPetSitter[]> {
  const cacheKey = city.trim().toLowerCase();
  const cacheEntry = petSitterSearchCache.get(cacheKey);

  if (cacheEntry?.profiles) {
    return cacheEntry.profiles;
  }

  if (cacheEntry?.promise) {
    return cacheEntry.promise;
  }

  const promise = fetchPublicPetSitters(city).then((profiles) => {
    if (profiles.length > 0) {
      petSitterSearchCache.set(cacheKey, { profiles });
    } else {
      petSitterSearchCache.delete(cacheKey);
    }

    return profiles;
  });

  petSitterSearchCache.set(cacheKey, { promise });

  return promise;
}

async function fetchPublicPetSitters(city: string): Promise<PublicPetSitter[]> {
  const searchParams = new URLSearchParams({
    city,
    pageSize: "24",
  });
  const response = await fetch(`/api/pet-sitters?${searchParams}`);

  if (!response.ok) {
    return [];
  }

  const payload = (await response.json()) as {
    data: ApiPetSitterProfileDto[] | null;
  };

  return (payload.data ?? [])
    .filter((profile) => !containsForbiddenPublicFields(profile))
    .map(mapApiPetSitter);
}

export function filterPublicPetSitters(
  petSitters: PublicPetSitter[],
  options: {
    activeQuickFilters: string[];
    need: SearchNeed;
    species: SearchSpecies;
    viewport: MapViewport;
  },
): PublicPetSitter[] {
  const profilesInCurrentArea = filterProfilesByViewport(
    petSitters,
    options.viewport,
  );
  const matchingNeed =
    options.need === "all"
      ? profilesInCurrentArea
      : profilesInCurrentArea.filter((petSitter) =>
          petSitter.careCapabilities.some(
            (capability) => capability.code === options.need,
          ),
        );
  const matchingSpecies =
    options.species === "all"
      ? matchingNeed
      : matchingNeed.filter((petSitter) =>
          petSitter.species.some((item) => item.code === options.species),
        );

  return matchingSpecies.filter((petSitter) =>
    options.activeQuickFilters.every((filterCode) =>
      doesPetSitterMatchQuickFilter(petSitter, filterCode),
    ),
  );
}

export function containsForbiddenPublicFields(value: unknown): boolean {
  if (!value || typeof value !== "object") {
    return false;
  }

  if (Array.isArray(value)) {
    return value.some(containsForbiddenPublicFields);
  }

  return Object.entries(value as Record<string, unknown>).some(([key, childValue]) => {
    if (forbiddenPublicPetSitterFields.includes(key as never)) {
      return true;
    }

    return containsForbiddenPublicFields(childValue);
  });
}

function doesPetSitterMatchQuickFilter(
  petSitter: PublicPetSitter,
  filterCode: string,
): boolean {
  if (filterCode === "verified_identity") {
    return petSitter.verificationStatus !== "published_unverified";
  }

  return [
    ...petSitter.badges,
    ...petSitter.careCapabilities,
    ...petSitter.careLocations,
  ].some((tag) => tag.code === filterCode);
}

function mapApiPetSitter(profile: ApiPetSitterProfileDto): PublicPetSitter {
  return {
    id: profile.id,
    firstName: profile.pseudo ?? profile.firstName,
    lastInitial: "",
    city: profile.city ?? "Zone non précisée",
    approximateAddress: profile.city
      ? `${profile.city}, adresse exacte masquée`
      : "Zone approximative, adresse exacte masquée",
    latitude: profile.latitude ?? mapAreas.caen.viewport.latitude,
    longitude: profile.longitude ?? mapAreas.caen.viewport.longitude,
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
      profile.photoUrl ??
      "https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=1800&q=82",
    imageAlt: "Pet-sitter avec un animal dans un intérieur lumineux",
    gallery: [],
  };
}

function isKnownNeed(value: string): value is SearchNeed {
  return ["all", "senior", "medication", "anxious", "monitoring"].includes(value);
}

function isKnownSpecies(value: string): value is SearchSpecies {
  return ["all", "dog", "cat", "rabbit", "bird", "small_pet"].includes(value);
}
