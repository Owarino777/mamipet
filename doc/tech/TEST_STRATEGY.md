# Strategie de tests

La strategie de tests MamiPet est progressive, centree sur les regles metier critiques et le flux de reservation directe.

## 1. Objectifs

Les tests doivent :

- proteger les invariants metier ;
- securiser le flux proprietaire -> pet-sitter -> paiement -> contrat ;
- verifier les permissions ;
- proteger les donnees sensibles ;
- produire une base de non-regression ;
- rendre le backend integrable par le front.

## 2. Niveaux de tests

### Tests unitaires

Ciblent :

- entites domaine ;
- value objects ;
- policies metier ;
- calculs ;
- transitions d'etats ;
- use cases avec ports mockes.

Priorite :

- reservation ;
- paiement ;
- avis ;
- test de validation ;
- badge ;
- disponibilite.

### Tests d'integration

Ciblent :

- migrations PostgreSQL ;
- contraintes SQL ;
- RLS ;
- repositories Supabase ;
- Route Handlers ;
- Storage ;
- paiement simule.

### Tests fonctionnels

Ciblent les parcours :

- creation compte/profils ;
- creation animal ;
- configuration pet-sitter ;
- recherche ;
- reservation directe ;
- acceptation ;
- paiement test ;
- contrat ;
- avis ;
- signalement ;
- admin validation document.

### Tests E2E

A ajouter quand le front minimal existe.

Parcours E2E prioritaire :

1. owner cree animal ;
2. pet-sitter configure profil ;
3. owner recherche pet-sitter ;
4. owner cree reservation ;
5. pet-sitter accepte ;
6. owner paie ;
7. contrat genere ;
8. reservation terminee ;
9. owner depose avis.

## 3. Scenarios critiques

### Identite

- creer compte Supabase ;
- synchroniser compte applicatif ;
- activer profil owner ;
- activer profil pet-sitter ;
- refuser deux profils owner pour le meme compte ;
- refuser deux profils pet-sitter pour le meme compte.

### Animaux

- creer animal pour owner ;
- refuser lecture animal par autre owner ;
- creer dossier medical ;
- proteger documents animaux ;
- refuser exposition publique dossier medical.

### Pet-sitter

- creer profil pet-sitter ;
- configurer especes ;
- configurer capacites ;
- declarer disponibilite valide ;
- refuser disponibilite avec date fin avant date debut ;
- deposer document professionnel ;
- valider document par admin ;
- attribuer badge sans doublon actif.

### Reservation

- creer reservation avec animaux du proprietaire ;
- refuser reservation avec animal d'un autre proprietaire ;
- refuser reservation sans animal ;
- refuser reservation avec dates incoherentes ;
- accepter par pet-sitter concerne ;
- refuser acceptation par autre pet-sitter ;
- bloquer creneau apres acceptation ;
- passer en attente paiement ;
- refuser paiement si reservation non payable ;
- marquer payee apres paiement test ;
- generer contrat ;
- passer terminee ;
- declarer incident.

### Paiement

- calculer commission 15 % ;
- calculer montant prestataire ;
- creer paiement pending ;
- confirmer paiement succeeded ;
- expirer paiement ;
- verifier separation statut paiement/statut reservation.

### Avis

- refuser avis avant reservation terminee ;
- creer avis apres reservation terminee ;
- refuser deuxieme avis sur meme reservation ;
- permettre reponse pet-sitter concerne ;
- refuser reponse autre pet-sitter.

### Signalement

- creer signalement general ;
- creer signalement cible reservation ;
- creer signalement cible profil ;
- creer signalement cible avis ;
- refuser signalement avec plusieurs cibles ;
- traiter signalement admin.

### Securite et RLS

- visiteur peut lire referentiels ;
- visiteur peut lire profils publics ;
- visiteur ne peut pas lire donnees privees ;
- owner ne peut lire que ses animaux ;
- pet-sitter ne peut lire donnees medicales qu'en contexte autorise ;
- admin peut traiter documents et signalements ;
- service role jamais utilise cote client.

## 4. Definition of Done test

Un module est considere stable si :

- ses use cases critiques ont des tests unitaires ;
- ses endpoints principaux ont des tests d'integration ;
- les erreurs principales sont testees ;
- les permissions importantes sont testees ;
- les DTO publics n'exposent pas de donnees interdites.

## 5. Priorite de couverture

Priorite 1 :

- reservations ;
- paiements ;
- RLS ;
- donnees medicales ;
- avis ;
- admin documents/badges.

Priorite 2 :

- recherche ;
- disponibilites ;
- contrats ;
- signalements.

Priorite 3 :

- abonnements ;
- tests de validation avances ;
- reporting admin.

## 6. Donnees de test

Seeds de test minimaux :

- 1 owner ;
- 1 pet-sitter non verifie ;
- 1 pet-sitter identite verifiee ;
- 1 pet-sitter professionnel verifie ;
- 1 admin ;
- especes MVP ;
- capacites MVP ;
- lieux/formats/services ;
- badges Verified Identity, Pro, Expert ;
- animaux standard et animal avec dossier medical ;
- disponibilites libres.

