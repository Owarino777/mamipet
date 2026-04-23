# Plan d'implementation backend

Ce plan decrit l'ordre de construction du backend MamiPet. L'objectif est de livrer par increments coherents, testables et integrables par le front.

## 1. Phase 0 - Initialisation projet

Objectif : creer le socle technique.

Taches :

- initialiser Next.js + TypeScript ;
- configurer lint, format, typecheck ;
- configurer structure `src/app`, `src/modules`, `src/shared` ;
- installer Supabase client SSR ;
- configurer `.env.example` ;
- ajouter README projet ;
- ajouter scripts npm ;
- preparer pipeline minimal.

Definition of Done :

- app demarre localement ;
- typecheck passe ;
- lint passe ;
- structure respecte `PROJECT_STRUCTURE.md`.

## 2. Phase 1 - Base de donnees et Supabase

Objectif : poser les tables et contraintes.

Taches :

- creer migrations PostgreSQL depuis le MPD ;
- creer enums ou checks ;
- creer index ;
- creer seeds referentiels ;
- creer buckets Storage ;
- activer RLS ;
- ajouter policies de base.

Definition of Done :

- migrations rejouables ;
- seeds presents ;
- RLS activee sur tables sensibles ;
- contraintes critiques presentes.

## 3. Phase 2 - Identity access

Objectif : connecter Supabase Auth au compte applicatif.

Taches :

- utilitaires Supabase serveur/client ;
- endpoint `/api/me` ;
- creation/synchronisation compte ;
- activation profil owner ;
- activation profil pet-sitter ;
- tests permissions de base.

Definition of Done :

- un utilisateur connecte voit son compte ;
- un compte peut activer les deux profils ;
- doublons refuses.

## 4. Phase 3 - Referentiels

Objectif : exposer les donnees de reference.

Taches :

- endpoints reference-data ;
- seeds especes ;
- seeds capacites ;
- seeds lieux/formats/services ;
- seeds badges ;
- DTO publics.

Definition of Done :

- referentiels lisibles publiquement ;
- code front peut alimenter les formulaires.

## 5. Phase 4 - Owners et animaux

Objectif : permettre au proprietaire de preparer ses animaux.

Taches :

- CRUD profil owner ;
- CRUD animaux ;
- dossier medical ;
- documents animaux via Storage ;
- RLS owner ;
- DTO prives.

Definition of Done :

- owner gere ses animaux ;
- autre owner ne peut pas les lire ;
- dossier medical protege.

## 6. Phase 5 - Pet-sitters et qualification

Objectif : permettre au pet-sitter de configurer son offre.

Taches :

- CRUD profil pet-sitter ;
- configuration especes/capacites/lieux/formats/services ;
- disponibilites ;
- documents professionnels ;
- tests de validation MVP ;
- badges en lecture ;
- RLS pet-sitter.

Definition of Done :

- pet-sitter configure son profil ;
- offre exploitable par la recherche ;
- documents pros prives.

## 7. Phase 6 - Recherche publique

Objectif : exposer les profils compatibles.

Taches :

- endpoint `/api/pet-sitters` ;
- endpoint `/api/pet-sitters/{id}` ;
- filtres MVP ;
- DTO public card/detail ;
- masquage donnees sensibles ;
- localisation approximative.

Definition of Done :

- visiteur peut rechercher ;
- donnees privees absentes ;
- filtres principaux operationnels.

## 8. Phase 7 - Reservation directe

Objectif : implementer le coeur metier.

Taches :

- create reservation ;
- sent/received reservations ;
- accept ;
- refuse ;
- cancel ;
- incident ;
- complete ;
- blocage disponibilite ;
- tests transitions.

Definition of Done :

- owner cree demande ;
- pet-sitter concerne accepte/refuse ;
- creneau bloque apres acceptation ;
- statuts respectes.

## 9. Phase 8 - Paiement test et contrat

Objectif : fermer le flux critique.

Taches :

- payment intent simule/test ;
- confirmation paiement ;
- calcul commission ;
- paiement succeeded ;
- generation contrat recapitulatif ;
- stockage contrat ;
- DTO paiement/contrat.

Definition of Done :

- reservation accepted -> awaiting_payment -> paid ;
- paiement distinct ;
- contrat genere.

## 10. Phase 9 - Avis, signalements et moderation

Objectif : ajouter la confiance MVP.

Taches :

- creation avis apres reservation terminee ;
- reponse pet-sitter ;
- signalement general/cible ;
- cycle ticket ;
- moderation basique.

Definition of Done :

- avis impossible avant completion ;
- signalement cree ticket ;
- cibles signalement controlees.

## 11. Phase 10 - Back-office minimal

Objectif : permettre la demo admin.

Taches :

- lister profils/documents ;
- valider/rejeter documents ;
- changer statut verification ;
- attribuer/retirer badges ;
- lister reservations/paiements ;
- traiter signalements ;
- audit minimal.

Definition of Done :

- admin peut traiter les objets critiques ;
- actions sensibles tracees.

## 12. Phase 11 - Stabilisation

Objectif : livrer un backend propre et documente.

Taches :

- completer tests critiques ;
- verifier DTO ;
- verifier RLS ;
- verifier docs ;
- preparer donnees demo ;
- nettoyer dette immediate ;
- produire note de livraison.

Definition of Done :

- build passe ;
- lint passe ;
- typecheck passe ;
- tests critiques passent ;
- README explique lancement ;
- documentation mise a jour.

## 13. Ordre strict recommande

1. Projet et tooling.
2. Supabase schema + RLS.
3. Auth/compte/profils.
4. Referentiels.
5. Animaux.
6. Pet-sitter offer.
7. Recherche publique.
8. Reservation.
9. Paiement/contrat.
10. Avis/signalement.
11. Admin.
12. Tests/stabilisation.

## 14. Regles pendant implementation

- Ne pas coder la messagerie complete au debut.
- Ne pas coder notifications avancees au debut.
- Ne pas exposer les tables brutes au front.
- Ne pas stocker de mot de passe applicatif.
- Ne pas melanger reservation et paiement.
- Ne pas contourner les policies avec service role sauf operation serveur justifiee.
- Mettre a jour la documentation si une decision change.

