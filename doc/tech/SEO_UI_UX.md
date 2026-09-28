# Passe SEO, GEO et UI/UX

Date : 2026-09-23
Statut : implémentée sur les surfaces publiques principales.

## SEO et GEO

- L'accueil expose une description éditoriale, un canonical, Open Graph et les schémas `Organization` et `WebSite` avec `SearchAction`.
- La recherche expose un canonical, Open Graph et un schéma `CollectionPage`.
- Le journal expose un canonical par page, Open Graph et un schéma `CollectionPage` avec `ItemList` des articles publiés.
- Les articles publiés exposent déjà `BlogPosting`, les dates, l'auteur, le canonical et les données Open Graph.
- Les profils publics génèrent un canonical propre à leur identifiant et un schéma `ProfilePage` sans exposer de données privées.
- `robots.txt` et `sitemap.xml` restent limités aux routes publiques.

Les données structurées sont sérialisées avec échappement des caractères dangereux. Elles ne remplacent pas une validation dans Google Search Console, Bing Webmaster Tools ou un validateur Schema.org.

## UX et UI

- La recherche distingue maintenant l'état vide de l'erreur réseau et propose une nouvelle tentative explicite.
- Le journal utilise une largeur de lecture limitée, une grille éditoriale stable, des couvertures cadrées et un titre moins dominant.
- Les couvertures d'articles individuels sont limitées en hauteur pour préserver la hiérarchie du contenu.
- Les styles restent responsifs et conservent les états de focus existants.

## Limites connues

- Les profils pet-sitters sont encore chargés principalement côté client dans `PetSitterProfilePage`. Les métadonnées du profil restent donc génériques tant qu'un lecteur public serveur n'est pas ajouté.
- La recherche utilise encore une donnée de démonstration comme repli lorsque l'API ne renvoie aucun profil. L'interface signale désormais une panne réseau, mais ce repli devra être retiré avant une qualification de données de production.
- Les tests visuels automatisés et la validation manuelle avec lecteur d'écran restent à compléter sur les parcours complets.

## Vérification

```powershell
npm.cmd run quality
```

La passe validée le 23 septembre 2026 contient 50 tests, un typecheck, un lint et un build Next.js réussis.
