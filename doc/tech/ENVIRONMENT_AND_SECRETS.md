# Environnement et secrets

Ce document liste les variables et regles de gestion des secrets pour le MVP MamiPet.

## 1. Environnements

Environnements cibles :

- `local` : developpement ;
- `preview` : demonstration/preproduction Vercel ;
- `production` : cible future.

Chaque environnement doit avoir :

- projet Supabase ou configuration separee ;
- cles API dediees ;
- buckets Storage separes ;
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

## 3. Regles de secrets

- Ne jamais committer `.env.local`.
- Ne jamais exposer `SUPABASE_SERVICE_ROLE_KEY` au client.
- Ne jamais exposer `STRIPE_SECRET_KEY`.
- Utiliser uniquement les variables `NEXT_PUBLIC_*` pour ce qui est volontairement public.
- Les webhooks Stripe doivent verifier leur signature.
- Les logs ne doivent pas contenir de documents, donnees medicales ou secrets.

## 4. Supabase

### Auth

MVP :

- email/mot de passe ;
- pas d'OAuth au depart ;
- compte applicatif lie a `auth.users.id`.

### PostgreSQL

Obligatoire :

- RLS activee sur les tables sensibles ;
- policies par role et ownership ;
- vues ou RPC publiques pour la recherche si utile ;
- index sur les champs de recherche.

### Storage

Buckets :

- `animal-documents` : documents medicaux ou animaux, prive ;
- `professional-documents` : justificatifs pet-sitters, prive ;
- `contracts` : recapitulatif contractuel, prive.

Acces public interdit par defaut.

## 5. Stripe

MVP :

- paiement test ;
- Stripe Connect prepare ;
- onboarding Connect complet non prioritaire ;
- les references Stripe sont stockees mais le flux peut etre simule.

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

- coordonnees exactes stockees privees ;
- affichage public limite a ville/zone approximative.

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

