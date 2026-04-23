# Matrice de controle d'acces

Roles :

- `visitor` : non connecte ;
- `authenticated` : compte connecte ;
- `owner` : compte avec profil proprietaire ;
- `pet_sitter` : compte avec profil pet-sitter ;
- `admin` : compte avec `is_admin = true`.

Principes :

- le front ne fait jamais foi pour la securite ;
- les Route Handlers verifient session et role ;
- Supabase RLS protege les tables ;
- les documents et donnees medicales sont prives par defaut.

## 1. Matrice principale

| Ressource | Visitor | Authenticated | Owner | Pet-sitter | Admin |
|---|---:|---:|---:|---:|---:|
| Reference data | Read | Read | Read | Read | Manage |
| Public pet-sitter search | Read | Read | Read | Read | Read |
| Public pet-sitter profile | Read | Read | Read | Read | Read |
| Account current user | No | Own read | Own read | Own read | Read admin |
| Owner profile | No | Create own | Own read/write | No sauf si aussi owner | Read/manage |
| Pet-sitter profile | No | Create own | No sauf si aussi pet-sitter | Own read/write | Read/manage |
| Animal | No | No | Own CRUD | Read only in authorized reservation context | Read/manage |
| Medical record | No | No | Own CRUD | Read only in authorized reservation context | Read/manage |
| Animal document | No | No | Own CRUD | Read only in authorized reservation context | Read/manage |
| Pet-sitter offer | Public partial read | Public partial read | Public partial read | Own write | Manage |
| Availability | Public summary | Public summary | Public summary | Own CRUD if not blocked | Manage |
| Professional document | No | No | No | Own create/read | Validate/reject |
| Validation test | No | No | No | Own create/read | Manage |
| Badge assignment | Public active read | Public active read | Public active read | Own read | Assign/remove |
| Subscription | No | No | No | Own read | Manage |
| Reservation | No | No | Own sent read/create/cancel | Own received read/accept/refuse | Read/manage |
| Payment | No | No | Own reservation read/pay | Own reservation read summary | Read/manage |
| Contract | No | No | Own reservation read | Own reservation read | Read/manage |
| Review | Public read moderated | Public read moderated | Create on own completed reservation | Reply if concerned | Moderate |
| Report | No | Create/read own | Create/read own | Create/read own | Process/manage |
| Admin audit | No | No | No | No | Read |

## 2. Regles speciales

### Public profile

Un profil pet-sitter public expose seulement :

- display name ;
- photo ;
- ville/zone ;
- tarif de depart ;
- badges publics actifs ;
- verification visible ;
- especes ;
- capacites ;
- lieux/formats ;
- services ;
- resume disponibilite ;
- notes publiques.

### Medical data

Un pet-sitter ne peut voir les informations medicales detaillees que si :

- il est le pet-sitter concerne ;
- une reservation existe avec cet animal ;
- la reservation est dans un etat autorisant la consultation.

Etats autorisant la consultation MVP :

- `awaiting_response` : lecture minimale pour evaluer la faisabilite ;
- `accepted` ;
- `awaiting_payment` ;
- `paid` ;
- `incident_reported` ;
- `completed` avec acces limite si besoin de suivi.

### Availability

Un pet-sitter peut modifier une disponibilite libre.

Il ne peut pas supprimer librement une disponibilite liee a une reservation bloquee. Une action de reservation doit liberer ou annuler le creneau.

### Reservation

Creation :

- uniquement par le proprietaire ;
- avec animaux appartenant au proprietaire ;
- avec pet-sitter visible et compatible.

Acceptation/refus :

- uniquement par le pet-sitter concerne.

Paiement :

- uniquement par le proprietaire concerne ;
- seulement si reservation en `awaiting_payment`.

Completion MVP :

- admin ou action systeme pendant la demo.

### Admin

Admin via `account.is_admin = true`.

Actions admin a tracer :

- validation/rejet document ;
- changement statut verification ;
- attribution/retrait badge ;
- traitement signalement ;
- intervention sur reservation ;
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

Les tables de referentiel peuvent etre lisibles publiquement.

## 4. Service role

La cle service role est reservee aux operations serveur strictement necessaires.

Interdit :

- exposition client ;
- usage dans des composants React client ;
- logs ;
- usage pour contourner les regles metier.

