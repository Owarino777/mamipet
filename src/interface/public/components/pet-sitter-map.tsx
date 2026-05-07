"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MapRef, ViewStateChangeEvent } from "@vis.gl/react-maplibre";
import {
  AttributionControl,
  Map,
  Marker,
  NavigationControl,
} from "@vis.gl/react-maplibre";
import {
  Popup,
} from "@vis.gl/react-maplibre";
import Link from "next/link";
import Image from "next/image";
import { formatEuro } from "@/interface/shared/format";
import type { PublicPetSitter } from "@/interface/shared/product-data";
import {
  mapConfig,
  type MapArea,
  type MapAreaId,
  type MapMove,
  type MapViewport,
} from "../hooks/use-map-viewport";

type PetSitterMapProps = {
  activeAreaId: MapAreaId;
  areas: Record<MapAreaId, MapArea>;
  orderedAreaIds: MapAreaId[];
  petSitters: PublicPetSitter[];
  selectedPetSitterId: string | null;
  viewport: MapViewport;
  zoomLevel: number;
  onAreaChange: (areaId: MapAreaId) => void;
  onMoveEnd: (move: MapMove) => void;
  onPetSitterSelect: (petSitterId: string | null) => void;
  onSearchArea: () => void;
};

export function PetSitterMap({
  activeAreaId,
  areas,
  orderedAreaIds,
  petSitters,
  selectedPetSitterId,
  viewport,
  zoomLevel,
  onAreaChange,
  onMoveEnd,
  onPetSitterSelect,
  onSearchArea,
}: PetSitterMapProps) {
  const mapRef = useRef<MapRef | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [hasMapError, setHasMapError] = useState(false);
  const [galleryState, setGalleryState] = useState<{
    petSitterId: string | null;
    index: number;
  }>({ petSitterId: null, index: 0 });
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const mappablePetSitters = useMemo(
    () =>
      petSitters.filter(
        (petSitter) =>
          Number.isFinite(petSitter.latitude) && Number.isFinite(petSitter.longitude),
      ),
    [petSitters],
  );
  const selectedPetSitter = useMemo(
    () =>
      mappablePetSitters.find((petSitter) => petSitter.id === selectedPetSitterId) ?? null,
    [mappablePetSitters, selectedPetSitterId],
  );
  const selectedImages = useMemo(() => {
    if (!selectedPetSitter) {
      return [];
    }

    if (selectedPetSitter.gallery.length > 0) {
      return selectedPetSitter.gallery;
    }

    return [
      {
        url: selectedPetSitter.imageUrl,
        alt: selectedPetSitter.imageAlt,
      },
    ];
  }, [selectedPetSitter]);
  const galleryIndex =
    galleryState.petSitterId === selectedPetSitterId ? galleryState.index : 0;
  const activeImage = selectedImages[galleryIndex] ?? null;

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
          La liste reste utilisable. La carte se recharge automatiquement dès que
          le provider gratuit répond.
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
        onMoveEnd={handleMoveEnd}
      >
        <NavigationControl position="bottom-right" visualizePitch={false} />
        <AttributionControl compact position="bottom-left" />
        {mappablePetSitters.map((petSitter) => (
          <Marker
            anchor="bottom"
            key={petSitter.id}
            latitude={petSitter.latitude}
            longitude={petSitter.longitude}
          >
            <button
              className={
                selectedPetSitterId === petSitter.id
                  ? "maplibre-price-marker maplibre-price-marker--active"
                  : "maplibre-price-marker"
              }
              type="button"
              onClick={() =>
                onPetSitterSelect(
                  selectedPetSitterId === petSitter.id ? null : petSitter.id,
                )
              }
              onFocus={() => onPetSitterSelect(petSitter.id)}
              aria-label={`Sélectionner ${petSitter.firstName} ${petSitter.lastInitial}`}
            >
              {formatEuro(petSitter.basePriceCents)}
            </button>
          </Marker>
        ))}
        {selectedPetSitter ? (
          <Popup
            latitude={selectedPetSitter.latitude}
            longitude={selectedPetSitter.longitude}
            anchor="bottom"
            offset={[0, -36]}
            maxWidth="380px"
            closeButton={false}
            closeOnClick={false}
            closeOnMove={false}
          >
            <article className="map-floating-card map-floating-card--in-popup" aria-live="polite">
              <div className="map-floating-card__media">
                {activeImage ? (
                  <Image
                    src={activeImage.url}
                    alt={activeImage.alt}
                    fill
                    sizes="380px"
                  />
                ) : null}
                {selectedImages.length > 1 ? (
                  <>
                    <button
                      className="map-floating-card__nav map-floating-card__nav--prev"
                      type="button"
                      aria-label="Image précédente"
                      onClick={() =>
                        setGalleryState((current) => ({
                          petSitterId: selectedPetSitter.id,
                          index:
                            current.petSitterId !== selectedPetSitter.id ||
                            current.index === 0
                              ? selectedImages.length - 1
                              : current.index - 1,
                        }))
                      }
                    >
                      ‹
                    </button>
                    <button
                      className="map-floating-card__nav map-floating-card__nav--next"
                      type="button"
                      aria-label="Image suivante"
                      onClick={() =>
                        setGalleryState((current) => ({
                          petSitterId: selectedPetSitter.id,
                          index:
                            current.petSitterId !== selectedPetSitter.id ||
                            current.index === selectedImages.length - 1
                              ? 0
                              : current.index + 1,
                        }))
                      }
                    >
                      ›
                    </button>
                  </>
                ) : null}
                <button
                  className={
                    favoriteIds.has(selectedPetSitter.id)
                      ? "map-floating-card__favorite map-floating-card__favorite--active"
                      : "map-floating-card__favorite"
                  }
                  type="button"
                  aria-label={
                    favoriteIds.has(selectedPetSitter.id)
                      ? `Retirer ${selectedPetSitter.firstName} des favoris`
                      : `Ajouter ${selectedPetSitter.firstName} aux favoris`
                  }
                  aria-pressed={favoriteIds.has(selectedPetSitter.id)}
                  onClick={() =>
                    setFavoriteIds((current) => {
                      const next = new Set(current);
                      if (next.has(selectedPetSitter.id)) {
                        next.delete(selectedPetSitter.id);
                      } else {
                        next.add(selectedPetSitter.id);
                      }
                      return next;
                    })
                  }
                >
                  {favoriteIds.has(selectedPetSitter.id) ? "♥" : "♡"}
                </button>
              </div>
              <span className="map-floating-card__body">
                <strong>
                  {selectedPetSitter.firstName} {selectedPetSitter.lastInitial}
                </strong>
                <small>
                  {selectedPetSitter.city} · {selectedPetSitter.distanceLabel}
                </small>
                <span className="map-floating-card__tags">
                  {selectedPetSitter.badges.slice(0, 2).map((badge) => (
                    <em key={badge.id}>{badge.label}</em>
                  ))}
                </span>
                <b>
                  Dès {formatEuro(selectedPetSitter.basePriceCents)} /{" "}
                  {selectedPetSitter.priceUnit}
                </b>
                <Link
                  className="map-floating-card__profile-link"
                  href={`/pet-sitters/${selectedPetSitter.id}`}
                >
                  Voir profil
                </Link>
              </span>
              <button
                type="button"
                onClick={() => onPetSitterSelect(null)}
                aria-label="Fermer la fiche"
              >
                ×
              </button>
            </article>
          </Popup>
        ) : null}
      </Map>
      <div className="map-area-controls" aria-label="Déplacer la carte">
        {orderedAreaIds.map((areaId) => {
          const area = areas[areaId];

          return (
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
          );
        })}
      </div>
      <button className="map-search-button" type="button" onClick={onSearchArea}>
        Rechercher dans cette zone
      </button>
      <p className="map-privacy-label">OpenFreeMap · adresse exacte masquée</p>
    </div>
  );
}
