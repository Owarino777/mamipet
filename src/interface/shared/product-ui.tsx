import Link from "next/link";
import Image from "next/image";
import type React from "react";
import type { PublicPetSitter, ReferenceTag } from "./product-data";
import { formatEuro, formatRating } from "./format";

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
        <Link className="ghost-button" href="/login">
          Connexion
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
  return (
    <article className={`sitter-card sitter-card--${layout}`}>
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
          <button className="icon-button" type="button" aria-label="Ajouter aux favoris">
            <span aria-hidden="true">♡</span>
          </button>
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
        <ButtonLink href={`/pet-sitters/${petSitter.id}`} variant="secondary">
          Voir le profil
        </ButtonLink>
      </div>
    </article>
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

export function ApproximateMap({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "map-preview map-preview--compact" : "map-preview"}>
      <iframe
        title="Carte approximative des pet-sitters"
        src="https://www.openstreetmap.org/export/embed.html?bbox=-0.4388%2C49.1554%2C-0.3057%2C49.2102&layer=mapnik&marker=49.1829%2C-0.3707"
        loading="lazy"
        referrerPolicy="no-referrer"
      />
      <span className="map-price map-price--one">28 €</span>
      <span className="map-price map-price--two">30 €</span>
      <span className="map-price map-price--three">26 €</span>
      <p>Zone approximative, adresse masquée</p>
    </div>
  );
}
