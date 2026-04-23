# Principes d'ingénierie obligatoires

Ce document fixe les principes à respecter pendant l'implémentation de MamiPet. Il ne sert pas à sur-ingénier le projet : il sert à garder un backend simple, robuste, testable, sécurisé et prêt à intégrer le front.

## 1. Fondamentaux de conception

### POO - Programmation orientée objet

La POO organise le code autour d'objets représentant des concepts métier ou techniques, avec leurs données et comportements.

Pour MamiPet, la POO doit rester simple et métier :

- les objets de domaine représentent les notions importantes : `Reservation`, `PetSitterProfile`, `OwnerProfile`, `Animal`, `Payment`, `Contract`, `Review`, `Report` ;
- les invariants importants doivent être protégés au plus près du domaine ;
- une classe ne doit pas être créée uniquement pour "faire objet" ;
- les classes doivent clarifier les responsabilités, pas ajouter du bruit.

### Encapsulation

Un objet doit protéger son état interne. On ne doit pas pouvoir le placer facilement dans un état incohérent depuis l'extérieur.

Exemples MamiPet :

- une réservation ne doit pas passer à `paid` si elle n'est pas `awaiting_payment` ;
- un avis ne doit pas être créé si la réservation n'est pas `completed` ;
- un test de validation ne doit pas cibler à la fois une espèce et une capacité de soin.

### Abstraction

Une abstraction doit simplifier l'usage sans masquer les règles importantes.

Bonnes abstractions attendues :

- `ReservationRepository` pour persister les réservations ;
- `PaymentGateway` pour isoler Stripe ;
- `StorageService` pour isoler Supabase Storage ;
- `ContractGenerator` pour isoler la génération de contrat ;
- `AuthorizationService` ou policies serveur pour les droits d'accès.

### Héritage

L'héritage est a utiliser uniquement quand la relation "est un" est stable et réelle. Il ne doit pas servir a réutiliser du code par confort.

Pour MamiPet :

- ne pas créer une hiérarchie lourde `User -> Owner -> PetSitter` dans le code métier ;
- un compte peut avoir deux profils, donc la composition est plus juste que l'héritage ;
- préférer `Account` compose avec `OwnerProfile` et/ou `PetSitterProfile`.

### Composition over inheritance

Composer des objets spécialisés est le choix par défaut.

Exemple :

- `PetSitterProfile` possède des espèces, capacités, disponibilités, badges et documents ;
- `Reservation` compose des animaux reserves, services additionnels, paiement et contrat ;
- les adapters techniques sont injectés dans les cas d'usage.

### Polymorphisme

Le polymorphisme doit passer par de petits contrats clairs.

Exemples :

- `PaymentGateway` peut avoir une implémentation `StripeTestPaymentGateway` puis `StripeConnectPaymentGateway` ;
- `GeocodingProvider` peut avoir une implémentation Google Maps ;
- `ContractStorage` peut utiliser Supabase Storage.

## 2. Principes de qualité et simplicité

### SOLID

#### Single Responsibility Principle

Une classe, fonction ou module doit avoir une responsabilité principale.

Exemples :

- un Route Handler validé la requete et appelle un use case ;
- un use case orchestre un scénario ;
- une entité domaine protégé ses invariants ;
- un repository géré la persistance ;
- un adapter communique avec un service externe.

#### Open/Closed Principle

Le code doit permettre d'ajouter un comportement sans casser l'existant.

Exemple :

- ajouter un vrai `StripeConnectPaymentGateway` plus tard sans modifier toutes les routes de réservation.

#### Liskov Substitution Principle

Une implémentation d'interface doit respecter les attentes du contrat.

Exemple :

- toute implémentation de `PaymentGateway` doit renvoyer un resultat cohérent : `pending`, `succeeded`, `failed`, `expired`, etc.

#### Interface Segregation Principle

Preferer plusieurs petites interfaces cohérentes a une interface enorme.

Exemples :

- `ReservationReader` séparé de `ReservationWriter` si nécessaire ;
- `PublicPetSitterSearchRepository` séparé des repositories admin ;
- `StorageUploader` séparé de `StorageDeleter` si les droits divergent.

#### Dependency Inversion Principle

Les use cases et le domaine dependent d'abstractions, pas directement de Supabase, Stripe ou Google Maps.

### DRY

Ne pas dupliquer la même connaissance métier.

Exemples :

- le taux de commission MVP est defini une seule fois ;
- les statuts métier sont centralises ;
- les schémas de validation sont reutilises entre API et tests si possible.

Attention : ne pas factoriser trop tot. Deux codes qui se ressemblent mais evoluent differemment peuvent rester séparés.

### KISS

Choisir la solution la plus simple qui couvre correctement le besoin.

Pour le MVP :

- REST Route Handlers simples ;
- use cases explicites ;
- Supabase RLS pour la sécurité des données ;
- Stripe Connect préparé mais paiement simulé/test au depart ;
- pas de microservices ;
- pas de bus evenementiel complexe.

### YAGNI

Ne pas coder ce qui n'est pas nécessaire maintenant.

Modules préparés mais non implémentés completement au depart :

- messagerie complète ;
- notifications avancées ;
- demandes publiques de garde ;
- dashboards avancés ;
- application mobile native.

### Clean Code

Le code doit être lisible par ses noms, sa structure et son decoupage.

Règles :

- noms en anglais dans le code ;
- fonctions courtes et intentionnelles ;
- erreurs explicites ;
- commentaires uniquement quand ils apportent une vraie valeur ;
- pas de logique métier cachee dans les composants front ;
- pas de logique métier lourde directement dans les Route Handlers.

### Séparation of Concerns

Separations attendues :

- interface web ;
- API REST ;
- use cases applicatifs ;
- domaine ;
- repositories ;
- adapters externes ;
- migrations et policies SQL.

### Single Source of Truth

Une information métier ne doit avoir qu'une source fiable.

Exemples :

- le montant réel de commission appartient au paiement ;
- la réservation garde le taux de commission applique ;
- le mot de passe n'est jamais stocké dans le schéma applicatif, Supabase Auth est la source ;
- les badges actifs sont historises dans la table d'attribution.

### High cohesion / low coupling

Chaque module doit être cohérent et faiblement couple aux autres.

Exemples :

- le module `reservations` connait les contrats dont il a besoin, mais ne doit pas manipuler directement toute la logique de documents professionnels ;
- le module `payments` ne doit pas decider seul des transitions de réservation ;
- le module `admin` orchestre la validation, mais les règles restent explicites.

## 3. Surete, robustesse et invariants

### RAII

RAII est un principe central en C++ pour gérer automatiquement les ressources via la duree de vie des objets. Le backend MamiPet est en TypeScript, donc RAII ne s'applique pas directement comme en C++.

Equivalent pratique attendu :

- toujours fermer/attendre les operations asynchrones ;
- éviter les ressources globales mutables ;
- isoler les clients techniques ;
- gérer les erreurs de fichiers, paiement et storage explicitement.

### Immutability

Preferer les données immuables pour les value objects, commandes, DTO et resultats.

Exemples :

- une commande `CreateReservationCommand` ne doit pas être modifiee pendant le use case ;
- les DTO de réponse sont construits puis renvoyes ;
- les transitions changent l'état via methodes explicites.

### Defensive programming

Toute entree externe est non fiable.

Frontiere a protéger :

- payload API ;
- id dans URL ;
- session utilisateur ;
- webhook Stripe ;
- fichiers uploades ;
- données geographiques ;
- données médicales.

### Fail fast

Une incoherence doit echouer tot, avec une erreur explicite.

Exemples :

- animal n'appartenant pas au propriétaire ;
- réservation non payable ;
- rôle insuffisant ;
- fichier interdit ;
- dates incoherentes.

### Design by contract

Chaque use case doit avoir :

- preconditions ;
- postconditions ;
- invariants.

Exemple `AcceptReservationUseCase` :

- précondition : l'utilisateur est le pet-sitter concerné ;
- précondition : réservation en `awaiting_response` ;
- postcondition : réservation en `awaiting_payment` ;
- postcondition : créneau bloqué ;
- invariant : les statuts de paiement restent séparés.

## 4. Architecture et modélisation

### Domain-Driven Design

Le domaine MamiPet est assez riche pour utiliser une approche DDD pragmatique.

Bounded contexts/modules :

- identity-access ;
- owners ;
- animals ;
- pet-sitters ;
- qualification ;
- search ;
- réservations ;
- payments ;
- contracts ;
- trust-moderation ;
- administration.

Aggregats principaux :

- `Account` ;
- `OwnerProfile` ;
- `PetSitterProfile` ;
- `Animal` ;
- `Reservation` ;
- `Payment` ;
- `Contract` ;
- `Review` ;
- `Report`.

### Hexagonal architecture / ports and adapters

Le coeur métier ne doit pas dépendre directement de Next.js, Supabase ou Stripe.

Ports typiques :

- repositories ;
- payment gateway ;
- storage service ;
- geocoding/search provider ;
- contract generator.

Adapters :

- Supabase repository ;
- Stripe adapter ;
- Google Maps adapter ;
- Supabase Storage adapter.

### Layered architecture

Organisation attendue :

- `presentation` : Route Handlers, DTO, validation HTTP ;
- `application` : use cases ;
- `domain` : entités, value objects, policies métier ;
- `infrastructure` : Supabase, Stripe, Maps, Storage.

### CQRS

CQRS est applique de maniere legere :

- commandes pour modifier l'état ;
- queries pour lire des DTO ;
- pas d'architecture CQRS lourde ni event store dans le MVP.

### Event-based thinking

Les événements métier peuvent être représentés dans le code ou les logs sans installer une architecture evenementielle lourde.

Evenements importants :

- `ReservationCreated` ;
- `ReservationAccepted` ;
- `PaymentSucceeded` ;
- `ContractGenerated` ;
- `ReviewCreated` ;
- `DocumentValidated` ;
- `BadgeAssigned` ;
- `ReportOpened`.

## 5. Tests et validation

### TDD pragmatique

Ecrire les tests avant ou pendant l'implémentation des règles critiques.

Priorité :

- transitions de réservation ;
- calcul commission ;
- restriction animaux/propriétaire ;
- avis après réservation terminée ;
- XOR test validation ;
- permissions critiques.

### Tests unitaires

Ciblent :

- value objects ;
- règles métier ;
- use cases sans infrastructure réelle ;
- calculs ;
- transitions d'états.

### Tests d'intégration

Ciblent :

- Supabase/PostgreSQL ;
- RLS/policies ;
- migrations ;
- Route Handlers ;
- simulation paiement ;
- storage.

### Tests fonctionnels / end-to-end

Ciblent :

- création compte/profils ;
- recherche pet-sitter ;
- réservation directe ;
- acceptation ;
- paiement test ;
- génération contrat ;
- avis.

### Regression testing

Tout bug métier corrige doit produire un test de non-regression si son impact est significatif.

### Testability

Un composant dur a tester signale souvent :

- trop de responsabilités ;
- trop de dependances concrètes ;
- un melange domaine/infrastructure ;
- un payload mal defini.

## 6. Performance et efficacite

### Performance

Ne pas optimiser sans mesure. Le MVP doit d'abord être correct, cohérent et stable.

Points a surveiller :

- recherche géolocalisée ;
- filtres multi-référentiels ;
- chargement des profils publics ;
- policies RLS ;
- liste admin ;
- génération de contrat.

### Complexity awareness

Toujours evaluer :

- complexite métier ;
- complexite algorithmique ;
- coût réseau ;
- coût SQL ;
- coût de maintenance ;
- lisibilite.

### Caching

Autorise uniquement avec stratégie claire.

Candidats :

- référentiels publics ;
- badges ;
- formats/lieux/services ;
- profils publics si invalidation maitrisee.

Ne pas cacher :

- données médicales ;
- paiements ;
- réservations sensibles ;
- autorisations.

### Lazy loading

Charger seulement ce qui est nécessaire.

Exemple :

- une recherche affiche un DTO public leger ;
- une fiche détaillée charge plus d'informations publiques ;
- les documents sensibles ne sont charges que dans un contexte autorisé.

## 7. Lisibilite et maintenance

### Naming

Code et API en anglais.

Exemples :

- `ownerProfile`, `petSitterProfile`, `reservation`, `payment`, `contract`, `review`, `report` ;
- `awaiting_response`, `awaiting_payment`, `paid`, `completed` pour le code si traduction technique retenue ;
- garder une table de correspondance avec les statuts métier français dans la documentation.

### Self-documenting code

Le code doit être comprehensible par :

- noms ;
- types ;
- validation ;
- decoupage ;
- tests.

### Refactoring continu

Refactoriser après stabilisation des tests, sans changer le comportement observable.

### Code review obligatoire

Toute modification importante doit être relue, surtout :

- auth ;
- RLS ;
- paiement ;
- réservation ;
- données médicales ;
- admin ;
- documents.

## 8. Sécurité

### Security by design

La sécurité est intégrée des le depart.

Obligatoire :

- validation stricte des entrees ;
- RLS Supabase ;
- séparation public/privé/sensible ;
- secrets uniquement en variables d'environnement ;
- service rôle jamais exposé au client ;
- logs utiles mais sans fuite de données sensibles ;
- principe du moindre privilege.

### Principle of least privilege

Chaque acteur ne voit et ne modifie que ce qui lui est nécessaire.

### Input validation

Toutes les routes API valident :

- payload ;
- params ;
- query params ;
- session ;
- rôle ;
- ownership.

### Secure defaults

Par défaut :

- pas d'accès public aux données privées ;
- pas de documents accessibles sans autorisation ;
- pas de paiement possible si réservation non eligible ;
- pas d'admin sans `is_admin`.

## 9. Accessibilité et qualité produit

### Accessibility by design

Le backend doit fournir des erreurs, libelles et états exploitables par un front accessible.

Le front devra respecter :

- HTML semantique ;
- navigation clavier ;
- focus visible ;
- contrastes ;
- labels explicites ;
- messages d'erreur comprehensibles ;
- compatibilite lecteurs d'ecran.

### RGAA

Le projet doit viser une interface compatible avec les principes RGAA, surtout pour les formulaires, erreurs et parcours critiques.

### UX consistency

Les termes doivent rester cohérents :

- réservation ;
- profil propriétaire ;
- profil pet-sitter ;
- badge ;
- vérification ;
- paiement ;
- contrat ;
- signalement.

## 10. Produit, scope et execution

### MVP

Le MVP est reduit au coeur de valeur, mais pas bacle.

Coeur MVP :

- comptes/profils ;
- animaux ;
- pet-sitter qualifie ;
- recherche ;
- réservation directe ;
- paiement test ;
- contrat ;
- avis ;
- signalement ;
- back-office minimal.

### Backend-first

Priorité :

- modèle ;
- migrations ;
- RLS ;
- API ;
- DTO ;
- règles ;
- tests ;
- front intégration-ready.

### Incremental delivery

Livrer par increments testables :

1. socle ;
2. profils ;
3. référentiels ;
4. animaux ;
5. pet-sitters ;
6. réservation ;
7. paiement/contrat ;
8. avis/signalement ;
9. admin ;
10. stabilisation.

## 11. Noyau dur permanent

Chaque implémentation doit respecter :

- POO simple et métier ;
- SOLID ;
- DRY sans factorisation prematuree ;
- KISS ;
- YAGNI ;
- Clean Code ;
- Séparation of Concerns ;
- High Cohesion / Low Coupling ;
- Single Source of Truth ;
- Composition over Inheritance ;
- Fail Fast ;
- Defensive Programming ;
- Design by Contract ;
- TDD pragmatique ;
- Security by Design ;
- Accessibility by Design ;
- Backend-First ;
- Refactoring continu ;
- Code review obligatoire ;
- optimisation après mesure.

