# Audit de conformite MamiPet

Date de l'audit : 2026-04-23

Perimetre audite :

- dossier produit historique hors partie developpement ;
- partie developpement cible ;
- documentation actuelle du repository ;
- schemas Merise ;
- UML ;
- documentation technique pre-backend.

Documents audites :

- `doc/PASSATION_PROJET_MAMIPET.md`
- `doc/README.md`
- `doc/merise/*`
- `doc/UML/*`
- `doc/tech/*`

## 1. Synthese executive

Le repository est conforme a l'intention projet et a la partie developpement cible sur le cadrage, la modelisation, l'architecture et la preparation backend.

La documentation actuelle couvre correctement :

- la distinction prototype Adalo / landing page / MVP applicatif ;
- la vision marketplace de confiance ;
- le flux critique proprietaire -> pet-sitter -> reservation -> paiement test -> contrat ;
- la separation compte / profils metier ;
- les roles et droits ;
- les referentiels metier ;
- les donnees sensibles et medicales ;
- les reservations, paiements, contrats, avis et signalements ;
- le choix Next.js + Supabase + PostgreSQL + Stripe + Google Maps ;
- les schemas MCD, MLD, MPD ;
- les UML attendus ;
- les contrats API et DTO ;
- les regles metier testables ;
- le plan de tests ;
- le plan d'implementation backend.

Score de conformite documentaire estime : **91 / 100**.

Statut global : **conforme pour lancer l'implementation backend, sous reserve de corriger les points mineurs listes en section 8**.

## 2. Grille de lecture

Niveaux utilises :

- Conforme : l'attendu est couvert clairement.
- Partiel : l'attendu est present mais demande precision ou production future.
- Non couvert : l'attendu manque.
- Hors MVP : l'attendu est volontairement reporte.

## 3. Conformite avec l'ancien dossier hors partie developpement

L'ancien dossier sert surtout a verifier la coherence produit, marche, positionnement et proposition de valeur. Sa partie dev historique ne doit pas piloter l'architecture finale.

| Attendu produit | Statut | Verification |
|---|---|---|
| Application de mise en relation proprietaires / pet-sitters | Conforme | Couvert dans passation, Merise, UML et API |
| Positionnement confiance et securite | Conforme | Badges, verification, documents, avis, signalements |
| Animaux fragiles, ages, sous traitement ou sensibles | Conforme | Capacites de soin, dossier medical, regles d'eligibilite |
| Pivot hors NAC uniquement vers tous animaux | Conforme | Referentiel espece large et architecture extensible |
| Propriétaires anxieux premium | Conforme | Donnees medicales, assurance, contrat, verification |
| Pet-sitters pro/semi-pro differenciables | Conforme | Tests, documents, badges, abonnement prepare |
| Commission 15 % | Conforme | Passation, domaine, API, paiement, principes |
| Assurance erreur medicale / niveau de garantie | Partiel | Modele `standard/premium` present, moteur assureur reel reporte |
| Photos/videos quotidiennes | Partiel | Mention produit historique, non integre au MVP critique actuel |
| Tchat temps reel | Hors MVP | Prepare comme extension, non prioritaire |
| Notifications push | Hors MVP | FCM prevu en extension |
| Landing page distincte | Conforme | Clarifie dans passation |
| Prototype Adalo non base technique finale | Conforme | Clarifie dans passation et README |

Conclusion : la coherence produit est respectee. Les fonctionnalites fortes du dossier historique qui ne sont pas dans le MVP critique sont correctement traitees comme extensions ou modelisations futures.

## 4. Conformite avec la partie developpement cible

| Attendu partie dev | Statut | Preuve documentaire |
|---|---|---|
| Web app responsive + API | Conforme | `ARCHITECTURE_DECISION.md`, `API_CONTRACTS.md` |
| Backend-first | Conforme | Passation, architecture, plan backend |
| Socle exploitable, documente, maintenable | Conforme | `doc/tech/*` |
| Comptes multi-roles | Conforme | Merise, DTO, API, regles `ID-*` |
| Profils proprietaire et pet-sitter separes | Conforme | Merise, UML, regles `PR-*` |
| Gestion animaux | Conforme | Merise, API, DTO, regles `AN-*` |
| Dossier medical et documents animaux | Conforme | Merise, API, DTO, access control |
| Capacites de soin | Conforme | Merise, referentiels, API |
| Badges Verified Identity, Pro, Expert | Conforme | Passation, Merise, UML, regles |
| Tests de validation | Conforme | Merise, UML, regles `QS-*` |
| Recherche geolocalisee | Conforme | API, DTO, architecture Maps |
| Localisation utile mais protegee | Conforme | DTO public, access control, environment |
| Reservation directe | Conforme | UML sequence, activity, state, API |
| Acceptation/refus pet-sitter | Conforme | API, sequence, regles |
| Blocage de creneau apres acceptation | Conforme | Merise, UML, regles `AV-*`, `RS-*` |
| Paiement Stripe test | Conforme | API, architecture, environment |
| Stripe Connect prepare | Conforme | Architecture decision, env, domain rules |
| Contrat recapitulatif | Conforme | API, DTO, sequence, regles `CT-*` |
| Avis apres prestation | Conforme | API, DTO, regles `RV-*` |
| Signalements/tickets | Conforme | Merise, API, access, regles `RP-*` |
| Back-office minimal | Conforme | API admin, access control, implementation plan |
| Demandes publiques preparees | Partiel | Mentionnees comme extension, pas encore modelisees en tables dediees |
| Messagerie complete preparee | Partiel | Mentionnee comme extension, pas modelisee detaillee |
| Notifications avancees preparees | Partiel | Mentionnees comme extension, FCM env futur non detaille |
| IA Act non contrainte directe | Partiel | Mention dans passation, pas encore dans doc tech dediee |
| Pipeline typecheck/lint/tests/build | Conforme conceptuellement | Plan documente, pas implemente car code non initialise |
| AGENT.md | Non couvert | Attendu futur, fichier non cree |
| README racine projet | Non couvert | Attendu futur, seul `doc/README.md` existe |

Conclusion : la partie developpement est bien couverte pour lancer l'implementation. Les manques restants concernent surtout les livrables de repository apres initialisation du projet.

## 5. Conformite Merise

Fichiers audites :

- `doc/merise/mamipet_mcd_conceptuel.puml`
- `doc/merise/mamipet_mld_logique.puml`
- `doc/merise/mamipet_mpd_physique.puml`
- versions Mermaid associees.

| Point attendu | Statut | Commentaire |
|---|---|---|
| MCD conceptuel independant de l'implementation | Conforme | Le MCD est plus conceptuel que les versions initiales |
| MLD relationnel coherent | Conforme | Tables de jointure, cardinalites, relations normalisees |
| MPD PostgreSQL/Supabase | Conforme | UUID, contraintes, notes RLS/Auth |
| Separation compte / profils | Conforme | Un compte, deux profils optionnels |
| Absence de mot de passe applicatif | Conforme | Supabase Auth est source |
| Avis non redondant | Conforme | Avis relie a reservation seulement |
| Reservation multi-animaux | Conforme | `reservation_animal` |
| Disponibilite liee au blocage reservation | Conforme | `id_reservation` et statut bloque |
| Signalement multi-cible controle | Conforme | Cible reservation/profil/avis, au plus une |
| Test validation XOR espece/capacite | Conforme | Contrainte explicitee |
| Commission coherente | Conforme | Taux sur reservation, montants dans paiement |
| Demandes publiques de garde | Partiel | Preparees fonctionnellement, non integrees au schema MVP |
| Messagerie | Hors MVP | Non modelisee, coherent avec arbitrage |
| Notifications | Hors MVP | Non modelisees, coherent avec arbitrage |

Conclusion : les schemas Merise sont suffisamment propres pour servir de base aux migrations PostgreSQL.

## 6. Conformite UML

Fichiers audites :

- cas d'utilisation ;
- classes domaine ;
- etats reservation ;
- etats profil pet-sitter ;
- sequence reservation directe ;
- sequence validation documentaire ;
- activite recherche/reservation ;
- composants ;
- deploiement.

| Diagramme attendu | Statut | Commentaire |
|---|---|---|
| Cas d'utilisation | Conforme | 5 acteurs + systemes externes |
| Classes domaine | Conforme | Diagramme metier, pas copie brute du MPD |
| Etats reservation | Conforme | Statuts metier separes du paiement |
| Etats profil pet-sitter | Conforme | Expert non confondu avec statut |
| Sequence reservation directe | Conforme | Owner, pet-sitter, API/use case, DB, Stripe, contrat |
| Sequence validation documentaire | Conforme | Admin, document, statut, badge, audit |
| Activite recherche/reservation | Conforme | Workflow lisible |
| Composants | Conforme | Couches et adapters |
| Deploiement | Conforme | Vercel, Supabase, Stripe, Maps, GitHub |
| Rendu image des UML | Partiel | PlantUML non installe localement, `.puml` valide structurellement |

Conclusion : le set UML est complet et coherent avec la partie developpement attendue.

## 7. Conformite architecture et bonnes pratiques

| Principe attendu | Statut | Verification |
|---|---|---|
| POO pragmatique | Conforme | `ENGINEERING_PRINCIPLES.md`, structure domaine |
| SOLID | Conforme | Documente et applique dans structure use cases/ports/adapters |
| DRY/KISS/YAGNI | Conforme | MVP limite, extensions reportees |
| Clean Code | Conforme | Conventions documentees |
| Separation of Concerns | Conforme | Architecture couches + modules |
| High cohesion / low coupling | Conforme | Modules fonctionnels |
| Single Source of Truth | Conforme | Auth, commission, paiement, badges clarifies |
| Composition over inheritance | Conforme | Compte compose avec profils |
| Defensive programming / fail fast | Conforme | Regles + erreurs + validation API |
| Design by Contract | Conforme | Pre/postconditions dans principes |
| DDD pragmatique | Conforme | Bounded contexts identifies |
| Hexagonal / Ports & Adapters | Conforme | Ports/adapters prevus |
| CQRS leger | Conforme | Command/query distinguees sans surdesign |
| TDD pragmatique | Conforme | Strategie de tests |
| Security by Design | Conforme | RLS, secrets, permissions |
| Accessibility by Design | Partiel | Principes presents, pas encore checklist front detaillee |
| Optimisation apres mesure | Conforme | Documente |

Conclusion : le cadrage technique est aligne avec les bonnes pratiques demandees. L'accessibilite sera surtout a concretiser lors du front.

## 8. Ecarts et actions correctives

### Ecart 1 - AGENT.md non cree

Statut : non bloquant avant initialisation code, mais attendu dans la partie dev.

Action recommandee :

- creer `AGENT.md` a la racine lors de l'initialisation projet ;
- y rappeler les regles de contribution, doc, tests, architecture, securite et IA.

Priorite : haute avant debut implementation.

### Ecart 2 - README racine absent

Statut : non bloquant tant que le repo ne contient que la doc.

Action recommandee :

- creer un `README.md` racine avec installation, scripts, architecture, liens doc.

Priorite : haute au moment d'initialiser Next.js.

### Ecart 3 - OpenAPI machine-readable absent

Statut : partiel. `API_CONTRACTS.md` est clair, mais un `openapi.yaml` serait mieux pour industrialiser.

Action recommandee :

- generer `doc/tech/openapi.yaml` apres stabilisation des endpoints ;
- ou le produire avant code si besoin de contrat strict.

Priorite : moyenne.

### Ecart 4 - Demandes publiques non modelisees physiquement

Statut : volontairement partiel.

Raison :

- module hors flux critique MVP ;
- compatible future mais non integre dans MPD.

Action recommandee :

- ajouter un ADR ou backlog extension quand le module devient prioritaire.

Priorite : basse.

### Ecart 5 - Messagerie et photos/videos quotidiennes non detaillees

Statut : hors MVP critique.

Raison :

- le flux principal est reservation directe + paiement + contrat ;
- messagerie complete et suivi media peuvent alourdir le scope.

Action recommandee :

- conserver comme epic phase 2 ;
- ne pas les implementer dans le premier backend.

Priorite : basse.

### Ecart 6 - Accessibilite front non transformee en checklist RGAA detaillee

Statut : partiel.

Action recommandee :

- creer plus tard `doc/front/ACCESSIBILITY_CHECKLIST.md` lorsque les maquettes et composants front arrivent.

Priorite : moyenne avant integration front.

### Ecart 7 - PlantUML non rendu localement

Statut : partiel.

Action recommandee :

- installer PlantUML ou utiliser extension VS Code ;
- generer les PNG/SVG des diagrammes si le rendu final est demande.

Priorite : basse a moyenne selon rendu ecole.

## 9. Risques residuels

| Risque | Niveau | Reponse |
|---|---|---|
| Derive de perimetre | Eleve | Suivre `BACKEND_IMPLEMENTATION_PLAN.md` et MVP critique |
| Complexite reservation/paiement | Moyen | Tests prioritaires + separation statuts |
| Donnees medicales exposees | Eleve | RLS + DTO publics + tests securite |
| Confusion prototype Adalo / produit reel | Faible | Clarifie partout |
| Sur-engineering DDD | Moyen | KISS/YAGNI documentes |
| Sous-documentation API future | Moyen | Transformer API_CONTRACTS en OpenAPI si besoin |
| Front non encore connu | Moyen | DTO front-ready et API REST stabilises |

## 10. Verdict final

Le repository est **conforme au cadrage attendu** pour passer a l'implementation backend.

Les livrables documentaires sont suffisamment complets pour coder un backend :

- propre ;
- backend-first ;
- REST ;
- front-ready ;
- securise ;
- teste ;
- modulaire ;
- conforme a la promesse produit ;
- compatible avec une evolution future.

Avant de coder, il reste idealement a produire au moment de l'initialisation technique :

1. `README.md` racine ;
2. `AGENT.md` racine ;
3. `.env.example` ;
4. migrations Supabase ;
5. seeds ;
6. eventuellement `openapi.yaml`.

Decision d'audit : **GO backend apres creation du socle projet**.

