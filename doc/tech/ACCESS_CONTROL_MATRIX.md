# Matrice de contrôle d'accès

Rôles :

- `visitor` : non connecte ;
- `authenticated` : compte connecte ;
- `owner` : compte avec profil propriétaire ;
- `pet_sitter` : compte avec profil pet-sitter ;
- `admin` : compte avec `is_admin = true`.

Principes :

- le front ne fait jamais foi pour la sécurité ;
- les Route Handlers verifient session et rôle ;
- Supabase RLS protégé les tables ;
- les documents et données médicales sont privés par défaut.

## 1. Matrice principale

| Ressource | Visitor | Authenticated | Owner | Pet-sitter | Admin |
|---|---:|---:|---:|---:|---:|
| Référence data | Read | Read | Read | Read | Manage |
| Public pet-sitter search | Read | Read | Read | Read | Read |
| Public pet-sitter profile | Read | Read | Read | Read | Read |
| Account current user | No | Own read | Own read | Own read | Read admin |
| Owner profile | No | Create own | Own read/write | No sauf si aussi owner | Read/manage |
| Pet-sitter profile | No | Create own | No sauf si aussi pet-sitter | Own read/write | Read/manage |
| Animal | No | No | Own CRUD | Read only in authorized réservation context | Read/manage |
| Médical record | No | No | Own CRUD | Read only in authorized réservation context | Read/manage |
| Animal document | No | No | Own CRUD | Read only in authorized réservation context | Read/manage |
| Pet-sitter offer | Public partial read | Public partial read | Public partial read | Own write | Manage |
| Availability | Public summary | Public summary | Public summary | Own CRUD if not blocked | Manage |
| Professional document | No | No | No | Own create/read | Validate/reject |
| Validation test | No | No | No | Own create/read | Manage |
| Badge assignment | Public active read | Public active read | Public active read | Own read | Assign/remove |
| Subscription | No | No | No | Own read | Manage |
| Réservation | No | No | Own sent read/create/cancel | Own received read/accept/refuse | Read/manage |
| Payment | No | No | Own réservation read/pay | Own réservation read summary | Read/manage |
| Contract | No | No | Own réservation read | Own réservation read | Read/manage |
| Review | Public read moderated | Public read moderated | Create on own completed réservation | Reply if concerned | Moderate |
| Report | No | Create/read own | Create/read own | Create/read own | Process/manage |
| Admin audit | No | No | No | No | Read |

## 2. Règles speciales

### Public profile

Un profil pet-sitter public exposé seulement :

- display name ;
- photo ;
- ville/zone ;
- tarif de depart ;
- badges publics actifs ;
- vérification visible ;
- espèces ;
- capacités ;
- lieux/formats ;
- services ;
- resume disponibilité ;
- notes publiques.

### Médical data

Un pet-sitter ne peut voir les informations médicales détaillées que si :

- il est le pet-sitter concerné ;
- une réservation existe avec cet animal ;
- la réservation est dans un état autorisant la consultation.

États autorisant la consultation MVP :

- `awaiting_response` : lecture minimale pour evaluer la faisabilite ;
- `accepted` ;
- `awaiting_payment` ;
- `paid` ;
- `incident_reported` ;
- `completed` avec accès limité si besoin de suivi.

### Availability

Un pet-sitter peut modifier une disponibilité libre.

Il ne peut pas supprimer librement une disponibilité liee a une réservation bloquée. Une action de réservation doit liberer ou annuler le créneau.

### Réservation

Création :

- uniquement par le propriétaire ;
- avec animaux appartenant au propriétaire ;
- avec pet-sitter visible et compatible.

Acceptation/refus :

- uniquement par le pet-sitter concerné.

Paiement :

- uniquement par le propriétaire concerné ;
- seulement si réservation en `awaiting_payment`.

Completion MVP :

- admin ou action système pendant la demo.

### Admin

Admin via `account.is_admin = true`.

Actions admin a tracer :

- validation/rejet document ;
- changement statut vérification ;
- attribution/retrait badge ;
- traitement signalement ;
- intervention sur réservation ;
- intervention sur paiement.

## 3. Policies RLS attendues

RLS a prevoir sur :

- `account` ;
- `owner_profile` ;
- `pet_sitter_profile` ;
- `animal` ;
- `medical_record` ;
- `animal_document` ;
- `availability` ;
- `professional_document` ;
- `validation_test` ;
- `badge_assignment` ;
- `subscription` ;
- `reservation` ;
- `reservation_animal` ;
- `payment` ;
- `contract` ;
- `review` ;
- `report`.

Les tables de référentiel peuvent être lisibles publiquement.

## 4. Service rôle

La clé service rôle est reservee aux operations serveur strictement nécessaires.

Interdit :

- exposition client ;
- usage dans des composants React client ;
- logs ;
- usage pour contourner les règles métier.

