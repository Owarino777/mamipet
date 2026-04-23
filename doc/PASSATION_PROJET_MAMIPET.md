# MamiPet - Document complet de comprehension et de passation

Ce document sert de référence projet pour la suite du travail sur MamiPet. Il explique le produit, le contexte, les choix techniques, les règles métier, le modèle de données cible et l'ordre de travail attendu pour poursuivre proprement la modélisation, les UML et le backend.

Il doit être lu avec les schémas suivants :

- `doc/merise/mamipet_mcd_conceptuel.puml`
- `doc/merise/mamipet_mcd_mermaid.md`
- `doc/merise/mamipet_mld_logique.puml`
- `doc/merise/mamipet_mld_mermaid.md`
- `doc/merise/mamipet_mpd_physique.puml`
- `doc/merise/mamipet_mpd_mermaid.md`

Les diagrammes UML produits a partir de cette passation sont ranges dans `doc/UML/`.

## 0. Objet du document

Ce document est la source de vérité fonctionnelle et technique pour reprendre MamiPet sans repartir du prototype no-code. Il sert à :

- comprendre le produit et son positionnement ;
- cadrer le périmètre MVP ;
- aligner les schémas MCD, MLD et MPD ;
- préparer les UML ;
- guider l'implémentation backend ;
- préparer le branchement futur du front ;
- éviter la reintroduction d'anciennes incoherences de modélisation.

Il ne remplace pas les schémas, mais il explique pourquoi ils sont structures ainsi.

## 1. Vision générale du projet

MamiPet est une marketplace de confiance pour la garde d'animaux. Le produit met en relation des propriétaires d'animaux avec des pet-sitters, en insistant sur la sécurité, la vérification, les compétences et la prise en charge d'animaux sensibles.

Le positionnement n'est pas celui d'une simple plateforme generaliste. MamiPet veut devenir une solution spécialisée pour les propriétaires anxieux ou exigeants, notamment ceux qui ont des animaux âgés, fragiles, handicapés, anxieux, sous traitement ou avec des besoins particuliers.

La promesse centrale est la tranquillite d'esprit : trouver un pet-sitter fiable, qualifie, vérifié et capable de prendre en charge un animal dans de bonnes conditions.

## 2. Origine du projet et apprentissages

Le projet a d'abord ete explore avec un prototype no-code realise sur Adalo pendant un challenge Lean Startup. Ce prototype mobile-first a servi à valider rapidement :

- la comprehension du besoin ;
- les parcours principaux ;
- la séparation entre propriétaire et pet-sitter ;
- la logique de recherche ;
- les premiers mecanismes de réservation ;
- la proposition de valeur.

Le prototype Adalo n'est pas la base technique finale. Il sert de validation fonctionnelle et d'outil de test utilisateur. La suite du projet doit être construite sur une stack dediee, scalable et maintenable.

La landing page est un livrable séparé. Elle sert à présenter la promesse, mesurer l'intérêt marché et tester l'engagement via un CTA de recherche de pet-sitter. Elle ne doit pas être confondue avec le MVP applicatif.

Le MVP applicatif réel est une web app responsive avec API, base relationnelle, back-office minimal, paiement test et architecture préparée pour une future application mobile.

## 3. Marche, probleme et differenciation

Les interviews et retours utilisateurs ont mis en evidence plusieurs problemes majeurs :

- beaucoup de propriétaires manquent de confiance dans les solutions existantes ;
- certains ont vecu des experiences graves : negligence, animaux perdus, maltraitance, animaux malades non signales ;
- les animaux sous traitement ou avec besoins spécifiques sont mal couverts par les plateformes concurrentes ;
- les propriétaires veulent davantage de transparence, de suivi et de garanties ;
- les pet-sitters veulent prouver leurs compétences et se differencier.

La differenciation de MamiPet repose sur :

- des profils pet-sitters enrichis ;
- des documents professionnels ou d'identité validables ;
- des compétences de soin structurees ;
- des tests de validation ;
- des badges publics de confiance ;
- des avis vérifiés ;
- une réservation directe sécurisée ;
- un contrat récapitulatif ;
- une assurance modélisée ;
- une commission plateforme de 15 %.

Les modules plus ambitieux comme la messagerie complète, les notifications avancées, les demandes publiques de garde ou les dashboards avancés sont prevus en extension, mais ne sont pas le coeur du MVP critique.

## 4. Objectifs produit

MamiPet poursuit trois objectifs principaux :

1. Créer une communauté de propriétaires et de pet-sitters qualifiés autour de la confiance.
2. Collecter des données utiles sur les besoins de garde, espèces, périodes, prix acceptés et attentes fonctionnelles.
3. Générer du revenu via une commission de 15 % sur les réservations et, plus tard, des abonnements ou options de valorisation pour les pet-sitters.

Les objectifs quantitatifs structurants sont :

- panier moyen estime : 150 euros par garde ;
- commission : 15 %, soit 22,50 euros par réservation moyenne ;
- seuil de rentabilité ciblé : environ 120 réservations mensuelles ;
- objectif long terme de première annee : environ 1 200 réservations cumulees ;
- volume d'affaires ciblé : environ 180 000 euros ;
- revenu plateforme estime : environ 27 000 euros sur une annee complète.

### 4.1 Périmètre MVP opérationnel

Le MVP applicatif réel doit demontrer un flux complet et credible, sans chercher a couvrir tout le produit final.

Le périmètre prioritaire comprend :

- création de compte via Supabase Auth ;
- activation d'un profil propriétaire ;
- activation d'un profil pet-sitter ;
- gestion des profils métier séparés ;
- création et gestion des animaux ;
- dossier médical optionnel et documents animaux ;
- configuration de l'offre pet-sitter : espèces, capacités, lieux, formats, services, disponibilités ;
- dépôt et validation de documents professionnels ;
- tests de validation ;
- attribution et retrait de badges ;
- recherche publique géolocalisée et filtree ;
- consultation de fiche pet-sitter publique ;
- réservation directe ;
- acceptation ou refus par le pet-sitter ;
- blocage logique du créneau ;
- paiement Stripe test ;
- génération du contrat récapitulatif ;
- avis après prestation terminée ;
- signalement ;
- back-office minimal de validation et moderation.

Le MVP ne priorise pas encore la messagerie complète, les demandes publiques de garde, les notifications avancées, les dashboards avancés ou l'application mobile native.

## 5. Stack cible

La stack cible du MVP applicatif est :

- Next.js pour la web app responsive et les routes serveur ;
- React pour l'interface ;
- TypeScript pour la qualité et le typage ;
- Supabase Auth pour l'authentification ;
- PostgreSQL via Supabase pour la base relationnelle ;
- Supabase Storage pour les fichiers si nécessaire ;
- Stripe Connect en mode test pour le paiement marketplace ;
- Google Maps API pour la géolocalisation ;
- Vercel pour l'hebergement front et le déploiement ;
- GitHub pour le versionnement ;
- Firebase Cloud Messaging en extension future pour les notifications.

Le développement doit suivre une approche backend-first : stabiliser le domaine, la base, les règles métier, les accès, les réservations, les paiements et le back-office minimal avant de finaliser l'intégration front.

## 6. Architecture applicative cible

L'architecture logique recommandee suit une séparation en couches :

- interface : pages, composants, formulaires, affichage ;
- application : cas d'usage, orchestration des workflows ;
- domaine : règles métier, transitions d'états, invariants ;
- infrastructure : Supabase, Stripe, Google Maps, stockage, notifications ;
- données : schéma PostgreSQL, RLS, migrations, seeds.

Le decoupage fonctionnel conseille est :

- identité-accès ;
- propriétaires ;
- animaux ;
- pet-sitters ;
- qualification ;
- recherche-matching ;
- réservations ;
- paiements ;
- contractualisation ;
- confiance-moderation ;
- administration.

## 7. Acteurs du système

### 7.1 Visiteur

Le visiteur non connecte peut :

- consulter des profils pet-sitters publics ;
- consulter une liste ou carte de profils publics ;
- utiliser certains filtres publics ;
- accéder aux informations publiques nécessaires à la compréhension du service.

Il ne peut pas :

- reserver ;
- voir les données privées ;
- voir les données médicales ;
- accéder aux documents ;
- accéder au back-office.

### 7.2 Utilisateur authentifie

L'utilisateur authentifie correspond au compte applicatif. Il peut activer un profil propriétaire, un profil pet-sitter ou les deux.

Regle majeure : compte, rôle et profil ne sont pas la même chose.

### 7.3 Propriétaire

Le propriétaire peut :

- completer son profil ;
- créer plusieurs animaux ;
- renseigner des besoins spécifiques ;
- créer un dossier médical pour un animal ;
- joindre des documents animaux ;
- rechercher des pet-sitters ;
- consulter les profils publics detailles ;
- créer une demande de réservation directe ;
- payer en mode test ;
- consulter le contrat récapitulatif ;
- déposer un avis après prestation terminée ;
- signaler un incident ou un contenu.

### 7.4 Pet-sitter

Le pet-sitter peut :

- créer et gérer son profil public ;
- définir les espèces acceptées ;
- définir les capacités de soin maîtrisées ;
- déclarer les lieux de garde proposés ;
- déclarer les formats de garde proposés ;
- déclarer les services additionnels proposés ;
- renseigner ses disponibilités ;
- déposer des documents professionnels ;
- passer des tests de validation ;
- recevoir des badges publics ;
- souscrire un abonnement ;
- accepter ou refuser une demande de réservation.

### 7.5 Administrateur

L'administrateur peut :

- consulter les comptes et profils ;
- valider ou rejeter des documents ;
- changer le statut de vérification d'un pet-sitter ;
- attribuer ou retirer des badges ;
- consulter les réservations ;
- consulter les paiements ;
- traiter les signalements ;
- moderer les contenus ;
- suivre les actions sensibles.

## 8. Verite actuelle du modèle de données

Les schémas actuels ont ete corriges pour être alignes avec une vision backend propre. Cette section est la source de vérité a retenir.

### 8.1 Compte utilisateur

`compte_utilisateur` représente le compte applicatif rattache a Supabase Auth.

Point important : le schéma applicatif ne stocké pas de mot de passe hashe. L'authentification est gérée par Supabase Auth. `compte_utilisateur.id_compte` doit correspondre a `auth.users.id`.

Un compte peut activer :

- zero ou un profil propriétaire ;
- zero ou un profil pet-sitter ;
- les deux si l'utilisateur utilisé les deux rôles.

### 8.2 Profils métier

`profil_proprietaire` et `profil_pet_sitter` sont séparés. Cette séparation évite de melanger l'identité du compte avec les données propres a chaque usage.

Le profil propriétaire sert à reserver et gérer les animaux.

Le profil pet-sitter sert à être visible, qualifier l'offre, déclarer les compétences, disponibilités, documents, tests, badges et abonnements.

### 8.3 Referentiels

Les référentiels sont normalises et ne doivent pas être fusionnes :

- `espece` ;
- `capacite_soin` ;
- `lieu_garde` ;
- `format_garde` ;
- `service_additionnel` ;
- `badge_public`.

Cette séparation est indispensable pour les filtres, la recherche, la tarification, l'évolution et la cohérence métier.

Valeurs initiales recommandees pour les seeds :

- espèces : chien, chat, oiseau, petit mammifère, reptile, invertébré, amphibien, animal de la ferme ;
- capacités de soin : animal âge, sous traitement, handicapé, anxieux ou sensible, alimentation spécifique, surveillance renforcee, protocole veterinaire leger ;
- lieux de garde : chez le pet-sitter, chez le propriétaire, visite ;
- formats de garde : journee, nuit, weekend, longue duree ;
- services additionnels : administration de traitement, suivi photo/video, promenade supplementaire, transport, nettoyage spécifique ;
- badges publics : Verified Identity, Pro, Expert.

Important : ces valeurs peuvent évoluer, mais les categories ne doivent pas être fusionnees. Le lieu, le format, la capacité et le service ne decrivent pas la même notion.

### 8.4 Animaux et médical

Un propriétaire possède plusieurs animaux.

Un animal :

- appartient a un seul propriétaire ;
- appartient a une seule espèce ;
- peut avoir zero ou un dossier médical ;
- peut être rattache a plusieurs réservations dans le temps.

Le dossier médical est optionnel et confidentiel. Les documents animaux sont rattaches au dossier médical. Ces informations ne doivent jamais être publiques.

### 8.5 Qualification pet-sitter

Un pet-sitter peut déclarer :

- plusieurs espèces acceptées ;
- plusieurs capacités de soin ;
- plusieurs lieux de garde ;
- plusieurs formats de garde ;
- plusieurs services additionnels ;
- plusieurs disponibilités ;
- plusieurs documents professionnels ;
- plusieurs tests de validation ;
- plusieurs badges historises ;
- plusieurs abonnements dans le temps, mais un seul actif ou en essai.

### 8.6 Tests de validation

Un test de validation cible un seul périmètre :

- soit une espèce ;
- soit une capacité de soin ;
- jamais les deux.

Dans le modèle actuel, cette règle est clarifiee par `type_perimetre`. Elle doit être appliquee par une contrainte XOR.

### 8.7 Badges publics

Les badges publics du MVP sont :

- Verified Identity ;
- Pro ;
- Expert.

Un badge public n'est pas un statut de profil. Il s'agit d'un élément affichable qui valorise une garantie.

Le statut de vérification du profil reste distinct :

- brouillon ;
- publie_non_verifie ;
- identite_verifiee ;
- professionnel_verifie ;
- suspendu ;
- rejete.

Expert est un badge ou une qualification, pas un statut.

### 8.8 Disponibilités

Une disponibilité est un créneau declare par un pet-sitter.

Elle contient :

- date debut ;
- date fin ;
- statut ;
- commentaire.

La disponibilité peut être associee a une réservation lorsqu'un créneau est bloqué. Cette relation rend explicite le lien entre acceptation de réservation et blocage du calendrier.

Statuts physiques recommandes :

- `disponible` ;
- `indisponible` ;
- `bloque_reservation`.

Si `id_reservation` est renseigne, le statut doit être cohérent avec un blocage de réservation. Une disponibilité libre ne doit pas pointer vers une réservation.

### 8.9 Réservation

La réservation est le coeur du flux critique.

Elle relie :

- un profil propriétaire ;
- un profil pet-sitter ;
- un lieu de garde ;
- un format de garde ;
- un ou plusieurs animaux du propriétaire ;
- zero ou plusieurs services additionnels.

Elle contient :

- date de demande ;
- date debut ;
- date fin ;
- statut métier ;
- niveau d'assurance applique ;
- tarif convenu ;
- taux de commission plateforme ;
- consignes ;
- motif de refus ;
- motif d'annulation ;
- date de réponse.

Dans le modèle actuel, la réservation stocké le taux de commission, pas le montant final de commission. Le montant réel de commission appartient au paiement.

### 8.10 Réservation et animaux

`reservation_animal` garantit qu'une réservation peut concerner plusieurs animaux, mais uniquement des animaux appartenant au propriétaire de la réservation.

Cette table porte :

- le tarif par animal ;
- les notes propres à l'animal dans cette réservation.

C'est un invariant métier critique.

### 8.11 Paiement

Le paiement est séparé de la réservation.

Il contient :

- statut de paiement Stripe ;
- montant total ;
- commission plateforme calculee ;
- montant prestataire ;
- références Stripe ;
- dates de paiement, expiration et remboursement.

Les statuts de paiement ne sont pas les statuts de réservation.

### 8.12 Contrat récapitulatif

Le contrat récapitulatif est généré a partir de la réservation après paiement reussi.

Il contient :

- réservation ;
- date de génération ;
- niveau d'assurance ;
- clauses standard ;
- chemin de fichier ;
- hash du document.

Au MVP, il y a un contrat principal par réservation.

### 8.13 Avis

L'avis dépend uniquement de la réservation.

Il ne doit pas être relie directement au propriétaire ou au pet-sitter, car ces informations sont deduites de la réservation.

Un avis :

- est unique par réservation ;
- est possible seulement après réservation terminée ;
- concerne la prestation, pas le paiement ;
- peut recevoir une réponse du pet-sitter.

### 8.14 Signalement

Le signalement est un ticket de support/moderation.

Dans le modèle actuel, il peut cibler au plus une cible directe parmi :

- réservation ;
- profil pet-sitter ;
- avis.

Il peut aussi rester général si nécessaire.

Il contient :

- créateur ;
- categorie ;
- motif ;
- statut ticket ;
- commentaire de résolution ;
- date de signalement ;
- date de résolution.

Categories recommandees :

- `reservation` ;
- `profil` ;
- `avis` ;
- `incident` ;
- `autre`.

Statuts recommandes :

- `ouvert` ;
- `en_cours` ;
- `traite` ;
- `rejete` ;
- `clos`.

Règle de ciblage : au plus une cible directe parmi réservation, profil pet-sitter et avis. Un signalement général peut rester sans cible directe.

## 9. Cycles de vie

### 9.1 Profil pet-sitter

Statuts :

- brouillon ;
- publie_non_verifie ;
- identite_verifiee ;
- professionnel_verifie ;
- suspendu ;
- rejete.

Lecture :

- brouillon : profil incomplet, non visible ;
- publie_non_verifie : visible mais non vérifié, moins mis en avant ;
- identite_verifiee : identité validée, badge Verified Identity possible ;
- professionnel_verifie : documents professionnels validés, badge Pro possible ;
- suspendu : profil temporairement bloqué ;
- rejete : profil refuse.

### 9.2 Réservation

Statuts métier :

- en_attente_reponse ;
- acceptée ;
- refusee ;
- en_attente_paiement ;
- payée ;
- annulee ;
- terminée ;
- incident_signale.

Transition cible :

1. création par le propriétaire : `en_attente_reponse` ;
2. refus pet-sitter : `refusee` avec motif possible ;
3. acceptation pet-sitter : `acceptee` ;
4. blocage du créneau : disponibilité reliee et bloquée ;
5. attente paiement : `en_attente_paiement` ;
6. paiement Stripe reussi : `payee` ;
7. fin de prestation : `terminee` ;
8. incident : `incident_signale` ;
9. annulation possible selon règles : `annulee`.

### 9.3 Paiement

Statuts paiement :

- pending ;
- succeeded ;
- failed ;
- refunded ;
- partially_refunded ;
- expired.

Ces statuts ne remplacent jamais ceux de la réservation.

### 9.4 Documents professionnels

Statuts :

- soumis ;
- validé ;
- rejete ;
- expire.

### 9.5 Tests de validation

Statuts :

- a_passer ;
- reussi ;
- echoue ;
- expire.

### 9.6 Signalements

Statuts :

- ouvert ;
- en_cours ;
- traite ;
- rejete ;
- clos.

## 10. Flux critique du MVP

Le flux prioritaire à implémenter est la réservation directe.

Etapes :

1. le propriétaire se connecte ;
2. il active ou complète son profil propriétaire ;
3. il crée un ou plusieurs animaux ;
4. il recherche un pet-sitter avec filtres ;
5. il consulte une fiche pet-sitter publique ;
6. il selectionne dates, lieu, format, animaux et services ;
7. il crée une réservation en attente de réponse ;
8. le pet-sitter accepte ou refuse ;
9. si le pet-sitter accepte, le système bloqué le créneau ;
10. la réservation passe en attente de paiement ;
11. Stripe créé ou confirme le paiement test ;
12. si le paiement reussit, la réservation passe a payée ;
13. le contrat récapitulatif est généré ;
14. la prestation se deroule ;
15. la réservation passe a terminée ;
16. le propriétaire peut déposer un avis ;
17. un signalement peut être ouvert si besoin.

## 11. Recherche et visibilite publique

Un profil pet-sitter public doit exposer uniquement les données utiles à la décision :

- pseudo ou prenom ;
- photo ;
- ville ;
- tarif de depart ;
- badges actifs ;
- statut ou niveau de vérification visible ;
- espèces acceptées ;
- capacités de soin ;
- lieux et formats proposés ;
- services additionnels ;
- resume de disponibilité.

Ne jamais exposer publiquement :

- email ;
- téléphone brut ;
- adresse complète ;
- coordonnées exactes ;
- documents ;
- dossier médical ;
- éléments de paiement ;
- commentaires admin ;
- signalements.

La localisation doit être utile mais protectrice : afficher une zone ou ville, pas une adresse précise trop tot dans le parcours.

## 12. Règles métier et invariants a tester

### 12.1 Identité

- un email correspond a un seul compte ;
- un compte a au plus un profil propriétaire ;
- un compte a au plus un profil pet-sitter ;
- les profils métier ne sont pas interchangeables.

### 12.2 Animaux

- un animal appartient a un seul propriétaire ;
- un animal a une seule espèce ;
- un animal peut avoir zero ou un dossier médical ;
- un dossier médical appartient a un seul animal ;
- les documents animaux ne sont pas publics.

### 12.3 Qualification

- un pet-sitter peut accepter plusieurs espèces ;
- un pet-sitter peut maîtriser plusieurs capacités ;
- espèces, capacités, lieux, formats et services restent séparés ;
- un test cible une espèce ou une capacité, jamais les deux ;
- un badge actif ne peut pas être duplique pour le même pet-sitter ;
- un abonnement actif ou en essai ne peut pas être duplique.

### 12.4 Réservation

- la date de fin est après la date de debut ;
- une réservation concerne au moins un animal ;
- tous les animaux d'une réservation appartiennent au propriétaire de la réservation ;
- une réservation ne peut pas être payée si elle n'a pas ete acceptée ;
- l'acceptation doit entrainer un blocage logique de créneau ;
- les statuts de réservation et de paiement restent séparés.

### 12.5 Paiement

- montant total supérieur ou égal à la commission ;
- taux commission MVP = 15 % ;
- montant prestataire = montant total - commission ;
- un paiement principal est rattache a une seule réservation.

### 12.6 Avis

- un avis est unique par réservation ;
- un avis est possible uniquement si la réservation est terminée ;
- le pet-sitter peut répondre ;
- la réponse du pet-sitter ne doit pas être datee avant l'avis.

### 12.7 Signalement

- un signalement a un créateur ;
- un signalement ouvre un ticket traçable ;
- date de résolution >= date de signalement si elle existe ;
- au plus une cible directe parmi réservation, profil pet-sitter et avis.

### 12.8 Scénarios critiques a transformer en tests

Les tests doivent couvrir au minimum :

- création de compte et recuperation du compte applicatif ;
- activation d'un profil propriétaire ;
- activation d'un profil pet-sitter ;
- impossibilité de créer deux profils propriétaires pour le même compte ;
- impossibilité de créer deux profils pet-sitters pour le même compte ;
- création d'un animal rattache au bon propriétaire ;
- création d'un dossier médical optionnel ;
- protection des documents animaux ;
- configuration des espèces acceptées par un pet-sitter ;
- configuration des capacités de soin ;
- création d'une disponibilité avec date de fin après date de debut ;
- rejet d'une disponibilité avec dates incoherentes ;
- création d'un test de validation sur une espèce ;
- création d'un test de validation sur une capacité ;
- rejet d'un test qui cible à la fois une espèce et une capacité ;
- attribution d'un badge actif ;
- rejet d'un doublon de badge actif ;
- création d'un abonnement actif ;
- rejet d'un deuxième abonnement actif ou essai ;
- recherche publique qui n'exposé pas email, téléphone, adresse complète ou documents ;
- création d'une réservation avec plusieurs animaux du même propriétaire ;
- rejet d'une réservation contenant un animal d'un autre propriétaire ;
- acceptation d'une réservation par le bon pet-sitter ;
- blocage du créneau après acceptation ;
- impossibilité de payer une réservation non acceptée ;
- création et confirmation d'un paiement Stripe test ;
- génération d'un contrat récapitulatif ;
- impossibilité de déposer un avis avant réservation terminée ;
- dépôt d'un avis après réservation terminée ;
- réponse du pet-sitter a un avis ;
- création d'un signalement général ;
- création d'un signalement ciblé ;
- rejet d'un signalement avec plusieurs cibles directes ;
- traitement administratif d'un document professionnel ;
- attribution et retrait d'un badge par administrateur.

## 13. Sécurité, RGPD et accès

La sécurité ne doit jamais dépendre du front.

Principes :

- utiliser Supabase Auth pour l'identité ;
- protéger les tables par RLS ;
- créer des DTO/vues publiques pour les profils pet-sitters ;
- séparer données publiques, privées et sensibles ;
- limiter l'exposition des coordonnées ;
- journaliser les actions administratives sensibles ;
- stocker les documents dans un espace contrôle ;
- prevoir export et suppression RGPD ;
- ne pas exposer les données médicales hors contexte autorisé.

Droits typiques :

- visiteur : lecture publique uniquement ;
- propriétaire : lecture/ecriture sur son profil, ses animaux, ses réservations ;
- pet-sitter : lecture/ecriture sur son profil, ses disponibilités, ses documents, ses réponses ;
- administrateur : validation, moderation, suivi, attribution badges.

### 13.1 Policies RLS minimales attendues

Les policies RLS ou contrôles serveur doivent garantir au minimum :

- un utilisateur lit son propre `compte_utilisateur` ;
- un utilisateur modifie uniquement ses propres profils ;
- un propriétaire lit et modifie uniquement ses animaux ;
- un propriétaire lit les dossiers médicaux de ses animaux ;
- un pet-sitter ne voit les informations médicales détaillées qu'en contexte de réservation autorisé ;
- un pet-sitter modifie uniquement ses disponibilités et documents professionnels ;
- les visiteurs lisent uniquement une projection publique des profils pet-sitters visibles ;
- les documents animaux et professionnels ne sont jamais servis par une URL publique non controlee ;
- les réservations sont visibles par le propriétaire concerné, le pet-sitter concerné et l'administrateur ;
- les paiements sont visibles par les parties concernees et l'administrateur, avec données Stripe limitees côté front ;
- les signalements sont visibles par leur créateur et l'administration ;
- les actions administratives sensibles sont reservees aux administrateurs.

### 13.2 Back-office minimal attendu

Le back-office MVP doit permettre :

- consulter les profils pet-sitters a vérifier ;
- consulter les documents professionnels soumis ;
- valider, rejeter ou expirer un document ;
- changer le statut de vérification d'un pet-sitter ;
- attribuer ou retirer un badge ;
- consulter les réservations et leur statut ;
- consulter les paiements et leur statut ;
- consulter les signalements ;
- faire évoluer un ticket de signalement ;
- ajouter un commentaire de résolution ;
- conserver une trace des actions sensibles.

## 14. API et contrats attendus pour le front

Le front ne doit pas consommer directement toutes les tables brutes. Il faut exposer des contrats stables.

### 14.1 Identité et profils

- créer compte via Supabase Auth ;
- récupérer compte courant ;
- activer profil propriétaire ;
- activer profil pet-sitter ;
- lire/modifier profil propriétaire ;
- lire/modifier profil pet-sitter.

### 14.2 Referentiels

- lister espèces ;
- lister capacités de soin ;
- lister lieux de garde ;
- lister formats de garde ;
- lister services additionnels ;
- lister badges publics.

### 14.3 Animaux

- créer animal ;
- modifier animal ;
- supprimer animal ;
- lister mes animaux ;
- créer ou modifier dossier médical ;
- joindre un document animal.

### 14.4 Pet-sitter et qualification

- mettre à jour espèces acceptées ;
- mettre à jour capacités ;
- mettre à jour lieux ;
- mettre à jour formats ;
- mettre à jour services additionnels ;
- déclarer disponibilités ;
- déposer document professionnel ;
- consulter tests ;
- consulter badges ;
- consulter abonnement.

### 14.5 Recherche publique

- rechercher pet-sitters ;
- filtrer par espèce, capacité, lieu, format, dates, tarif, badges, distance ;
- récupérer fiche publique détaillée.

### 14.6 Réservations

- créer demande de réservation ;
- consulter demandes envoyées ;
- consulter demandes reçues ;
- accepter demande ;
- refuser demande ;
- annuler réservation ;
- déclarer incident ;
- passer réservation a terminée.

### 14.7 Paiements et contrats

- créer intention Stripe ;
- confirmer paiement ;
- récupérer statut paiement ;
- générer contrat récapitulatif ;
- consulter contrat.

### 14.8 Avis et signalements

- déposer avis ;
- répondre a un avis ;
- créer signalement ;
- consulter ses signalements.

### 14.9 Administration

- lister profils a valider ;
- valider/rejeter documents ;
- changer statut vérification ;
- attribuer/retirer badges ;
- consulter réservations ;
- consulter paiements ;
- consulter signalements ;
- traiter signalements.

## 15. Modules préparés mais non prioritaires

Ces modules doivent rester compatibles avec l'architecture, mais ne doivent pas alourdir le MVP critique :

- demandes publiques de garde ;
- réponses de pet-sitters a une demande publique ;
- messagerie complète ;
- notifications push avancées ;
- moderation enrichie ;
- dashboards professionnels ;
- back-office statistique avancé ;
- application mobile native.

## 16. UML produits

Les UML sont dérivés de ce document et des schémas MCD/MLD/MPD.

Fichiers produits dans `doc/UML/` :

1. `mamipet_use_cases.puml` : diagramme de cas d'utilisation ;
2. `mamipet_class_domain.puml` : diagramme de classes domaine ;
3. `mamipet_state_reservation.puml` : diagramme d'états réservation ;
4. `mamipet_state_profil_pet_sitter.puml` : diagramme d'états profil pet-sitter ;
5. `mamipet_sequence_reservation_directe.puml` : sequence réservation directe ;
6. `mamipet_sequence_validation_documentaire.puml` : sequence validation documentaire ;
7. `mamipet_activity_recherche_reservation.puml` : activite recherche/réservation ;
8. `mamipet_component_architecture.puml` : composants applicatifs ;
9. `mamipet_deployment.puml` : déploiement cible.

Points de vigilance UML :

- acteurs : Visiteur, Utilisateur authentifie, Propriétaire, Pet-sitter, Administrateur ;
- Propriétaire et Pet-sitter heritent de Utilisateur authentifie ;
- ne pas créer d'acteur flou comme "Membre" ;
- ne pas relier avis directement au paiement ;
- ne pas melanger états de paiement et états de réservation ;
- ne pas faire du diagramme de classes une copie brute du MPD.

## 17. Définition of Done backend

Un backend MVP est considere cohérent si :

- Supabase Auth fonctionne ;
- les profils propriétaire et pet-sitter sont activables separement ;
- les référentiels sont seedes ;
- un propriétaire peut créer des animaux ;
- un animal peut avoir un dossier médical confidentiel ;
- un pet-sitter peut configurer son offre ;
- la recherche publique exposé uniquement des données publiques ;
- une réservation directe peut être créée ;
- le pet-sitter peut accepter ou refuser ;
- l'acceptation bloqué un créneau ;
- un paiement Stripe test peut être rattache ;
- un contrat récapitulatif est généré ;
- un avis peut être depose uniquement après réservation terminée ;
- un signalement ouvre un ticket ;
- les règles critiques sont couvertes par tests ;
- les données sensibles sont protegees par RLS ou services backend.

## 18. Ce qu'il ne faut pas faire

- Ne pas utiliser le prototype Adalo comme modèle technique final.
- Ne pas stocker de mot de passe hashe dans `compte_utilisateur`.
- Ne pas fusionner compte, rôle et profil.
- Ne pas fusionner espèce, capacité, lieu, format et service.
- Ne pas confondre statut de vérification et badge public.
- Ne pas confondre réservation et paiement.
- Ne pas relier directement avis a propriétaire/pet-sitter si la réservation suffit.
- Ne pas rendre publiques les données médicales, documents, adresses complètes ou coordonnées exactes.
- Ne pas construire la sécurité dans le front.
- Ne pas commencer par une UI riche avant d'avoir verrouille les règles backend.

## 19. Ordre de travail recommande

1. Valider le document de passation et les schémas MCD/MLD/MPD.
2. Maintenir les UML propres avec les schémas.
3. Ecrire les migrations SQL Supabase.
4. Seeder les référentiels.
5. Mettre en place les policies RLS.
6. Implementer les cas d'usage backend.
7. Implementer le flux réservation directe.
8. Brancher Stripe test.
9. Ajouter génération contrat.
10. Ajouter avis et signalements.
11. Ajouter back-office minimal.
12. Ecrire tests unitaires et intégration.
13. Brancher le front sur des DTO propres.

## 20. Resume opérationnel

MamiPet est une marketplace de confiance pour la garde d'animaux, orientée propriétaires anxieux, animaux sensibles et pet-sitters qualifiés. Le coeur technique repose sur un compte unique, des profils métier séparés, des référentiels normalises, des animaux avec informations médicales protegees, des pet-sitters qualifiés par documents, tests et badges, une recherche publique controlee, une réservation directe, un paiement Stripe test, un contrat récapitulatif, des avis et des signalements.

Le projet doit rester backend-first. Les schémas MCD/MLD/MPD actuels constituent la base de référence pour les prochains UML et pour l'implémentation backend.
