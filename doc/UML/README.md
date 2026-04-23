# UML MamiPet

Ces diagrammes UML sont derives de `../PASSATION_PROJET_MAMIPET.md` et des schemas Merise presents dans `../merise/`.

Ils suivent les principes UML 2.5.1 : separation entre structure et comportement, acteurs explicites, etats metier distincts des statuts techniques, et diagrammes de sequence centres sur les responsabilites.

## Fichiers

- `mamipet_use_cases.puml` : diagramme de cas d'utilisation du MVP.
- `mamipet_class_domain.puml` : diagramme de classes domaine.
- `mamipet_state_reservation.puml` : etats-transitions d'une reservation.
- `mamipet_state_profil_pet_sitter.puml` : etats-transitions d'un profil pet-sitter.
- `mamipet_sequence_reservation_directe.puml` : sequence du flux direct proprietaire vers pet-sitter, paiement et contrat.
- `mamipet_sequence_validation_documentaire.puml` : sequence de validation documentaire par l'administration.
- `mamipet_activity_recherche_reservation.puml` : activite de recherche puis creation de demande de reservation.
- `mamipet_component_architecture.puml` : diagramme de composants de l'architecture cible.
- `mamipet_deployment.puml` : diagramme de deploiement cible.

## Points de vigilance

- `Avis` reste rattache a `Reservation`, sans lien direct redondant vers proprietaire ou pet-sitter.
- Les statuts de `Reservation` et de `Paiement` restent separes.
- `Expert` est un badge ou une qualification, pas un etat du profil pet-sitter.
- Les donnees publiques, privees et sensibles doivent rester separees.

## Reference locale

La specification UML fournie est conservee dans `../references/UML_2_5_1_OMG_formal_17_12_05.pdf`.

