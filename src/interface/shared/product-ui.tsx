"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type React from "react";
import { demoPetSitters, type PublicPetSitter, type ReferenceTag } from "./product-data";
import { formatEuro, formatRating } from "./format";
import { DemoSessionHeaderAction } from "./demo-session-client";
import { Map, Marker } from "@vis.gl/react-maplibre";

type ShellProps = {
  children: React.ReactNode;
  compact?: boolean;
};

export function PublicShell({ children, compact = false }: ShellProps) {
  return (
    <div className={compact ? "public-shell public-shell--compact" : "public-shell"}>
      <PublicHeader />
      {children}
    </div>
  );
}

export function PublicHeader() {
  return (
    <header className="public-header">
      <Link className="brand-mark" href="/" aria-label="Accueil MamiPet">
        <span className="brand-symbol" aria-hidden="true">
          M
        </span>
        <span>Mami<span>Pet</span></span>
      </Link>
      <nav className="public-nav" aria-label="Navigation principale">
        <Link href="/pet-sitters">Trouver une garde</Link>
        <Link href="/#fonctionnement">Comment ça marche</Link>
        <Link href="/#garanties">Garanties</Link>
        <Link href="/#devenir-pet-sitter">Devenir pet-sitter</Link>
      </nav>
      <div className="header-actions">
        <DemoSessionHeaderAction />
        <Link className="ghost-button" href="/register">
          Inscription
        </Link>
        <Link className="primary-button primary-button--small" href="/pet-sitters">
          Rechercher
        </Link>
      </div>
    </header>
  );
}

type ButtonLinkProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
};

export function ButtonLink({ href, children, variant = "primary" }: ButtonLinkProps) {
  const className =
    variant === "primary"
      ? "primary-button"
      : variant === "secondary"
        ? "secondary-button"
        : "ghost-button";

  return (
    <Link className={className} href={href}>
      {children}
    </Link>
  );
}

export function TrustBadge({ label }: { label: string }) {
  return (
    <span className="trust-badge">
      <span aria-hidden="true" />
      {label}
    </span>
  );
}

export function CareCapabilityTag({ label }: { label: string }) {
  return <span className="care-tag">{label}</span>;
}

export function SensitiveDataNotice() {
  return (
    <p className="sensitive-notice">
      Ces informations sont privées. Elles deviennent visibles uniquement dans
      le cadre d&apos;une réservation autorisée.
    </p>
  );
}

export function PublicPetSitterCard({
  petSitter,
  layout = "grid",
}: {
  petSitter: PublicPetSitter;
  layout?: "grid" | "list";
}) {
  const profileHref = `/pet-sitters/${petSitter.id}`;

  return (
    <article className={`sitter-card sitter-card--${layout}`}>
      <Link className="sitter-card__link" href={profileHref}>
        <PetSitterVisual petSitter={petSitter} />
        <div className="sitter-card__content">
          <div className="sitter-card__heading">
            <div>
              <h3>
                {petSitter.firstName} {petSitter.lastInitial}
              </h3>
              <p>
                {formatRating(petSitter.rating)} / 5 · {petSitter.reviewCount} avis ·{" "}
                {petSitter.city}
              </p>
              <p>{petSitter.approximateAddress}</p>
            </div>
          </div>
          <div className="badge-row">
            {petSitter.badges.slice(0, 3).map((badge) => (
              <TrustBadge key={badge.id} label={badge.label} />
            ))}
          </div>
          <p className="sitter-card__copy">{petSitter.description}</p>
          <InlineTagList items={petSitter.species} limit={3} />
          <div className="tag-row">
            {petSitter.careCapabilities.slice(0, 3).map((tag) => (
              <CareCapabilityTag key={tag.id} label={tag.label} />
            ))}
          </div>
          <div className="sitter-card__footer">
            <span>{petSitter.availabilitySummary}</span>
            <strong>
              Dès {formatEuro(petSitter.basePriceCents)} / {petSitter.priceUnit}
            </strong>
          </div>
          <span className="secondary-button sitter-card__cta">Voir le profil</span>
        </div>
      </Link>
      <FavoriteButton petSitterName={`${petSitter.firstName} ${petSitter.lastInitial}`} />
    </article>
  );
}

function FavoriteButton({ petSitterName }: { petSitterName: string }) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <button
      className={isFavorite ? "icon-button icon-button--active" : "icon-button"}
      type="button"
      onClick={() => setIsFavorite((current) => !current)}
      aria-label={
        isFavorite
          ? `Retirer ${petSitterName} des favoris`
          : `Ajouter ${petSitterName} aux favoris`
      }
      aria-pressed={isFavorite}
    >
      <span aria-hidden="true">{isFavorite ? "♥" : "♡"}</span>
    </button>
  );
}

export function PetSitterVisual({ petSitter }: { petSitter: PublicPetSitter }) {
  return (
    <div className="pet-visual">
      <Image
        src={petSitter.imageUrl}
        alt={petSitter.imageAlt}
        fill
        sizes="(max-width: 760px) 100vw, (max-width: 1180px) 50vw, 33vw"
        priority={petSitter.id === "sarah-johnson"}
      />
    </div>
  );
}

export function InlineTagList({
  items,
  limit,
}: {
  items: ReferenceTag[];
  limit: number;
}) {
  const visibleItems = items.slice(0, limit);
  const hiddenCount = Math.max(items.length - visibleItems.length, 0);

  return (
    <p className="inline-tags">
      {visibleItems.map((item) => item.label).join(" · ")}
      {hiddenCount > 0 ? ` · +${hiddenCount}` : ""}
    </p>
  );
}

export function ApproximateMap({
  compact = false,
  petSitters = demoPetSitters.slice(0, 3),
}: {
  compact?: boolean;
  petSitters?: PublicPetSitter[];
}) {
  const visiblePetSitters = petSitters.slice(0, 3);

  return (
    <div className={compact ? "map-preview map-preview--compact" : "map-preview"}>
      <Map
        initialViewState={{
          latitude:
            visiblePetSitters.length > 0
              ? visiblePetSitters.reduce((s, ps) => s + ps.latitude, 0) / visiblePetSitters.length
              : 49.18,
          longitude:
            visiblePetSitters.length > 0
              ? visiblePetSitters.reduce((s, ps) => s + ps.longitude, 0) / visiblePetSitters.length
              : -0.37,
          zoom: 11,
        }}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        attributionControl={false}
        dragRotate={false}
      >
        {visiblePetSitters.map((petSitter) => (
          <Marker
            key={petSitter.id}
            latitude={petSitter.latitude}
            longitude={petSitter.longitude}
            anchor="bottom"
          >
            <Link
              className="map-price"
              href={`/pet-sitters/${petSitter.id}`}
              aria-label={`Voir le profil de ${petSitter.firstName} ${petSitter.lastInitial}`}
            >
              {formatEuro(petSitter.basePriceCents)}
            </Link>
          </Marker>
        ))}
      </Map>
      <Link className="map-preview__open" href="/pet-sitters">
        Ouvrir la carte interactive
      </Link>
      <p>Zone approximative, adresse masquée</p>
    </div>
  );
}
