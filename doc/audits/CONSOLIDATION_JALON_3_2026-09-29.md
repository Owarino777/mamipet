# Consolidation MamiPet — Jalon 3

Date : 29 septembre 2026. Référence : document « Développement Full Stack — MamiPet — Jalon 3 » fourni pour cette tâche. Ce rapport est un **instantané de l'audit avant les commits de checkpoint** : les chiffres Git ci-dessous ne décrivent pas l'état actuel de la branche. Aucune migration n'avait alors été appliquée à un projet Supabase distant, ni aucun déploiement effectué.

## 1. État initial trouvé

- Branche : `fix/reservation-production-safety` ; dernier commit connu `2b21c15` (« feat: ajouter des galeries d'images pour les pet-sitters et mettre à jour les références de galerie »).
- 90 fichiers suivis modifiés, 68 fichiers individuels non suivis, aucun fichier indexé ni supprimé. Le statut Git groupait plusieurs répertoires non suivis ; `git ls-files --others --exclude-standard` a servi à les détailler.
- Le chantier hérité ajoutait principalement un blog administrable, des pages SEO, une récupération de mot de passe, des protections de session/HTTP, sept migrations (`001`–`007` de septembre), une CI qualité, des tests de blog sous PGlite et de nombreuses retouches responsive. Il fermait les routes Checkout insuffisamment sûres.
- Le fichier local `supabase/snippets/Untitled query 815.sql` contient une élévation manuelle de privilège administrateur ciblée sur une adresse personnelle. Il n'est référencé par aucun script applicatif et n'a pas été exécuté ; le dossier `supabase/snippets/` est désormais ignoré pour éviter un ajout Git accidentel. Le fichier local est conservé pour revue.

## 2. Inventaire des modifications héritées par domaine

| Domaine | Fichiers/ensemble | Intention constatée et état | Décision |
| --- | --- | --- | --- |
| Infrastructure/configuration | `package*`, `next.config.ts`, `middleware.ts`, `tsconfig.json`, `eslint.config.mjs`, `scripts/apply-supabase-sql.mjs`, `.gitignore`, `supabase/config.toml` | Mise à jour Next/React/Vitest, en-têtes de sécurité, chargement d'images et application ordonnée de migrations. Le script DB désactivait la vérification TLS ; MapLibre 5.0.0 était vulnérable. | Conserver, corriger TLS et MapLibre, documenter l'historique DB. |
| Base de données | `202609230001`–`007`, `supabase/.gitignore` | Création/acceptation de réservation transactionnelles, droits d'écriture retirés, garde de vérification et chevauchement, dossier médical propriétaire, blog privé/public, création de compte restreinte. Pas de preuve d'application distante. | Conserver les migrations ; ajouter `008`/`009` sans réécrire l'historique. |
| Authentification | `/auth/callback`, `/reset-password`, layouts protégés, `current-user.ts`, `ensure-account.ts`, `session-middleware.ts`, `authenticated-workspace.tsx` | Session vérifiée avant l'accès, compte suspendu refusé, récupération de mot de passe. L'email et les URL Auth réelles restent à tester. | Conserver ; recette Supabase réelle nécessaire. |
| Profils | `/api/me`, pages owner/pet-sitter, `workspace-session.ts` | Compte séparé des profils, rôle serveur vérifié, suppression du rôle inventé en secours. | Conserver ; UI encore alimentée en partie par l'état local. |
| Animaux | page owner, migration médicale `004` | Amélioration de l'UI et accès propriétaire au dossier médical. Pas d'upload privé réel de documents animaux. | Conserver et tester RLS ; Storage reste à faire. |
| Pet-sitters | onboarding, vérification `003`, documents, badges | Publication de profil séparée de la vérification ; garde SQL contre auto-attribution de statut. L'API de documents accepte encore des métadonnées/chemins sans fichier Storage vérifié. | Conserver ; protéger les statuts de document en SQL, ne pas présenter le dépôt comme une preuve documentaire complète. |
| Qualification | onboarding, tests métier existants | UI de questionnaire et règles unitaires ; aucun parcours serveur complet d'attribution de qualification vérifié. | Conserver, état partiel explicite. |
| Recherche/cartographie | recherche, carte, hooks, styles, pages SEO | MapLibre/OpenFreeMap, filtres UI et fallback carte. L'API paginait avant les filtres d'offre ; l'UI conservait des profils fictifs en cas de réponse vide. La table SQL exposait les colonnes privées malgré le DTO. | Corriger projection SQL, filtrage avant pagination, états UI ; recette WebGL réelle restante. |
| Réservation | Route Handlers, schéma, migrations `001`/`002`/`005` | RPC transactionnelles et contrôle d'ownership ; refus/annulation/completion SQL. L'acceptation aboutit à `accepted`, sans étape serveur fonctionnelle de paiement ni contrat. | Conserver ; parcours complet non achevé, tests distants/concurrence nécessaires. |
| Paiement | routes `/pay` et `/demo-payments/checkout` | Fermeture volontaire : `409` au lieu de créer un paiement depuis un montant client ou de croire un retour navigateur. Commission domaine testée. | Conserver fermé ; documenter l'écart avec le Jalon 3. |
| Contrat | tables/DTO et panneaux UI | Structure prévue, pas de génération serveur ni fichier privé démontrés. | Conserver comme cible, ne pas déclarer opérationnel. |
| Avis | règles domaine et Route Handler existants | Avis après completion, réponse pet-sitter. La permission SQL d'update permettait de modifier la note via PostgREST. | Restreindre l'UPDATE aux colonnes de réponse et tester. |
| Signalements | routes et policy initiale | Ticket traçable en table ; insertion directe pouvait déclarer un ticket traité. | Restreindre les champs initiaux en SQL ; traitement admin réel à tester. |
| Administration | dashboard, routes existantes, `/admin/blog`, module `blog` | Contrôle admin serveur, rédaction de brouillons et publication atomique locale. Les listes métier sont peu paginées ; Storage du blog reste à vérifier sur Supabase. | Conserver, tester droits SQL et documenter limites. |
| Interface | pages publiques/connectées, CSS par domaine, images, modale | Responsive, SEO, états vides, labels/focus, nav mobile ; plusieurs écrans demeurent des fixtures/localStorage. | Conserver ; corriger les faux profils publics et effectuer audit clavier/mobile manuel. |
| Tests | 13 fichiers initiaux (12 unitaires, 1 intégration blog) | 50 tests passaient au premier `npm test`. Les tests SQL n'exerçaient que le blog et l'initialisation du compte. | Ajouter scénarios SQL de confidentialité/ownership ; mesurer toute la source. |
| CI/CD | `.github/workflows/quality.yml` | `npm ci`, quality (typecheck, lint, tests, build), audit npm ; aucun déploiement. | Conserver. Exécution GitHub non observée localement. |
| Documentation | README, contrats, guides blog/SEO, ADR 002 | Nombreux éléments cibles étaient formulés comme déjà implémentés, surtout paiement/Storage. | Ajouter ADR 003 et corriger les états affirmés. |

## 3. Problèmes détectés, impact et correction

| Sévérité | Cause/fichier | Impact | Correction ou limite |
| --- | --- | --- | --- |
| Critique | Policy `profil_pet_sitter` dans `202605020002` puis `202609230003` et `grant select` public | Téléphone, adresse et coordonnées exactes lisibles directement via Supabase, malgré le DTO Next.js. | Migration `008` : retrait policy/lecture anonyme de la table, vue publique à colonnes explicites et position arrondie ; routes publiques migrées ; test PGlite. |
| Critique | `maplibre-gl` 5.0.0 dans `package.json` | Avis XSS [GHSA-jrc7-96c5-q579](https://github.com/advisories/GHSA-jrc7-96c5-q579), trouvé par `npm audit`. | Version 6.11.2 verrouillée ; audit npm, typage, tests et build revérifiés. |
| Élevée | `avis` et `document_professionnel`, policies `202605020004` | Un client Supabase direct pouvait modifier la note d'un avis ou soumettre un document déjà validé. | Migration `009` : colonnes d'UPDATE limitées et checks d'INSERT ; tests refus + validation admin. |
| Élevée | `signalement`, policy `202605020004` | Un compte pouvait créer directement un ticket au statut traité/résolu. | Migration `009` : ouverture forcée et résolution vide à l'insertion. |
| Élevée | `pet-sitter-profile-page.tsx`, `use-pet-sitter-search.ts` | Fiche inconnue présentée avec un autre profil fictif ; recherche vide laissait des résultats fictifs. | Chargement réel, états vide/erreur, fixture uniquement en mode dédié ; note et prix inconnus ne sont plus inventés. |
| Élevée | README, OpenAPI et documents techniques | Paiement et contrat décrits comme utilisables alors que Checkout répond `409` et aucun webhook/contrat serveur complet n'existe. | Statuts corrigés, ADR 003 et préparation à l'ouverture reliés aux contrats cibles. |
| Moyenne | `scripts/apply-supabase-sql.mjs` | `rejectUnauthorized: false` désactivait la vérification du certificat sur connexion distante. | TLS vérifié à distance, connexion locale sans TLS. Non exécuté sur une base distante. |
| Moyenne | Recherche API `/api/pet-sitters` | Filtres d'offre appliqués après pagination et `total` incohérent. | Filtres d'UUID appliqués dans la requête SQL sur tableaux d'IDs de la vue, avant pagination. |
| Moyenne | Aucun rapport de couverture | Impossibilité de défendre un taux réel ou de voir les grandes lacunes. | Vitest V8 ajouté, source entière incluse, chiffres faibles publiés sans seuil cosmétique. |

## 4. Parcours et architecture réellement vérifiés

| Étape Jalon 3 | État du repository | Preuve | Action restante |
| --- | --- | --- | --- |
| Compte et authentification | Code Supabase Auth/SSR, récupération de mot de passe et garde serveur ; pas de recette email distante. | Routes/pages et tests de session. | Tester inscription, récupération, expiration et suspension sur préproduction. |
| Profil owner | Route de création/lecture/mise à jour et table avec RLS. | Route Handlers, migration initiale. | Test d'intégration Supabase Auth + API + UI. |
| Animal et médical | CRUD animal, upsert médical ; RLS propriétaire testée sous PostgreSQL embarqué. | Test `public-pet-sitter-database.test.ts`. | Upload privé et recette réelle. |
| Recherche et fiche pet-sitter | API et vue publique protégée ; interface affiche résultats serveur, état vide et erreur. | Migration `008`, routes, tests SQL/DTO. | Test navigateur réel, position/tiles, qualité des données et filtres sous charge. |
| Réservation/acceptation/refus | RPC SQL transactionnelles, vérifications de parties et créneau. | Migrations `001`/`002`/`005`, test refus du mauvais pet-sitter. | Tester création/acceptation concurrentes et idempotence sur Supabase réel. |
| Disponibilité | Tables, routes manuelles et garde de chevauchement. | Migration `005`. | Vérifier concurrence, annulation et libération du créneau. |
| Paiement MVP | **Indisponible côté serveur** (`409`) ; seuls calcul et maquette locale existent. | Routes Checkout fermées, test de commission. | Décision Connect et webhooks signés/idempotents, tests paiements/refus/remboursement. |
| Contrat | Table/DTO prévus, panneau UI local. | Schéma SQL. | Génération serveur, stockage privé et droits de lecture. |
| Completion/avis | Route completion admin, règle d'avis et réponse ; SQL d'avis durci. | Route, tests domaine et migration `009`. | E2E après paiement réellement confirmé. |
| Qualification/documents/badges | Règles et routes, garde de statut ; validation de métadonnées, sans preuve du binaire privé. | Tests domaine, migrations `003`/`009`. | Storage privé, téléchargement autorisé, tests Admin réel. |
| Signalements/administration | Routes et policies, insertion de ticket durcie ; blog admin localement testé. | Migrations `004`/`006`/`009`, tests SQL. | Scénarios UI/API réels, pagination et audit des actions sensibles. |

L'architecture modulaire existe (`src/modules/*/domain|application|infrastructure|presentation`), mais plusieurs Route Handlers contiennent encore accès Supabase et orchestration métier. Les écrans connectés conservent `demo-workspace-state`/localStorage : ils ne prouvent pas une intégration E2E avec les DTO serveur. Les diagrammes Merise/UML et le plan backend sont des **cibles**. Aucun refactoring massif n'a été effectué, car il n'aurait pas résolu ces frontières de données ni fourni de preuve supplémentaire.

## 5. Sécurité, RGPD, accessibilité et performance

- **Authentification/autorisation** : `getUser()` serveur, `ensureAccount` refuse les comptes suspendus, `requireAdminAccount` vérifie le rôle actif. Les mutations HTTP authentifiées contrôlent l'origine et la taille du corps. Les tests PGlite vérifient Owner B face à l'animal/dossier de Owner A, visiteur face au dossier médical, pet-sitter tiers face à l'acceptation, non-admin face à un document validé et au changement de note. Il manque un test des mêmes scénarios à travers Auth, PostgREST et Storage hébergés.
- **Données publiques** : la projection SQL de la fiche exclut téléphone, adresse et position exacte ; les brouillons blog sont distincts des publications. Ne pas exposer les clés service rôle : seules les scripts de maintenance locaux les lisent. Une revue des autres colonnes directement exposées par PostgREST reste nécessaire avant production, notamment `animal.besoins_specifiques` pour les parties de réservation.
- **Secrets** : seul `.env.example` est suivi par Git. Le fichier local de bootstrap admin dans `supabase/snippets/` a été conservé et ignoré ; sa présence et son usage doivent être revus par le propriétaire du projet. Aucun secret n'a été affiché ou appliqué pendant cet audit.
- **RGPD** : absence de parcours prouvé d'export/suppression de compte, de politique de rétention exécutable et de nettoyage des images orphelines du blog. Les coordonnées publiques sont désormais arrondies. Cookies Auth nécessaires ; inventaire des autres traceurs et durées à faire. Conservation, bases légales, durée d'accès aux données médicales et procédure de droits : **À VALIDER CÔTÉ PROJET/JURIDIQUE**. Aucune conformité RGPD complète n'est annoncée.
- **Accessibilité** : les écrans hérités ont des landmarks, labels, états `role=status/alert`, focus de modale et marqueurs carte clavier. La fiche corrigée annonce chargement/erreur. Il manque un audit manuel RGAA/WCAG des pages accueil, inscription, connexion/récupération, recherche/carte, fiche, réservation, dashboards, éditeur blog, avec clavier, zoom et lecteur d'écran. Les contrastes et le focus de tous les composants custom n'ont pas été mesurés.
- **Performance** : filtres d'offre avant pagination et lecture profil sans données privées ; index de base sur recherche/réservations/disponibilités. La vue publique agrège des relations par profil et devra être mesurée sur volume réel (`EXPLAIN ANALYZE`), sans chiffre inventé. Listes admin et certaines routes utilisateur restent sans pagination ; images/MapLibre et cache UI demandent mesure navigateur. Aucun test k6 n'a été exécuté faute de préproduction isolée et de jeu de données représentatif.

## 6. Tests et couverture

| Commande | Résultat local |
| --- | --- |
| `npm.cmd ci` | Code 0 ; 465 packages installés depuis le lockfile. |
| `npm.cmd run typecheck` | Code 0, exécuté par `quality` après le dernier `npm ci`. |
| `npm.cmd run lint` | Code 0, exécuté par `quality`. |
| `npm.cmd test` | Code 0, 14 fichiers et 56 tests réussis dans `quality`. |
| `npm.cmd run coverage` | Code 0, 14 fichiers et 56 tests réussis ; rapport V8 généré. |
| `npm.cmd run build` | Code 0, build Next.js 16.3.6 réussi dans `quality` (47 pages statiques générées). |
| `npm.cmd run quality` | Code 0 ; enchaînement typecheck → lint → tests → build réussi. |
| `npm.cmd audit --audit-level=high` | `found 0 vulnerabilities` après mise à jour MapLibre (contrôle local du 29 septembre 2026). |
| `git diff --check` | Réussi ; avertissements de normalisation LF/CRLF non bloquants sous Windows. |

La mesure Vitest V8 porte sur `src/**/*.{ts,tsx}`, fichiers jamais importés inclus. Résultat : lignes **10,85 % (346/3187)**, statements **10,85 % (358/3299)**, branches **8,54 % (201/2353)**, functions **11,56 % (100/865)**. Cette faible couverture reflète notamment les Route Handlers et pages non testés automatiquement ; les tests SQL PGlite ne contribuent pas à la couverture TypeScript des handlers. Le rapport local HTML/JSON est dans `coverage/` (ignoré par Git).

## 7. Dette réelle et preuves nécessaires

1. **Bloquant parcours complet** : paiement serveur et contrat fermés, écrans connectés locaux. Preuve attendue : environnement de préproduction, création Owner → avis, paiement confirmé par webhook signé et données persistées.
2. **Bloquant déploiement** : historique SQL distant non rapproché ; migrations `001`–`009` non appliquées/validées à distance. Preuve : journal Supabase, migration sur copie de test, tests Auth/RLS/Storage, sauvegarde et rollback documentés.
3. **Sécurité documents** : `document_professionnel` accepte des chemins de métadonnées sans upload vérifié. Preuve : bucket privé, URL signée limitée, contrôle ownership/admin, test d'accès croisé.
4. **Idempotence et concurrence** : double création/double acceptation et événements paiement non testés sur PostgreSQL multi-connexion. Preuve : tests simultanés, contrainte et clés d'idempotence si le flux est activé.
5. **Qualité de la recherche** : offre, disponibilité et prix non validés intégralement à la demande ; géolocalisation approximative actuelle. Preuve : règles métier écrites, scénarios négatifs et mesures SQL sur données représentatives.
6. **Exploitation et conformité** : audit des actions admin, export/suppression/rétention, sauvegarde/restauration, observabilité et test de charge. Preuves attendues : procédures et exécutions enregistrées. Les décisions juridiques sont **À VALIDER CÔTÉ PROJET/JURIDIQUE**.

## 8. Fichiers à revoir manuellement

- `supabase/snippets/Untitled query 815.sql` (bootstrap admin local à adresse personnelle ; ignorer ou traiter via une procédure contrôlée, ne pas committer).
- `doc/UML/mamipet_sequence_reservation_directe.puml` et `doc/UML/mamipet_deployment.puml` (cible Stripe/Storage/Google Maps, pas description de l'exécutable actuel).
- `src/interface/shared/demo-workspace-state.ts` et les pages dashboards/réservation (données locales susceptibles d'être prises pour des données serveur).
- `src/app/api/pet-sitter/documents/route.ts` et routes Admin de validation (métadonnées sans contrôle de binaire Storage).
- `doc/tech/openapi.yaml` (contrat cible comportant encore des routes non implémentées ; distinction explicitée en tête).

## 9. État Git à la fin de l'audit, avant checkpoint

Branche inchangée `fix/reservation-production-safety`. À cet instant, `git status` indiquait **100 fichiers suivis modifiés**, **72 fichiers individuels non suivis visibles**, aucun fichier indexé ni supprimé. `supabase/snippets/` était ignoré mais son fichier local conservé. Les 90 modifications suivies et la majorité des ajouts non suivis hérités ont été gardés ; les ajouts de consolidation sont `ADR_003_CONSOLIDATION_JALON_3.md`, ce rapport, `doc/merise/README.md`, les migrations `202609230008`/`009` et `tests/integration/public-pet-sitter-database.test.ts`. Les fichiers suivis ajoutés à la consolidation concernent README/AGENT/documentation, `package*`, `vitest.config.ts`, `scripts/apply-supabase-sql.mjs`, les deux routes et le mapper publics pet-sitter, les composants de recherche/fiche/carte. Aucun commit ni push n'avait été fait pendant cet audit.
