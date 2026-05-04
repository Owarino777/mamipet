import Image from "next/image";
import Link from "next/link";
import type React from "react";
import { demoPetSitters } from "@/interface/shared/product-data";
import { formatEuro, formatRating } from "@/interface/shared/format";
import { ButtonLink, CareCapabilityTag, SensitiveDataNotice, TrustBadge } from "@/interface/shared/product-ui";

const ownerPets = [
  {
    name: "Luna",
    species: "Chien",
    age: "3 ans",
    needs: ["Anxiété", "Pas de chats"],
    image:
      "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1200&q=82",
  },
  {
    name: "Milo",
    species: "Chat",
    age: "2 ans",
    needs: ["Intérieur", "Traitement léger"],
    image:
      "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=1200&q=82",
  },
];

export function OwnerDashboardPage() {
  const sitter = getPrimaryPetSitter();

  return (
    <ConnectedShell role="Propriétaire" active="Tableau de bord">
      <main className="workspace-main">
        <div className="workspace-heading">
          <div>
            <p className="section-kicker">Bonjour Olivia</p>
            <h1>Vos gardes et animaux sont à jour.</h1>
          </div>
          <ButtonLink href="/reservations/new">Nouvelle réservation</ButtonLink>
        </div>

        <section className="workspace-grid workspace-grid--hero">
          <article className="workspace-card upcoming-card">
            <div>
              <p className="section-kicker">Prochaine garde</p>
              <h2>Garde de Luna et Milo</h2>
              <p>Du 24 au 26 mai · {sitter.firstName} {sitter.lastInitial}</p>
            </div>
            <div className="badge-row">
              <TrustBadge label="Acceptée" />
              <TrustBadge label="Paiement à effectuer" />
              <TrustBadge label="Assurance standard" />
            </div>
            <ButtonLink href="/reservations/new" variant="secondary">
              Voir la réservation
            </ButtonLink>
          </article>

          <article className="workspace-card">
            <div className="card-heading-row">
              <h2>Mes animaux</h2>
              <Link href="/owner/animals">Voir tout</Link>
            </div>
            <div className="pet-mini-grid">
              {ownerPets.map((pet) => (
                <PetMiniCard key={pet.name} pet={pet} />
              ))}
            </div>
          </article>
        </section>

        <section className="workspace-grid">
          <article className="workspace-card">
            <h2>Pet-sitters adaptés</h2>
            <div className="recommendation-row">
              {demoPetSitters.map((profile) => (
                <Link className="mini-sitter-card" href={`/pet-sitters/${profile.id}`} key={profile.id}>
                  <Image src={profile.imageUrl} alt={profile.imageAlt} fill sizes="180px" />
                  <span>{profile.firstName} {profile.lastInitial}</span>
                  <small>{formatRating(profile.rating)} / 5 · {profile.city}</small>
                </Link>
              ))}
            </div>
          </article>

          <article className="workspace-card">
            <h2>Dossier médical</h2>
            <SensitiveDataNotice />
            <p>Luna a 2 consignes à compléter avant la prochaine garde.</p>
            <ButtonLink href="/owner/animals" variant="secondary">Compléter</ButtonLink>
          </article>

          <article className="workspace-card">
            <h2>Avis à déposer</h2>
            <p>Aucun avis en attente pour le moment.</p>
            <ButtonLink href="/dashboard" variant="secondary">Voir l&apos;historique</ButtonLink>
          </article>
        </section>
      </main>
    </ConnectedShell>
  );
}

export function OwnerAnimalsPage() {
  return (
    <ConnectedShell role="Propriétaire" active="Mes animaux">
      <main className="workspace-main">
        <div className="workspace-heading">
          <div>
            <p className="section-kicker">Animaux</p>
            <h1>Les besoins de chaque animal restent visibles au bon moment.</h1>
          </div>
          <ButtonLink href="/owner/animals">Ajouter un animal</ButtonLink>
        </div>
        <section className="workspace-grid">
          {ownerPets.map((pet) => (
            <article className="workspace-card animal-detail-card" key={pet.name}>
              <PetMiniCard pet={pet} />
              <h2>Dossier médical {pet.name}</h2>
              <div className="tag-row">
                {pet.needs.map((need) => (
                  <CareCapabilityTag key={need} label={need} />
                ))}
              </div>
              <SensitiveDataNotice />
            </article>
          ))}
        </section>
      </main>
    </ConnectedShell>
  );
}

export function BookingFlowPage() {
  const sitter = getPrimaryPetSitter();

  return (
    <ConnectedShell role="Propriétaire" active="Réservation">
      <main className="booking-workspace">
        <section className="booking-steps" aria-label="Étapes de réservation">
          {["Animaux", "Garde", "Consignes", "Vérification"].map((step, index) => (
            <span className={index === 0 ? "step-pill step-pill--active" : "step-pill"} key={step}>
              {index + 1}. {step}
            </span>
          ))}
        </section>

        <div className="booking-layout">
          <section className="workspace-card booking-form-card">
            <h1>Quels animaux seront gardés ?</h1>
            <div className="pet-mini-grid">
              {ownerPets.map((pet) => (
                <label className="selectable-pet" key={pet.name}>
                  <input type="checkbox" defaultChecked />
                  <PetMiniCard pet={pet} />
                </label>
              ))}
            </div>
            <label>
              Consignes propres à cette garde
              <textarea rows={5} placeholder="Traitement, alimentation, comportement, urgence..." />
            </label>
            <SensitiveDataNotice />
          </section>

          <aside className="workspace-card booking-summary-card">
            <h2>Récapitulatif</h2>
            <Image src={sitter.imageUrl} alt={sitter.imageAlt} width={96} height={96} />
            <p>{sitter.firstName} {sitter.lastInitial} · {sitter.city}</p>
            <dl>
              <div><dt>Dates</dt><dd>24-26 mai 2026</dd></div>
              <div><dt>Animaux</dt><dd>Luna, Milo</dd></div>
              <div><dt>Total estimé</dt><dd>{formatEuro(12100)}</dd></div>
            </dl>
            <ButtonLink href="/dashboard">Envoyer la demande</ButtonLink>
            <small>Paiement uniquement après acceptation.</small>
          </aside>
        </div>
      </main>
    </ConnectedShell>
  );
}

export function PetSitterDashboardPage() {
  return (
    <ConnectedShell role="Pet-sitter" active="Demandes">
      <main className="workspace-main">
        <div className="workspace-heading">
          <div>
            <p className="section-kicker">Bonjour Sarah</p>
            <h1>Votre activité de garde est prête.</h1>
          </div>
          <ButtonLink href="/pet-sitter/dashboard">Modifier mon profil</ButtonLink>
        </div>
        <section className="workspace-grid workspace-grid--four">
          <MetricCard title="Complétion profil" value="85 %" detail="Encore quelques documents" />
          <MetricCard title="Statut" value="Vérifiée" detail="Identité validée" />
          <MetricCard title="Réponse" value="98 %" detail="Temps moyen : 1 h" />
          <MetricCard title="Revenus" value="1 250 €" detail="Ce mois-ci" />
        </section>
        <section className="workspace-grid">
          <article className="workspace-card">
            <h2>Demandes reçues</h2>
            {ownerPets.map((pet) => (
              <div className="request-row" key={pet.name}>
                <PetMiniCard pet={pet} />
                <div className="request-actions">
                  <button type="button">Refuser</button>
                  <button type="button">Accepter</button>
                </div>
              </div>
            ))}
          </article>
          <article className="workspace-card">
            <h2>Documents & badges</h2>
            <TrustBadge label="Identité vérifiée" />
            <TrustBadge label="Assurance active" />
            <TrustBadge label="Expert animaux âgés" />
          </article>
        </section>
      </main>
    </ConnectedShell>
  );
}

export function AdminDashboardPage() {
  return (
    <ConnectedShell role="Admin" active="Validation">
      <main className="workspace-main">
        <div className="workspace-heading">
          <div>
            <p className="section-kicker">Back-office</p>
            <h1>Validation, modération et suivi des actions sensibles.</h1>
          </div>
        </div>
        <section className="workspace-grid workspace-grid--four">
          <MetricCard title="Documents" value="12" detail="À valider" />
          <MetricCard title="Profils" value="5" detail="En attente" />
          <MetricCard title="Signalements" value="3" detail="Ouverts" />
          <MetricCard title="Paiements" value="24" detail="Mode test" />
        </section>
        <section className="workspace-grid">
          <AdminList title="Documents en attente" items={["Sarah Johnson · ACACED", "Thomas L. · RC Pro", "Élodie M. · Identité"]} />
          <AdminList title="Signalements ouverts" items={["Incident pendant une garde", "Avis litigieux", "Profil incomplet"]} />
        </section>
      </main>
    </ConnectedShell>
  );
}

export function LoginPage() {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link className="brand-mark" href="/">
          <span className="brand-symbol" aria-hidden="true">M</span>
          <span>Mami<span>Pet</span></span>
        </Link>
        <div>
          <p className="section-kicker">Accès sécurisé</p>
          <h1>Connectez-vous pour réserver ou gérer vos gardes.</h1>
        </div>
        <form className="auth-form">
          <label>
            Email
            <input type="email" placeholder="olivia@example.com" />
          </label>
          <label>
            Mot de passe
            <input type="password" placeholder="••••••••" />
          </label>
          <button className="primary-button" type="button">Continuer</button>
        </form>
        <div className="auth-shortcuts">
          <ButtonLink href="/dashboard" variant="secondary">Espace propriétaire</ButtonLink>
          <ButtonLink href="/pet-sitter/dashboard" variant="secondary">Espace pet-sitter</ButtonLink>
          <ButtonLink href="/admin/dashboard" variant="secondary">Administration</ButtonLink>
        </div>
      </section>
    </main>
  );
}

function ConnectedShell({
  role,
  active,
  children,
}: {
  role: string;
  active: string;
  children: React.ReactNode;
}) {
  const links: Array<[string, string]> = [
    ["Tableau de bord", "/dashboard"],
    ["Mes animaux", "/owner/animals"],
    ["Recherche", "/pet-sitters"],
    ["Réservation", "/reservations/new"],
    ["Pet-sitter", "/pet-sitter/dashboard"],
    ["Admin", "/admin/dashboard"],
  ];

  return (
    <div className="connected-shell">
      <aside className="connected-sidebar">
        <Link className="brand-mark" href="/">
          <span className="brand-symbol" aria-hidden="true">M</span>
          <span>Mami<span>Pet</span></span>
        </Link>
        <p>{role}</p>
        <nav aria-label="Navigation espace connecté">
          {links.map(([label, href]) => (
            <Link className={active === label ? "active" : ""} href={href} key={href}>
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      {children}
    </div>
  );
}

function getPrimaryPetSitter() {
  const petSitter = demoPetSitters[0];

  if (!petSitter) {
    throw new Error("At least one demo pet-sitter profile is required.");
  }

  return petSitter;
}

function PetMiniCard({
  pet,
}: {
  pet: {
    name: string;
    species: string;
    age: string;
    needs: string[];
    image: string;
  };
}) {
  return (
    <div className="pet-mini-card">
      <Image src={pet.image} alt={`${pet.name}, ${pet.species}`} width={104} height={104} />
      <div>
        <strong>{pet.name}</strong>
        <span>{pet.species} · {pet.age}</span>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  detail,
}: {
  title: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="workspace-card metric-card">
      <span>{title}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}

function AdminList({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="workspace-card admin-list">
      <h2>{title}</h2>
      {items.map((item) => (
        <div className="admin-row" key={item}>
          <span>{item}</span>
          <div>
            <button type="button">Valider</button>
            <button type="button">Refuser</button>
          </div>
        </div>
      ))}
    </article>
  );
}
