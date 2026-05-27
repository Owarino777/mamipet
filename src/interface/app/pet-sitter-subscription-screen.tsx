import Image from "next/image";

type PetSitterSubscriptionScreenProps = {
  onContinueWithoutPlan: () => void;
  onProfessionalPlan: () => void;
};

export function PetSitterSubscriptionScreen(props: PetSitterSubscriptionScreenProps) {
  return (
    <main className="pet-sitter-subscription-screen">
      <section className="pet-sitter-subscription-shell" aria-labelledby="pet-sitter-subscription-title">
        <div className="pet-sitter-subscription-panel">
          <h1 id="pet-sitter-subscription-title">
            <span>Choisi</span>
            <span>ta</span>
            <span>formule...</span>
          </h1>

          <article className="pet-sitter-subscription-card" aria-label="Formule premium">
            <h2>PREMIUM</h2>
            <ul>
              <li>Assurance incluse</li>
              <li>Profil mis en avant</li>
              <li>Service client prioritaire</li>
            </ul>
            <p className="pet-sitter-subscription-price">
              <Image
                alt=""
                aria-hidden="true"
                height={81}
                src="/figma/subscription-price-badge.svg"
                unoptimized
                width={81}
              />
              <span className="pet-sitter-subscription-price-copy">
                <strong>9.99&nbsp;€</strong>
                <span>/mois</span>
              </span>
            </p>
          </article>

          <div className="pet-sitter-subscription-actions">
            <button
              className="pet-sitter-subscription-secondary"
              onClick={props.onContinueWithoutPlan}
              type="button"
            >
              Continuer sans formule
            </button>
            <button
              className="pet-sitter-subscription-primary"
              onClick={props.onProfessionalPlan}
              type="button"
            >
              Je suis professionnel&nbsp;!
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
