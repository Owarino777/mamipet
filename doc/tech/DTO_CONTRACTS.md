# Contrats DTO

Les DTO sont les objets renvoyes au front. Ils ne doivent pas exposer les tables brutes.

Conventions :

- noms en anglais ;
- ids UUID en string ;
- dates ISO 8601 ;
- montants en centimes ;
- champs optionnels explicites avec `null` si pertinent ;
- aucun secret, document privé ou donnée médicale dans les DTO publics.

## 1. CurrentUserDto

```ts
type CurrentUserDto = {
  id: string;
  email: string;
  isAdmin: boolean;
  accountStatus: "active" | "suspended" | "deleted";
  roles: {
    owner: boolean;
    petSitter: boolean;
    admin: boolean;
  };
  profiles: {
    ownerProfileId: string | null;
    petSitterProfileId: string | null;
  };
};
```

## 2. ReferenceDataDto

```ts
type ReferenceItemDto = {
  id: string;
  code: string;
  label: string;
};
```

Utilise pour :

- species ;
- careCapabilities ;
- careLocations ;
- careFormats ;
- additionalServices ;
- publicBadges.

## 3. OwnerProfileDto

```ts
type OwnerProfileDto = {
  id: string;
  pseudo: string | null;
  firstName: string;
  phone: string | null;
  city: string | null;
  country: string | null;
  createdAt: string;
  updatedAt: string | null;
};
```

Expose uniquement au propriétaire concerné et aux admins.

## 4. AnimalDto

```ts
type AnimalDto = {
  id: string;
  ownerProfileId: string;
  species: ReferenceItemDto;
  name: string;
  sex: string | null;
  birthDate: string | null;
  color: string | null;
  weightKg: number | null;
  temperament: string | null;
  specificNeeds: string | null;
  hasMedicalRecord: boolean;
  createdAt: string;
  updatedAt: string | null;
};
```

## 5. MedicalRecordDto

```ts
type MedicalRecordDto = {
  id: string;
  animalId: string;
  careProtocol: string | null;
  frequency: string | null;
  confidentialInstructions: string | null;
  documents: AnimalDocumentDto[];
  createdAt: string;
  updatedAt: string | null;
};
```

Accès limité :

- propriétaire de l'animal ;
- pet-sitter concerné par une réservation autorisée ;
- admin.

## 6. PublicPetSitterCardDto

```ts
type PublicPetSitterCardDto = {
  id: string;
  displayName: string;
  photoUrl: string | null;
  city: string | null;
  approximateLocation: {
    label: string;
    lat: number | null;
    lng: number | null;
  };
  basePriceCents: number;
  verificationStatus: "published_unverified" | "identity_verified" | "professional_verified";
  badges: PublicBadgeDto[];
  acceptedSpecies: ReferenceItemDto[];
  careCapabilities: ReferenceItemDto[];
  careLocations: ReferenceItemDto[];
  careFormats: ReferenceItemDto[];
  availabilitySummary: string | null;
  rating: {
    average: number | null;
    count: number;
  };
};
```

Interdit :

- email ;
- téléphone ;
- adresse complète ;
- coordonnées exactes ;
- documents ;
- commentaires admin.

## 7. PublicPetSitterProfileDto

```ts
type PublicPetSitterProfileDto = PublicPetSitterCardDto & {
  description: string | null;
  additionalServices: ReferenceItemDto[];
  reviewsPreview: ReviewPublicDto[];
};
```

## 8. PetSitterPrivateProfileDto

```ts
type PetSitterPrivateProfileDto = {
  id: string;
  pseudo: string | null;
  firstName: string;
  phone: string | null;
  photoUrl: string | null;
  description: string | null;
  addressLine: string | null;
  city: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  basePriceCents: number | null;
  interventionRadiusKm: number | null;
  verificationStatus: PetSitterVerificationStatusDto;
  publicVisibility: boolean;
  offer: {
    species: ReferenceItemDto[];
    careCapabilities: ReferenceItemDto[];
    careLocations: ReferenceItemDto[];
    careFormats: ReferenceItemDto[];
    additionalServices: ReferenceItemDto[];
  };
  createdAt: string;
  updatedAt: string | null;
};
```

## 9. ReservationDto

```ts
type ReservationDto = {
  id: string;
  ownerProfileId: string;
  petSitterProfileId: string;
  status:
    | "awaiting_response"
    | "accepted"
    | "refused"
    | "awaiting_payment"
    | "paid"
    | "cancelled"
    | "completed"
    | "incident_reported";
  requestedAt: string;
  startDate: string;
  endDate: string;
  careLocation: ReferenceItemDto;
  careFormat: ReferenceItemDto;
  insuranceLevel: "standard" | "premium";
  agreedPriceCents: number;
  platformCommissionRate: number;
  instructions: string | null;
  refusalReason: string | null;
  cancellationReason: string | null;
  responseDate: string | null;
  animals: ReservationAnimalDto[];
  additionalServices: ReservationAdditionalServiceDto[];
  payment: PaymentSummaryDto | null;
  contract: ContractSummaryDto | null;
  createdAt: string;
  updatedAt: string | null;
};
```

## 10. PaymentSummaryDto

```ts
type PaymentSummaryDto = {
  id: string;
  reservationId: string;
  status: "pending" | "succeeded" | "failed" | "refunded" | "partially_refunded" | "expired";
  totalAmountCents: number;
  platformCommissionCents: number;
  providerAmountCents: number;
  externalReference: string | null;
  paidAt: string | null;
  expiresAt: string | null;
  refundedAt: string | null;
};
```

## 11. ContractSummaryDto

```ts
type ContractSummaryDto = {
  id: string;
  reservationId: string;
  generatedAt: string;
  insuranceLevel: "standard" | "premium";
  fileUrl: string | null;
  documentHash: string | null;
};
```

## 12. ReviewPublicDto

```ts
type ReviewPublicDto = {
  id: string;
  reservationId: string;
  globalRating: number;
  comment: string | null;
  punctualityRating: number | null;
  communicationRating: number | null;
  careRating: number | null;
  trustRating: number | null;
  petSitterReply: string | null;
  createdAt: string;
  repliedAt: string | null;
};
```

## 13. ReportDto

```ts
type ReportDto = {
  id: string;
  category: "reservation" | "profile" | "review" | "incident" | "other";
  status: "open" | "in_progress" | "processed" | "rejected" | "closed";
  reason: string;
  target: {
    reservationId?: string;
    petSitterProfileId?: string;
    reviewId?: string;
  };
  createdAt: string;
  resolvedAt: string | null;
  resolutionComment: string | null;
};
```

## 14. Admin DTO

Les DTO admin peuvent exposer plus d'informations, mais jamais :

- secrets ;
- mots de passe ;
- clés Stripe ;
- chemins Storage bruts si URL signee nécessaire ;
- données inutiles au traitement.

