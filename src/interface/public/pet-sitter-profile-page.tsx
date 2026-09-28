"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
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
import { useDemoSession } from "@/interface/shared/demo-session-client";
import { mapApiPetSitter, type ApiPetSitterProfileDto } from "./hooks/use-pet-sitter-search";

type ProfilePageProps = {
  petSitterId: string;
};

export function PetSitterProfilePage({ petSitterId }: ProfilePageProps) {
  const session = useDemoSession();
  const [petSitter, setPetSitter] = useState<PublicPetSitter | null>(null);
  const [loadError, setLoadError] = useState("");
  const bookingRoute = `/reservations/new?sitter=${encodeURIComponent(petSitterId)}`;
  const bookingHref = session ? bookingRoute : `/login?next=${encodeURIComponent(bookingRoute)}`;

  useEffect(() => {
    const controller = new AbortController();

    async function loadProfile() {
      if (session?.source === "fixture") {
        setPetSitter(demoPetSitters.find((profile) => profile.id === petSitterId) ?? null);
        setLoadError("");
        return;
      }

      try {
        setPetSitter(null);
        setLoadError("");
        const response = await fetch(`/api/pet-sitters/${petSitterId}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          setLoadError(response.status === 404 ? "Ce profil est introuvable." : "Impossible de charger ce profil.");
          return;
        }

        const payload = (await response.json()) as { data: ApiPetSitterProfileDto | null };

        if (!payload.data || payload.data.id !== petSitterId) throw new Error("Invalid profile response");
        setPetSitter(mapApiPetSitter(payload.data));
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setLoadError("Impossible de charger ce profil.");
      }
    }

    void loadProfile();

    return () => controller.abort();
  }, [petSitterId, session?.source]);

  const acceptedCare = useMemo(
    () => petSitter?.careCapabilities.slice(0, 6) ?? [],
    [petSitter],
  );

  if (!petSitter) {
    return <PublicShell compact><main className="profile-page"><Link className="back-link" href="/pet-sitters">Retour aux résultats</Link><h1>Profil pet-sitter</h1><p role={loadError ? "alert" : "status"}>{loadError || "Chargement du profil…"}</p></main></PublicShell>;
  }

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
            <p className="section-kicker">{petSitter.verificationStatus === "published_unverified" ? "Pet-sitter" : "Pet-sitter vérifié"}</p>
            <h1>
              {petSitter.firstName} {petSitter.lastInitial}
            </h1>
            <p className="profile-meta">
              {petSitter.reviewCount > 0 ? `${formatRating(petSitter.rating)} / 5 · ${petSitter.reviewCount} avis · ` : "Aucun avis publié · "}
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
            <p className="booking-panel__price">{petSitter.basePriceCents > 0 ? `Dès ${formatEuro(petSitter.basePriceCents)} / ${petSitter.priceUnit}` : "Tarif à confirmer"}</p>
            <div className="booking-panel__proofs">
              <span>Réponse moyenne : {petSitter.responseTime}</span>
              <span>{petSitter.availabilitySummary}</span>
            </div>
            <ButtonLink href={bookingHref}>Préparer une demande</ButtonLink>
            <small>Dates et type de garde à préciser dans la demande. Aucun paiement avant acceptation.</small>
          </aside>
        </section>

        <section className="profile-confidence-row" aria-label="Garanties avant réservation">
          <article>
            <span>1</span>
            <h2>Vérifier l&apos;adéquation</h2>
            <p>
              Les espèces, modes de garde, badges et capacités sensibles sont visibles
              avant d&apos;envoyer une demande.
            </p>
          </article>
          <article>
            <span>2</span>
            <h2>Partager le nécessaire</h2>
            <p>
              Les consignes détaillées de l&apos;animal sont transmises dans le cadre de
              la demande, sans rendre publiques les données médicales.
            </p>
          </article>
          <article>
            <span>3</span>
            <h2>Payer après acceptation</h2>
            <p>
              Le paiement en ligne et le contrat sont actuellement indisponibles.
            </p>
          </article>
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
          {petSitter.gallery.slice(0, 4).map((image) => (
            <div className="gallery-tile" key={image.url}>
              <Image src={image.url} alt={image.alt} fill sizes="24vw" />
            </div>
          ))}
        </section>

        <section className="profile-detail-layout">
          <div className="profile-card">
            <h2>Avis</h2>
            <p className="profile-rating">{petSitter.reviewCount > 0 ? <><strong>{formatRating(petSitter.rating)} / 5</strong> · {petSitter.reviewCount} avis</> : "Aucun avis publié"}</p>
          </div>
          <div className="profile-card">
            <h2>Zone de garde</h2>
            <p>{petSitter.city} · {petSitter.distanceLabel}</p>
            <p className="profile-detail-note">L’adresse exacte reste privée avant la réservation.</p>
            <Link href="/pet-sitters">Voir la carte des pet-sitters</Link>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
