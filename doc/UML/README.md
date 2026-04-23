# UML MamiPet

Ces diagrammes UML sont dérivés de `../PASSATION_PROJET_MAMIPET.md` et des schémas Merise présents dans `../merise/`.

Ils suivent les principes UML 2.5.1 : séparation entre structure et comportement, acteurs explicites, états métier distincts des statuts techniques, et diagrammes de sequence centres sur les responsabilités.

## Fichiers

- `mamipet_use_cases.puml` : diagramme de cas d'utilisation du MVP.
- `mamipet_class_domain.puml` : diagramme de classes domaine.
- `mamipet_state_reservation.puml` : états-transitions d'une réservation.
- `mamipet_state_profil_pet_sitter.puml` : états-transitions d'un profil pet-sitter.
- `mamipet_sequence_reservation_directe.puml` : sequence du flux direct propriétaire vers pet-sitter, paiement et contrat.
- `mamipet_sequence_validation_documentaire.puml` : sequence de validation documentaire par l'administration.
- `mamipet_activity_recherche_reservation.puml` : activite de recherche puis création de demande de réservation.
- `mamipet_component_architecture.puml` : diagramme de composants de l'architecture cible.
- `mamipet_deployment.puml` : diagramme de déploiement cible.

## Points de vigilance

- `Avis` reste rattache a `Reservation`, sans lien direct redondant vers propriétaire ou pet-sitter.
- Les statuts de `Reservation` et de `Paiement` restent séparés.
- `Expert` est un badge ou une qualification, pas un état du profil pet-sitter.
- Les données publiques, privées et sensibles doivent rester séparées.

## Référence locale

La spécification UML fournie est conservée dans `../references/UML_2_5_1_OMG_formal_17_12_05.pdf`.

