# Documentation MamiPet

Ce dossier regroupe la documentation de conception du projet MamiPet.

## Organisation

- `PASSATION_PROJET_MAMIPET.md` : document de reference fonctionnelle et technique.
- `merise/` : schemas MCD, MLD et MPD, en PlantUML, Mermaid et image existante.
- `UML/` : diagrammes UML du MVP applicatif.
- `tech/` : decisions techniques, contrats API/DTO, permissions, regles, tests et plan backend.
- `audits/` : audits de conformite et rapports de verification.
- `references/` : ressources de reference, dont la specification UML 2.5.1 fournie.

## Regles de lecture

- Les schemas Merise servent a stabiliser les donnees.
- Les UML servent a expliquer les usages, le domaine, les etats, les flux et l'architecture.
- Le prototype Adalo reste une preuve fonctionnelle, pas une base technique finale.
- Le MVP applicatif cible une architecture backend-first avec Next.js, Supabase, PostgreSQL, Stripe et Google Maps.
- Toute evolution importante du backend doit verifier si `tech/` doit etre mis a jour.
