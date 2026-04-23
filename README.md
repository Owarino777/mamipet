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

Lorsque le code applicatif sera initialisé, ajouter :

- `.env.example` ;
- configuration Next.js ;
- configuration Supabase ;
- migrations ;
- seeds ;
- scripts `typecheck`, `lint`, `test`, `build` ;
- pipeline CI minimal.

## Maintenance documentaire

Après chaque modification importante, vérifier si la documentation doit être mise à jour.

Si rien n'a besoin d'être documenté, le compte rendu de travail doit l'indiquer explicitement.

