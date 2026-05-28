"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MapRef, ViewStateChangeEvent } from "@vis.gl/react-maplibre";
import {
  AttributionControl,
  Map,
  Marker,
  NavigationControl,
} from "@vis.gl/react-maplibre";
import { formatEuro } from "@/interface/shared/format";
import type {
  DemoBooking,
  DemoPet,
} from "@/interface/shared/demo-workspace-state";
import { getBookingStatusLabel } from "@/interface/shared/demo-workspace-state";
import {
  formatBookingTitle,
  formatShortDate,
} from "@/interface/app/connected/workspace-formatters";
import {
  mapConfig,
  type MapMove,
  type MapViewport,
} from "../hooks/use-map-viewport";

type GuardRequestMapProps = {
  bookings: DemoBooking[];
  petById: Map<string, DemoPet>;
  viewport: MapViewport;
  zoomLevel: number;
  onMoveEnd: (move: MapMove) => void;
};

type MappableBooking = DemoBooking & {
  latitude: number;
  longitude: number;
};

const requestOffsets = [
  { latitude: 0.018, longitude: -0.012 },
  { latitude: -0.014, longitude: 0.022 },
  { latitude: 0.006, longitude: 0.032 },
  { latitude: -0.026, longitude: -0.028 },
  { latitude: 0.032, longitude: 0.012 },
];

export function GuardRequestMap({
  bookings,
  petById,
  viewport,
  zoomLevel,
  onMoveEnd,
}: GuardRequestMapProps) {
  const mapRef = useRef<MapRef | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [hasMapError, setHasMapError] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    bookings[0]?.id ?? null,
  );
  const mappableBookings = useMemo(
    () =>
      bookings.map((booking, index) => {
        const offset = requestOffsets[index % requestOffsets.length] ?? requestOffsets[0]!;

        return {
          ...booking,
          latitude: viewport.latitude + offset.latitude,
          longitude: viewport.longitude + offset.longitude,
        };
      }),
    [bookings, viewport.latitude, viewport.longitude],
  );
  const selectedBooking = useMemo(
    () =>
      selectedBookingId
        ? mappableBookings.find((booking) => booking.id === selectedBookingId) ?? null
        : null,
    [mappableBookings, selectedBookingId],
  );

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !isMapReady) {
      return;
    }

    map.easeTo({
      center: [viewport.longitude, viewport.latitude],
      duration: 420,
      essential: true,
      zoom: zoomLevel,
    });
  }, [isMapReady, viewport.latitude, viewport.longitude, zoomLevel]);

  const handleMoveEnd = useCallback(
    (event: ViewStateChangeEvent) => {
      const map = event.target;
      const center = map.getCenter();

      onMoveEnd({
        latitude: center.lat,
        longitude: center.lng,
        zoom: map.getZoom(),
      });
    },
    [onMoveEnd],
  );

  if (hasMapError) {
    return (
      <div className="maplibre-map-shell maplibre-map-shell--fallback">
        <h2>Carte indisponible</h2>
        <p>
          Les demandes restent accessibles sous la carte. Réessayez quand le
          provider gratuit répond.
        </p>
      </div>
    );
  }

  return (
    <div className="maplibre-map-shell">
      <Map
        ref={mapRef}
        attributionControl={false}
        cooperativeGestures={false}
        dragPan={mapConfig.dragPan}
        doubleClickZoom={mapConfig.doubleClickZoom}
        initialViewState={{
          ...mapConfig.initialViewState,
          latitude: viewport.latitude,
          longitude: viewport.longitude,
          zoom: zoomLevel,
        }}
        interactiveLayerIds={[]}
        mapStyle={mapConfig.mapStyle}
        maxZoom={mapConfig.maxZoom}
        minZoom={mapConfig.minZoom}
        scrollZoom={mapConfig.scrollZoom}
        style={{ height: "100%", width: "100%" }}
        touchPitch={false}
        onError={() => setHasMapError(true)}
        onLoad={(event) => {
          event.target.scrollZoom.setWheelZoomRate(1 / 520);
          event.target.scrollZoom.setZoomRate(1 / 120);
          setIsMapReady(true);
        }}
        onClick={() => setSelectedBookingId(null)}
        onMoveEnd={handleMoveEnd}
      >
        <NavigationControl position="bottom-right" visualizePitch={false} />
        <AttributionControl compact position="bottom-left" />
        {mappableBookings.map((booking) => (
          <GuardRequestMarker
            booking={booking}
            isSelected={selectedBooking?.id === booking.id}
            key={booking.id}
            onSelect={setSelectedBookingId}
          />
        ))}
      </Map>
      {selectedBooking ? (
        <article
          className="map-floating-card request-floating-card"
          aria-live="polite"
          onClick={(event) => event.stopPropagation()}
        >
          <span className="map-floating-card__body">
            <small>{selectedBooking.ownerName} · propriétaire</small>
            <strong>{formatBookingTitle(selectedBooking, petById)}</strong>
            <small>
              {formatShortDate(selectedBooking.startDate)} -{" "}
              {formatShortDate(selectedBooking.endDate)} ·{" "}
              {selectedBooking.careType}
            </small>
            <span className="map-floating-card__tags">
              <em>{getBookingStatusLabel(selectedBooking.status)}</em>
              <em>{selectedBooking.insuranceLevel}</em>
            </span>
            <b>{formatEuro(selectedBooking.providerAmountCents)} net estimé</b>
            <p>{selectedBooking.instructions || "Aucune consigne ajoutée."}</p>
          </span>
          <button
            type="button"
            onClick={() => setSelectedBookingId(null)}
            aria-label="Fermer la demande"
          >
            ×
          </button>
        </article>
      ) : null}
      <p className="map-privacy-label">OpenFreeMap · adresse exacte masquée</p>
    </div>
  );
}

function GuardRequestMarker({
  booking,
  isSelected,
  onSelect,
}: {
  booking: MappableBooking;
  isSelected: boolean;
  onSelect: (bookingId: string | null) => void;
}) {
  return (
    <Marker anchor="bottom" latitude={booking.latitude} longitude={booking.longitude}>
      <button
        className={
          isSelected
            ? "maplibre-request-marker maplibre-request-marker--active"
            : "maplibre-request-marker"
        }
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onSelect(isSelected ? null : booking.id);
        }}
        onFocus={() => onSelect(booking.id)}
        aria-label={`Sélectionner la demande ${booking.ownerName}`}
      >
        {formatEuro(booking.providerAmountCents)}
      </button>
    </Marker>
  );
}
