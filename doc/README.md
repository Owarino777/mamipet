# Documentation MamiPet

État de livraison : [préparation à l’ouverture](tech/PRODUCTION_READINESS.md). Pour le journal et la rédaction non technique : [guide du blog](tech/BLOG.md). Les documents de conception décrivent aussi des fonctions cibles encore à intégrer ; ils ne constituent pas un constat de fonctionnement du code actuel.

Ce dossier regroupe la documentation de conception du projet MamiPet.

## Organisation

- `PASSATION_PROJET_MAMIPET.md` : document de référence fonctionnelle et technique.
- `merise/` : schémas MCD, MLD et MPD, en PlantUML, Mermaid et image existante.
- `UML/` : diagrammes UML du MVP applicatif.
- `tech/` : décisions techniques, contrats API/DTO, permissions, règles, tests et plan backend.
- `audits/` : audits de conformité et rapports de vérification.
- `references/` : ressources de référence, dont la spécification UML 2.5.1 fournie.

## Règles de lecture

- Les schémas Merise servent à stabiliser les données.
- Les UML servent à expliquer les usages, le domaine, les états, les flux et l'architecture.
- Le prototype Adalo reste une preuve fonctionnelle, pas une base technique finale.
- Le MVP applicatif cible une architecture backend-first avec Next.js, Supabase, PostgreSQL, Stripe et Google Maps.
- Toute évolution importante du backend doit vérifier si `tech/` doit être mis à jour.
