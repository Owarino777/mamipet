# Stratégie de tests

La stratégie de tests MamiPet est progressive, centree sur les règles métier critiques et le flux de réservation directe.

## 1. Objectifs

Les tests doivent :

- protéger les invariants métier ;
- sécuriser le flux propriétaire -> pet-sitter -> paiement -> contrat ;
- vérifier les permissions ;
- protéger les données sensibles ;
- produire une base de non-regression ;
- rendre le backend integrable par le front.

## 2. Niveaux de tests

### Tests unitaires

Ciblent :

- entités domaine ;
- value objects ;
- policies métier ;
- calculs ;
- transitions d'états ;
- use cases avec ports mockes.

Priorité :

- réservation ;
- paiement ;
- avis ;
- test de validation ;
- badge ;
- disponibilité.

### Tests d'intégration

Ciblent :

- migrations PostgreSQL ;
- contraintes SQL ;
- RLS ;
- repositories Supabase ;
- Route Handlers ;
- Storage ;
- paiement simulé.

### Tests fonctionnels

Ciblent les parcours :

- création compte/profils ;
- création animal ;
- configuration pet-sitter ;
- recherche ;
- réservation directe ;
- acceptation ;
- paiement test ;
- contrat ;
- avis ;
- signalement ;
- admin validation document.

### Tests E2E

A ajouter quand le front minimal existe.

Parcours E2E prioritaire :

1. owner créé animal ;
2. pet-sitter configure profil ;
3. owner recherche pet-sitter ;
4. owner créé réservation ;
5. pet-sitter accepte ;
6. owner paie ;
7. contrat généré ;
8. réservation terminée ;
9. owner depose avis.

## 3. Scénarios critiques

### Identité

- créer compte Supabase ;
- synchroniser compte applicatif ;
- activer profil owner ;
- activer profil pet-sitter ;
- refuser deux profils owner pour le même compte ;
- refuser deux profils pet-sitter pour le même compte.

### Animaux

- créer animal pour owner ;
- refuser lecture animal par autre owner ;
- créer dossier médical ;
- protéger documents animaux ;
- refuser exposition publique dossier médical.

### Pet-sitter

- créer profil pet-sitter ;
- configurer espèces ;
- configurer capacités ;
- déclarer disponibilité validé ;
- refuser disponibilité avec date fin avant date debut ;
- déposer document professionnel ;
- valider document par admin ;
- attribuer badge sans doublon actif.

### Réservation

- créer réservation avec animaux du propriétaire ;
- refuser réservation avec animal d'un autre propriétaire ;
- refuser réservation sans animal ;
- refuser réservation avec dates incoherentes ;
- accepter par pet-sitter concerné ;
- refuser acceptation par autre pet-sitter ;
- bloquer créneau après acceptation ;
- passer en attente paiement ;
- refuser paiement si réservation non payable ;
- marquer payée après paiement test ;
- générer contrat ;
- passer terminée ;
- déclarer incident.

### Paiement

- calculer commission 15 % ;
- calculer montant prestataire ;
- créer paiement pending ;
- confirmer paiement succeeded ;
- expirer paiement ;
- vérifier séparation statut paiement/statut réservation.

### Avis

- refuser avis avant réservation terminée ;
- créer avis après réservation terminée ;
- refuser deuxième avis sur même réservation ;
- permettre réponse pet-sitter concerné ;
- refuser réponse autre pet-sitter.

### Signalement

- créer signalement général ;
- créer signalement ciblé réservation ;
- créer signalement ciblé profil ;
- créer signalement ciblé avis ;
- refuser signalement avec plusieurs cibles ;
- traiter signalement admin.

### Sécurité et RLS

- visiteur peut lire référentiels ;
- visiteur peut lire profils publics ;
- visiteur ne peut pas lire données privées ;
- owner ne peut lire que ses animaux ;
- pet-sitter ne peut lire données médicales qu'en contexte autorisé ;
- admin peut traiter documents et signalements ;
- service rôle jamais utilisé côté client.

## 4. Définition of Done test

Un module est considere stable si :

- ses use cases critiques ont des tests unitaires ;
- ses endpoints principaux ont des tests d'intégration ;
- les erreurs principales sont testees ;
- les permissions importantes sont testees ;
- les DTO publics n'exposent pas de données interdites.

## 5. Priorité de couverture

Priorité 1 :

- réservations ;
- paiements ;
- RLS ;
- données médicales ;
- avis ;
- admin documents/badges.

Priorité 2 :

- recherche ;
- disponibilités ;
- contrats ;
- signalements.

Priorité 3 :

- abonnements ;
- tests de validation avancés ;
- reporting admin.

## 6. Données de test

Seeds de test minimaux :

- 1 owner ;
- 1 pet-sitter non vérifié ;
- 1 pet-sitter identité vérifiée ;
- 1 pet-sitter professionnel vérifié ;
- 1 admin ;
- espèces MVP ;
- capacités MVP ;
- lieux/formats/services ;
- badges Verified Identity, Pro, Expert ;
- animaux standard et animal avec dossier médical ;
- disponibilités libres.

