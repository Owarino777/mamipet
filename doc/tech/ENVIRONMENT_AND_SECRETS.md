# Environnement et secrets

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

MVP :

- paiement test ;
- Stripe Connect préparé ;
- onboarding Connect complet non prioritaire ;
- les références Stripe sont stockees mais le flux peut être simulé.

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

