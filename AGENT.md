# AGENT.md - Regles de contribution IA/dev pour MamiPet

Ce fichier cadre le travail de toute IA ou developpeur intervenant sur MamiPet. Il doit etre lu avant toute implementation.

## 1. Mission du projet

MamiPet est une marketplace de confiance pour la garde d'animaux, specialement orientee vers les animaux sensibles : ages, sous traitement, handicapes, anxieux ou avec besoins particuliers.

Le MVP applicatif reel n'est pas le prototype Adalo. Le prototype a servi a valider les parcours, mais le produit final repose sur une architecture backend-first propre.

## 2. Source de verite

Avant de coder, lire :

- `README.md`
- `doc/PASSATION_PROJET_MAMIPET.md`
- `doc/tech/ARCHITECTURE_DECISION.md`
- `doc/tech/PROJECT_STRUCTURE.md`
- `doc/tech/API_CONTRACTS.md`
- `doc/tech/openapi.yaml`
- `doc/tech/DTO_CONTRACTS.md`
- `doc/tech/ACCESS_CONTROL_MATRIX.md`
- `doc/tech/DOMAIN_RULES.md`
- `doc/tech/TEST_STRATEGY.md`
- `doc/tech/ENVIRONMENT_AND_SECRETS.md`
- `doc/tech/BACKEND_IMPLEMENTATION_PLAN.md`
- `doc/tech/ENGINEERING_PRINCIPLES.md`

Les schemas sont dans :

- `doc/merise/`
- `doc/UML/`

## 3. Architecture obligatoire

Stack retenue :

- Next.js ;
- React ;
- TypeScript strict ;
- API REST via Route Handlers ;
- Supabase Auth ;
- Supabase PostgreSQL ;
- Supabase Storage ;
- RLS ;
- Stripe Connect prepare mais paiement MVP simule/test ;
- Google Maps API ;
- Vercel.

Architecture cible :

```txt
src/
  app/
    api/
  modules/
    identity-access/
    owners/
    animals/
    pet-sitters/
    qualification/
    search/
    reservations/
    payments/
    contracts/
    trust-moderation/
    administration/
  shared/
```

Chaque module doit separer :

- `domain` : regles, entites, value objects, invariants ;
- `application` : use cases, ports, orchestration ;
- `infrastructure` : Supabase, Stripe, Storage, Maps ;
- `presentation` : DTO, mappers, schemas HTTP.

## 4. Regles produit non negociables

- Compte utilisateur, role et profil metier sont distincts.
- Un compte peut avoir un profil proprietaire et/ou un profil pet-sitter.
- Le mot de passe n'est jamais stocke dans le schema applicatif.
- Supabase Auth est la source pour l'authentification.
- Les donnees medicales ne sont jamais publiques.
- Les documents animaux et documents professionnels sont prives.
- Les profils publics n'exposent jamais email, telephone brut, adresse complete ou coordonnees exactes.
- Le statut de verification du pet-sitter n'est pas un badge.
- Expert est un badge ou une qualification, pas un statut.
- Une reservation concerne un ou plusieurs animaux du meme proprietaire.
- Une reservation acceptee doit bloquer un creneau.
- Une reservation ne peut pas etre payee si elle n'est pas en attente de paiement.
- Le paiement est distinct de la reservation.
- Les statuts de paiement ne remplacent jamais les statuts de reservation.
- Un avis est possible seulement apres reservation terminee.
- Un avis depend de la reservation, pas directement du paiement.
- Un signalement ouvre un ticket tracable.
- La commission MVP est de 15 %.

## 5. Fondamentaux de conception

### POO - Programmation orientee objet

La POO organise le code autour d'objets representant des entites metier ou techniques, avec leurs donnees et leurs comportements.

Le but n'est pas de mettre des classes partout. Le but est de modeliser correctement le domaine, limiter les effets de bord, encapsuler les responsabilites et rendre le code maintenable.

Piliers :

- Encapsulation : cacher l'etat interne et exposer seulement ce qui est utile.
- Abstraction : montrer ce qui est important et masquer le detail inutile.
- Heritage : reutiliser une structure existante uniquement quand la relation metier "est un" est vraie.
- Polymorphisme : manipuler plusieurs implementations via un meme contrat.

Bonne pratique MamiPet :

- preferer une POO simple, claire et metier ;
- eviter la POO sur-ingenieree ;
- preferer la composition a l'heritage.

### Encapsulation

Un objet doit rester valide par construction. Il ne faut pas exposer directement des donnees si cela permet de casser ses invariants.

Exemples :

- `Reservation` protege ses transitions ;
- `Payment` protege ses statuts ;
- `ValidationTest` protege la contrainte espece XOR capacite ;
- `Review` protege la regle "reservation terminee uniquement".

### Abstraction

Une bonne abstraction simplifie l'usage. Une mauvaise abstraction masque mal la complexite ou introduit du flou.

Abstractions attendues :

- repositories ;
- payment gateway ;
- storage service ;
- geocoding provider ;
- contract generator.

### Heritage

L'heritage doit etre rare. L'utiliser uniquement quand la relation est stable et logique.

Interdit :

- creer une hierarchie `User -> Owner -> PetSitter`, car un meme compte peut etre les deux.

### Composition over inheritance

Assembler des composants specialises est le choix par defaut.

Exemple :

- `Account` compose `OwnerProfile` et/ou `PetSitterProfile` ;
- `Reservation` compose animaux reserves, services, paiement et contrat ;
- les use cases recoivent des ports/adapters injectes.

### Polymorphisme

Utiliser plusieurs implementations derriere un contrat.

Exemples :

- `PaymentGateway` : simulation MVP puis Stripe Connect reel ;
- `StorageService` : Supabase Storage ;
- `GeocodingProvider` : Google Maps.

## 6. Principes de qualite et simplicite

### SOLID

#### S - Single Responsibility Principle

Une classe, un module ou une fonction ne doit avoir qu'une responsabilite reelle.

#### O - Open/Closed Principle

Un composant doit etre ouvert a l'extension mais ferme a la modification.

#### L - Liskov Substitution Principle

Une classe derivee ou implementation doit pouvoir remplacer son contrat sans comportement incoherent.

#### I - Interface Segregation Principle

Preferer plusieurs petites interfaces coherentes a une grosse interface fourre-tout.

#### D - Dependency Inversion Principle

Le code metier depend d'abstractions, pas d'implementations concretes.

### DRY - Don't Repeat Yourself

Ne pas dupliquer la meme connaissance metier ou technique. Ne pas factoriser trop tot.

### KISS - Keep It Simple

Toujours choisir la solution la plus simple qui repond correctement au besoin.

### YAGNI - You Aren't Gonna Need It

Ne pas developper maintenant ce qui n'est pas necessaire maintenant.

Modules hors MVP critique :

- messagerie complete ;
- notifications avancees ;
- demandes publiques de garde ;
- dashboards avances ;
- mobile natif ;
- moteur assureur complexe.

### Clean Code

Un code propre :

- a des noms clairs ;
- separe les responsabilites ;
- evite les effets de bord inutiles ;
- reste comprehensible vite ;
- ne surprend pas inutilement.

### Separation of Concerns

Separations obligatoires :

- interface ;
- logique metier ;
- acces donnees ;
- infrastructure ;
- orchestration.

### Single Source of Truth

Une information ne doit avoir qu'une source fiable.

Exemples :

- Supabase Auth pour l'authentification ;
- paiement pour les montants reels de commission ;
- reservation pour le taux de commission applique ;
- attribution de badge pour les badges actifs.

### High Cohesion / Low Coupling

Chaque composant doit faire un ensemble de choses liees, avec le moins de dependances possible.

## 7. Surete, robustesse et invariants

### RAII

RAII est central en C++ : une ressource est acquise dans le constructeur et liberee dans le destructeur.

MamiPet est en TypeScript, donc l'equivalent pratique est :

- gerer explicitement les ressources asynchrones ;
- ne pas laisser de promesses non attendues ;
- isoler les clients techniques ;
- gerer les erreurs de storage, paiement, base et reseau.

### Immutability

Quand une donnee n'a pas besoin de changer, elle ne doit pas changer.

Commandes, DTO, value objects et resultats doivent etre traites comme immuables autant que possible.

### Defensive Programming

Toute entree externe est non fiable :

- payload API ;
- params ;
- query params ;
- session ;
- fichier ;
- webhook Stripe ;
- donnees geographiques.

### Fail Fast

Echouer tot quand l'etat est invalide :

- dates incoherentes ;
- animal d'un autre proprietaire ;
- reservation non payable ;
- role insuffisant ;
- statut invalide ;
- fichier non autorise.

### Design by Contract

Chaque use case doit preciser :

- preconditions ;
- postconditions ;
- invariants.

## 8. Architecture et modelisation

### Domain-Driven Design

Le domaine MamiPet doit guider le code.

Concepts utiles :

- langage ubiquitaire ;
- entites ;
- value objects ;
- agregats ;
- services de domaine ;
- bounded contexts.

Bounded contexts :

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

### Hexagonal Architecture / Ports & Adapters

Le coeur metier ne depend pas directement de la base, du framework, du web ou d'un provider externe.

Ports :

- repositories ;
- payment gateway ;
- storage service ;
- geocoding provider ;
- contract generator.

Adapters :

- Supabase ;
- Stripe ;
- Google Maps ;
- Supabase Storage.

### Layered Architecture

Couches :

- presentation ;
- application ;
- domaine ;
- infrastructure ;
- persistance.

Les couches doivent rester utiles, pas bureaucratiques.

### CQRS

CQRS leger :

- commandes pour modifier ;
- queries pour lire ;
- pas d'event store ni architecture lourde dans le MVP.

### Event-based thinking

Penser les evenements importants :

- reservation created ;
- reservation accepted ;
- payment succeeded ;
- contract generated ;
- document validated ;
- badge assigned ;
- report opened.

Ne pas installer une architecture evenementielle lourde sans besoin prouve.

## 9. Tests et validation

### TDD pragmatique

Ecrire les tests avant ou pendant les regles critiques.

Cycle :

1. test qui echoue ;
2. code minimal ;
3. refactorisation.

### Tests unitaires

Couvrent :

- regles metier ;
- calculs ;
- validations ;
- transformations ;
- transitions d'etats.

### Tests d'integration

Couvrent :

- base de donnees ;
- RLS ;
- repositories ;
- API ;
- storage ;
- paiement test.

### Tests fonctionnels / E2E

Couvrent les parcours utilisateurs et systeme complets.

### Regression Testing

Tout bug important corrige doit produire un test empechant sa reapparition.

### Testability

Si un composant est impossible a tester proprement, il est probablement trop couple, trop gros ou mal decoupe.

## 10. Performance et efficacite

### Performance

Ne pas optimiser a l'aveugle. Mesurer, identifier les vrais goulots, optimiser apres preuve.

### Complexity Awareness

Raisonner sur :

- complexite algorithmique ;
- cout memoire ;
- cout reseau ;
- cout I/O ;
- cout SQL ;
- cout de maintenance.

### Caching

Autorise avec strategie claire d'invalidation.

Ne pas cacher :

- donnees medicales ;
- paiements ;
- autorisations ;
- secrets.

### Lazy Loading

Charger seulement ce qui est necessaire.

## 11. Lisibilite et maintenance

### Naming

Le code, les routes API et les DTO sont en anglais.

Les noms doivent exprimer l'intention metier ou technique sans ambiguite.

### Self-documenting code

Le code doit etre comprehensible par sa structure, ses noms et ses types.

### Refactoring

Ameliorer la structure sans changer le comportement observable.

### Code Review

Toute modification importante doit etre relue, surtout :

- auth ;
- RLS ;
- paiement ;
- reservation ;
- donnees medicales ;
- documents ;
- admin.

## 12. Securite

### Security by Design

La securite est pensee des la conception.

Obligatoire :

- moindre privilege ;
- validation stricte ;
- secrets en variables d'environnement ;
- separation des roles ;
- journalisation utile ;
- protection donnees sensibles ;
- RLS Supabase.

### Principle of Least Privilege

Chaque utilisateur, service ou composant a uniquement les permissions necessaires.

### Input Validation

Toute donnee externe est non fiable par defaut.

### Secure Defaults

Par defaut :

- acces refuse ;
- donnees privees cachees ;
- documents non publics ;
- service role jamais cote client.

## 13. Accessibilite et qualite produit

### Accessibility

Le front doit etre utilisable au clavier, avec structure semantique, focus visible, contrastes, labels, messages d'erreur comprehensibles et compatibilite lecteurs d'ecran.

### RGAA

L'objectif n'est pas seulement de passer un audit, mais de rendre l'interface exploitable.

### UX Consistency

Les termes, actions et comportements doivent rester coherents.

## 14. Produit, scope et execution

### MVP

Un MVP n'est pas un produit bacle. C'est un produit reduit au coeur de valeur.

Coeur MVP :

- comptes ;
- profils ;
- animaux ;
- qualification pet-sitter ;
- recherche ;
- reservation directe ;
- paiement test ;
- contrat ;
- avis ;
- signalement ;
- admin minimal.

### Backend-First

Stabiliser d'abord :

- modele metier ;
- contrats API ;
- donnees ;
- regles ;
- securite ;
- flux critiques.

### Incremental Delivery

Livrer par increments coherents, testables et demonstrables.

## 15. Noyau dur permanent

A respecter sur chaque contribution :

- POO ;
- SOLID ;
- DRY ;
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

## 16. Documentation obligatoire

Apres chaque changement important :

1. verifier si `doc/tech/*` doit etre mis a jour ;
2. verifier si `doc/merise/*` ou `doc/UML/*` doivent etre mis a jour ;
3. verifier si `doc/audits/*` est impacte ;
4. indiquer explicitement dans le compte rendu si aucune documentation n'a ete modifiee.

## 17. Interdictions

- Ne pas utiliser Adalo comme modele technique final.
- Ne pas exposer la cle service role.
- Ne pas stocker de mot de passe dans le schema applicatif.
- Ne pas exposer les donnees medicales publiquement.
- Ne pas faire consommer les tables brutes par le front.
- Ne pas melanger paiement et reservation.
- Ne pas coder les modules hors MVP critique sans decision explicite.
- Ne pas introduire une abstraction sans besoin clair.

