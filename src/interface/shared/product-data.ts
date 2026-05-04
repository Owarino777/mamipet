export type ReferenceTag = {
  id: string;
  code: string;
  label: string;
};

export type PublicPetSitter = {
  id: string;
  firstName: string;
  lastInitial: string;
  city: string;
  approximateAddress: string;
  latitude: number;
  longitude: number;
  distanceLabel: string;
  rating: number;
  reviewCount: number;
  basePriceCents: number;
  priceUnit: string;
  responseTime: string;
  availabilitySummary: string;
  description: string;
  verificationStatus:
    | "published_unverified"
    | "identity_verified"
    | "professional_verified";
  badges: ReferenceTag[];
  species: ReferenceTag[];
  careCapabilities: ReferenceTag[];
  careLocations: ReferenceTag[];
  careFormats: ReferenceTag[];
  services: ReferenceTag[];
  imageUrl: string;
  imageAlt: string;
  gallery: Array<{
    url: string;
    alt: string;
  }>;
};

export const trustProofs = [
  "Identité vérifiée",
  "Avis contrôlés",
  "Assurance modélisée",
  "Réservation sécurisée",
];

export const demoPetSitters: PublicPetSitter[] = [
  {
    id: "sarah-johnson",
    firstName: "Sarah",
    lastInitial: "J.",
    city: "Caen",
    approximateAddress: "Quartier Vaugueux, Caen",
    latitude: 49.1842,
    longitude: -0.3619,
    distanceLabel: "2,1 km",
    rating: 4.9,
    reviewCount: 128,
    basePriceCents: 2800,
    priceUnit: "jour",
    responseTime: "1 h",
    availabilitySummary: "Disponible cette semaine",
    description:
      "Garde calme et attentive pour chiens, chats et animaux sensibles, avec suivi quotidien.",
    verificationStatus: "professional_verified",
    badges: [
      { id: "identity", code: "verified_identity", label: "Identité vérifiée" },
      { id: "pro", code: "pro", label: "Pro" },
      { id: "insurance", code: "insurance", label: "Assurance active" },
    ],
    species: [
      { id: "dog", code: "dog", label: "Chiens" },
      { id: "cat", code: "cat", label: "Chats" },
      { id: "rabbit", code: "rabbit", label: "Lapins" },
    ],
    careCapabilities: [
      { id: "senior", code: "senior", label: "Animal âgé" },
      { id: "medication", code: "medication", label: "Sous traitement" },
      { id: "anxious", code: "anxious", label: "Anxieux" },
    ],
    careLocations: [
      { id: "sitter-home", code: "sitter_home", label: "Chez le pet-sitter" },
      { id: "owner-home", code: "owner_home", label: "À domicile" },
    ],
    careFormats: [
      { id: "day", code: "day", label: "Journée" },
      { id: "night", code: "night", label: "Nuit" },
    ],
    services: [
      { id: "boarding", code: "boarding", label: "Garde chez pet-sitter" },
      { id: "visit", code: "visit", label: "Visites" },
      { id: "photo", code: "photo", label: "Suivi photo" },
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=1800&q=82",
    imageAlt: "Pet-sitter assise avec un chien dans un intérieur lumineux",
    gallery: [
      {
        url: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1600&q=82",
        alt: "Chien golden retriever calme",
      },
      {
        url: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=1600&q=82",
        alt: "Chat installé près d'une fenêtre",
      },
      {
        url: "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1600&q=82",
        alt: "Chien attentif pendant une garde",
      },
      {
        url: "https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=1600&q=82",
        alt: "Petit chien photographié en lumière naturelle",
      },
    ],
  },
  {
    id: "liam-keller",
    firstName: "Liam",
    lastInitial: "K.",
    city: "Hérouville-Saint-Clair",
    approximateAddress: "Hérouville-Saint-Clair, nord de Caen",
    latitude: 49.2038,
    longitude: -0.3374,
    distanceLabel: "2,7 km",
    rating: 5,
    reviewCount: 98,
    basePriceCents: 2600,
    priceUnit: "jour",
    responseTime: "2 h",
    availabilitySummary: "Prochain créneau demain",
    description:
      "Profil patient pour chats, chiens et foyers multi-animaux, avec consignes détaillées.",
    verificationStatus: "identity_verified",
    badges: [
      { id: "identity", code: "verified_identity", label: "Identité vérifiée" },
      { id: "reviews", code: "verified_reviews", label: "Avis vérifiés" },
    ],
    species: [
      { id: "dog", code: "dog", label: "Chiens" },
      { id: "cat", code: "cat", label: "Chats" },
    ],
    careCapabilities: [
      { id: "medication", code: "medication", label: "Sous traitement" },
      { id: "multi", code: "multi_pet", label: "Multi-animaux" },
    ],
    careLocations: [
      { id: "owner-home", code: "owner_home", label: "À domicile" },
    ],
    careFormats: [
      { id: "night", code: "night", label: "Nuit" },
      { id: "drop-in", code: "drop_in", label: "Visite" },
    ],
    services: [
      { id: "house", code: "house_sitting", label: "Garde à domicile" },
      { id: "walk", code: "walk", label: "Promenade" },
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?auto=format&fit=crop&w=1800&q=82",
    imageAlt: "Pet-sitter avec un chat dans un cadre chaleureux",
    gallery: [
      {
        url: "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=1600&q=82",
        alt: "Chat observant son environnement",
      },
      {
        url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1600&q=82",
        alt: "Chat calme sur un canapé",
      },
      {
        url: "https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=1600&q=82",
        alt: "Chien lors d'une promenade",
      },
      {
        url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=1600&q=82",
        alt: "Chien en extérieur",
      },
    ],
  },
  {
    id: "sophia-martinez",
    firstName: "Sophia",
    lastInitial: "M.",
    city: "Mondeville",
    approximateAddress: "Mondeville, est de Caen",
    latitude: 49.1743,
    longitude: -0.3198,
    distanceLabel: "3,4 km",
    rating: 4.8,
    reviewCount: 76,
    basePriceCents: 3000,
    priceUnit: "jour",
    responseTime: "45 min",
    availabilitySummary: "Disponible le week-end",
    description:
      "Pet-sitter douce pour animaux âgés, anxieux ou avec alimentation spécifique.",
    verificationStatus: "professional_verified",
    badges: [
      { id: "identity", code: "verified_identity", label: "Identité vérifiée" },
      { id: "expert", code: "expert", label: "Expert" },
      { id: "insurance", code: "insurance", label: "Assurance active" },
    ],
    species: [
      { id: "dog", code: "dog", label: "Chiens" },
      { id: "cat", code: "cat", label: "Chats" },
      { id: "bird", code: "bird", label: "Oiseaux" },
    ],
    careCapabilities: [
      { id: "senior", code: "senior", label: "Animal âgé" },
      { id: "food", code: "food", label: "Alimentation spécifique" },
      { id: "monitoring", code: "monitoring", label: "Surveillance renforcée" },
    ],
    careLocations: [
      { id: "sitter-home", code: "sitter_home", label: "Chez le pet-sitter" },
    ],
    careFormats: [
      { id: "day", code: "day", label: "Journée" },
      { id: "drop-in", code: "drop_in", label: "Visite" },
    ],
    services: [
      { id: "boarding", code: "boarding", label: "Garde chez pet-sitter" },
      { id: "visit", code: "visit", label: "Visites" },
      { id: "updates", code: "updates", label: "Compte-rendu" },
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1525253013412-55c1a69a5738?auto=format&fit=crop&w=1800&q=82",
    imageAlt: "Pet-sitter tenant un petit chien avec douceur",
    gallery: [
      {
        url: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=1600&q=82",
        alt: "Chien calme en lumière naturelle",
      },
      {
        url: "https://images.unsplash.com/photo-1601758064224-c3c75d147a0d?auto=format&fit=crop&w=1600&q=82",
        alt: "Animal accompagné pendant une garde",
      },
      {
        url: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=1600&q=82",
        alt: "Chat allongé en sécurité",
      },
      {
        url: "https://images.unsplash.com/photo-1559190394-df5a28aab5c5?auto=format&fit=crop&w=1600&q=82",
        alt: "Chien photographié dehors",
      },
    ],
  },
];
