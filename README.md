# MamiPet

MamiPet est une marketplace de confiance pour la garde d'animaux. Le projet met en relation des proprietaires avec des pet-sitters qualifies, avec un positionnement fort sur la securite, la verification, les competences et la prise en charge d'animaux sensibles : animaux ages, sous traitement, handicapes, anxieux ou avec besoins specifiques.

La trajectoire du projet distingue clairement :

- le prototype no-code Adalo, utilise pour valider les parcours et la proposition de valeur ;
- la landing page, utilisee pour presenter l'offre et tester l'interet marche ;
- le MVP applicatif reel, construit comme une web app responsive avec API, base relationnelle, securite, paiement test et back-office minimal.

## Stack cible

- Next.js
- React
- TypeScript strict
- REST Route Handlers via `app/api/.../route.ts`
- Supabase Auth
- Supabase PostgreSQL
- Supabase Storage
- Supabase RLS
- Stripe Connect prepare, paiement MVP simule en mode test
- Google Maps API
- Vercel
- GitHub

## Architecture retenue

Le projet suit une approche backend-first :

1. stabiliser le modele metier ;
2. poser les migrations SQL et les policies RLS ;
3. definir les contrats API et DTO ;
4. implementer les use cases critiques ;
5. tester les regles metier ;
6. preparer le front a consommer des contrats stables.

Le repository est pense comme un monorepo propre :

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

Le flux prioritaire a implementer est :

1. le proprietaire cree son compte ;
2. il active son profil proprietaire ;
3. il cree un ou plusieurs animaux ;
4. il recherche un pet-sitter ;
5. il consulte une fiche publique ;
6. il cree une demande de reservation ;
7. le pet-sitter accepte ou refuse ;
8. en cas d'acceptation, le creneau est bloque ;
9. le proprietaire paie en mode test ;
10. le contrat recapitulatif est genere ;
11. la reservation peut etre terminee ;
12. le proprietaire peut deposer un avis.

## Documentation

Toute la documentation est centralisee dans `doc/`.

- `doc/PASSATION_PROJET_MAMIPET.md` : vision fonctionnelle et technique complete.
- `doc/merise/` : MCD, MLD, MPD.
- `doc/UML/` : diagrammes UML.
- `doc/tech/` : architecture, API, DTO, permissions, regles, tests, plan backend.
- `doc/audits/` : audits de conformite.
- `doc/references/` : references normatives, dont UML 2.5.1.

Documents essentiels avant implementation :

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

## Regles fortes

- Le prototype Adalo ne doit pas guider l'architecture finale.
- Le compte utilisateur est distinct des profils metier.
- Un compte peut avoir un profil proprietaire, un profil pet-sitter, ou les deux.
- Les donnees medicales et documents sont prives par defaut.
- Les statuts de reservation et de paiement sont separes.
- Le paiement MVP est simule/test, Stripe Connect reste prepare.
- La commission plateforme MVP est de 15 %.
- Le front consomme des DTO, jamais les tables brutes.
- Toute securite doit etre portee cote backend, SQL/RLS et services serveur.

## Initialisation future

Lorsque le code applicatif sera initialise, ajouter :

- `.env.example` ;
- configuration Next.js ;
- configuration Supabase ;
- migrations ;
- seeds ;
- scripts `typecheck`, `lint`, `test`, `build` ;
- pipeline CI minimal.

## Maintenance documentaire

Apres chaque modification importante, verifier si la documentation doit etre mise a jour.

Si rien n'a besoin d'etre documente, le compte rendu de travail doit l'indiquer explicitement.

