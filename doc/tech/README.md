# Documentation technique MamiPet

Ce dossier contient les documents a lire avant d'implementer le backend MamiPet.

Les decisions retenues sont les suivantes :

- monorepo unique ;
- Next.js + TypeScript pour l'application web, les Route Handlers REST et l'orchestration serveur ;
- Supabase pour Auth, PostgreSQL, Storage et RLS ;
- API REST via `app/api/.../route.ts` pour fournir des contrats stables au front ;
- Server Actions autorisees uniquement pour des besoins UI internes, jamais comme contrat principal ;
- Stripe Connect prepare dans le modele, paiement MVP simule en mode test ;
- code, routes API, DTO et noms techniques en anglais ;
- documentation metier en francais.

## Fichiers

- `ENGINEERING_PRINCIPLES.md` : principes de qualite obligatoires.
- `ARCHITECTURE_DECISION.md` : decisions d'architecture.
- `PROJECT_STRUCTURE.md` : structure cible du projet.
- `API_CONTRACTS.md` : endpoints REST attendus.
- `openapi.yaml` : contrat API REST machine-readable.
- `DTO_CONTRACTS.md` : formats de donnees front-ready.
- `ACCESS_CONTROL_MATRIX.md` : droits par role.
- `DOMAIN_RULES.md` : regles metier numerotees.
- `TEST_STRATEGY.md` : strategie de tests.
- `ENVIRONMENT_AND_SECRETS.md` : variables et secrets.
- `BACKEND_IMPLEMENTATION_PLAN.md` : ordre d'implementation.

## Regle de maintenance documentaire

Apres chaque modification importante du backend, verifier si l'un de ces documents doit etre mis a jour. Si rien n'est a documenter, l'indiquer explicitement dans le compte rendu.
