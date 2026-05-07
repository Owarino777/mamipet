import {
  ApproximateMap,
  ButtonLink,
  PublicPetSitterCard,
  PublicShell,
  TrustBadge,
} from "@/interface/shared/product-ui";
import { demoPetSitters, trustProofs } from "@/interface/shared/product-data";
import Image from "next/image";

export function HomePage() {
  const featuredPetSitters = demoPetSitters.slice(0, 3);

  return (
    <PublicShell>
      <main>
        <section className="hero-section">
          <Image
            className="hero-background"
            src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=2400&q=84"
            alt="Pet-sitter avec un chien dans un intérieur lumineux"
            fill
            sizes="100vw"
            priority
          />
          <div className="hero-content">
            <h1>Trouvez une garde fiable pour votre animal.</h1>
            <p className="hero-copy">
              MamiPet vous aide à trouver des pet-sitters vérifiés, qualifiés et
              capables de prendre soin d&apos;animaux classiques, sensibles, âgés ou
              sous traitement.
            </p>
            <div className="hero-actions">
              <ButtonLink href="/pet-sitters">Trouver un pet-sitter</ButtonLink>
              <ButtonLink href="/#devenir-pet-sitter" variant="secondary">
                Devenir pet-sitter
              </ButtonLink>
            </div>
            <div className="proof-row" aria-label="Garanties principales">
              {trustProofs.map((proof) => (
                <TrustBadge key={proof} label={proof} />
              ))}
            </div>
          </div>
        </section>

        <aside className="hero-search-dock" aria-label="Recherche rapide">
          <form className="quick-search quick-search--hero" action="/pet-sitters">
            <label>
              Espèce
              <select name="species" defaultValue="dog">
                <option value="dog">Chien</option>
                <option value="cat">Chat</option>
                <option value="rabbit">Lapin</option>
                <option value="small_pet">Petit mammifère</option>
              </select>
            </label>
            <label>
              Ville
              <input name="city" defaultValue="Caen" placeholder="Caen" />
            </label>
            <label>
              Besoin
              <select name="need" defaultValue="medication">
                <option value="medication">Sous traitement</option>
                <option value="senior">Animal âgé</option>
                <option value="anxious">Anxieux</option>
                <option value="monitoring">Surveillance renforcée</option>
              </select>
            </label>
            <button className="primary-button" type="submit">
              Rechercher
            </button>
          </form>
        </aside>

        <section className="value-section" id="fonctionnement">
          <div className="section-heading">
            <p className="section-kicker">Pourquoi MamiPet</p>
            <h2>Plus qu&apos;une disponibilité : une vraie compatibilité.</h2>
          </div>
          <div className="value-grid">
            <article>
              <h3>Profils vérifiés</h3>
              <p>Identité, documents et badges visibles avant réservation.</p>
            </article>
            <article>
              <h3>Besoins spécifiques</h3>
              <p>
                Trouvez des pet-sitters adaptés aux animaux âgés, anxieux ou sous
                traitement.
              </p>
            </article>
            <article>
              <h3>Réservation encadrée</h3>
              <p>Demande directe, paiement test, récapitulatif et suivi.</p>
            </article>
          </div>
        </section>

        <section className="featured-section">
          <div className="section-heading section-heading--inline">
            <div>
              <p className="section-kicker">Recherche</p>
              <h2>Pet-sitters disponibles près de vous</h2>
            </div>
            <ButtonLink href="/pet-sitters" variant="ghost">
              Voir tous les profils
            </ButtonLink>
          </div>
          <div className="featured-layout">
            <div className="featured-grid">
              {featuredPetSitters.map((petSitter) => (
                <PublicPetSitterCard key={petSitter.id} petSitter={petSitter} />
              ))}
            </div>
            <ApproximateMap petSitters={featuredPetSitters} />
          </div>
        </section>

        <section className="seo-section" id="garanties">
          <div>
            <p className="section-kicker">Confiance</p>
            <h2>Une garde adaptée à chaque animal</h2>
          </div>
          <p>
            Un chat anxieux, un chien âgé ou un animal sous traitement ne se
            confie pas comme n&apos;importe quel animal. MamiPet structure les
            profils, les compétences et les garanties pour aider les propriétaires
            à choisir avec plus de confiance.
          </p>
        </section>

        <section className="become-sitter-section" id="devenir-pet-sitter">
          <div>
            <p className="section-kicker">Pet-sitters</p>
            <h2>Valorisez vos compétences de garde.</h2>
            <p>
              Renseignez vos espèces acceptées, vos capacités de soin, vos
              documents et vos disponibilités pour recevoir des demandes adaptées.
            </p>
          </div>
          <ButtonLink href="/login">Créer mon profil</ButtonLink>
        </section>
      </main>
    </PublicShell>
  );
}
