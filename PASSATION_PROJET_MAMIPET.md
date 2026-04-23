# MamiPet - Document complet de comprehension et de passation

Ce document sert de reference projet pour la suite du travail sur MamiPet. Il explique le produit, le contexte, les choix techniques, les regles metier, le modele de donnees cible et l'ordre de travail attendu pour poursuivre proprement la modelisation, les UML et le backend.

Il doit etre lu avec les schemas suivants :

- `mamipet_mcd_conceptuel.puml`
- `mamipet_mcd_mermaid.md`
- `mamipet_mld_logique.puml`
- `mamipet_mld_mermaid.md`
- `mamipet_mpd_physique.puml`
- `mamipet_mpd_mermaid.md`

## 0. Objet du document

Ce document est la source de verite fonctionnelle et technique pour reprendre MamiPet sans repartir du prototype no-code. Il sert a :

- comprendre le produit et son positionnement ;
- cadrer le perimetre MVP ;
- aligner les schemas MCD, MLD et MPD ;
- preparer les UML ;
- guider l'implementation backend ;
- preparer le branchement futur du front ;
- eviter la reintroduction d'anciennes incoherences de modelisation.

Il ne remplace pas les schemas, mais il explique pourquoi ils sont structures ainsi.

## 1. Vision generale du projet

MamiPet est une marketplace de confiance pour la garde d'animaux. Le produit met en relation des proprietaires d'animaux avec des pet-sitters, en insistant sur la securite, la verification, les competences et la prise en charge d'animaux sensibles.

Le positionnement n'est pas celui d'une simple plateforme generaliste. MamiPet veut devenir une solution specialisee pour les proprietaires anxieux ou exigeants, notamment ceux qui ont des animaux ages, fragiles, handicapes, anxieux, sous traitement ou avec des besoins particuliers.

La promesse centrale est la tranquillite d'esprit : trouver un pet-sitter fiable, qualifie, verifie et capable de prendre en charge un animal dans de bonnes conditions.

## 2. Origine du projet et apprentissages

Le projet a d'abord ete explore avec un prototype no-code realise sur Adalo pendant un challenge Lean Startup. Ce prototype mobile-first a servi a valider rapidement :

- la comprehension du besoin ;
- les parcours principaux ;
- la separation entre proprietaire et pet-sitter ;
- la logique de recherche ;
- les premiers mecanismes de reservation ;
- la proposition de valeur.

Le prototype Adalo n'est pas la base technique finale. Il sert de validation fonctionnelle et d'outil de test utilisateur. La suite du projet doit etre construite sur une stack dediee, scalable et maintenable.

La landing page est un livrable separe. Elle sert a presenter la promesse, mesurer l'interet marche et tester l'engagement via un CTA de recherche de pet-sitter. Elle ne doit pas etre confondue avec le MVP applicatif.

Le MVP applicatif reel est une web app responsive avec API, base relationnelle, back-office minimal, paiement test et architecture preparee pour une future application mobile.

## 3. Marche, probleme et differenciation

Les interviews et retours utilisateurs ont mis en evidence plusieurs problemes majeurs :

- beaucoup de proprietaires manquent de confiance dans les solutions existantes ;
- certains ont vecu des experiences graves : negligence, animaux perdus, maltraitance, animaux malades non signales ;
- les animaux sous traitement ou avec besoins specifiques sont mal couverts par les plateformes concurrentes ;
- les proprietaires veulent davantage de transparence, de suivi et de garanties ;
- les pet-sitters veulent prouver leurs competences et se differencier.

La differenciation de MamiPet repose sur :

- des profils pet-sitters enrichis ;
- des documents professionnels ou d'identite validables ;
- des competences de soin structurees ;
- des tests de validation ;
- des badges publics de confiance ;
- des avis verifies ;
- une reservation directe securisee ;
- un contrat recapitulatif ;
- une assurance modelisee ;
- une commission plateforme de 15 %.

Les modules plus ambitieux comme la messagerie complete, les notifications avancees, les demandes publiques de garde ou les dashboards avances sont prevus en extension, mais ne sont pas le coeur du MVP critique.

## 4. Objectifs produit

MamiPet poursuit trois objectifs principaux :

1. Creer une communaute de proprietaires et de pet-sitters qualifies autour de la confiance.
2. Collecter des donnees utiles sur les besoins de garde, especes, periodes, prix acceptes et attentes fonctionnelles.
3. Generer du revenu via une commission de 15 % sur les reservations et, plus tard, des abonnements ou options de valorisation pour les pet-sitters.

Les objectifs quantitatifs structurants sont :

- panier moyen estime : 150 euros par garde ;
- commission : 15 %, soit 22,50 euros par reservation moyenne ;
- seuil de rentabilite cible : environ 120 reservations mensuelles ;
- objectif long terme de premiere annee : environ 1 200 reservations cumulees ;
- volume d'affaires cible : environ 180 000 euros ;
- revenu plateforme estime : environ 27 000 euros sur une annee complete.

### 4.1 Perimetre MVP operationnel

Le MVP applicatif reel doit demontrer un flux complet et credible, sans chercher a couvrir tout le produit final.

Le perimetre prioritaire comprend :

- creation de compte via Supabase Auth ;
- activation d'un profil proprietaire ;
- activation d'un profil pet-sitter ;
- gestion des profils metier separes ;
- creation et gestion des animaux ;
- dossier medical optionnel et documents animaux ;
- configuration de l'offre pet-sitter : especes, capacites, lieux, formats, services, disponibilites ;
- depot et validation de documents professionnels ;
- tests de validation ;
- attribution et retrait de badges ;
- recherche publique geolocalisee et filtree ;
- consultation de fiche pet-sitter publique ;
- reservation directe ;
- acceptation ou refus par le pet-sitter ;
- blocage logique du creneau ;
- paiement Stripe test ;
- generation du contrat recapitulatif ;
- avis apres prestation terminee ;
- signalement ;
- back-office minimal de validation et moderation.

Le MVP ne priorise pas encore la messagerie complete, les demandes publiques de garde, les notifications avancees, les dashboards avances ou l'application mobile native.

## 5. Stack cible

La stack cible du MVP applicatif est :

- Next.js pour la web app responsive et les routes serveur ;
- React pour l'interface ;
- TypeScript pour la qualite et le typage ;
- Supabase Auth pour l'authentification ;
- PostgreSQL via Supabase pour la base relationnelle ;
- Supabase Storage pour les fichiers si necessaire ;
- Stripe Connect en mode test pour le paiement marketplace ;
- Google Maps API pour la geolocalisation ;
- Vercel pour l'hebergement front et le deploiement ;
- GitHub pour le versionnement ;
- Firebase Cloud Messaging en extension future pour les notifications.

Le developpement doit suivre une approche backend-first : stabiliser le domaine, la base, les regles metier, les acces, les reservations, les paiements et le back-office minimal avant de finaliser l'integration front.

## 6. Architecture applicative cible

L'architecture logique recommandee suit une separation en couches :

- interface : pages, composants, formulaires, affichage ;
- application : cas d'usage, orchestration des workflows ;
- domaine : regles metier, transitions d'etats, invariants ;
- infrastructure : Supabase, Stripe, Google Maps, stockage, notifications ;
- donnees : schema PostgreSQL, RLS, migrations, seeds.

Le decoupage fonctionnel conseille est :

- identite-acces ;
- proprietaires ;
- animaux ;
- pet-sitters ;
- qualification ;
- recherche-matching ;
- reservations ;
- paiements ;
- contractualisation ;
- confiance-moderation ;
- administration.

## 7. Acteurs du systeme

### 7.1 Visiteur

Le visiteur non connecte peut :

- consulter des profils pet-sitters publics ;
- consulter une liste ou carte de profils publics ;
- utiliser certains filtres publics ;
- acceder aux informations publiques necessaires a la comprehension du service.

Il ne peut pas :

- reserver ;
- voir les donnees privees ;
- voir les donnees medicales ;
- acceder aux documents ;
- acceder au back-office.

### 7.2 Utilisateur authentifie

L'utilisateur authentifie correspond au compte applicatif. Il peut activer un profil proprietaire, un profil pet-sitter ou les deux.

Regle majeure : compte, role et profil ne sont pas la meme chose.

### 7.3 Proprietaire

Le proprietaire peut :

- completer son profil ;
- creer plusieurs animaux ;
- renseigner des besoins specifiques ;
- creer un dossier medical pour un animal ;
- joindre des documents animaux ;
- rechercher des pet-sitters ;
- consulter les profils publics detailles ;
- creer une demande de reservation directe ;
- payer en mode test ;
- consulter le contrat recapitulatif ;
- deposer un avis apres prestation terminee ;
- signaler un incident ou un contenu.

### 7.4 Pet-sitter

Le pet-sitter peut :

- creer et gerer son profil public ;
- definir les especes acceptees ;
- definir les capacites de soin maitrisees ;
- declarer les lieux de garde proposes ;
- declarer les formats de garde proposes ;
- declarer les services additionnels proposes ;
- renseigner ses disponibilites ;
- deposer des documents professionnels ;
- passer des tests de validation ;
- recevoir des badges publics ;
- souscrire un abonnement ;
- accepter ou refuser une demande de reservation.

### 7.5 Administrateur

L'administrateur peut :

- consulter les comptes et profils ;
- valider ou rejeter des documents ;
- changer le statut de verification d'un pet-sitter ;
- attribuer ou retirer des badges ;
- consulter les reservations ;
- consulter les paiements ;
- traiter les signalements ;
- moderer les contenus ;
- suivre les actions sensibles.

## 8. Verite actuelle du modele de donnees

Les schemas actuels ont ete corriges pour etre alignes avec une vision backend propre. Cette section est la source de verite a retenir.

### 8.1 Compte utilisateur

`compte_utilisateur` represente le compte applicatif rattache a Supabase Auth.

Point important : le schema applicatif ne stocke pas de mot de passe hashe. L'authentification est geree par Supabase Auth. `compte_utilisateur.id_compte` doit correspondre a `auth.users.id`.

Un compte peut activer :

- zero ou un profil proprietaire ;
- zero ou un profil pet-sitter ;
- les deux si l'utilisateur utilise les deux roles.

### 8.2 Profils metier

`profil_proprietaire` et `profil_pet_sitter` sont separes. Cette separation evite de melanger l'identite du compte avec les donnees propres a chaque usage.

Le profil proprietaire sert a reserver et gerer les animaux.

Le profil pet-sitter sert a etre visible, qualifier l'offre, declarer les competences, disponibilites, documents, tests, badges et abonnements.

### 8.3 Referentiels

Les referentiels sont normalises et ne doivent pas etre fusionnes :

- `espece` ;
- `capacite_soin` ;
- `lieu_garde` ;
- `format_garde` ;
- `service_additionnel` ;
- `badge_public`.

Cette separation est indispensable pour les filtres, la recherche, la tarification, l'evolution et la coherence metier.

Valeurs initiales recommandees pour les seeds :

- especes : chien, chat, oiseau, petit mammifere, reptile, invertebre, amphibien, animal de la ferme ;
- capacites de soin : animal age, sous traitement, handicape, anxieux ou sensible, alimentation specifique, surveillance renforcee, protocole veterinaire leger ;
- lieux de garde : chez le pet-sitter, chez le proprietaire, visite ;
- formats de garde : journee, nuit, weekend, longue duree ;
- services additionnels : administration de traitement, suivi photo/video, promenade supplementaire, transport, nettoyage specifique ;
- badges publics : Verified Identity, Pro, Expert.

Important : ces valeurs peuvent evoluer, mais les categories ne doivent pas etre fusionnees. Le lieu, le format, la capacite et le service ne decrivent pas la meme notion.

### 8.4 Animaux et medical

Un proprietaire possede plusieurs animaux.

Un animal :

- appartient a un seul proprietaire ;
- appartient a une seule espece ;
- peut avoir zero ou un dossier medical ;
- peut etre rattache a plusieurs reservations dans le temps.

Le dossier medical est optionnel et confidentiel. Les documents animaux sont rattaches au dossier medical. Ces informations ne doivent jamais etre publiques.

### 8.5 Qualification pet-sitter

Un pet-sitter peut declarer :

- plusieurs especes acceptees ;
- plusieurs capacites de soin ;
- plusieurs lieux de garde ;
- plusieurs formats de garde ;
- plusieurs services additionnels ;
- plusieurs disponibilites ;
- plusieurs documents professionnels ;
- plusieurs tests de validation ;
- plusieurs badges historises ;
- plusieurs abonnements dans le temps, mais un seul actif ou en essai.

### 8.6 Tests de validation

Un test de validation cible un seul perimetre :

- soit une espece ;
- soit une capacite de soin ;
- jamais les deux.

Dans le modele actuel, cette regle est clarifiee par `type_perimetre`. Elle doit etre appliquee par une contrainte XOR.

### 8.7 Badges publics

Les badges publics du MVP sont :

- Verified Identity ;
- Pro ;
- Expert.

Un badge public n'est pas un statut de profil. Il s'agit d'un element affichable qui valorise une garantie.

Le statut de verification du profil reste distinct :

- brouillon ;
- publie_non_verifie ;
- identite_verifiee ;
- professionnel_verifie ;
- suspendu ;
- rejete.

Expert est un badge ou une qualification, pas un statut.

### 8.8 Disponibilites

Une disponibilite est un creneau declare par un pet-sitter.

Elle contient :

- date debut ;
- date fin ;
- statut ;
- commentaire.

La disponibilite peut etre associee a une reservation lorsqu'un creneau est bloque. Cette relation rend explicite le lien entre acceptation de reservation et blocage du calendrier.

Statuts physiques recommandes :

- `disponible` ;
- `indisponible` ;
- `bloque_reservation`.

Si `id_reservation` est renseigne, le statut doit etre coherent avec un blocage de reservation. Une disponibilite libre ne doit pas pointer vers une reservation.

### 8.9 Reservation

La reservation est le coeur du flux critique.

Elle relie :

- un profil proprietaire ;
- un profil pet-sitter ;
- un lieu de garde ;
- un format de garde ;
- un ou plusieurs animaux du proprietaire ;
- zero ou plusieurs services additionnels.

Elle contient :

- date de demande ;
- date debut ;
- date fin ;
- statut metier ;
- niveau d'assurance applique ;
- tarif convenu ;
- taux de commission plateforme ;
- consignes ;
- motif de refus ;
- motif d'annulation ;
- date de reponse.

Dans le modele actuel, la reservation stocke le taux de commission, pas le montant final de commission. Le montant reel de commission appartient au paiement.

### 8.10 Reservation et animaux

`reservation_animal` garantit qu'une reservation peut concerner plusieurs animaux, mais uniquement des animaux appartenant au proprietaire de la reservation.

Cette table porte :

- le tarif par animal ;
- les notes propres a l'animal dans cette reservation.

C'est un invariant metier critique.

### 8.11 Paiement

Le paiement est separe de la reservation.

Il contient :

- statut de paiement Stripe ;
- montant total ;
- commission plateforme calculee ;
- montant prestataire ;
- references Stripe ;
- dates de paiement, expiration et remboursement.

Les statuts de paiement ne sont pas les statuts de reservation.

### 8.12 Contrat recapitulatif

Le contrat recapitulatif est genere a partir de la reservation apres paiement reussi.

Il contient :

- reservation ;
- date de generation ;
- niveau d'assurance ;
- clauses standard ;
- chemin de fichier ;
- hash du document.

Au MVP, il y a un contrat principal par reservation.

### 8.13 Avis

L'avis depend uniquement de la reservation.

Il ne doit pas etre relie directement au proprietaire ou au pet-sitter, car ces informations sont deduites de la reservation.

Un avis :

- est unique par reservation ;
- est possible seulement apres reservation terminee ;
- concerne la prestation, pas le paiement ;
- peut recevoir une reponse du pet-sitter.

### 8.14 Signalement

Le signalement est un ticket de support/moderation.

Dans le modele actuel, il peut cibler au plus une cible directe parmi :

- reservation ;
- profil pet-sitter ;
- avis.

Il peut aussi rester general si necessaire.

Il contient :

- createur ;
- categorie ;
- motif ;
- statut ticket ;
- commentaire de resolution ;
- date de signalement ;
- date de resolution.

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

Regle de cible : au plus une cible directe parmi reservation, profil pet-sitter et avis. Un signalement general peut rester sans cible directe.

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
- publie_non_verifie : visible mais non verifie, moins mis en avant ;
- identite_verifiee : identite validee, badge Verified Identity possible ;
- professionnel_verifie : documents professionnels valides, badge Pro possible ;
- suspendu : profil temporairement bloque ;
- rejete : profil refuse.

### 9.2 Reservation

Statuts metier :

- en_attente_reponse ;
- acceptee ;
- refusee ;
- en_attente_paiement ;
- payee ;
- annulee ;
- terminee ;
- incident_signale.

Transition cible :

1. creation par le proprietaire : `en_attente_reponse` ;
2. refus pet-sitter : `refusee` avec motif possible ;
3. acceptation pet-sitter : `acceptee` ;
4. blocage du creneau : disponibilite reliee et bloquee ;
5. attente paiement : `en_attente_paiement` ;
6. paiement Stripe reussi : `payee` ;
7. fin de prestation : `terminee` ;
8. incident : `incident_signale` ;
9. annulation possible selon regles : `annulee`.

### 9.3 Paiement

Statuts paiement :

- pending ;
- succeeded ;
- failed ;
- refunded ;
- partially_refunded ;
- expired.

Ces statuts ne remplacent jamais ceux de la reservation.

### 9.4 Documents professionnels

Statuts :

- soumis ;
- valide ;
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

Le flux prioritaire a implementer est la reservation directe.

Etapes :

1. le proprietaire se connecte ;
2. il active ou complete son profil proprietaire ;
3. il cree un ou plusieurs animaux ;
4. il recherche un pet-sitter avec filtres ;
5. il consulte une fiche pet-sitter publique ;
6. il selectionne dates, lieu, format, animaux et services ;
7. il cree une reservation en attente de reponse ;
8. le pet-sitter accepte ou refuse ;
9. si le pet-sitter accepte, le systeme bloque le creneau ;
10. la reservation passe en attente de paiement ;
11. Stripe cree ou confirme le paiement test ;
12. si le paiement reussit, la reservation passe a payee ;
13. le contrat recapitulatif est genere ;
14. la prestation se deroule ;
15. la reservation passe a terminee ;
16. le proprietaire peut deposer un avis ;
17. un signalement peut etre ouvert si besoin.

## 11. Recherche et visibilite publique

Un profil pet-sitter public doit exposer uniquement les donnees utiles a la decision :

- pseudo ou prenom ;
- photo ;
- ville ;
- tarif de depart ;
- badges actifs ;
- statut ou niveau de verification visible ;
- especes acceptees ;
- capacites de soin ;
- lieux et formats proposes ;
- services additionnels ;
- resume de disponibilite.

Ne jamais exposer publiquement :

- email ;
- telephone brut ;
- adresse complete ;
- coordonnees exactes ;
- documents ;
- dossier medical ;
- elements de paiement ;
- commentaires admin ;
- signalements.

La localisation doit etre utile mais protectrice : afficher une zone ou ville, pas une adresse precise trop tot dans le parcours.

## 12. Regles metier et invariants a tester

### 12.1 Identite

- un email correspond a un seul compte ;
- un compte a au plus un profil proprietaire ;
- un compte a au plus un profil pet-sitter ;
- les profils metier ne sont pas interchangeables.

### 12.2 Animaux

- un animal appartient a un seul proprietaire ;
- un animal a une seule espece ;
- un animal peut avoir zero ou un dossier medical ;
- un dossier medical appartient a un seul animal ;
- les documents animaux ne sont pas publics.

### 12.3 Qualification

- un pet-sitter peut accepter plusieurs especes ;
- un pet-sitter peut maitriser plusieurs capacites ;
- especes, capacites, lieux, formats et services restent separes ;
- un test cible une espece ou une capacite, jamais les deux ;
- un badge actif ne peut pas etre duplique pour le meme pet-sitter ;
- un abonnement actif ou en essai ne peut pas etre duplique.

### 12.4 Reservation

- la date de fin est apres la date de debut ;
- une reservation concerne au moins un animal ;
- tous les animaux d'une reservation appartiennent au proprietaire de la reservation ;
- une reservation ne peut pas etre payee si elle n'a pas ete acceptee ;
- l'acceptation doit entrainer un blocage logique de creneau ;
- les statuts de reservation et de paiement restent separes.

### 12.5 Paiement

- montant total superieur ou egal a la commission ;
- taux commission MVP = 15 % ;
- montant prestataire = montant total - commission ;
- un paiement principal est rattache a une seule reservation.

### 12.6 Avis

- un avis est unique par reservation ;
- un avis est possible uniquement si la reservation est terminee ;
- le pet-sitter peut repondre ;
- la reponse du pet-sitter ne doit pas etre datee avant l'avis.

### 12.7 Signalement

- un signalement a un createur ;
- un signalement ouvre un ticket traçable ;
- date de resolution >= date de signalement si elle existe ;
- au plus une cible directe parmi reservation, profil pet-sitter et avis.

### 12.8 Scenarios critiques a transformer en tests

Les tests doivent couvrir au minimum :

- creation de compte et recuperation du compte applicatif ;
- activation d'un profil proprietaire ;
- activation d'un profil pet-sitter ;
- impossibilite de creer deux profils proprietaires pour le meme compte ;
- impossibilite de creer deux profils pet-sitters pour le meme compte ;
- creation d'un animal rattache au bon proprietaire ;
- creation d'un dossier medical optionnel ;
- protection des documents animaux ;
- configuration des especes acceptees par un pet-sitter ;
- configuration des capacites de soin ;
- creation d'une disponibilite avec date de fin apres date de debut ;
- rejet d'une disponibilite avec dates incoherentes ;
- creation d'un test de validation sur une espece ;
- creation d'un test de validation sur une capacite ;
- rejet d'un test qui cible a la fois une espece et une capacite ;
- attribution d'un badge actif ;
- rejet d'un doublon de badge actif ;
- creation d'un abonnement actif ;
- rejet d'un deuxieme abonnement actif ou essai ;
- recherche publique qui n'expose pas email, telephone, adresse complete ou documents ;
- creation d'une reservation avec plusieurs animaux du meme proprietaire ;
- rejet d'une reservation contenant un animal d'un autre proprietaire ;
- acceptation d'une reservation par le bon pet-sitter ;
- blocage du creneau apres acceptation ;
- impossibilite de payer une reservation non acceptee ;
- creation et confirmation d'un paiement Stripe test ;
- generation d'un contrat recapitulatif ;
- impossibilite de deposer un avis avant reservation terminee ;
- depot d'un avis apres reservation terminee ;
- reponse du pet-sitter a un avis ;
- creation d'un signalement general ;
- creation d'un signalement cible ;
- rejet d'un signalement avec plusieurs cibles directes ;
- traitement administratif d'un document professionnel ;
- attribution et retrait d'un badge par administrateur.

## 13. Securite, RGPD et acces

La securite ne doit jamais dependre du front.

Principes :

- utiliser Supabase Auth pour l'identite ;
- proteger les tables par RLS ;
- creer des DTO/vues publiques pour les profils pet-sitters ;
- separer donnees publiques, privees et sensibles ;
- limiter l'exposition des coordonnees ;
- journaliser les actions administratives sensibles ;
- stocker les documents dans un espace controle ;
- prevoir export et suppression RGPD ;
- ne pas exposer les donnees medicales hors contexte autorise.

Droits typiques :

- visiteur : lecture publique uniquement ;
- proprietaire : lecture/ecriture sur son profil, ses animaux, ses reservations ;
- pet-sitter : lecture/ecriture sur son profil, ses disponibilites, ses documents, ses reponses ;
- administrateur : validation, moderation, suivi, attribution badges.

### 13.1 Policies RLS minimales attendues

Les policies RLS ou controles serveur doivent garantir au minimum :

- un utilisateur lit son propre `compte_utilisateur` ;
- un utilisateur modifie uniquement ses propres profils ;
- un proprietaire lit et modifie uniquement ses animaux ;
- un proprietaire lit les dossiers medicaux de ses animaux ;
- un pet-sitter ne voit les informations medicales detaillees qu'en contexte de reservation autorise ;
- un pet-sitter modifie uniquement ses disponibilites et documents professionnels ;
- les visiteurs lisent uniquement une projection publique des profils pet-sitters visibles ;
- les documents animaux et professionnels ne sont jamais servis par une URL publique non controlee ;
- les reservations sont visibles par le proprietaire concerne, le pet-sitter concerne et l'administrateur ;
- les paiements sont visibles par les parties concernees et l'administrateur, avec donnees Stripe limitees cote front ;
- les signalements sont visibles par leur createur et l'administration ;
- les actions administratives sensibles sont reservees aux administrateurs.

### 13.2 Back-office minimal attendu

Le back-office MVP doit permettre :

- consulter les profils pet-sitters a verifier ;
- consulter les documents professionnels soumis ;
- valider, rejeter ou expirer un document ;
- changer le statut de verification d'un pet-sitter ;
- attribuer ou retirer un badge ;
- consulter les reservations et leur statut ;
- consulter les paiements et leur statut ;
- consulter les signalements ;
- faire evoluer un ticket de signalement ;
- ajouter un commentaire de resolution ;
- conserver une trace des actions sensibles.

## 14. API et contrats attendus pour le front

Le front ne doit pas consommer directement toutes les tables brutes. Il faut exposer des contrats stables.

### 14.1 Identite et profils

- creer compte via Supabase Auth ;
- recuperer compte courant ;
- activer profil proprietaire ;
- activer profil pet-sitter ;
- lire/modifier profil proprietaire ;
- lire/modifier profil pet-sitter.

### 14.2 Referentiels

- lister especes ;
- lister capacites de soin ;
- lister lieux de garde ;
- lister formats de garde ;
- lister services additionnels ;
- lister badges publics.

### 14.3 Animaux

- creer animal ;
- modifier animal ;
- supprimer animal ;
- lister mes animaux ;
- creer ou modifier dossier medical ;
- joindre un document animal.

### 14.4 Pet-sitter et qualification

- mettre a jour especes acceptees ;
- mettre a jour capacites ;
- mettre a jour lieux ;
- mettre a jour formats ;
- mettre a jour services additionnels ;
- declarer disponibilites ;
- deposer document professionnel ;
- consulter tests ;
- consulter badges ;
- consulter abonnement.

### 14.5 Recherche publique

- rechercher pet-sitters ;
- filtrer par espece, capacite, lieu, format, dates, tarif, badges, distance ;
- recuperer fiche publique detaillee.

### 14.6 Reservations

- creer demande de reservation ;
- consulter demandes envoyees ;
- consulter demandes recues ;
- accepter demande ;
- refuser demande ;
- annuler reservation ;
- declarer incident ;
- passer reservation a terminee.

### 14.7 Paiements et contrats

- creer intention Stripe ;
- confirmer paiement ;
- recuperer statut paiement ;
- generer contrat recapitulatif ;
- consulter contrat.

### 14.8 Avis et signalements

- deposer avis ;
- repondre a un avis ;
- creer signalement ;
- consulter ses signalements.

### 14.9 Administration

- lister profils a valider ;
- valider/rejeter documents ;
- changer statut verification ;
- attribuer/retirer badges ;
- consulter reservations ;
- consulter paiements ;
- consulter signalements ;
- traiter signalements.

## 15. Modules prepares mais non prioritaires

Ces modules doivent rester compatibles avec l'architecture, mais ne doivent pas alourdir le MVP critique :

- demandes publiques de garde ;
- reponses de pet-sitters a une demande publique ;
- messagerie complete ;
- notifications push avancees ;
- moderation enrichie ;
- dashboards professionnels ;
- back-office statistique avance ;
- application mobile native.

## 16. UML a produire ensuite

Les UML doivent etre derives de ce document et des schemas MCD/MLD/MPD.

Ordre conseille :

1. diagramme de cas d'utilisation ;
2. diagramme de classes domaine ;
3. diagramme d'etats reservation ;
4. diagramme d'etats profil pet-sitter ;
5. diagramme de sequence reservation directe ;
6. diagramme de sequence validation documentaire ;
7. diagramme d'activite recherche/reservation si necessaire.

Points de vigilance UML :

- acteurs : Visiteur, Utilisateur authentifie, Proprietaire, Pet-sitter, Administrateur ;
- Proprietaire et Pet-sitter heritent de Utilisateur authentifie ;
- ne pas creer d'acteur flou comme "Membre" ;
- ne pas relier avis directement au paiement ;
- ne pas melanger etats de paiement et etats de reservation ;
- ne pas faire du diagramme de classes une copie brute du MPD.

## 17. Definition of Done backend

Un backend MVP est considere coherent si :

- Supabase Auth fonctionne ;
- les profils proprietaire et pet-sitter sont activables separement ;
- les referentiels sont seedes ;
- un proprietaire peut creer des animaux ;
- un animal peut avoir un dossier medical confidentiel ;
- un pet-sitter peut configurer son offre ;
- la recherche publique expose uniquement des donnees publiques ;
- une reservation directe peut etre creee ;
- le pet-sitter peut accepter ou refuser ;
- l'acceptation bloque un creneau ;
- un paiement Stripe test peut etre rattache ;
- un contrat recapitulatif est genere ;
- un avis peut etre depose uniquement apres reservation terminee ;
- un signalement ouvre un ticket ;
- les regles critiques sont couvertes par tests ;
- les donnees sensibles sont protegees par RLS ou services backend.

## 18. Ce qu'il ne faut pas faire

- Ne pas utiliser le prototype Adalo comme modele technique final.
- Ne pas stocker de mot de passe hashe dans `compte_utilisateur`.
- Ne pas fusionner compte, role et profil.
- Ne pas fusionner espece, capacite, lieu, format et service.
- Ne pas confondre statut de verification et badge public.
- Ne pas confondre reservation et paiement.
- Ne pas relier directement avis a proprietaire/pet-sitter si la reservation suffit.
- Ne pas rendre publiques les donnees medicales, documents, adresses completes ou coordonnees exactes.
- Ne pas construire la securite dans le front.
- Ne pas commencer par une UI riche avant d'avoir verrouille les regles backend.

## 19. Ordre de travail recommande

1. Valider le document de passation et les schemas MCD/MLD/MPD.
2. Produire les UML propres.
3. Ecrire les migrations SQL Supabase.
4. Seeder les referentiels.
5. Mettre en place les policies RLS.
6. Implementer les cas d'usage backend.
7. Implementer le flux reservation directe.
8. Brancher Stripe test.
9. Ajouter generation contrat.
10. Ajouter avis et signalements.
11. Ajouter back-office minimal.
12. Ecrire tests unitaires et integration.
13. Brancher le front sur des DTO propres.

## 20. Resume operationnel

MamiPet est une marketplace de confiance pour la garde d'animaux, orientee proprietaires anxieux, animaux sensibles et pet-sitters qualifies. Le coeur technique repose sur un compte unique, des profils metier separes, des referentiels normalises, des animaux avec informations medicales protegees, des pet-sitters qualifies par documents, tests et badges, une recherche publique controlee, une reservation directe, un paiement Stripe test, un contrat recapitulatif, des avis et des signalements.

Le projet doit rester backend-first. Les schemas MCD/MLD/MPD actuels constituent la base de reference pour les prochains UML et pour l'implementation backend.
