# Decision d'architecture

## 1. Decision retenue

Le MVP applicatif MamiPet est implemente dans un seul repository avec :

- Next.js ;
- React ;
- TypeScript strict ;
- Route Handlers REST dans `app/api/.../route.ts` ;
- Server Actions uniquement si utiles pour des interactions UI internes ;
- Supabase Auth ;
- Supabase PostgreSQL ;
- Supabase Storage ;
- policies RLS ;
- Stripe Connect prepare dans le modele, paiement MVP simule/test ;
- Google Maps API pour geolocalisation ;
- Vercel pour deploiement ;
- GitHub pour versionnement et CI.

Le backend est developpe en approche backend-first. Le front doit pouvoir se brancher sur des contrats REST stables et documentes.

## 2. Pourquoi un monorepo

Un monorepo est retenu pour le MVP car :

- le front n'est pas encore finalise ;
- les contrats API et DTO doivent evoluer rapidement ;
- la meme personne ou IA peut maintenir documentation, migrations, API et integration ;
- le deploiement Vercel est plus simple ;
- Supabase porte deja une partie importante du backend : Auth, DB, RLS, Storage ;
- extraire une API separee maintenant augmenterait la charge sans benefice immediat.

Une separation future reste possible si :

- le backend sert plusieurs clients externes ;
- une equipe backend separee apparait ;
- le domaine devient trop volumineux pour Next.js seul ;
- une API publique versionnee devient un produit en soi.

## 3. Pourquoi Next.js pour le backend MVP

Next.js est retenu car il permet :

- une web app responsive ;
- des endpoints REST via Route Handlers ;
- une integration naturelle avec React ;
- un deploiement simple sur Vercel ;
- une bonne integration Supabase SSR ;
- une architecture modulaire TypeScript propre si elle est disciplinee.

Limite connue : Next.js ne doit pas devenir un amas de routes contenant toute la logique metier. Pour eviter cela, les routes appellent des use cases.

## 4. Pourquoi Supabase

Supabase est retenu pour :

- Auth email/mot de passe ;
- PostgreSQL relationnel ;
- RLS pour la securite des donnees ;
- Storage pour documents et contrats ;
- rapidite de mise en place ;
- compatibilite avec le modele relationnel MamiPet.

Regle importante : le schema applicatif ne stocke pas les mots de passe. `account.id` reference l'utilisateur Supabase Auth.

## 5. Pourquoi REST

REST est retenu comme contrat principal car :

- comprehensible par l'equipe ;
- facile a tester ;
- facile a documenter ;
- compatible avec front web et future app mobile ;
- stable pour brancher une interface plus tard.

Les Server Actions peuvent etre utilisees pour simplifier certains formulaires internes Next.js, mais elles ne remplacent pas les contrats API documentes.

## 6. Stripe Connect

Stripe Connect est prepare dans le modele, mais le MVP implemente une simulation de paiement en mode test.

Objectif :

- valider le flux metier reservation -> paiement -> contrat ;
- eviter la complexite complete d'onboarding Stripe Connect au debut ;
- garder les champs et adapters permettant de remplacer la simulation par une integration Connect plus tard.

## 7. Langue et conventions

- Documentation metier : francais.
- Code, dossiers, routes API, DTO : anglais.
- Statuts techniques API : anglais.
- Le mapping avec les statuts metier francais doit rester documente.

## 8. Non-objectifs MVP

Ne pas implementer completement au premier backend :

- messagerie complete ;
- notifications push avancees ;
- demandes publiques de garde ;
- onboarding Stripe Connect complet ;
- dashboards statistiques avances ;
- application mobile native ;
- moteur d'assurance complexe.

## 9. Decision review

Cette decision pourra etre revue apres le MVP si :

- les besoins API depassent fortement les Route Handlers ;
- les regles metier deviennent trop nombreuses ;
- une equipe backend dediee prend le relais ;
- la plateforme doit exposer une API publique externe.

