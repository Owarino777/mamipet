import { useEffect, useMemo, useState } from "react";
import { demoPetSitters, type PublicPetSitter } from "@/interface/shared/product-data";
import { useDemoSession } from "@/interface/shared/demo-session-client";
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
  const session = useDemoSession();
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

  const visiblePetSitters = useMemo(
    () => mergeLocalPetSitterProfile(petSitters, session),
    [petSitters, session],
  );

  const results = useMemo(
    () =>
      filterPublicPetSitters(visiblePetSitters, {
        activeQuickFilters,
        need,
        species,
        viewport: mapViewport,
      }),
    [activeQuickFilters, mapViewport, need, species, visiblePetSitters],
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

function mergeLocalPetSitterProfile(
  petSitters: PublicPetSitter[],
  session: ReturnType<typeof useDemoSession>,
): PublicPetSitter[] {
  if (!session?.enabledRoles?.includes("petSitter")) {
    return petSitters;
  }

  const localProfile = createLocalPetSitterProfile(session);
  const publicProfiles = petSitters.filter((profile) => profile.id !== localProfile.id);

  return [localProfile, ...publicProfiles];
}

function createLocalPetSitterProfile(
  session: NonNullable<ReturnType<typeof useDemoSession>>,
): PublicPetSitter {
  const firstName = session.name.trim().split(/\s+/)[0] ?? session.name;
  const lastInitial = getLastInitial(session.name);

  return {
    id: `local-pet-sitter-${session.id}`,
    firstName,
    lastInitial,
    city: "Caen",
    approximateAddress: "Caen, adresse exacte masquée",
    latitude: 49.1878,
    longitude: -0.3526,
    distanceLabel: "Profil local",
    rating: 0,
    reviewCount: 0,
    basePriceCents: 2500,
    priceUnit: "jour",
    responseTime: "À compléter",
    availabilitySummary: "Disponibilités à renseigner",
    description:
      "Profil pet-sitter activé depuis le parcours MamiPet. Les badges affichés correspondent aux compétences validées dans le MVP.",
    verificationStatus: "published_unverified",
    badges: [
      { id: "local-profile", code: "local_profile", label: "Profil local" },
      { id: "local-expert", code: "expert", label: "Expert test MVP" },
    ],
    species: [
      { id: "dog", code: "dog", label: "Chiens" },
      { id: "cat", code: "cat", label: "Chats" },
    ],
    careCapabilities: [
      { id: "anxious", code: "anxious", label: "Anxieux" },
      { id: "medication", code: "medication", label: "Sous traitement" },
    ],
    careLocations: [
      { id: "owner-home", code: "owner_home", label: "À domicile" },
      { id: "sitter-home", code: "sitter_home", label: "Chez le pet-sitter" },
    ],
    careFormats: [
      { id: "day", code: "day", label: "Journée" },
      { id: "drop-in", code: "drop_in", label: "Visite" },
    ],
    services: [
      { id: "walk", code: "walk", label: "Promenade" },
      { id: "photo", code: "photo", label: "Suivi photo" },
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1600&q=82",
    imageAlt: "Pet-sitter local avec un chien attentif",
    gallery: [
      {
        url: "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1600&q=82",
        alt: "Pet-sitter local avec un chien attentif",
      },
      {
        url: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=1600&q=82",
        alt: "Chat calme gardé à domicile",
      },
    ],
  };
}

function getLastInitial(name: string): string {
  const parts = name.trim().split(/\s+/);
  const lastName = parts.length > 1 ? parts[parts.length - 1] : "";

  return lastName ? `${lastName.charAt(0).toUpperCase()}.` : "";
}

function isKnownNeed(value: string): value is SearchNeed {
  return ["all", "senior", "medication", "anxious", "monitoring"].includes(value);
}

function isKnownSpecies(value: string): value is SearchSpecies {
  return ["all", "dog", "cat", "rabbit", "bird", "small_pet"].includes(value);
}
