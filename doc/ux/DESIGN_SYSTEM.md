# Système d’interface MamiPet

## Source de vérité

La marque conserve son bleu, son rose, son fond bleu pâle, ses visuels animaliers et ses illustrations d’inscription. Les variables de `src/app/styles/globals/globals-001.css` sont la source technique des couleurs, polices, rayons et tailles de contrôles. Les assets de `public/figma` sont des exports graphiques, pas un fichier Figma lié au projet.

## Règles communes

| Élément | Règle |
| --- | --- |
| Texte | Bleu nuit `--text`; texte secondaire `--muted`; bleu `--green` pour liens et actions principales. |
| Accent | Rose `--coral` pour les moments de marque et quelques actions d’inscription, sans colorer chaque contrôle. |
| Typographie | `--font-ui` pour le corps, les libellés et les contrôles; `--font-title` pour les titres et la marque. Ne pas utiliser `font: inherit` sur `body`, ce qui efface la famille déclarée. |
| Surfaces | Fond `--page`, panneaux blancs `--surface`; une bordure discrète suffit dans la plupart des cas. Ombre `--shadow-soft` uniquement pour un élément élevé ou en survol. |
| Espacement | Base 4 px. Contrôles et libellés: 8–12 px; éléments dans une section: 16–24 px; sections de page: 32–64 px selon l’écran. |
| Géométrie | Rayon de contrôle `--radius-control`, rayon de panneau `--radius-panel`; pills réservées aux vrais choix binaires ou états compacts. |
| Largeur | Lecture éditoriale autour de 800 px; listes et espaces de travail autour de 1200–1360 px; carte de recherche dans un second panneau. |
| États | Focus bleu visible au clavier; survol par couleur ou bordure; `disabled` atténué et sans interaction; succès, avertissement et erreur accompagnés d’un texte explicite. |

## Composants structurants

- **En-tête public** : marque, navigation principale, accès au compte. Sur mobile, un menu explicite donne accès aux mêmes routes.
- **Espace connecté** : navigation latérale sur grand écran, rail horizontal sur petits écrans, contenu centré et largeur contrôlée.
- **Formulaires** : labels visibles, contrôles d’au moins 44 px, actions proches du groupe de champs, erreurs au même endroit que l’action.
- **Résultats** : photo, identité, preuve de confiance, disponibilité et prix en un balayage; détails et services sur le profil.
- **Journal** : index d’articles en lignes séparées, lecture individuelle sur largeur de texte. Les images ne s’affichent que si une couverture existe.
- **Listes de travail** : rangées et séparateurs pour tâches répétées; panneaux seulement pour un dossier ou une tâche qui requiert un contexte propre.

## Priorités de revue

1. Recherche et fiches pet-sitter : densité, filtres, lisibilité et comportement de la carte.
2. Espace propriétaire, pet-sitter et administration : navigation, dossiers et listes opérationnelles.
3. Inscription et connexion : accès direct à l’action, lisibilité et validation.
4. Accueil et journal : hiérarchie, répétitions et rythme de lecture.

Les écrans de rôle historiques gardent leurs fonctions. Toute harmonisation doit préserver les règles métier et les permissions du backend.
