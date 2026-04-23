# Documentation technique MamiPet

Ce dossier contient les documents a lire avant d'implémenter le backend MamiPet.

Les décisions retenues sont les suivantes :

- monorepo unique ;
- Next.js + TypeScript pour l'application web, les Route Handlers REST et l'orchestration serveur ;
- Supabase pour Auth, PostgreSQL, Storage et RLS ;
- API REST via `app/api/.../route.ts` pour fournir des contrats stables au front ;
- Server Actions autorisées uniquement pour des besoins UI internes, jamais comme contrat principal ;
- Stripe Connect préparé dans le modèle, paiement MVP simulé en mode test ;
- code, routes API, DTO et noms techniques en anglais ;
- documentation métier en français.

## Fichiers

- `ENGINEERING_PRINCIPLES.md` : principes de qualité obligatoires.
- `ARCHITECTURE_DECISION.md` : décisions d'architecture.
- `PROJECT_STRUCTURE.md` : structure cible du projet.
- `API_CONTRACTS.md` : endpoints REST attendus.
- `openapi.yaml` : contrat API REST machine-readable.
- `DTO_CONTRACTS.md` : formats de données front-ready.
- `ACCESS_CONTROL_MATRIX.md` : droits par rôle.
- `DOMAIN_RULES.md` : règles métier numerotees.
- `TEST_STRATEGY.md` : stratégie de tests.
- `ENVIRONMENT_AND_SECRETS.md` : variables et secrets.
- `BACKEND_IMPLEMENTATION_PLAN.md` : ordre d'implémentation.

## Regle de maintenance documentaire

Après chaque modification importante du backend, vérifier si l'un de ces documents doit être mis à jour. Si rien n'est a documenter, l'indiquer explicitement dans le compte rendu.
