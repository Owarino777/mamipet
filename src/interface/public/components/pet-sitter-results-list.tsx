import { PublicPetSitterCard } from "@/interface/shared/product-ui";
import type { PublicPetSitter } from "@/interface/shared/product-data";

type PetSitterResultsListProps = {
  isLoading: boolean;
  petSitters: PublicPetSitter[];
  selectedPetSitterId: string | null;
  onPetSitterFocus: (petSitterId: string | null) => void;
};

export function PetSitterResultsList({
  isLoading,
  petSitters,
  selectedPetSitterId,
  onPetSitterFocus,
}: PetSitterResultsListProps) {
  return (
    <div className="results-grid">
      {isLoading ? <SearchResultSkeletonGrid /> : null}
      {!isLoading
        ? petSitters.map((petSitter) => (
            <div
              className={
                selectedPetSitterId === petSitter.id
                  ? "result-card-shell result-card-shell--active"
                  : "result-card-shell"
              }
              key={petSitter.id}
              onMouseEnter={() => onPetSitterFocus(petSitter.id)}
              onMouseLeave={() => onPetSitterFocus(null)}
              onFocus={() => onPetSitterFocus(petSitter.id)}
            >
              <PublicPetSitterCard petSitter={petSitter} layout="list" />
            </div>
          ))
        : null}
      {!isLoading && petSitters.length === 0 ? (
        <article className="empty-results-card">
          <h2>Aucun profil dans cette zone</h2>
          <p>
            Déplacez la carte, ajustez les filtres ou revenez sur une ville
            où des pet-sitters sont disponibles.
          </p>
        </article>
      ) : null}
    </div>
  );
}

function SearchResultSkeletonGrid() {
  return (
    <>
      {Array.from({ length: 6 }, (_, index) => (
        <article className="sitter-card sitter-card--skeleton" key={index}>
          <span className="skeleton-block skeleton-image" />
          <div className="skeleton-content">
            <span className="skeleton-line skeleton-line--strong" />
            <span className="skeleton-line" />
            <span className="skeleton-line skeleton-line--short" />
            <span className="skeleton-pill-row" />
            <span className="skeleton-line skeleton-line--price" />
          </div>
        </article>
      ))}
    </>
  );
}
