# Principes d'ingenierie obligatoires

Ce document fixe les principes a respecter pendant l'implementation de MamiPet. Il ne sert pas a sur-ingenierer le projet : il sert a garder un backend simple, robuste, testable, securise et pret a integrer le front.

## 1. Fondamentaux de conception

### POO - Programmation orientee objet

La POO organise le code autour d'objets representant des concepts metier ou techniques, avec leurs donnees et comportements.

Pour MamiPet, la POO doit rester simple et metier :

- les objets de domaine representent les notions importantes : `Reservation`, `PetSitterProfile`, `OwnerProfile`, `Animal`, `Payment`, `Contract`, `Review`, `Report` ;
- les invariants importants doivent etre proteges au plus pres du domaine ;
- une classe ne doit pas etre creee uniquement pour "faire objet" ;
- les classes doivent clarifier les responsabilites, pas ajouter du bruit.

### Encapsulation

Un objet doit proteger son etat interne. On ne doit pas pouvoir le placer facilement dans un etat incoherent depuis l'exterieur.

Exemples MamiPet :

- une reservation ne doit pas passer a `paid` si elle n'est pas `awaiting_payment` ;
- un avis ne doit pas etre cree si la reservation n'est pas `completed` ;
- un test de validation ne doit pas cibler a la fois une espece et une capacite de soin.

### Abstraction

Une abstraction doit simplifier l'usage sans masquer les regles importantes.

Bonnes abstractions attendues :

- `ReservationRepository` pour persister les reservations ;
- `PaymentGateway` pour isoler Stripe ;
- `StorageService` pour isoler Supabase Storage ;
- `ContractGenerator` pour isoler la generation de contrat ;
- `AuthorizationService` ou policies serveur pour les droits d'acces.

### Heritage

L'heritage est a utiliser uniquement quand la relation "est un" est stable et reelle. Il ne doit pas servir a reutiliser du code par confort.

Pour MamiPet :

- ne pas creer une hierarchie lourde `User -> Owner -> PetSitter` dans le code metier ;
- un compte peut avoir deux profils, donc la composition est plus juste que l'heritage ;
- preferer `Account` compose avec `OwnerProfile` et/ou `PetSitterProfile`.

### Composition over inheritance

Composer des objets specialises est le choix par defaut.

Exemple :

- `PetSitterProfile` possede des especes, capacites, disponibilites, badges et documents ;
- `Reservation` compose des animaux reserves, services additionnels, paiement et contrat ;
- les adapters techniques sont injectes dans les cas d'usage.

### Polymorphisme

Le polymorphisme doit passer par de petits contrats clairs.

Exemples :

- `PaymentGateway` peut avoir une implementation `StripeTestPaymentGateway` puis `StripeConnectPaymentGateway` ;
- `GeocodingProvider` peut avoir une implementation Google Maps ;
- `ContractStorage` peut utiliser Supabase Storage.

## 2. Principes de qualite et simplicite

### SOLID

#### Single Responsibility Principle

Une classe, fonction ou module doit avoir une responsabilite principale.

Exemples :

- un Route Handler valide la requete et appelle un use case ;
- un use case orchestre un scenario ;
- une entite domaine protege ses invariants ;
- un repository gere la persistance ;
- un adapter communique avec un service externe.

#### Open/Closed Principle

Le code doit permettre d'ajouter un comportement sans casser l'existant.

Exemple :

- ajouter un vrai `StripeConnectPaymentGateway` plus tard sans modifier toutes les routes de reservation.

#### Liskov Substitution Principle

Une implementation d'interface doit respecter les attentes du contrat.

Exemple :

- toute implementation de `PaymentGateway` doit renvoyer un resultat coherent : `pending`, `succeeded`, `failed`, `expired`, etc.

#### Interface Segregation Principle

Preferer plusieurs petites interfaces coherentes a une interface enorme.

Exemples :

- `ReservationReader` separe de `ReservationWriter` si necessaire ;
- `PublicPetSitterSearchRepository` separe des repositories admin ;
- `StorageUploader` separe de `StorageDeleter` si les droits divergent.

#### Dependency Inversion Principle

Les use cases et le domaine dependent d'abstractions, pas directement de Supabase, Stripe ou Google Maps.

### DRY

Ne pas dupliquer la meme connaissance metier.

Exemples :

- le taux de commission MVP est defini une seule fois ;
- les statuts metier sont centralises ;
- les schemas de validation sont reutilises entre API et tests si possible.

Attention : ne pas factoriser trop tot. Deux codes qui se ressemblent mais evoluent differemment peuvent rester separes.

### KISS

Choisir la solution la plus simple qui couvre correctement le besoin.

Pour le MVP :

- REST Route Handlers simples ;
- use cases explicites ;
- Supabase RLS pour la securite des donnees ;
- Stripe Connect prepare mais paiement simule/test au depart ;
- pas de microservices ;
- pas de bus evenementiel complexe.

### YAGNI

Ne pas coder ce qui n'est pas necessaire maintenant.

Modules prepares mais non implementes completement au depart :

- messagerie complete ;
- notifications avancees ;
- demandes publiques de garde ;
- dashboards avances ;
- application mobile native.

### Clean Code

Le code doit etre lisible par ses noms, sa structure et son decoupage.

Regles :

- noms en anglais dans le code ;
- fonctions courtes et intentionnelles ;
- erreurs explicites ;
- commentaires uniquement quand ils apportent une vraie valeur ;
- pas de logique metier cachee dans les composants front ;
- pas de logique metier lourde directement dans les Route Handlers.

### Separation of Concerns

Separations attendues :

- interface web ;
- API REST ;
- use cases applicatifs ;
- domaine ;
- repositories ;
- adapters externes ;
- migrations et policies SQL.

### Single Source of Truth

Une information metier ne doit avoir qu'une source fiable.

Exemples :

- le montant reel de commission appartient au paiement ;
- la reservation garde le taux de commission applique ;
- le mot de passe n'est jamais stocke dans le schema applicatif, Supabase Auth est la source ;
- les badges actifs sont historises dans la table d'attribution.

### High cohesion / low coupling

Chaque module doit etre coherent et faiblement couple aux autres.

Exemples :

- le module `reservations` connait les contrats dont il a besoin, mais ne doit pas manipuler directement toute la logique de documents professionnels ;
- le module `payments` ne doit pas decider seul des transitions de reservation ;
- le module `admin` orchestre la validation, mais les regles restent explicites.

## 3. Surete, robustesse et invariants

### RAII

RAII est un principe central en C++ pour gerer automatiquement les ressources via la duree de vie des objets. Le backend MamiPet est en TypeScript, donc RAII ne s'applique pas directement comme en C++.

Equivalent pratique attendu :

- toujours fermer/attendre les operations asynchrones ;
- eviter les ressources globales mutables ;
- isoler les clients techniques ;
- gerer les erreurs de fichiers, paiement et storage explicitement.

### Immutability

Preferer les donnees immuables pour les value objects, commandes, DTO et resultats.

Exemples :

- une commande `CreateReservationCommand` ne doit pas etre modifiee pendant le use case ;
- les DTO de reponse sont construits puis renvoyes ;
- les transitions changent l'etat via methodes explicites.

### Defensive programming

Toute entree externe est non fiable.

Frontiere a proteger :

- payload API ;
- id dans URL ;
- session utilisateur ;
- webhook Stripe ;
- fichiers uploades ;
- donnees geographiques ;
- donnees medicales.

### Fail fast

Une incoherence doit echouer tot, avec une erreur explicite.

Exemples :

- animal n'appartenant pas au proprietaire ;
- reservation non payable ;
- role insuffisant ;
- fichier interdit ;
- dates incoherentes.

### Design by contract

Chaque use case doit avoir :

- preconditions ;
- postconditions ;
- invariants.

Exemple `AcceptReservationUseCase` :

- precondition : l'utilisateur est le pet-sitter concerne ;
- precondition : reservation en `awaiting_response` ;
- postcondition : reservation en `awaiting_payment` ;
- postcondition : creneau bloque ;
- invariant : les statuts de paiement restent separes.

## 4. Architecture et modelisation

### Domain-Driven Design

Le domaine MamiPet est assez riche pour utiliser une approche DDD pragmatique.

Bounded contexts/modules :

- identity-access ;
- owners ;
- animals ;
- pet-sitters ;
- qualification ;
- search ;
- reservations ;
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

Le coeur metier ne doit pas dependre directement de Next.js, Supabase ou Stripe.

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
- `domain` : entites, value objects, policies metier ;
- `infrastructure` : Supabase, Stripe, Maps, Storage.

### CQRS

CQRS est applique de maniere legere :

- commandes pour modifier l'etat ;
- queries pour lire des DTO ;
- pas d'architecture CQRS lourde ni event store dans le MVP.

### Event-based thinking

Les evenements metier peuvent etre representes dans le code ou les logs sans installer une architecture evenementielle lourde.

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

Ecrire les tests avant ou pendant l'implementation des regles critiques.

Priorite :

- transitions de reservation ;
- calcul commission ;
- restriction animaux/proprietaire ;
- avis apres reservation terminee ;
- XOR test validation ;
- permissions critiques.

### Tests unitaires

Ciblent :

- value objects ;
- regles metier ;
- use cases sans infrastructure reelle ;
- calculs ;
- transitions d'etats.

### Tests d'integration

Ciblent :

- Supabase/PostgreSQL ;
- RLS/policies ;
- migrations ;
- Route Handlers ;
- simulation paiement ;
- storage.

### Tests fonctionnels / end-to-end

Ciblent :

- creation compte/profils ;
- recherche pet-sitter ;
- reservation directe ;
- acceptation ;
- paiement test ;
- generation contrat ;
- avis.

### Regression testing

Tout bug metier corrige doit produire un test de non-regression si son impact est significatif.

### Testability

Un composant dur a tester signale souvent :

- trop de responsabilites ;
- trop de dependances concretes ;
- un melange domaine/infrastructure ;
- un payload mal defini.

## 6. Performance et efficacite

### Performance

Ne pas optimiser sans mesure. Le MVP doit d'abord etre correct, coherent et stable.

Points a surveiller :

- recherche geolocalisee ;
- filtres multi-referentiels ;
- chargement des profils publics ;
- policies RLS ;
- liste admin ;
- generation de contrat.

### Complexity awareness

Toujours evaluer :

- complexite metier ;
- complexite algorithmique ;
- cout reseau ;
- cout SQL ;
- cout de maintenance ;
- lisibilite.

### Caching

Autorise uniquement avec strategie claire.

Candidats :

- referentiels publics ;
- badges ;
- formats/lieux/services ;
- profils publics si invalidation maitrisee.

Ne pas cacher :

- donnees medicales ;
- paiements ;
- reservations sensibles ;
- autorisations.

### Lazy loading

Charger seulement ce qui est necessaire.

Exemple :

- une recherche affiche un DTO public leger ;
- une fiche detaillee charge plus d'informations publiques ;
- les documents sensibles ne sont charges que dans un contexte autorise.

## 7. Lisibilite et maintenance

### Naming

Code et API en anglais.

Exemples :

- `ownerProfile`, `petSitterProfile`, `reservation`, `payment`, `contract`, `review`, `report` ;
- `awaiting_response`, `awaiting_payment`, `paid`, `completed` pour le code si traduction technique retenue ;
- garder une table de correspondance avec les statuts metier francais dans la documentation.

### Self-documenting code

Le code doit etre comprehensible par :

- noms ;
- types ;
- validation ;
- decoupage ;
- tests.

### Refactoring continu

Refactoriser apres stabilisation des tests, sans changer le comportement observable.

### Code review obligatoire

Toute modification importante doit etre relue, surtout :

- auth ;
- RLS ;
- paiement ;
- reservation ;
- donnees medicales ;
- admin ;
- documents.

## 8. Securite

### Security by design

La securite est integree des le depart.

Obligatoire :

- validation stricte des entrees ;
- RLS Supabase ;
- separation public/prive/sensible ;
- secrets uniquement en variables d'environnement ;
- service role jamais expose au client ;
- logs utiles mais sans fuite de donnees sensibles ;
- principe du moindre privilege.

### Principle of least privilege

Chaque acteur ne voit et ne modifie que ce qui lui est necessaire.

### Input validation

Toutes les routes API valident :

- payload ;
- params ;
- query params ;
- session ;
- role ;
- ownership.

### Secure defaults

Par defaut :

- pas d'acces public aux donnees privees ;
- pas de documents accessibles sans autorisation ;
- pas de paiement possible si reservation non eligible ;
- pas d'admin sans `is_admin`.

## 9. Accessibilite et qualite produit

### Accessibility by design

Le backend doit fournir des erreurs, libelles et etats exploitables par un front accessible.

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

Les termes doivent rester coherents :

- reservation ;
- profil proprietaire ;
- profil pet-sitter ;
- badge ;
- verification ;
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
- reservation directe ;
- paiement test ;
- contrat ;
- avis ;
- signalement ;
- back-office minimal.

### Backend-first

Priorite :

- modele ;
- migrations ;
- RLS ;
- API ;
- DTO ;
- regles ;
- tests ;
- front integration-ready.

### Incremental delivery

Livrer par increments testables :

1. socle ;
2. profils ;
3. referentiels ;
4. animaux ;
5. pet-sitters ;
6. reservation ;
7. paiement/contrat ;
8. avis/signalement ;
9. admin ;
10. stabilisation.

## 11. Noyau dur permanent

Chaque implementation doit respecter :

- POO simple et metier ;
- SOLID ;
- DRY sans factorisation prematuree ;
- KISS ;
- YAGNI ;
- Clean Code ;
- Separation of Concerns ;
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
- optimisation apres mesure.

