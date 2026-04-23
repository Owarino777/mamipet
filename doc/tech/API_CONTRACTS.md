# Contrats API REST

Les routes API sont en anglais. Les contrats REST sont la source stable pour integrer le futur front.

Base path : `/api`

Format standard :

```json
{
  "data": {},
  "meta": {},
  "error": null
}
```

Format erreur :

```json
{
  "data": null,
  "meta": {},
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request payload.",
    "details": {}
  }
}
```

## 1. Auth et compte courant

L'authentification principale passe par Supabase Auth. Les endpoints applicatifs servent a synchroniser et lire le compte metier.

| Methode | Route | Acces | Description |
|---|---|---|---|
| `GET` | `/api/me` | Auth | Lire compte courant, roles actifs, profils associes |
| `POST` | `/api/profiles/owner` | Auth | Activer/creer profil proprietaire |
| `GET` | `/api/profiles/owner/me` | Owner | Lire mon profil proprietaire |
| `PATCH` | `/api/profiles/owner/me` | Owner | Modifier mon profil proprietaire |
| `POST` | `/api/profiles/pet-sitter` | Auth | Activer/creer profil pet-sitter |
| `GET` | `/api/profiles/pet-sitter/me` | Pet-sitter | Lire mon profil pet-sitter |
| `PATCH` | `/api/profiles/pet-sitter/me` | Pet-sitter | Modifier mon profil pet-sitter |

## 2. Referentiels

| Methode | Route | Acces | Description |
|---|---|---|---|
| `GET` | `/api/reference-data/species` | Public | Lister especes |
| `GET` | `/api/reference-data/care-capabilities` | Public | Lister capacites de soin |
| `GET` | `/api/reference-data/care-locations` | Public | Lister lieux de garde |
| `GET` | `/api/reference-data/care-formats` | Public | Lister formats de garde |
| `GET` | `/api/reference-data/additional-services` | Public | Lister services additionnels |
| `GET` | `/api/reference-data/public-badges` | Public | Lister badges publics |

## 3. Animaux

| Methode | Route | Acces | Description |
|---|---|---|---|
| `GET` | `/api/animals` | Owner | Lister mes animaux |
| `POST` | `/api/animals` | Owner | Creer un animal |
| `GET` | `/api/animals/{animalId}` | Owner | Lire un de mes animaux |
| `PATCH` | `/api/animals/{animalId}` | Owner | Modifier un de mes animaux |
| `DELETE` | `/api/animals/{animalId}` | Owner | Supprimer/desactiver un animal |
| `PUT` | `/api/animals/{animalId}/medical-record` | Owner | Creer/modifier dossier medical |
| `POST` | `/api/animals/{animalId}/documents` | Owner | Ajouter document animal |
| `DELETE` | `/api/animals/{animalId}/documents/{documentId}` | Owner | Supprimer document animal |

## 4. Pet-sitter et qualification

| Methode | Route | Acces | Description |
|---|---|---|---|
| `PUT` | `/api/pet-sitter/offer/species` | Pet-sitter | Remplacer especes acceptees |
| `PUT` | `/api/pet-sitter/offer/care-capabilities` | Pet-sitter | Remplacer capacites maitrisees |
| `PUT` | `/api/pet-sitter/offer/care-locations` | Pet-sitter | Remplacer lieux proposes |
| `PUT` | `/api/pet-sitter/offer/care-formats` | Pet-sitter | Remplacer formats proposes |
| `PUT` | `/api/pet-sitter/offer/additional-services` | Pet-sitter | Remplacer services proposes |
| `GET` | `/api/pet-sitter/availabilities` | Pet-sitter | Lister mes disponibilites |
| `POST` | `/api/pet-sitter/availabilities` | Pet-sitter | Creer disponibilite |
| `PATCH` | `/api/pet-sitter/availabilities/{availabilityId}` | Pet-sitter | Modifier disponibilite |
| `DELETE` | `/api/pet-sitter/availabilities/{availabilityId}` | Pet-sitter | Supprimer disponibilite libre |
| `GET` | `/api/pet-sitter/documents` | Pet-sitter | Lister mes documents pros |
| `POST` | `/api/pet-sitter/documents` | Pet-sitter | Deposer document pro |
| `GET` | `/api/pet-sitter/tests` | Pet-sitter | Lister mes tests |
| `POST` | `/api/pet-sitter/tests` | Pet-sitter | Demarrer/soumettre un test MVP |
| `GET` | `/api/pet-sitter/badges` | Pet-sitter | Lister mes badges |
| `GET` | `/api/pet-sitter/subscription` | Pet-sitter | Lire mon abonnement |

## 5. Recherche publique

| Methode | Route | Acces | Description |
|---|---|---|---|
| `GET` | `/api/pet-sitters` | Public | Rechercher profils publics |
| `GET` | `/api/pet-sitters/{petSitterProfileId}` | Public | Lire fiche publique detaillee |

Filtres `GET /api/pet-sitters` :

- `species`;
- `careCapabilities`;
- `careLocation`;
- `careFormat`;
- `additionalServices`;
- `startDate`;
- `endDate`;
- `city`;
- `lat`;
- `lng`;
- `radiusKm`;
- `maxBasePrice`;
- `badges`;
- `sensitiveCareOnly`.

Donnees interdites dans la recherche publique :

- email ;
- telephone brut ;
- adresse complete ;
- coordonnees exactes ;
- documents ;
- dossier medical ;
- commentaires admin ;
- signalements.

## 6. Reservations

| Methode | Route | Acces | Description |
|---|---|---|---|
| `GET` | `/api/reservations/sent` | Owner | Demandes envoyees |
| `GET` | `/api/reservations/received` | Pet-sitter | Demandes recues |
| `POST` | `/api/reservations` | Owner | Creer demande de reservation |
| `GET` | `/api/reservations/{reservationId}` | Owner/Pet-sitter/Admin | Lire reservation autorisee |
| `POST` | `/api/reservations/{reservationId}/accept` | Pet-sitter concerne | Accepter demande |
| `POST` | `/api/reservations/{reservationId}/refuse` | Pet-sitter concerne | Refuser demande |
| `POST` | `/api/reservations/{reservationId}/cancel` | Owner/Pet-sitter/Admin selon statut | Annuler |
| `POST` | `/api/reservations/{reservationId}/complete` | Admin ou systeme MVP | Passer a terminee |
| `POST` | `/api/reservations/{reservationId}/incident` | Owner/Pet-sitter/Admin | Declarer incident |

Payload creation :

```json
{
  "petSitterProfileId": "uuid",
  "animalIds": ["uuid"],
  "careLocationId": "uuid",
  "careFormatId": "uuid",
  "additionalServiceIds": ["uuid"],
  "startDate": "2026-05-20T09:00:00.000Z",
  "endDate": "2026-05-22T18:00:00.000Z",
  "insuranceLevel": "standard",
  "instructions": "Text",
  "agreedPrice": 15000
}
```

Montants en centimes.

## 7. Paiements et contrats

| Methode | Route | Acces | Description |
|---|---|---|---|
| `POST` | `/api/reservations/{reservationId}/payment-intent` | Owner concerne | Creer intention paiement simulee/test |
| `POST` | `/api/reservations/{reservationId}/payment-confirmation` | Owner/System | Confirmer paiement test |
| `GET` | `/api/reservations/{reservationId}/payment` | Owner/Pet-sitter/Admin | Lire paiement autorise |
| `POST` | `/api/reservations/{reservationId}/contract` | System/Admin | Generer contrat |
| `GET` | `/api/reservations/{reservationId}/contract` | Owner/Pet-sitter/Admin | Lire contrat autorise |

## 8. Avis et signalements

| Methode | Route | Acces | Description |
|---|---|---|---|
| `POST` | `/api/reservations/{reservationId}/review` | Owner concerne | Deposer avis apres reservation terminee |
| `PATCH` | `/api/reviews/{reviewId}/reply` | Pet-sitter concerne | Repondre a un avis |
| `POST` | `/api/reports` | Auth | Creer signalement general ou cible |
| `GET` | `/api/reports/me` | Auth | Lire mes signalements |

## 9. Administration

Toutes les routes admin exigent `isAdmin = true`.

| Methode | Route | Description |
|---|---|---|
| `GET` | `/api/admin/pet-sitter-profiles` | Lister profils pet-sitters |
| `PATCH` | `/api/admin/pet-sitter-profiles/{profileId}/verification-status` | Changer statut verification |
| `GET` | `/api/admin/professional-documents` | Lister documents pros |
| `POST` | `/api/admin/professional-documents/{documentId}/validate` | Valider document |
| `POST` | `/api/admin/professional-documents/{documentId}/reject` | Rejeter document |
| `POST` | `/api/admin/pet-sitter-profiles/{profileId}/badges` | Attribuer badge |
| `DELETE` | `/api/admin/pet-sitter-profiles/{profileId}/badges/{badgeId}` | Retirer badge |
| `GET` | `/api/admin/reservations` | Lister reservations |
| `GET` | `/api/admin/payments` | Lister paiements |
| `GET` | `/api/admin/reports` | Lister signalements |
| `PATCH` | `/api/admin/reports/{reportId}` | Traiter signalement |

