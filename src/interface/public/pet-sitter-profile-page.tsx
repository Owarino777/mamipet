"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ApproximateMap,
  ButtonLink,
  CareCapabilityTag,
  InlineTagList,
  PetSitterVisual,
  PublicShell,
  SensitiveDataNotice,
  TrustBadge,
} from "@/interface/shared/product-ui";
import { demoPetSitters, type PublicPetSitter } from "@/interface/shared/product-data";
import { formatEuro, formatRating } from "@/interface/shared/format";

type ProfilePageProps = {
  petSitterId: string;
};

export function PetSitterProfilePage({ petSitterId }: ProfilePageProps) {
  const [petSitter, setPetSitter] = useState<PublicPetSitter>(() =>
    findInitialProfile(petSitterId),
  );

  useEffect(() => {
    const controller = new AbortController();

    async function loadProfile() {
      if (demoPetSitters.some((profile) => profile.id === petSitterId)) {
        return;
      }

      try {
        const response = await fetch(`/api/pet-sitters/${petSitterId}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as { data: unknown };

        if (payload.data && typeof payload.data === "object") {
          setPetSitter((current) => ({
            ...current,
            id: petSitterId,
          }));
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    void loadProfile();

    return () => controller.abort();
  }, [petSitterId]);

  const acceptedCare = useMemo(
    () => petSitter.careCapabilities.slice(0, 6),
    [petSitter],
  );

  return (
    <PublicShell compact>
      <main className="profile-page">
        <Link className="back-link" href="/pet-sitters">
          Retour aux résultats
        </Link>

        <section className="profile-hero">
          <div className="profile-hero__media">
            <PetSitterVisual petSitter={petSitter} />
          </div>
          <div className="profile-hero__content">
            <p className="section-kicker">Pet-sitter vérifié</p>
            <h1>
              {petSitter.firstName} {petSitter.lastInitial}
            </h1>
            <p className="profile-meta">
              {formatRating(petSitter.rating)} / 5 · {petSitter.reviewCount} avis ·{" "}
              {petSitter.city} · {petSitter.distanceLabel}
            </p>
            <p className="hero-copy">{petSitter.description}</p>
            <div className="badge-row">
              {petSitter.badges.map((badge) => (
                <TrustBadge key={badge.id} label={badge.label} />
              ))}
            </div>
          </div>
          <aside className="booking-panel">
            <h2>Demander une réservation</h2>
            <p>
              Dès {formatEuro(petSitter.basePriceCents)} / {petSitter.priceUnit}
            </p>
            <label>
              Début
              <input type="date" />
            </label>
            <label>
              Fin
              <input type="date" />
            </label>
            <label>
              Type de garde
              <select>
                {petSitter.careLocations.map((location) => (
                  <option key={location.id}>{location.label}</option>
                ))}
              </select>
            </label>
            <ButtonLink href="/login">Vérifier les disponibilités</ButtonLink>
            <small>Vous ne serez pas facturé avant acceptation.</small>
          </aside>
        </section>

        <section className="profile-grid">
          <article className="profile-card">
            <h2>Animaux acceptés</h2>
            <InlineTagList items={petSitter.species} limit={8} />
          </article>
          <article className="profile-card">
            <h2>Besoins pris en charge</h2>
            <div className="tag-row">
              {acceptedCare.map((tag) => (
                <CareCapabilityTag key={tag.id} label={tag.label} />
              ))}
            </div>
          </article>
          <article className="profile-card">
            <h2>Services proposés</h2>
            <InlineTagList items={petSitter.services} limit={8} />
          </article>
          <article className="profile-card">
            <h2>Confidentialité</h2>
            <SensitiveDataNotice />
          </article>
        </section>

        <section className="gallery-section" aria-label="Galerie du pet-sitter">
          <div className="gallery-main">
            <Image
              src={petSitter.imageUrl}
              alt={petSitter.imageAlt}
              fill
              sizes="(max-width: 900px) 100vw, 52vw"
            />
          </div>
          {petSitter.gallery.slice(0, 4).map((image) => (
            <div className="gallery-tile" key={image.url}>
              <Image src={image.url} alt={image.alt} fill sizes="24vw" />
            </div>
          ))}
        </section>

        <section className="profile-detail-layout">
          <div className="profile-card">
            <h2>Avis vérifiés</h2>
            <article className="review-card">
              <strong>Réservation terminée</strong>
              <p>
                Communication claire, consignes respectées et nouvelles envoyées
                pendant la garde.
              </p>
              <span>{formatRating(petSitter.rating)} / 5</span>
            </article>
          </div>
          <div className="profile-card">
            <h2>Zone approximative</h2>
            <ApproximateMap compact />
          </div>
        </section>

        <div className="sticky-cta">
          <div>
            <strong>
              Dès {formatEuro(petSitter.basePriceCents)} / {petSitter.priceUnit}
            </strong>
            <span>Réservation encadrée après acceptation</span>
          </div>
          <ButtonLink href="/login">Demander une réservation</ButtonLink>
        </div>
      </main>
    </PublicShell>
  );
}

function findInitialProfile(petSitterId: string): PublicPetSitter {
  const matchingProfile = demoPetSitters.find((profile) => profile.id === petSitterId);

  if (matchingProfile) {
    return matchingProfile;
  }

  const fallbackProfile = demoPetSitters[0];

  if (!fallbackProfile) {
    throw new Error("At least one public pet-sitter profile is required.");
  }

  return fallbackProfile;
}
