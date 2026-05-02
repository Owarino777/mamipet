# MamiPet

MamiPet est une marketplace de confiance pour la garde d'animaux. Le projet met en relation des propriétaires avec des pet-sitters qualifiés, avec un positionnement fort sur la sécurité, la vérification, les compétences et la prise en charge d'animaux sensibles : animaux âgés, sous traitement, handicapés, anxieux ou avec besoins spécifiques.

La trajectoire du projet distingue clairement :

- le prototype no-code Adalo, utilisé pour valider les parcours et la proposition de valeur ;
- la landing page, utilisée pour présenter l'offre et tester l'intérêt marché ;
- le MVP applicatif réel, construit comme une web app responsive avec API, base relationnelle, sécurité, paiement test et back-office minimal.

## Stack cible

- Next.js
- React
- TypeScript strict
- REST Route Handlers via `app/api/.../route.ts`
- Supabase Auth
- Supabase PostgreSQL
- Supabase Storage
- Supabase RLS
- Stripe Connect préparé, paiement MVP simulé en mode test
- Google Maps API
- Vercel
- GitHub

## Architecture retenue

Le projet suit une approche backend-first :

1. stabiliser le modèle métier ;
2. poser les migrations SQL et les policies RLS ;
3. définir les contrats API et DTO ;
4. implémenter les use cases critiques ;
5. tester les règles métier ;
6. préparer le front à consommer des contrats stables.

Le repository est pensé comme un monorepo propre :

```txt
mamipet/
  doc/
  public/
  src/
    app/
    modules/
    shared/
  supabase/
    migrations/
    seeds/
    policies/
  tests/
```

## Flux critique MVP

Le flux prioritaire à implémenter est :

1. le propriétaire crée son compte ;
2. il active son profil propriétaire ;
3. il crée un ou plusieurs animaux ;
4. il recherche un pet-sitter ;
5. il consulte une fiche publique ;
6. il crée une demande de réservation ;
7. le pet-sitter accepte ou refuse ;
8. en cas d'acceptation, le créneau est bloqué ;
9. le propriétaire paie en mode test ;
10. le contrat récapitulatif est généré ;
11. la réservation peut être terminée ;
12. le propriétaire peut déposer un avis.

## État backend actuel

Implémenté :

- socle Next.js + TypeScript strict ;
- clients Supabase SSR/browser et middleware de rafraîchissement de session ;
- `/api/health` ;
- `/api/me` avec synchronisation du compte applicatif ;
- création, lecture et modification des profils owner et pet-sitter ;
- endpoints publics de référentiels ;
- CRUD animaux propriétaire ;
- upsert du dossier médical propriétaire ;
- offre pet-sitter : espèces, capacités, lieux, formats et services ;
- recherche publique des pet-sitters visibles ;
- réservation directe propriétaire vers pet-sitter ;
- acceptation, refus, annulation, blocage de créneau ;
- paiement MVP simulé et génération de récapitulatif contractuel ;
- avis après réservation terminée ;
- réponse du pet-sitter à un avis ;
- signalements généraux ou ciblés ;
- back-office admin minimal : profils pet-sitters, documents pros, badges, réservations, paiements, signalements ;
- migrations Supabase initiales, policies RLS MVP et seeds référentiels ;
- règles domaine unitaires pour réservation, paiement, qualification, avis et signalement.

Configuration locale :

- copier `.env.example` vers `.env.local` ;
- renseigner `NEXT_PUBLIC_SUPABASE_URL` ;
- renseigner `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` ;
- appliquer `supabase/migrations/202605020001_initial_schema.sql` sur le projet Supabase ;
- appliquer `supabase/migrations/202605020002_pet_sitter_offer_access.sql` ;
- appliquer `supabase/migrations/202605020003_reservation_flow_access.sql` ;
- appliquer `supabase/migrations/202605020004_trust_admin_access.sql` ;
- exécuter `supabase/seeds/001_reference_data.sql`.

À faire ensuite :

- documents Storage réels ;
- Stripe Connect réel après la simulation MVP ;
- Google Maps côté recherche ;
- tests d'intégration authentifiés sur Supabase.

## Routes API MVP

Routes publiques :

- `GET /api/health`
- `GET /api/reference-data/species`
- `GET /api/reference-data/care-capabilities`
- `GET /api/reference-data/care-locations`
- `GET /api/reference-data/care-formats`
- `GET /api/reference-data/additional-services`
- `GET /api/reference-data/public-badges`
- `GET /api/pet-sitters`
- `GET /api/pet-sitters/{petSitterId}`

Routes authentifiées :

- `GET /api/me`
- `POST /api/profiles/owner`
- `GET /api/profiles/owner/me`
- `PATCH /api/profiles/owner/me`
- `POST /api/profiles/pet-sitter`
- `GET /api/profiles/pet-sitter/me`
- `PATCH /api/profiles/pet-sitter/me`
- `GET /api/profiles/pet-sitter/me/offer`
- `PUT /api/profiles/pet-sitter/me/offer`
- `GET /api/animals`
- `POST /api/animals`
- `GET /api/animals/{animalId}`
- `PATCH /api/animals/{animalId}`
- `DELETE /api/animals/{animalId}`
- `PUT /api/animals/{animalId}/medical-record`
- `GET /api/reservations`
- `POST /api/reservations`
- `PATCH /api/reservations/{reservationId}/accept`
- `PATCH /api/reservations/{reservationId}/refuse`
- `PATCH /api/reservations/{reservationId}/cancel`
- `PATCH /api/reservations/{reservationId}/complete`
- `POST /api/reservations/{reservationId}/pay`
- `POST /api/reservations/{reservationId}/review`
- `PATCH /api/reviews/{reviewId}/reply`
- `POST /api/reports`
- `GET /api/reports/me`

Routes admin :

- `GET /api/admin/pet-sitter-profiles`
- `PATCH /api/admin/pet-sitter-profiles/{profileId}/verification-status`
- `POST /api/admin/pet-sitter-profiles/{profileId}/badges`
- `DELETE /api/admin/pet-sitter-profiles/{profileId}/badges/{badgeId}`
- `GET /api/admin/professional-documents`
- `POST /api/admin/professional-documents/{documentId}/validate`
- `POST /api/admin/professional-documents/{documentId}/reject`
- `GET /api/admin/reservations`
- `GET /api/admin/payments`
- `GET /api/admin/reports`
- `PATCH /api/admin/reports/{reportId}`

## Documentation

Toute la documentation est centralisée dans `doc/`.

- `doc/PASSATION_PROJET_MAMIPET.md` : vision fonctionnelle et technique complète.
- `doc/merise/` : MCD, MLD, MPD.
- `doc/UML/` : diagrammes UML.
- `doc/tech/` : architecture, API, DTO, permissions, règles, tests, plan backend.
- `doc/audits/` : audits de conformité.
- `doc/references/` : références normatives, dont UML 2.5.1.

Documents essentiels avant implémentation :

- `doc/tech/ENGINEERING_PRINCIPLES.md`
- `doc/tech/ARCHITECTURE_DECISION.md`
- `doc/tech/PROJECT_STRUCTURE.md`
- `doc/tech/API_CONTRACTS.md`
- `doc/tech/openapi.yaml`
- `doc/tech/DTO_CONTRACTS.md`
- `doc/tech/ACCESS_CONTROL_MATRIX.md`
- `doc/tech/DOMAIN_RULES.md`
- `doc/tech/TEST_STRATEGY.md`
- `doc/tech/ENVIRONMENT_AND_SECRETS.md`
- `doc/tech/BACKEND_IMPLEMENTATION_PLAN.md`

## Règles fortes

- Le prototype Adalo ne doit pas guider l'architecture finale.
- Le compte utilisateur est distinct des profils métier.
- Un compte peut avoir un profil propriétaire, un profil pet-sitter, ou les deux.
- Les données médicales et documents sont privés par défaut.
- Les statuts de réservation et de paiement sont séparés.
- Le paiement MVP est simulé/test, Stripe Connect reste préparé.
- La commission plateforme MVP est de 15 %.
- Le front consomme des DTO, jamais les tables brutes.
- Toute sécurité doit être portée côté backend, SQL/RLS et services serveur.

## Initialisation future

Le socle applicatif est initialisé avec Next.js, TypeScript strict, Vitest,
une première migration Supabase et les scripts qualité.

Commandes utiles :

```bash
npm install
npm run dev
npm run typecheck
npm run lint
npm test
npm run build
```

À finaliser ensuite :

- pipeline CI minimal ;
- routes documents Storage réels ;
- routes disponibilités manuelles pet-sitter ;
- tests d'intégration authentifiés avec comptes Supabase de démonstration.

## Maintenance documentaire

Après chaque modification importante, vérifier si la documentation doit être mise à jour.

Si rien n'a besoin d'être documenté, le compte rendu de travail doit l'indiquer explicitement.
