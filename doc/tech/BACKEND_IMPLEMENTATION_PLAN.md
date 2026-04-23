# Plan d'implémentation backend

Ce plan décrit l'ordre de construction du backend MamiPet. L'objectif est de livrer par increments cohérents, testables et integrables par le front.

## 1. Phase 0 - Initialisation projet

Objectif : créer le socle technique.

Taches :

- initialiser Next.js + TypeScript ;
- configurer lint, format, typecheck ;
- configurer structure `src/app`, `src/modules`, `src/shared` ;
- installer Supabase client SSR ;
- configurer `.env.example` ;
- ajouter README projet ;
- ajouter scripts npm ;
- préparer pipeline minimal.

Définition of Done :

- app demarre localement ;
- typecheck passe ;
- lint passe ;
- structure respecte `PROJECT_STRUCTURE.md`.

## 2. Phase 1 - Base de données et Supabase

Objectif : poser les tables et contraintes.

Taches :

- créer migrations PostgreSQL depuis le MPD ;
- créer enums ou checks ;
- créer index ;
- créer seeds référentiels ;
- créer buckets Storage ;
- activer RLS ;
- ajouter policies de base.

Définition of Done :

- migrations rejouables ;
- seeds présents ;
- RLS activee sur tables sensibles ;
- contraintes critiques presentes.

## 3. Phase 2 - Identity access

Objectif : connecter Supabase Auth au compte applicatif.

Taches :

- utilitaires Supabase serveur/client ;
- endpoint `/api/me` ;
- création/synchronisation compte ;
- activation profil owner ;
- activation profil pet-sitter ;
- tests permissions de base.

Définition of Done :

- un utilisateur connecte voit son compte ;
- un compte peut activer les deux profils ;
- doublons refuses.

## 4. Phase 3 - Referentiels

Objectif : exposer les données de référence.

Taches :

- endpoints référence-data ;
- seeds espèces ;
- seeds capacités ;
- seeds lieux/formats/services ;
- seeds badges ;
- DTO publics.

Définition of Done :

- référentiels lisibles publiquement ;
- code front peut alimenter les formulaires.

## 5. Phase 4 - Owners et animaux

Objectif : permettre au propriétaire de préparer ses animaux.

Taches :

- CRUD profil owner ;
- CRUD animaux ;
- dossier médical ;
- documents animaux via Storage ;
- RLS owner ;
- DTO privés.

Définition of Done :

- owner géré ses animaux ;
- autre owner ne peut pas les lire ;
- dossier médical protégé.

## 6. Phase 5 - Pet-sitters et qualification

Objectif : permettre au pet-sitter de configurer son offre.

Taches :

- CRUD profil pet-sitter ;
- configuration espèces/capacités/lieux/formats/services ;
- disponibilités ;
- documents professionnels ;
- tests de validation MVP ;
- badges en lecture ;
- RLS pet-sitter.

Définition of Done :

- pet-sitter configure son profil ;
- offre exploitable par la recherche ;
- documents pros privés.

## 7. Phase 6 - Recherche publique

Objectif : exposer les profils compatibles.

Taches :

- endpoint `/api/pet-sitters` ;
- endpoint `/api/pet-sitters/{id}` ;
- filtres MVP ;
- DTO public card/détail ;
- masquage données sensibles ;
- localisation approximative.

Définition of Done :

- visiteur peut rechercher ;
- données privées absentes ;
- filtres principaux operationnels.

## 8. Phase 7 - Réservation directe

Objectif : implémenter le coeur métier.

Taches :

- create réservation ;
- sent/received réservations ;
- accept ;
- refuse ;
- cancel ;
- incident ;
- complète ;
- blocage disponibilité ;
- tests transitions.

Définition of Done :

- owner créé demande ;
- pet-sitter concerné accepte/refuse ;
- créneau bloqué après acceptation ;
- statuts respectes.

## 9. Phase 8 - Paiement test et contrat

Objectif : fermer le flux critique.

Taches :

- payment intent simulé/test ;
- confirmation paiement ;
- calcul commission ;
- paiement succeeded ;
- génération contrat récapitulatif ;
- stockage contrat ;
- DTO paiement/contrat.

Définition of Done :

- réservation accepted -> awaiting_payment -> paid ;
- paiement distinct ;
- contrat généré.

## 10. Phase 9 - Avis, signalements et moderation

Objectif : ajouter la confiance MVP.

Taches :

- création avis après réservation terminée ;
- réponse pet-sitter ;
- signalement général/ciblé ;
- cycle ticket ;
- moderation basique.

Définition of Done :

- avis impossible avant completion ;
- signalement créé ticket ;
- cibles signalement controlees.

## 11. Phase 10 - Back-office minimal

Objectif : permettre la demo admin.

Taches :

- lister profils/documents ;
- valider/rejeter documents ;
- changer statut vérification ;
- attribuer/retirer badges ;
- lister réservations/paiements ;
- traiter signalements ;
- audit minimal.

Définition of Done :

- admin peut traiter les objets critiques ;
- actions sensibles tracees.

## 12. Phase 11 - Stabilisation

Objectif : livrer un backend propre et documenté.

Taches :

- completer tests critiques ;
- vérifier DTO ;
- vérifier RLS ;
- vérifier docs ;
- préparer données demo ;
- nettoyer dette immediate ;
- produire note de livraison.

Définition of Done :

- build passe ;
- lint passe ;
- typecheck passe ;
- tests critiques passent ;
- README explique lancement ;
- documentation mise à jour.

## 13. Ordre strict recommande

1. Projet et tooling.
2. Supabase schéma + RLS.
3. Auth/compte/profils.
4. Referentiels.
5. Animaux.
6. Pet-sitter offer.
7. Recherche publique.
8. Réservation.
9. Paiement/contrat.
10. Avis/signalement.
11. Admin.
12. Tests/stabilisation.

## 14. Règles pendant implémentation

- Ne pas coder la messagerie complète au debut.
- Ne pas coder notifications avancées au debut.
- Ne pas exposer les tables brutes au front.
- Ne pas stocker de mot de passe applicatif.
- Ne pas melanger réservation et paiement.
- Ne pas contourner les policies avec service rôle sauf operation serveur justifiee.
- Mettre à jour la documentation si une décision change.

