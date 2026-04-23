# Contrats API REST

Les routes API sont en anglais. Les contrats REST sont la source stable pour intégrer le futur front.

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

L'authentification principale passe par Supabase Auth. Les endpoints applicatifs servent à synchroniser et lire le compte métier.

| Méthode | Route | Accès | Description |
|---|---|---|---|
| `GET` | `/api/me` | Auth | Lire compte courant, rôles actifs, profils associes |
| `POST` | `/api/profiles/owner` | Auth | Activer/créer profil propriétaire |
| `GET` | `/api/profiles/owner/me` | Owner | Lire mon profil propriétaire |
| `PATCH` | `/api/profiles/owner/me` | Owner | Modifier mon profil propriétaire |
| `POST` | `/api/profiles/pet-sitter` | Auth | Activer/créer profil pet-sitter |
| `GET` | `/api/profiles/pet-sitter/me` | Pet-sitter | Lire mon profil pet-sitter |
| `PATCH` | `/api/profiles/pet-sitter/me` | Pet-sitter | Modifier mon profil pet-sitter |

## 2. Referentiels

| Méthode | Route | Accès | Description |
|---|---|---|---|
| `GET` | `/api/reference-data/species` | Public | Lister espèces |
| `GET` | `/api/reference-data/care-capabilities` | Public | Lister capacités de soin |
| `GET` | `/api/reference-data/care-locations` | Public | Lister lieux de garde |
| `GET` | `/api/reference-data/care-formats` | Public | Lister formats de garde |
| `GET` | `/api/reference-data/additional-services` | Public | Lister services additionnels |
| `GET` | `/api/reference-data/public-badges` | Public | Lister badges publics |

## 3. Animaux

| Méthode | Route | Accès | Description |
|---|---|---|---|
| `GET` | `/api/animals` | Owner | Lister mes animaux |
| `POST` | `/api/animals` | Owner | Créer un animal |
| `GET` | `/api/animals/{animalId}` | Owner | Lire un de mes animaux |
| `PATCH` | `/api/animals/{animalId}` | Owner | Modifier un de mes animaux |
| `DELETE` | `/api/animals/{animalId}` | Owner | Supprimer/desactiver un animal |
| `PUT` | `/api/animals/{animalId}/medical-record` | Owner | Créer/modifier dossier médical |
| `POST` | `/api/animals/{animalId}/documents` | Owner | Ajouter document animal |
| `DELETE` | `/api/animals/{animalId}/documents/{documentId}` | Owner | Supprimer document animal |

## 4. Pet-sitter et qualification

| Méthode | Route | Accès | Description |
|---|---|---|---|
| `PUT` | `/api/pet-sitter/offer/species` | Pet-sitter | Remplacer espèces acceptées |
| `PUT` | `/api/pet-sitter/offer/care-capabilities` | Pet-sitter | Remplacer capacités maîtrisées |
| `PUT` | `/api/pet-sitter/offer/care-locations` | Pet-sitter | Remplacer lieux proposés |
| `PUT` | `/api/pet-sitter/offer/care-formats` | Pet-sitter | Remplacer formats proposés |
| `PUT` | `/api/pet-sitter/offer/additional-services` | Pet-sitter | Remplacer services proposés |
| `GET` | `/api/pet-sitter/availabilities` | Pet-sitter | Lister mes disponibilités |
| `POST` | `/api/pet-sitter/availabilities` | Pet-sitter | Créer disponibilité |
| `PATCH` | `/api/pet-sitter/availabilities/{availabilityId}` | Pet-sitter | Modifier disponibilité |
| `DELETE` | `/api/pet-sitter/availabilities/{availabilityId}` | Pet-sitter | Supprimer disponibilité libre |
| `GET` | `/api/pet-sitter/documents` | Pet-sitter | Lister mes documents pros |
| `POST` | `/api/pet-sitter/documents` | Pet-sitter | Déposer document pro |
| `GET` | `/api/pet-sitter/tests` | Pet-sitter | Lister mes tests |
| `POST` | `/api/pet-sitter/tests` | Pet-sitter | Démarrer/soumettre un test MVP |
| `GET` | `/api/pet-sitter/badges` | Pet-sitter | Lister mes badges |
| `GET` | `/api/pet-sitter/subscription` | Pet-sitter | Lire mon abonnement |

## 5. Recherche publique

| Méthode | Route | Accès | Description |
|---|---|---|---|
| `GET` | `/api/pet-sitters` | Public | Rechercher profils publics |
| `GET` | `/api/pet-sitters/{petSitterProfileId}` | Public | Lire fiche publique détaillée |

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

Données interdites dans la recherche publique :

- email ;
- téléphone brut ;
- adresse complète ;
- coordonnées exactes ;
- documents ;
- dossier médical ;
- commentaires admin ;
- signalements.

## 6. Réservations

| Méthode | Route | Accès | Description |
|---|---|---|---|
| `GET` | `/api/reservations/sent` | Owner | Demandes envoyées |
| `GET` | `/api/reservations/received` | Pet-sitter | Demandes reçues |
| `POST` | `/api/reservations` | Owner | Créer demande de réservation |
| `GET` | `/api/reservations/{reservationId}` | Owner/Pet-sitter/Admin | Lire réservation autorisée |
| `POST` | `/api/reservations/{reservationId}/accept` | Pet-sitter concerné | Accepter demande |
| `POST` | `/api/reservations/{reservationId}/refuse` | Pet-sitter concerné | Refuser demande |
| `POST` | `/api/reservations/{reservationId}/cancel` | Owner/Pet-sitter/Admin selon statut | Annuler |
| `POST` | `/api/reservations/{reservationId}/complete` | Admin ou système MVP | Passer à terminée |
| `POST` | `/api/reservations/{reservationId}/incident` | Owner/Pet-sitter/Admin | Déclarer incident |

Payload création :

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

| Méthode | Route | Accès | Description |
|---|---|---|---|
| `POST` | `/api/reservations/{reservationId}/payment-intent` | Owner concerné | Créer intention paiement simulée/test |
| `POST` | `/api/reservations/{reservationId}/payment-confirmation` | Owner/System | Confirmer paiement test |
| `GET` | `/api/reservations/{reservationId}/payment` | Owner/Pet-sitter/Admin | Lire paiement autorisé |
| `POST` | `/api/reservations/{reservationId}/contract` | System/Admin | Générer contrat |
| `GET` | `/api/reservations/{reservationId}/contract` | Owner/Pet-sitter/Admin | Lire contrat autorisé |

## 8. Avis et signalements

| Méthode | Route | Accès | Description |
|---|---|---|---|
| `POST` | `/api/reservations/{reservationId}/review` | Owner concerné | Déposer avis après réservation terminée |
| `PATCH` | `/api/reviews/{reviewId}/reply` | Pet-sitter concerné | Répondre à un avis |
| `POST` | `/api/reports` | Auth | Créer signalement général ou ciblé |
| `GET` | `/api/reports/me` | Auth | Lire mes signalements |

## 9. Administration

Toutes les routes admin exigent `isAdmin = true`.

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/admin/pet-sitter-profiles` | Lister profils pet-sitters |
| `PATCH` | `/api/admin/pet-sitter-profiles/{profileId}/verification-status` | Changer statut vérification |
| `GET` | `/api/admin/professional-documents` | Lister documents pros |
| `POST` | `/api/admin/professional-documents/{documentId}/validate` | Valider document |
| `POST` | `/api/admin/professional-documents/{documentId}/reject` | Rejeter document |
| `POST` | `/api/admin/pet-sitter-profiles/{profileId}/badges` | Attribuer badge |
| `DELETE` | `/api/admin/pet-sitter-profiles/{profileId}/badges/{badgeId}` | Retirer badge |
| `GET` | `/api/admin/reservations` | Lister réservations |
| `GET` | `/api/admin/payments` | Lister paiements |
| `GET` | `/api/admin/reports` | Lister signalements |
| `PATCH` | `/api/admin/reports/{reportId}` | Traiter signalement |

