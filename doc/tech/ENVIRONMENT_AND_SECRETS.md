# Environnement et secrets

Pour l'application et le blog, les variables publiques Supabase et `NEXT_PUBLIC_APP_URL` suffisent au démarrage ; aucune clé service rôle n’est utilisée par les Route Handlers. `SUPABASE_DB_URL` sert aux migrations sur une base de test. Le bucket `blog-images` est public et réservé aux images éditoriales. Configurer `/auth/callback` dans les URL autorisées de Supabase Auth pour la récupération du mot de passe. Voir [BLOG.md](BLOG.md). Les paramètres Stripe/Google Maps ci-dessous appartiennent à la cible historique : le paiement est fermé et la carte actuelle utilise MapLibre/OpenFreeMap.

Ce document liste les variables et règles de gestion des secrets pour le MVP MamiPet.

## 1. Environnements

Environnements ciblés :

- `local` : développement ;
- `preview` : demonstration/preproduction Vercel ;
- `production` : cible future.

Chaque environnement doit avoir :

- projet Supabase ou configuration séparée ;
- clés API dediees ;
- buckets Storage séparés ;
- webhooks Stripe dedies ;
- variables Vercel dediees.

## 2. Fichier `.env.example`

```env
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
APP_ENV=local
# Production: required. Local dev only: local_bypass.
NEXT_PUBLIC_AUTH_EMAIL_VERIFICATION_MODE=required

# Supabase public client
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

# Supabase server-side
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SECRET=

# Stripe test
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_CONNECT_CLIENT_ID=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
PAYMENT_MODE=simulated_stripe_connect

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
GOOGLE_MAPS_SERVER_API_KEY=

# Storage buckets
SUPABASE_BUCKET_ANIMAL_DOCUMENTS=animal-documents
SUPABASE_BUCKET_PROFESSIONAL_DOCUMENTS=professional-documents
SUPABASE_BUCKET_CONTRACTS=contracts

# Security
ADMIN_BOOTSTRAP_EMAIL=
```

## 3. Règles de secrets

- Ne jamais committer `.env.local`.
- Ne jamais exposer `SUPABASE_SERVICE_ROLE_KEY` au client.
- Ne jamais exposer `STRIPE_SECRET_KEY`.
- Utiliser uniquement les variables `NEXT_PUBLIC_*` pour ce qui est volontairement public.
- Les webhooks Stripe doivent vérifier leur signature.
- Les logs ne doivent pas contenir de documents, données médicales ou secrets.

## 4. Supabase

### Auth

MVP :

- email/mot de passe ;
- pas d'OAuth au depart ;
- compte applicatif lie a `auth.users.id`.

En local, le parcours d'inscription peut bypasser l'attente de confirmation
email avec `NEXT_PUBLIC_AUTH_EMAIL_VERIFICATION_MODE=local_bypass`.
Ce bypass est ignore en build production (`NODE_ENV=production`) et ne doit
jamais etre active sur preview ou production.

Nettoyage des utilisateurs de test :

```bash
npm run db:clean:test-users -- --email-like="%@example.test"
npm run db:clean:test-users -- --email-like="%@example.test" --execute --confirm=mamipet-test-clean
```

Le premier appel est un dry-run. Le second supprime les comptes Auth Supabase
correspondants avec leurs donnees applicatives cascadees.

### PostgreSQL

Obligatoire :

- RLS activee sur les tables sensibles ;
- policies par rôle et ownership ;
- vues ou RPC publiques pour la recherche si utile ;
- index sur les champs de recherche.

### Storage

Buckets :

- `animal-documents` : documents médicaux ou animaux, privé ;
- `professional-documents` : justificatifs pet-sitters, privé ;
- `contracts` : récapitulatif contractuel, privé.

Accès public interdit par défaut.

## 5. Stripe

Les routes Checkout répondent actuellement `409`. Une redirection de retour ne valide aucun paiement. `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_CONNECT_CLIENT_ID`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` et `PAYMENT_MODE` dans `.env.example` sont des emplacements réservés à la future intégration, pas des prérequis de démarrage. La simulation visible dans certains écrans reste locale. Avant toute activation : définir les comptes Connect et les conditions de versement, vérifier les webhooks signés, gérer les événements idempotents et tester les remboursements. Voir [ADR 003](ADR_003_CONSOLIDATION_JALON_3.md).

Statuts paiement :

- `pending` ;
- `succeeded` ;
- `failed` ;
- `refunded` ;
- `partially_refunded` ;
- `expired`.

## 6. Google Maps

Utilisation :

- geocodage ;
- carte ;
- distance.

Regle de confidentialite :

- coordonnées exactes stockees privées ;
- affichage public limité a ville/zone approximative.

## 7. Vercel

Variables a configurer dans :

- local `.env.local` ;
- preview ;
- production.

Build minimal :

- typecheck ;
- lint ;
- tests ;
- build.
