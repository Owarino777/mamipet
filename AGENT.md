# AGENT.md - Règles de contribution IA/dev pour MamiPet

Ce fichier cadre le travail de toute IA ou développeur intervenant sur MamiPet. Il doit être lu avant toute implémentation.

## 1. Mission du projet

MamiPet est une marketplace de confiance pour la garde d'animaux, spécialement orientée vers les animaux sensibles : âgés, sous traitement, handicapés, anxieux ou avec besoins particuliers.

Le MVP applicatif réel n'est pas le prototype Adalo. Le prototype a servi à valider les parcours, mais le produit final repose sur une architecture backend-first propre.

## 2. Source de vérité

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

Les schémas sont dans :

- `doc/merise/`
- `doc/UML/`

## 3. Règle de langue et d'accents

La documentation métier, les documents techniques rédigés en français et tous les textes affichés au front doivent utiliser un français correct avec les accents nécessaires à la compréhension.

Les accents peuvent être absents uniquement dans les identifiants techniques : noms de fichiers, routes API, noms de fonctions, noms de classes, DTO, tables, colonnes, statuts techniques, clés JSON, variables, schémas PlantUML/Mermaid et blocs de code.

Règle pratique : prose française accentuée, identifiants techniques stables.

## 4. Architecture obligatoire

Stack retenue :

- Next.js ;
- React ;
- TypeScript strict ;
- API REST via Route Handlers ;
- Supabase Auth ;
- Supabase PostgreSQL ;
- Supabase Storage ;
- RLS ;
- Stripe Connect préparé mais paiement MVP simulé/test ;
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

Chaque module doit séparer :

- `domain` : règles, entités, value objects, invariants ;
- `application` : use cases, ports, orchestration ;
- `infrastructure` : Supabase, Stripe, Storage, Maps ;
- `presentation` : DTO, mappers, schémas HTTP.

## 5. Règles produit non négociables

- Compte utilisateur, rôle et profil métier sont distincts.
- Un compte peut avoir un profil propriétaire et/ou un profil pet-sitter.
- Le mot de passe n'est jamais stocké dans le schéma applicatif.
- Supabase Auth est la source pour l'authentification.
- Les données médicales ne sont jamais publiques.
- Les documents animaux et documents professionnels sont privés.
- Les profils publics n'exposent jamais email, téléphone brut, adresse complète ou coordonnées exactes.
- Le statut de vérification du pet-sitter n'est pas un badge.
- Expert est un badge ou une qualification, pas un statut.
- Une réservation concerne un ou plusieurs animaux du même propriétaire.
- Une réservation acceptée doit bloquer un créneau.
- Une réservation ne peut pas être payée si elle n'est pas en attente de paiement.
- Le paiement est distinct de la réservation.
- Les statuts de paiement ne remplacent jamais les statuts de réservation.
- Un avis est possible seulement après réservation terminée.
- Un avis dépend de la réservation, pas directement du paiement.
- Un signalement ouvre un ticket traçable.
- La commission MVP est de 15 %.

## 6. Fondamentaux de conception

### POO - Programmation orientée objet

La POO organise le code autour d'objets représentant des entités métier ou techniques, avec leurs données et leurs comportements.

Le but n'est pas de mettre des classes partout. Le but est de modéliser correctement le domaine, limiter les effets de bord, encapsuler les responsabilités et rendre le code maintenable.

Piliers :

- Encapsulation : cacher l'état interne et exposer seulement ce qui est utile.
- Abstraction : montrer ce qui est important et masquer le détail inutile.
- Héritage : réutiliser une structure existante uniquement quand la relation métier "est un" est vraie.
- Polymorphisme : manipuler plusieurs implémentations via un même contrat.

Bonne pratique MamiPet :

- préférer une POO simple, claire et métier ;
- éviter la POO sur-ingéniérée ;
- préférer la composition à l'héritage.

### Encapsulation

Un objet doit rester valide par construction. Il ne faut pas exposer directement des données si cela permet de casser ses invariants.

Exemples :

- `Reservation` protège ses transitions ;
- `Payment` protège ses statuts ;
- `ValidationTest` protège la contrainte espèce XOR capacité ;
- `Review` protège la règle "réservation terminée uniquement".

### Abstraction

Une bonne abstraction simplifie l'usage. Une mauvaise abstraction masque mal la complexité ou introduit du flou.

Abstractions attendues :

- repositories ;
- payment gateway ;
- storage service ;
- geocoding provider ;
- contract generator.

### Héritage

L'héritage doit être rare. L'utiliser uniquement quand la relation est stable et logique.

Interdit :

- créer une hiérarchie `User -> Owner -> PetSitter`, car un même compte peut être les deux.

### Composition over inheritance

Assembler des composants spécialisés est le choix par défaut.

Exemple :

- `Account` compose `OwnerProfile` et/ou `PetSitterProfile` ;
- `Reservation` compose animaux réservés, services, paiement et contrat ;
- les use cases reçoivent des ports/adapters injectés.

### Polymorphisme

Utiliser plusieurs implémentations derrière un contrat.

Exemples :

- `PaymentGateway` : simulation MVP puis Stripe Connect réel ;
- `StorageService` : Supabase Storage ;
- `GeocodingProvider` : Google Maps.

## 7. Principes de qualité et simplicité

### SOLID

#### S - Single Responsibility Principle

Une classe, un module ou une fonction ne doit avoir qu'une responsabilité réelle.

#### O - Open/Closed Principle

Un composant doit être ouvert à l'extension mais fermé à la modification.

#### L - Liskov Substitution Principle

Une classe dérivée ou implémentation doit pouvoir remplacer son contrat sans comportement incohérent.

#### I - Interface Segregation Principle

Préférer plusieurs petites interfaces cohérentes à une grosse interface fourre-tout.

#### D - Dependency Inversion Principle

Le code métier dépend d'abstractions, pas d'implémentations concrètes.

### DRY - Don't Repeat Yourself

Ne pas dupliquer la même connaissance métier ou technique. Ne pas factoriser trop tôt.

### KISS - Keep It Simple

Toujours choisir la solution la plus simple qui répond correctement au besoin.

### YAGNI - You Aren't Gonna Need It

Ne pas développer maintenant ce qui n'est pas nécessaire maintenant.

Modules hors MVP critique :

- messagerie complète ;
- notifications avancées ;
- demandes publiques de garde ;
- dashboards avancés ;
- mobile natif ;
- moteur assureur complexe.

### Clean Code

Un code propre :

- a des noms clairs ;
- sépare les responsabilités ;
- évite les effets de bord inutiles ;
- reste compréhensible vite ;
- ne surprend pas inutilement.

### Séparation of Concerns

Séparations obligatoires :

- interface ;
- logique métier ;
- accès données ;
- infrastructure ;
- orchestration.

### Single Source of Truth

Une information ne doit avoir qu'une source fiable.

Exemples :

- Supabase Auth pour l'authentification ;
- paiement pour les montants réels de commission ;
- réservation pour le taux de commission appliqué ;
- attribution de badge pour les badges actifs.

### High Cohesion / Low Coupling

Chaque composant doit faire un ensemble de choses liées, avec le moins de dépendances possible.

## 8. Sûreté, robustesse et invariants

### RAII

RAII est central en C++ : une ressource est acquise dans le constructeur et libérée dans le destructeur.

MamiPet est en TypeScript, donc l'équivalent pratique est :

- gérer explicitement les ressources asynchrones ;
- ne pas laisser de promesses non attendues ;
- isoler les clients techniques ;
- gérer les erreurs de storage, paiement, base et réseau.

### Immutability

Quand une donnée n'a pas besoin de changer, elle ne doit pas changer.

Commandes, DTO, value objects et résultats doivent être traités comme immuables autant que possible.

### Defensive Programming

Toute entrée externe est non fiable :

- payload API ;
- params ;
- query params ;
- session ;
- fichier ;
- webhook Stripe ;
- données géographiques.

### Fail Fast

Échouer tôt quand l'état est invalide :

- dates incohérentes ;
- animal d'un autre propriétaire ;
- réservation non payable ;
- rôle insuffisant ;
- statut invalide ;
- fichier non autorisé.

### Design by Contract

Chaque use case doit préciser :

- préconditions ;
- postconditions ;
- invariants.

## 9. Architecture et modélisation

### Domain-Driven Design

Le domaine MamiPet doit guider le code.

Concepts utiles :

- langage ubiquitaire ;
- entités ;
- value objects ;
- agrégats ;
- services de domaine ;
- bounded contexts.

Bounded contexts :

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

### Hexagonal Architecture / Ports & Adapters

Le cœur métier ne dépend pas directement de la base, du framework, du web ou d'un provider externe.

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

CQRS léger :

- commandes pour modifier ;
- queries pour lire ;
- pas d'event store ni architecture lourde dans le MVP.

### Event-based thinking

Penser les événements importants :

- réservation created ;
- réservation accepted ;
- payment succeeded ;
- contract generated ;
- document validated ;
- badge assigned ;
- report opened.

Ne pas installer une architecture événementielle lourde sans besoin prouvé.

## 10. Tests et validation

### TDD pragmatique

Écrire les tests avant ou pendant les règles critiques.

Cycle :

1. test qui échoue ;
2. code minimal ;
3. refactorisation.

### Tests unitaires

Couvrent :

- règles métier ;
- calculs ;
- validations ;
- transformations ;
- transitions d'états.

### Tests d'intégration

Couvrent :

- base de données ;
- RLS ;
- repositories ;
- API ;
- storage ;
- paiement test.

### Tests fonctionnels / E2E

Couvrent les parcours utilisateurs et système complets.

### Regression Testing

Tout bug important corrigé doit produire un test empêchant sa réapparition.

### Testability

Si un composant est impossible à tester proprement, il est probablement trop couplé, trop gros ou mal découpé.

## 11. Performance et efficacité

### Performance

Ne pas optimiser à l'aveugle. Mesurer, identifier les vrais goulots, optimiser après preuve.

### Complexity Awareness

Raisonner sur :

- complexité algorithmique ;
- coût mémoire ;
- coût réseau ;
- coût I/O ;
- coût SQL ;
- coût de maintenance.

### Caching

Autorisé avec stratégie claire d'invalidation.

Ne pas cacher :

- données médicales ;
- paiements ;
- autorisations ;
- secrets.

### Lazy Loading

Charger seulement ce qui est nécessaire.

## 12. Lisibilité et maintenance

### Naming

Le code, les routes API et les DTO sont en anglais.

Les noms doivent exprimer l'intention métier ou technique sans ambiguïté.

### Self-documenting code

Le code doit être compréhensible par sa structure, ses noms et ses types.

### Refactoring

Améliorer la structure sans changer le comportement observable.

### Code Review

Toute modification importante doit être relue, surtout :

- auth ;
- RLS ;
- paiement ;
- réservation ;
- données médicales ;
- documents ;
- admin.

## 13. Sécurité

### Security by Design

La sécurité est pensée dès la conception.

Obligatoire :

- moindre privilège ;
- validation stricte ;
- secrets en variables d'environnement ;
- séparation des rôles ;
- journalisation utile ;
- protection données sensibles ;
- RLS Supabase.

### Principle of Least Privilege

Chaque utilisateur, service ou composant a uniquement les permissions nécessaires.

### Input Validation

Toute donnée externe est non fiable par défaut.

### Secure Defaults

Par défaut :

- accès refusé ;
- données privées cachées ;
- documents non publics ;
- service rôle jamais côté client.

## 14. Accessibilité et qualité produit

### Accessibility

Le front doit être utilisable au clavier, avec structure sémantique, focus visible, contrastes, labels, messages d'erreur compréhensibles et compatibilité lecteurs d'écran.

### RGAA

L'objectif n'est pas seulement de passer un audit, mais de rendre l'interface exploitable.

### UX Consistency

Les termes, actions et comportements doivent rester cohérents.

## 15. Produit, scope et exécution

### MVP

Un MVP n'est pas un produit bâclé. C'est un produit réduit au cœur de valeur.

Cœur MVP :

- comptes ;
- profils ;
- animaux ;
- qualification pet-sitter ;
- recherche ;
- réservation directe ;
- paiement test ;
- contrat ;
- avis ;
- signalement ;
- admin minimal.

### Backend-First

Stabiliser d'abord :

- modèle métier ;
- contrats API ;
- données ;
- règles ;
- sécurité ;
- flux critiques.

### Incremental Delivery

Livrer par incréments cohérents, testables et démontrables.

## 16. Noyau dur permanent

À respecter sur chaque contribution :

- POO ;
- SOLID ;
- DRY ;
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

## 17. Documentation obligatoire

Après chaque changement important :

1. vérifier si `doc/tech/*` doit être mis à jour ;
2. vérifier si `doc/merise/*` ou `doc/UML/*` doivent être mis à jour ;
3. vérifier si `doc/audits/*` est impacté ;
4. indiquer explicitement dans le compte rendu si aucune documentation n'a été modifiée.

## 18. Interdictions

- Ne pas utiliser Adalo comme modèle technique final.
- Ne pas exposer la clé service rôle.
- Ne pas stocker de mot de passe dans le schéma applicatif.
- Ne pas exposer les données médicales publiquement.
- Ne pas faire consommer les tables brutes par le front.
- Ne pas mélanger paiement et réservation.
- Ne pas coder les modules hors MVP critique sans décision explicite.
- Ne pas introduire une abstraction sans besoin clair.
