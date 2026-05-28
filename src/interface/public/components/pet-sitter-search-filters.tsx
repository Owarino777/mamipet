import type {
  SearchNeed,
  SearchSpecies,
} from "@/interface/public/hooks/use-pet-sitter-search";

type PetSitterSearchFiltersProps = {
  city: string;
  species: SearchSpecies;
  need: SearchNeed;
  activeQuickFilters: string[];
  quickFilters: Array<{ code: string; label: string }>;
  onCityChange: (city: string) => void;
  onSpeciesChange: (species: SearchSpecies) => void;
  onNeedChange: (need: SearchNeed) => void;
  onQuickFilterToggle: (filterCode: string) => void;
  onSearchSubmit: () => void;
};

export function PetSitterSearchFilters({
  activeQuickFilters,
  city,
  need,
  quickFilters,
  species,
  onCityChange,
  onNeedChange,
  onQuickFilterToggle,
  onSearchSubmit,
  onSpeciesChange,
}: PetSitterSearchFiltersProps) {
  return (
    <section className="search-bar-panel" aria-label="Critères de recherche">
      <label>
        Lieu
        <input
          value={city}
          onChange={(event) => onCityChange(event.target.value)}
          placeholder="Ex. Caen"
        />
      </label>
      <label>
        Dates
        <input type="date" />
      </label>
      <label>
        Espèce
        <select
          value={species}
          onChange={(event) => onSpeciesChange(event.target.value as SearchSpecies)}
        >
          <option value="all">Toutes les espèces</option>
          <option value="dog">Chien</option>
          <option value="cat">Chat</option>
          <option value="rabbit">Lapin</option>
          <option value="bird">Oiseau</option>
          <option value="small_pet">Petit mammifère</option>
        </select>
      </label>
      <label>
        Besoin
        <select
          value={need}
          onChange={(event) => onNeedChange(event.target.value as SearchNeed)}
        >
          <option value="all">Tous les besoins</option>
          <option value="senior">Animal âgé</option>
          <option value="medication">Sous traitement</option>
          <option value="anxious">Anxieux</option>
          <option value="monitoring">Surveillance renforcée</option>
        </select>
      </label>
      <button className="primary-button" type="button" onClick={onSearchSubmit}>
        Rechercher
      </button>
      <div className="search-chip-row" id="filters" aria-label="Filtres rapides">
        {quickFilters.map((filter) => (
          <FilterChip
            active={activeQuickFilters.includes(filter.code)}
            key={filter.code}
            label={filter.label}
            onClick={() => onQuickFilterToggle(filter.code)}
          />
        ))}
      </div>
    </section>
  );
}

function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={active ? "filter-chip filter-chip--active" : "filter-chip"}
      type="button"
      onClick={onClick}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}
