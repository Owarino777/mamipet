# Décision d'architecture

## 1. Décision retenue

Le MVP applicatif MamiPet est implémenté dans un seul repository avec :

- Next.js ;
- React ;
- TypeScript strict ;
- Route Handlers REST dans `app/api/.../route.ts` ;
- Server Actions uniquement si utiles pour des interactions UI internes ;
- Supabase Auth ;
- Supabase PostgreSQL ;
- Supabase Storage ;
- policies RLS ;
- Stripe Connect préparé dans le modèle, paiement MVP simulé/test ;
- Google Maps API pour géolocalisation ;
- Vercel pour déploiement ;
- GitHub pour versionnement et CI.

Le backend est développé en approche backend-first. Le front doit pouvoir se brancher sur des contrats REST stables et documentes.

## 2. Pourquoi un monorepo

Un monorepo est retenu pour le MVP car :

- le front n'est pas encore finalise ;
- les contrats API et DTO doivent évoluer rapidement ;
- la même personne ou IA peut maintenir documentation, migrations, API et intégration ;
- le déploiement Vercel est plus simple ;
- Supabase porte déjà une partie importante du backend : Auth, DB, RLS, Storage ;
- extraire une API séparée maintenant augmenterait la charge sans benefice immediat.

Une séparation future reste possible si :

- le backend sert plusieurs clients externes ;
- une équipe backend séparée apparait ;
- le domaine devient trop volumineux pour Next.js seul ;
- une API publique versionnee devient un produit en soi.

## 3. Pourquoi Next.js pour le backend MVP

Next.js est retenu car il permet :

- une web app responsive ;
- des endpoints REST via Route Handlers ;
- une intégration naturelle avec React ;
- un déploiement simple sur Vercel ;
- une bonne intégration Supabase SSR ;
- une architecture modulaire TypeScript propre si elle est disciplinee.

Limite connue : Next.js ne doit pas devenir un amas de routes contenant toute la logique métier. Pour éviter cela, les routes appellent des use cases.

## 4. Pourquoi Supabase

Supabase est retenu pour :

- Auth email/mot de passe ;
- PostgreSQL relationnel ;
- RLS pour la sécurité des données ;
- Storage pour documents et contrats ;
- rapidite de mise en place ;
- compatibilite avec le modèle relationnel MamiPet.

Regle importante : le schéma applicatif ne stocké pas les mots de passe. `account.id` référence l'utilisateur Supabase Auth.

## 5. Pourquoi REST

REST est retenu comme contrat principal car :

- comprehensible par l'équipe ;
- facile a tester ;
- facile a documenter ;
- compatible avec front web et future app mobile ;
- stable pour brancher une interface plus tard.

Les Server Actions peuvent être utilisees pour simplifier certains formulaires internes Next.js, mais elles ne remplacent pas les contrats API documentes.

## 6. Stripe Connect

Stripe Connect est préparé dans le modèle, mais le MVP implémenté une simulation de paiement en mode test.

Objectif :

- valider le flux métier réservation -> paiement -> contrat ;
- éviter la complexite complète d'onboarding Stripe Connect au debut ;
- garder les champs et adapters permettant de remplacer la simulation par une intégration Connect plus tard.

## 7. Langue et conventions

- Documentation métier : français.
- Code, dossiers, routes API, DTO : anglais.
- Statuts techniques API : anglais.
- Le mapping avec les statuts métier français doit rester documenté.

## 8. Non-objectifs MVP

Ne pas implémenter completement au premier backend :

- messagerie complète ;
- notifications push avancées ;
- demandes publiques de garde ;
- onboarding Stripe Connect complet ;
- dashboards statistiques avancés ;
- application mobile native ;
- moteur d'assurance complexe.

## 9. Décision review

Cette décision pourra être revue après le MVP si :

- les besoins API depassent fortement les Route Handlers ;
- les règles métier deviennent trop nombreuses ;
- une équipe backend dediee prend le relais ;
- la plateforme doit exposer une API publique externe.

