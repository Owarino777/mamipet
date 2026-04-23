# Audit de conformité MamiPet

Date : 2026-04-23
Version : 2.0 - Audit complet base sur le dossier de synthese final (partie dev sections 6 a 8)

Périmètre audite :

- dossier de synthese final sections 6 (MVP prototype), 7 (etude technique et cadrage) et 8 (projection startup) ;
- dossier produit hors partie développement pour cohérence produit ;
- documentation actuelle du repository.

Documents de référence :

- Dossier de synthese Groupe 6 (version finale avec section 7 technique)

Documents audites dans le repository :

- `doc/PASSATION_PROJET_MAMIPET.md`
- `doc/README.md`
- `doc/merise/*`
- `doc/UML/*`
- `doc/tech/README.md`
- `doc/tech/ARCHITECTURE_DECISION.md`
- `doc/tech/PROJECT_STRUCTURE.md`
- `doc/tech/ENGINEERING_PRINCIPLES.md`
- `doc/tech/DOMAIN_RULES.md`
- `doc/tech/ACCESS_CONTROL_MATRIX.md`
- `doc/tech/API_CONTRACTS.md`
- `doc/tech/DTO_CONTRACTS.md`
- `doc/tech/ENVIRONMENT_AND_SECRETS.md`
- `doc/tech/TEST_STRATEGY.md`
- `doc/tech/BACKEND_IMPLEMENTATION_PLAN.md`

## 1. Synthese executive

Le repository est conforme à l'intention projet et à la partie développement ciblée sur le cadrage, la modélisation, l'architecture et la préparation backend.

La documentation actuelle couvre correctement :

- la distinction prototype Adalo / landing page / MVP applicatif ;
- la vision marketplace de confiance ;
- le flux critique propriétaire -> pet-sitter -> réservation -> paiement test -> contrat ;
- la séparation compte / profils métier ;
- les rôles et droits ;
- les référentiels métier ;
- les données sensibles et médicales ;
- les réservations, paiements, contrats, avis et signalements ;
- le choix Next.js + Supabase + PostgreSQL + Stripe + Google Maps ;
- les schémas MCD, MLD, MPD ;
- les UML attendus ;
- les contrats API et DTO ;
- les règles métier testables ;
- le plan de tests ;
- le plan d'implémentation backend.

Score de conformité documentaire estime : **96 / 100**.

Statut global : **conforme pour lancer l'implémentation backend**.

## 2. Grille de lecture

Niveaux utilisés :

- Conforme : l'attendu est couvert clairement.
- Partiel : l'attendu est present mais demande précision ou production future.
- Non couvert : l'attendu manque.
- Hors MVP : l'attendu est volontairement reporte.

## 3. Conformité avec l'ancien dossier hors partie développement

L'ancien dossier sert surtout a vérifier la cohérence produit, marché, positionnement et proposition de valeur. Sa partie dev historique ne doit pas piloter l'architecture finale.

| Attendu produit | Statut | Vérification |
|---|---|---|
| Application de mise en relation propriétaires / pet-sitters | Conforme | Couvert dans passation, Merise, UML et API |
| Positionnement confiance et sécurité | Conforme | Badges, vérification, documents, avis, signalements |
| Animaux fragiles, âgés, sous traitement ou sensibles | Conforme | Capacités de soin, dossier médical, règles d'eligibilite |
| Pivot hors NAC uniquement vers tous animaux | Conforme | Referentiel espèce large et architecture extensible |
| Propriétaires anxieux premium | Conforme | Données médicales, assurance, contrat, vérification |
| Pet-sitters pro/semi-pro differenciables | Conforme | Tests, documents, badges, abonnement préparé |
| Commission 15 % | Conforme | Passation, domaine, API, paiement, principes |
| Assurance erreur médicale / niveau de garantie | Partiel | Modèle `standard/premium` present, moteur assureur réel reporte |
| Photos/videos quotidiennes | Partiel | Mention produit historique, non intégré au MVP critique actuel |
| Tchat temps réel | Hors MVP | Prepare comme extension, non prioritaire |
| Notifications push | Hors MVP | FCM prevu en extension |
| Landing page distincte | Conforme | Clarifie dans passation |
| Prototype Adalo non base technique finale | Conforme | Clarifie dans passation et README |

Conclusion : la cohérence produit est respectee. Les fonctionnalites fortes du dossier historique qui ne sont pas dans le MVP critique sont correctement traitees comme extensions ou modelisations futures.

## 4. Conformité avec la partie développement ciblée

| Attendu partie dev | Statut | Preuve documentaire |
|---|---|---|
| Web app responsive + API | Conforme | `ARCHITECTURE_DECISION.md`, `API_CONTRACTS.md` |
| Backend-first | Conforme | Passation, architecture, plan backend |
| Socle exploitable, documenté, maintenable | Conforme | `doc/tech/*` |
| Comptes multi-rôles | Conforme | Merise, DTO, API, règles `ID-*` |
| Profils propriétaire et pet-sitter séparés | Conforme | Merise, UML, règles `PR-*` |
| Gestion animaux | Conforme | Merise, API, DTO, règles `AN-*` |
| Dossier médical et documents animaux | Conforme | Merise, API, DTO, access control |
| Capacités de soin | Conforme | Merise, référentiels, API |
| Badges Verified Identity, Pro, Expert | Conforme | Passation, Merise, UML, règles |
| Tests de validation | Conforme | Merise, UML, règles `QS-*` |
| Recherche géolocalisée | Conforme | API, DTO, architecture Maps |
| Localisation utile mais protégée | Conforme | DTO public, access control, environment |
| Réservation directe | Conforme | UML sequence, activity, state, API |
| Acceptation/refus pet-sitter | Conforme | API, sequence, règles |
| Blocage de créneau après acceptation | Conforme | Merise, UML, règles `AV-*`, `RS-*` |
| Paiement Stripe test | Conforme | API, architecture, environment |
| Stripe Connect préparé | Conforme | Architecture décision, env, domain rules |
| Contrat récapitulatif | Conforme | API, DTO, sequence, règles `CT-*` |
| Avis après prestation | Conforme | API, DTO, règles `RV-*` |
| Signalements/tickets | Conforme | Merise, API, access, règles `RP-*` |
| Back-office minimal | Conforme | API admin, access control, implémentation plan |
| Demandes publiques preparees | Partiel | Mentionnees comme extension, pas encore modelisees en tables dediees |
| Messagerie complète préparée | Partiel | Mentionnée comme extension, pas modélisée détaillée |
| Notifications avancées preparees | Partiel | Mentionnees comme extension, FCM env futur non detaille |
| IA Act non contrainte directe | Partiel | Mention dans passation, pas encore dans doc tech dediee |
| Pipeline typecheck/lint/tests/build | Conforme conceptuellement | Plan documenté, pas implémenté car code non initialisé |
| AGENT.md | Conforme | Fichier racine créé |
| README racine projet | Conforme | Fichier racine créé |

Conclusion : la partie développement est bien couverte pour lancer l'implémentation. Les manques restants concernent surtout les livrables de repository après initialisation du projet.

## 5. Conformité Merise

Fichiers audites :

- `doc/merise/mamipet_mcd_conceptuel.puml`
- `doc/merise/mamipet_mld_logique.puml`
- `doc/merise/mamipet_mpd_physique.puml`
- versions Mermaid associees.

| Point attendu | Statut | Commentaire |
|---|---|---|
| MCD conceptuel indépendant de l'implémentation | Conforme | Le MCD est plus conceptuel que les versions initiales |
| MLD relationnel cohérent | Conforme | Tables de jointure, cardinalites, relations normalisees |
| MPD PostgreSQL/Supabase | Conforme | UUID, contraintes, notes RLS/Auth |
| Séparation compte / profils | Conforme | Un compte, deux profils optionnels |
| Absence de mot de passe applicatif | Conforme | Supabase Auth est source |
| Avis non redondant | Conforme | Avis relie a réservation seulement |
| Réservation multi-animaux | Conforme | `reservation_animal` |
| Disponibilite liee au blocage réservation | Conforme | `id_reservation` et statut bloqué |
| Signalement multi-cible contrôlé | Conforme | Cible réservation/profil/avis, au plus une |
| Test validation XOR espèce/capacité | Conforme | Contrainte explicitee |
| Commission cohérente | Conforme | Taux sur réservation, montants dans paiement |
| Demandes publiques de garde | Partiel | Preparees fonctionnellement, non integrees au schéma MVP |
| Messagerie | Hors MVP | Non modélisée, cohérent avec arbitrage |
| Notifications | Hors MVP | Non modelisees, cohérent avec arbitrage |

Conclusion : les schémas Merise sont suffisamment propres pour servir de base aux migrations PostgreSQL.

## 6. Conformité UML

Fichiers audites :

- cas d'utilisation ;
- classes domaine ;
- états réservation ;
- états profil pet-sitter ;
- sequence réservation directe ;
- sequence validation documentaire ;
- activite recherche/réservation ;
- composants ;
- déploiement.

| Diagramme attendu | Statut | Commentaire |
|---|---|---|
| Cas d'utilisation | Conforme | 5 acteurs + systèmes externes |
| Classes domaine | Conforme | Diagramme métier, pas copie brute du MPD |
| États réservation | Conforme | Statuts métier séparés du paiement |
| États profil pet-sitter | Conforme | Expert non confondu avec statut |
| Sequence réservation directe | Conforme | Owner, pet-sitter, API/use case, DB, Stripe, contrat |
| Sequence validation documentaire | Conforme | Admin, document, statut, badge, audit |
| Activite recherche/réservation | Conforme | Workflow lisible |
| Composants | Conforme | Couches et adapters |
| Déploiement | Conforme | Vercel, Supabase, Stripe, Maps, GitHub |
| Rendu image des UML | Partiel | PlantUML non installe localement, `.puml` validé structurellement |

Conclusion : le set UML est complet et cohérent avec la partie développement attendue.

## 7. Conformité architecture et bonnes pratiques

| Principe attendu | Statut | Vérification |
|---|---|---|
| POO pragmatique | Conforme | `ENGINEERING_PRINCIPLES.md`, structure domaine |
| SOLID | Conforme | Documente et applique dans structure use cases/ports/adapters |
| DRY/KISS/YAGNI | Conforme | MVP limité, extensions reportees |
| Clean Code | Conforme | Conventions documentees |
| Séparation of Concerns | Conforme | Architecture couches + modules |
| High cohesion / low coupling | Conforme | Modules fonctionnels |
| Single Source of Truth | Conforme | Auth, commission, paiement, badges clarifies |
| Composition over inheritance | Conforme | Compte compose avec profils |
| Defensive programming / fail fast | Conforme | Règles + erreurs + validation API |
| Design by Contract | Conforme | Pre/postconditions dans principes |
| DDD pragmatique | Conforme | Bounded contexts identifies |
| Hexagonal / Ports & Adapters | Conforme | Ports/adapters prevus |
| CQRS leger | Conforme | Command/query distinguees sans surdesign |
| TDD pragmatique | Conforme | Stratégie de tests |
| Security by Design | Conforme | RLS, secrets, permissions |
| Accessibility by Design | Partiel | Principes présents, pas encore checklist front détaillée |
| Optimisation après mesure | Conforme | Documente |

Conclusion : le cadrage technique est aligne avec les bonnes pratiques demandees. L'accessibilite sera surtout a concretiser lors du front.

## 8. Ecarts et actions correctives

### Écart 1 - AGENT.md créé et corrige

Statut : corrige.

Correction appliquee :

- `AGENT.md` créé à la racine ;
- règles de contribution, architecture, documentation, sécurité, tests et bonnes pratiques ajoutees.

### Écart 2 - README racine créé et corrige

Statut : corrige.

Correction appliquee :

- `README.md` racine créé ;
- vision projet, stack, architecture, documentation et règles fortes documentees.

### Écart 3 - OpenAPI machine-readable créé et corrige

Statut : corrige en première version.

Correction appliquee :

- `doc/tech/openapi.yaml` créé ;
- le contrat devra rester synchronise avec `API_CONTRACTS.md` pendant l'implémentation.

### Écart 4 - Demandes publiques non modelisees physiquement

Statut : volontairement partiel.

Raison :

- module hors flux critique MVP ;
- compatible future mais non intégré dans MPD.

Action recommandee :

- ajouter un ADR ou backlog extension quand le module devient prioritaire.

Priorité : basse.

### Écart 5 - Messagerie et photos/videos quotidiennes non détaillées

Statut : hors MVP critique.

Raison :

- le flux principal est réservation directe + paiement + contrat ;
- messagerie complète et suivi media peuvent alourdir le scope.

Action recommandee :

- conserver comme epic phase 2 ;
- ne pas les implémenter dans le premier backend.

Priorité : basse.

### Écart 6 - Accessibilité front non transformée en checklist RGAA détaillée

Statut : partiel.

Action recommandee :

- créer plus tard `doc/front/ACCESSIBILITY_CHECKLIST.md` lorsque les maquettes et composants front arrivent.

Priorité : moyenne avant intégration front.

### Écart 7 - PlantUML non rendu localement

Statut : partiel.

Action recommandee :

- installer PlantUML ou utiliser extension VS Code ;
- générer les PNG/SVG des diagrammes si le rendu final est demande.

Priorité : basse a moyenne selon rendu ecole.

## 9. Risques residuels

| Risque | Niveau | Réponse |
|---|---|---|
| Derive de périmètre | Eleve | Suivre `BACKEND_IMPLEMENTATION_PLAN.md` et MVP critique |
| Complexite réservation/paiement | Moyen | Tests prioritaires + séparation statuts |
| Données médicales exposees | Eleve | RLS + DTO publics + tests sécurité |
| Confusion prototype Adalo / produit réel | Faible | Clarifie partout |
| Sur-engineering DDD | Moyen | KISS/YAGNI documentes |
| Derive entre API_CONTRACTS et openapi.yaml | Moyen | Maintenir les deux documents ensemble ou choisir OpenAPI comme source executable |
| Front non encore connu | Moyen | DTO front-ready et API REST stabilises |

## 10. Verdict final

Le repository est **conforme au cadrage attendu** pour passer à l'implémentation backend.

Les livrables documentaires sont suffisamment complets pour coder un backend :

- propre ;
- backend-first ;
- REST ;
- front-ready ;
- sécurisé ;
- teste ;
- modulaire ;
- conforme à la promesse produit ;
- compatible avec une évolution future.

Avant de coder, il reste idealement a produire au moment de l'initialisation technique :

1. `.env.example` ;
2. migrations Supabase ;
3. seeds ;
4. configuration Next.js ;
5. scripts qualité : typecheck, lint, test, build ;
6. pipeline CI minimal.

Décision d'audit : **GO backend**.
