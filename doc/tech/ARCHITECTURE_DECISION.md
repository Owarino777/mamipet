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
- MapLibre GL JS + OpenFreeMap pour la carte gratuite du MVP local et de démonstration ;
- Google Maps API reste une option cible réactivable si une clé et un budget provider sont validés ;
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

## 10. Décision cartographie MVP

La documentation initiale cible Google Maps API pour la géolocalisation et la carte. Pour le MVP local et la démonstration, la décision retenue est toutefois :

- utiliser MapLibre GL JS pour le rendu WebGL ;
- utiliser OpenFreeMap comme provider gratuit sans clé API ;
- ne pas bloquer l'expérience sur une clé Google Maps ou un compte de facturation ;
- conserver l'attribution visible ;
- ne pas exposer d'adresse complète ni de coordonnées exactes dans la recherche publique ;
- arrondir les coordonnées publiques avant exposition DTO ;
- garder Google Maps comme option future si les contraintes business, budget, SLA ou géocodage l'imposent.

Cette décision répond à la contrainte MVP : produire une carte fluide, gratuite, exploitable en démonstration, sans dépendre d'un service payant.

## 7.11 Découpage projet : epics, user stories et backlog initial

Le développement reste aligné sur le découpage fonctionnel retenu, structuré en epics puis décliné en user stories.

### Epic 1 - Authentification et rôles

- En tant qu'utilisateur, je peux créer un compte.
- En tant qu'utilisateur, je peux me connecter.
- En tant qu'utilisateur, je peux activer un rôle owner.
- En tant qu'utilisateur, je peux activer un rôle pet-sitter.
- En tant qu'administrateur, je peux distinguer les droits associés à chaque rôle.

### Epic 2 - Gestion propriétaire et animaux

- En tant que propriétaire, je peux compléter mon profil.
- En tant que propriétaire, je peux créer plusieurs animaux.
- En tant que propriétaire, je peux renseigner les besoins spécifiques d'un animal.
- En tant que propriétaire, je peux joindre des documents à un animal.

### Epic 3 - Gestion pet-sitter

- En tant que pet-sitter, je peux créer mon profil public.
- En tant que pet-sitter, je peux définir mes espèces acceptées.
- En tant que pet-sitter, je peux définir mes capacités de soin.
- En tant que pet-sitter, je peux renseigner mon périmètre.
- En tant que pet-sitter, je peux déclarer mes disponibilités.
- En tant que pet-sitter, je peux déposer des justificatifs professionnels.

### Epic 4 - Vérification et badges

- En tant qu'administrateur, je peux valider l'identité d'un pet-sitter.
- En tant qu'administrateur, je peux valider ou rejeter un document professionnel.
- En tant que système, je peux afficher les badges publics pertinents.
- En tant que système, je peux empêcher certains profils non validés d'apparaître sur les besoins sensibles.

### Epic 5 - Recherche et découverte

- En tant que visiteur, je peux consulter une carte de pet-sitters.
- En tant que propriétaire, je peux filtrer les résultats selon mes besoins.
- En tant que propriétaire, je peux consulter une fiche pet-sitter détaillée.

### Epic 6 - Réservation directe

- En tant que propriétaire, je peux créer une demande de réservation.
- En tant que pet-sitter, je peux accepter ou refuser une demande.
- En tant que système, je peux bloquer un créneau accepté.
- En tant que propriétaire, je peux payer une réservation en mode test.
- En tant que système, je peux générer un récapitulatif contractuel.

### Epic 7 - Confiance et administration

- En tant qu'administrateur, je peux consulter les réservations.
- En tant qu'administrateur, je peux consulter les paiements.
- En tant que propriétaire, je peux laisser un avis après la prestation.
- En tant qu'utilisateur, je peux signaler un contenu ou un incident.
- En tant qu'administrateur, je peux traiter un ticket.

### Epic 8 - Évolutions préparées

- En tant que propriétaire, je pourrai publier une demande publique de garde.
- En tant que pet-sitter, je pourrai répondre à cette demande.
- En tant que système, je pourrai gérer une modération enrichie.
- En tant que système, je pourrai envoyer des notifications.

### Backlog initial priorisé (MVP)

#### Sprint 0 - Fondations techniques

- US-01 (Epic 1) : création de compte.
- US-02 (Epic 1) : connexion.
- US-03 (Epic 1) : activation rôle owner.
- US-04 (Epic 1) : activation rôle pet-sitter.
- US-05 (Epic 1) : distinction des droits par rôle côté administration.

#### Sprint 1 - Owner et animaux

- US-06 (Epic 2) : profil propriétaire.
- US-07 (Epic 2) : création de plusieurs animaux.
- US-08 (Epic 2) : besoins spécifiques par animal.
- US-09 (Epic 2) : dépôt de documents animal.

#### Sprint 2 - Profil pet-sitter

- US-10 (Epic 3) : profil public pet-sitter.
- US-11 (Epic 3) : espèces acceptées.
- US-12 (Epic 3) : capacités de soin.
- US-13 (Epic 3) : périmètre d'intervention.
- US-14 (Epic 3) : disponibilités.
- US-15 (Epic 3) : justificatifs professionnels.

#### Sprint 3 - Confiance et visibilité publique

- US-16 (Epic 4) : validation d'identité pet-sitter.
- US-17 (Epic 4) : validation/rejet document professionnel.
- US-18 (Epic 4) : affichage des badges publics.
- US-19 (Epic 4) : filtrage des profils non validés pour besoins sensibles.
- US-20 (Epic 5) : carte publique des pet-sitters.
- US-21 (Epic 5) : filtres de recherche.
- US-22 (Epic 5) : fiche pet-sitter détaillée.

#### Sprint 4 - Réservation directe

- US-23 (Epic 6) : création de demande de réservation.
- US-24 (Epic 6) : acceptation/refus côté pet-sitter.
- US-25 (Epic 6) : blocage de créneau accepté.
- US-26 (Epic 6) : paiement test.
- US-27 (Epic 6) : récapitulatif contractuel.

#### Sprint 5 - Administration et confiance continue

- US-28 (Epic 7) : consultation des réservations en administration.
- US-29 (Epic 7) : consultation des paiements en administration.
- US-30 (Epic 7) : dépôt d'avis propriétaire post-prestation.
- US-31 (Epic 7) : signalement contenu/incidents.
- US-32 (Epic 7) : traitement de ticket administrateur.

#### Post-MVP - Évolutions préparées

- US-33 (Epic 8) : demande publique de garde.
- US-34 (Epic 8) : réponse pet-sitter à une demande publique.
- US-35 (Epic 8) : modération enrichie.
- US-36 (Epic 8) : notifications.

## 12. Cadrage livrable technique et jalons

Le cadrage documentaire du projet est aligné sur trois blocs :

- bloc 1 : MVP prototypé, landing page et tests utilisateurs/clients (sections 6.1 a 6.4) ;
- bloc 2 : étude technique et cadrage de la solution (sections 7.1 a 7.16) ;
- bloc 3 : projection vers My Digital Startup (sections 8.1 a 8.3).

Contrainte de structure retenue : conserver intégralement le bloc 1 (6.1 a 6.4) et le bloc 3 (8.1 a 8.3), puis faire évoluer prioritairement le bloc 2 pour les rendus de jalons.

### Jalon 0 - Mémo technique

- 7.1 et 7.2 : objectifs applicatifs ;
- 7.3 : objectifs quantitatifs ;
- 7.4 : périmètre MVP ;
- 7.5 et 7.6 : spécifications et choix techniques initiaux.

### Jalon 1 - Consolidation technique

- 7.5 et 7.6 : spécifications enrichies ;
- 7.7 : justification d'architecture ;
- 7.7.2 et 7.8 : infrastructure, sécurité, conformité, accessibilité ;
- 7.9 : stratégie de test ;
- 7.16 : conclusion de la partie développement.

### Jalon 2 - Pilotage de delivery

- 7.9.2 : ensemble de tests ;
- 7.10 : mise en place de l'environnement ;
- 7.11 : plan projet (epics, user stories, backlog) ;
- 7.12 : roadmap technique ;
- 7.13 : planification développement ;
- 7.14 : chiffrage ;
- 7.15 : risques techniques.

## 13. Référentiel d'ingénierie à respecter

Le projet applique un référentiel d'ingénierie couvrant :

- conception objet, SOLID, DRY, KISS, YAGNI, clean code et clean architecture ;
- séparation stricte des responsabilités (domaine, application, infrastructure, interface) ;
- backend-first, DDD pragmatique, repository pattern, service layer, adapters ;
- sécurité by design : validation serveur, moindre privilège, gestion d'erreurs robuste, auditabilité ;
- qualité logicielle : tests unitaires, intégration, E2E, linting, typage strict, revue de code ;
- exploitabilité : observabilité, CI/CD, documentation technique et métier, maintenabilité, scalabilité.

La référence détaillée des principes est maintenue dans `doc/tech/ENGINEERING_PRINCIPLES.md`.
