# Préparation à l'ouverture du service

## Paiement

Le déploiement sans encaissement ne nécessite pas Stripe. Les routes Checkout restent fermées. Avant le premier paiement réel : définir le modèle Connect, vérifier les comptes pet-sitters, traiter des webhooks signés et idempotents, gérer remboursements et rapprochement comptable, puis tester le parcours complet. Une redirection Checkout ne prouve pas un paiement.

## Données et parcours

Les routes API de réservation ont été durcies, mais les écrans existants restent ceux du prototype. Ils utilisent encore, selon le parcours, des données de démonstration ou du stockage local. Le retour à l'interface antérieure ne valide pas son intégration avec les API mises à jour. Avant une ouverture à de vrais utilisateurs, relier les parcours propriétaire, pet-sitter et administration aux données serveur, puis vérifier les permissions et les états d'erreur de bout en bout. Le stockage local ne doit pas servir de source de vérité pour un utilisateur réel.

## Base de données

Appliquer dans l'ordre les migrations `202609230001` à `202609230005` avant de déployer les routes de réservation mises à jour. Elles ajoutent les écritures transactionnelles, retirent les droits directs sur réservation et paiement, protègent les statuts de vérification, donnent au propriétaire l'accès à son dossier médical et empêchent le chevauchement de créneaux indisponibles.

`npm run db:apply` refuse une base existante sans historique de migrations. Ce projet Supabase a été créé avant cet historique : relever les fichiers SQL déjà appliqués et tester les nouveaux scripts sur une base distincte avant toute application au projet utilisé pour la démonstration. Aucun script de cette branche n'a été appliqué à la base distante.

Le blog ajoute `202609230006_blog.sql` (brouillons privés, copie publiée, verrou/version, Storage) et `202609230007_account_creation_access.sql` (initialisation du compte courant sans possibilité d’attribution de droits). `202609230008_public_pet_sitter_projection.sql` protège les colonnes privées des profils publiés. `202609230009_trust_write_guards.sql` limite les écritures directes de documents, avis et signalements. Ces fichiers sont testés localement dans PostgreSQL embarqué, pas sur le projet Supabase distant. [Mise en service du blog](BLOG.md).

## Améliorations vérifiées localement

- Blog et éditeur : rédaction, blocs, aperçu, sauvegarde privée, publication/retrait, conflits, URL stable, API administrateur, limites d’upload et protection RLS.
- SEO éditorial : rendu serveur, canonique par article, Open Graph, données structurées encodées, sitemap des seules publications avec leurs vraies dates. Suppression de la canonique globale qui attribuait l’accueil à toutes les pages. Inscription et administration non indexables.
- Sessions : vérification serveur avant affichage des espaces connectés, administration contrôlée à chaque API, comptes suspendus refusés, rôles non inventés après échec de `/api/me`, retrait de la connexion fictive de secours.
- Parcours : le retour Checkout ne marque plus un paiement comme réussi ; le partage des données locales entre espaces est limité aux fixtures de démonstration. Le bouton de récupération du mot de passe est raccordé à Supabase ; les emails et URL autorisées demandent une recette réelle.
- Performance : absence d’appel de rafraîchissement de session pour un visiteur sans cookie, lectures de profils parallèles, pagination du blog, déduplication de lecture par requête, appels serveur Supabase bornés à 15 secondes.
- Frontières HTTP : écritures intersites refusées, corps JSON limité à 1 Mio, images à 4 Mio, réponses privées non mises en cache, en-têtes nosniff/referrer/frame.
- Dépendances : Next.js 16.3.6, MapLibre 6.11.2 et Vitest 4.1.11 dans le lockfile actuel. Le 29 septembre 2026, `npm audit --audit-level=high` a retourné `found 0 vulnerabilities`. Ce constat dépend de la base d'avis du jour.
- CI et tests locaux : aucune action de déploiement ou modification de base distante n’est déclenchée.

Les styles des pages existantes ne sont pas refondus. Le blog réutilise leurs composants et dispose de styles limités à ses pages. Les maquettes fournies ne comprennent pas de page de blog dédiée : il s’agit d’une extension de l’identité existante, pas d’une reproduction Figma validée pour ce nouvel écran.

## Vérifications restantes

- Tests d'intégration avec deux comptes et refus d'accès croisés, dont documents médicaux et actions admin.
- Deux acceptations simultanées sur des créneaux qui se chevauchent, puis annulation et libération du créneau.
- Validation de l'offre pet-sitter, du prix et de la disponibilité avant la demande ; politique métier du prix à définir.
- Idempotence de création de réservation et journalisation des transitions.
- Stockage privé des documents, suivi des erreurs et restauration des données ; la CI qualité existe mais ne remplace pas un déploiement de préproduction.
- Intégration et validation manuelle des parcours frontend avec les API réelles, sur mobile et ordinateur.

Le build et les tests unitaires ne suffisent pas à conclure que le parcours complet fonctionne sur Supabase. Ne pas ouvrir les réservations à de vrais utilisateurs avant ces vérifications.
