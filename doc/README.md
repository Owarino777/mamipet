# Documentation MamiPet

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
