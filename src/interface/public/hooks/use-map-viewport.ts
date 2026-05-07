import type { PublicPetSitter } from "@/interface/shared/product-data";

export type MapViewport = {
  latitude: number;
  longitude: number;
  radiusKm: number;
};

export type MapAreaId =
  | "france"
  | "caen"
  | "north"
  | "east"
  | "paris"
  | "lyon"
  | "marseille"
  | "bordeaux"
  | "toulouse"
  | "nantes"
  | "lille"
  | "strasbourg"
  | "nice"
  | "rennes";

export type MapArea = {
  id: MapAreaId;
  title: string;
  searchCity: string;
  label: string;
  zoom: number;
  viewport: MapViewport;
};

export type MapMove = {
  latitude: number;
  longitude: number;
  zoom: number;
};

export const mapConfig = {
  mapStyle: "https://tiles.openfreemap.org/styles/liberty",
  initialViewState: {
    longitude: -0.3698,
    latitude: 49.1829,
    zoom: 11,
    pitch: 0,
    bearing: 0,
  },
  minZoom: 4,
  maxZoom: 17,
  dragPan: true,
  scrollZoom: {
    around: "center",
    speed: 0.7,
    smooth: true,
  },
  doubleClickZoom: false,
  attributionControl: true,
} as const;

export const orderedMapAreaIds: MapAreaId[] = [
  "caen",
  "north",
  "east",
  "france",
  "paris",
  "lyon",
  "marseille",
  "bordeaux",
  "toulouse",
  "nantes",
  "lille",
  "strasbourg",
  "nice",
  "rennes",
];

export const mapAreas: Record<MapAreaId, MapArea> = {
  france: {
    id: "france",
    title: "Pet-sitters disponibles en France",
    searchCity: "France",
    label: "France",
    zoom: 5.7,
    viewport: {
      latitude: 46.6034,
      longitude: 1.8883,
      radiusKm: 740,
    },
  },
  caen: {
    id: "caen",
    title: "Pet-sitters disponibles près de Caen",
    searchCity: "Caen",
    label: "Centre de Caen",
    zoom: 11,
    viewport: {
      latitude: 49.1829,
      longitude: -0.3698,
      radiusKm: 24,
    },
  },
  north: {
    id: "north",
    title: "Pet-sitters dans le nord de Caen",
    searchCity: "Hérouville-Saint-Clair",
    label: "Nord de Caen",
    zoom: 12.4,
    viewport: {
      latitude: 49.2038,
      longitude: -0.3374,
      radiusKm: 7,
    },
  },
  east: {
    id: "east",
    title: "Pet-sitters dans l'est de Caen",
    searchCity: "Mondeville",
    label: "Est de Caen",
    zoom: 12.4,
    viewport: {
      latitude: 49.1743,
      longitude: -0.3198,
      radiusKm: 7,
    },
  },
  paris: {
    id: "paris",
    title: "Pet-sitters disponibles près de Paris",
    searchCity: "Paris",
    label: "Paris",
    zoom: 11.2,
    viewport: {
      latitude: 48.8566,
      longitude: 2.3522,
      radiusKm: 24,
    },
  },
  lyon: {
    id: "lyon",
    title: "Pet-sitters disponibles près de Lyon",
    searchCity: "Lyon",
    label: "Lyon",
    zoom: 11.2,
    viewport: {
      latitude: 45.764,
      longitude: 4.8357,
      radiusKm: 24,
    },
  },
  marseille: {
    id: "marseille",
    title: "Pet-sitters disponibles près de Marseille",
    searchCity: "Marseille",
    label: "Marseille",
    zoom: 11.2,
    viewport: {
      latitude: 43.2965,
      longitude: 5.3698,
      radiusKm: 26,
    },
  },
  bordeaux: {
    id: "bordeaux",
    title: "Pet-sitters disponibles près de Bordeaux",
    searchCity: "Bordeaux",
    label: "Bordeaux",
    zoom: 11.2,
    viewport: {
      latitude: 44.8378,
      longitude: -0.5792,
      radiusKm: 24,
    },
  },
  toulouse: {
    id: "toulouse",
    title: "Pet-sitters disponibles près de Toulouse",
    searchCity: "Toulouse",
    label: "Toulouse",
    zoom: 11.2,
    viewport: {
      latitude: 43.6047,
      longitude: 1.4442,
      radiusKm: 24,
    },
  },
  nantes: {
    id: "nantes",
    title: "Pet-sitters disponibles près de Nantes",
    searchCity: "Nantes",
    label: "Nantes",
    zoom: 11.2,
    viewport: {
      latitude: 47.2184,
      longitude: -1.5536,
      radiusKm: 24,
    },
  },
  lille: {
    id: "lille",
    title: "Pet-sitters disponibles près de Lille",
    searchCity: "Lille",
    label: "Lille",
    zoom: 11.2,
    viewport: {
      latitude: 50.6292,
      longitude: 3.0573,
      radiusKm: 24,
    },
  },
  strasbourg: {
    id: "strasbourg",
    title: "Pet-sitters disponibles près de Strasbourg",
    searchCity: "Strasbourg",
    label: "Strasbourg",
    zoom: 11.2,
    viewport: {
      latitude: 48.5734,
      longitude: 7.7521,
      radiusKm: 24,
    },
  },
  nice: {
    id: "nice",
    title: "Pet-sitters disponibles près de Nice",
    searchCity: "Nice",
    label: "Nice",
    zoom: 11.2,
    viewport: {
      latitude: 43.7102,
      longitude: 7.262,
      radiusKm: 24,
    },
  },
  rennes: {
    id: "rennes",
    title: "Pet-sitters disponibles près de Rennes",
    searchCity: "Rennes",
    label: "Rennes",
    zoom: 11.2,
    viewport: {
      latitude: 48.1173,
      longitude: -1.6778,
      radiusKm: 24,
    },
  },
};

export function createViewportFromMapMove(move: MapMove): MapViewport {
  return {
    latitude: move.latitude,
    longitude: move.longitude,
    radiusKm: calculateRadiusFromZoom(move.zoom),
  };
}

export function findAreaFromSearchText(searchText: string): MapArea | null {
  const normalizedSearch = normalizeSearchText(searchText);

  if (!normalizedSearch) {
    return null;
  }

  return (
    Object.values(mapAreas).find((area) => {
      const candidates = [area.searchCity, area.label, area.title].map(
        normalizeSearchText,
      );

      return candidates.some(
        (candidate) =>
          candidate.includes(normalizedSearch) ||
          normalizedSearch.includes(candidate),
      );
    }) ?? null
  );
}

export function filterProfilesByViewport(
  profiles: PublicPetSitter[],
  viewport: MapViewport,
): PublicPetSitter[] {
  return profiles.filter((profile) =>
    getDistanceKm(
      viewport.latitude,
      viewport.longitude,
      profile.latitude,
      profile.longitude,
    ) <= viewport.radiusKm,
  );
}

export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function calculateRadiusFromZoom(zoom: number): number {
  return Math.max(2, Math.min(740, 740 / 2 ** (zoom - 5.7)));
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
