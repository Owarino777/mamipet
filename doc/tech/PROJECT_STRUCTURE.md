# Structure cible du projet

Le projet doit rester un monorepo Next.js + Supabase, avec une separation nette entre interface, API, application, domaine et infrastructure.

## 1. Arborescence cible

```txt
mamipet/
  doc/
    merise/
    UML/
    references/
    tech/
  public/
  src/
    app/
      api/
        auth/
        me/
        reference-data/
        owner-profile/
        pet-sitter-profile/
        animals/
        pet-sitters/
        reservations/
        payments/
        contracts/
        reviews/
        reports/
        admin/
      (public)/
      (auth)/
      (dashboard)/
    modules/
      identity-access/
      owners/
      animals/
      pet-sitters/
      qualification/
      search/
      reservations/
      payments/
      contracts/
      trust-moderation/
      administration/
    shared/
      application/
      domain/
      errors/
      http/
      validation/
      auth/
      supabase/
      storage/
      testing/
  supabase/
    migrations/
    seeds/
    policies/
  tests/
    unit/
    integration/
    e2e/
  .env.example
  README.md
```

## 2. Regle par module

Chaque module metier peut suivre cette structure :

```txt
modules/reservations/
  domain/
    reservation.entity.ts
    reservation-status.ts
    reservation-errors.ts
    reservation-policy.ts
  application/
    create-reservation.use-case.ts
    accept-reservation.use-case.ts
    refuse-reservation.use-case.ts
    complete-reservation.use-case.ts
    ports/
      reservation-repository.port.ts
      availability-repository.port.ts
  infrastructure/
    supabase-reservation.repository.ts
  presentation/
    reservation.dto.ts
    reservation.mapper.ts
    reservation.schemas.ts
```

## 3. Responsabilites

### `src/app/api`

Contient les Route Handlers REST.

Responsabilites :

- lire params/query/body ;
- verifier la session ;
- valider les payloads ;
- appeler un use case ;
- retourner un DTO ;
- mapper les erreurs en HTTP.

Interdit :

- logique metier lourde ;
- requetes SQL complexes directement dans les handlers ;
- appels Stripe ou Storage directs hors use case/adapter.

### `modules/*/domain`

Contient :

- entites ;
- value objects ;
- statuts ;
- invariants ;
- erreurs metier ;
- policies metier pures.

Ne depend pas de Next.js, Supabase, Stripe ou Google Maps.

### `modules/*/application`

Contient :

- use cases ;
- commandes ;
- queries ;
- ports ;
- orchestration metier.

Peut dependre du domaine et des ports, pas des implementations concretes.

### `modules/*/infrastructure`

Contient :

- repositories Supabase ;
- adapters Stripe ;
- adapters Storage ;
- adapters Maps ;
- implementations techniques.

### `modules/*/presentation`

Contient :

- DTO ;
- mappers ;
- schemas de validation ;
- formats de reponse.

### `shared`

Contient uniquement ce qui est vraiment transversal :

- erreurs communes ;
- helpers HTTP ;
- client Supabase serveur ;
- result types ;
- validation ;
- types de pagination.

## 4. Convention de nommage

- Dossiers : kebab-case.
- Fichiers : kebab-case.
- Classes/types : PascalCase.
- Variables/fonctions : camelCase.
- Routes API : kebab-case ou noms REST standards.
- DTO : suffixe `Dto`.
- Use cases : suffixe `UseCase`.
- Ports : suffixe `Port`.
- Implementations Supabase : prefixe `Supabase`.

## 5. Validation

Chaque endpoint doit avoir un schema de validation.

Validation attendue :

- body ;
- params ;
- query ;
- fichiers ;
- session ;
- role.

## 6. Gestion d'erreurs

Creer des erreurs metier explicites :

- `UnauthorizedError` ;
- `ForbiddenError` ;
- `ValidationError` ;
- `NotFoundError` ;
- `ConflictError` ;
- `InvalidStateTransitionError` ;
- `SensitiveDataAccessError`.

Mapper ensuite :

- 400 : payload invalide ;
- 401 : non connecte ;
- 403 : droit insuffisant ;
- 404 : ressource absente ;
- 409 : conflit metier ;
- 422 : regle metier violee ;
- 500 : erreur inattendue.

## 7. Migrations et SQL

Les migrations Supabase/PostgreSQL vont dans `supabase/migrations`.

Elles doivent contenir :

- tables ;
- contraintes ;
- index ;
- policies RLS ;
- fonctions SQL necessaires ;
- seeds separes si possible.

## 8. Front-ready

Le front ne doit pas consommer les tables brutes. Les endpoints renvoient des DTO stables.

Chaque DTO public doit exclure :

- email ;
- telephone brut ;
- adresse complete ;
- documents ;
- dossier medical ;
- paiement detaille ;
- commentaire admin ;
- signalement.

