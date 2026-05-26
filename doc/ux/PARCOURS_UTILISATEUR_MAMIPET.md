# Parcours utilisateur MamiPet

Ce cadrage complète le MVP applicatif sans remplacer les spécifications techniques.
Il sert de fil conducteur pour garder une expérience claire, rassurante et cohérente
avec le positionnement MamiPet : marketplace de confiance pour propriétaires exigeants
et animaux sensibles.

## Principe UX central

Le parcours doit réduire l'incertitude à chaque étape :

- le propriétaire comprend vite quels profils sont adaptés à son animal ;
- le pet-sitter ne reçoit que des demandes suffisamment qualifiées ;
- les données sensibles ne sont partagées qu'au moment utile ;
- le paiement intervient après acceptation, avec un récapitulatif contractuel.

## Parcours propriétaire

1. Découverte
   L'utilisateur arrive sur la recherche ou la landing page avec une intention claire :
   trouver une garde fiable, proche et adaptée aux besoins de son animal.

2. Recherche
   La liste et la carte restent synchronisées. Les filtres prioritaires sont la ville,
   l'espèce, les besoins sensibles, les dates, le mode de garde, la distance, le tarif
   et les badges.

3. Comparaison
   Chaque carte doit permettre une décision rapide : photo, ville approximative, tarif,
   disponibilité, temps de réponse, badges, espèces acceptées et capacités de soin.

4. Fiche pet-sitter
   La fiche détail sert à confirmer la confiance : description, badges, avis, services,
   zone approximative, confidentialité, fonctionnement de la demande et paiement après
   acceptation.

5. Demande de réservation
   Le propriétaire sélectionne ses animaux, les dates, le mode de garde, l'assurance
   et les consignes. Le système affiche un récapitulatif avant envoi.

6. Acceptation et paiement
   Le pet-sitter accepte ou refuse. En cas d'acceptation, le créneau est bloqué, le
   paiement test est déclenché, puis le récapitulatif contractuel est généré.

7. Après prestation
   Le propriétaire peut terminer la garde, déposer un avis et signaler un incident si
   nécessaire.

## Parcours pet-sitter

1. Activation du rôle
   L'utilisateur choisit les espèces qu'il peut réellement prendre en charge.

2. Tests de compétence
   Les tests valident des badges publics cohérents avec les capacités affichées.
   Les cartes de questionnaire affichent uniquement les animaux sélectionnés.
   Quand plusieurs cartes sont empilées, leurs pastilles animal doivent rester alignées
   verticalement sur le bord gauche de la pile pour conserver le repère visuel.

3. Publication du profil
   Le profil public ne valorise que les garanties réellement validées.

4. Traitement des demandes
   Le pet-sitter lit les animaux, les dates, les besoins et les consignes avant de
   répondre. L'acceptation doit rester un engagement fort.

5. Suivi opérationnel
   Les demandes acceptées, payées, terminées ou signalées restent visibles dans le
   tableau de bord.

## Standards à conserver

- Ne pas afficher l'adresse exacte publiquement.
- Ne pas exposer les données médicales hors contexte de réservation.
- Garder les badges lisibles et directement liés à une preuve.
- Garder une cohérence visuelle stricte entre les icônes de test et les badges
  de réussite : chat, chien et lapin utilisent leurs calques dédiés, avec une
  épaisseur perçue équivalente dans les pastilles.
- Ne jamais demander le paiement avant l'acceptation du pet-sitter.
- Prévoir des états vides, erreurs, chargement et actions désactivées explicables.
- Prioriser le flux direct propriétaire vers pet-sitter pour le MVP.

## Modules préparés mais non prioritaires

- messagerie complète ;
- demandes publiques de garde ;
- notifications avancées ;
- modération enrichie ;
- dashboard professionnel avancé.

Ces modules doivent rester compatibles avec le modèle, mais ne doivent pas détourner
le MVP du parcours critique : rechercher, comparer, demander, accepter, payer,
contractualiser.
