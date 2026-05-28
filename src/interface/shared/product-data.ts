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

const identityBadge: ReferenceTag = {
  id: "identity",
  code: "verified_identity",
  label: "Identité vérifiée",
};

const proBadge: ReferenceTag = { id: "pro", code: "pro", label: "Pro" };
const expertBadge: ReferenceTag = { id: "expert", code: "expert", label: "Expert" };
const insuranceBadge: ReferenceTag = {
  id: "insurance",
  code: "insurance",
  label: "Assurance active",
};
const reviewBadge: ReferenceTag = {
  id: "reviews",
  code: "verified_reviews",
  label: "Avis vérifiés",
};

const dogSpecies: ReferenceTag = { id: "dog", code: "dog", label: "Chiens" };
const catSpecies: ReferenceTag = { id: "cat", code: "cat", label: "Chats" };
const rabbitSpecies: ReferenceTag = {
  id: "rabbit",
  code: "rabbit",
  label: "Lapins",
};
const birdSpecies: ReferenceTag = { id: "bird", code: "bird", label: "Oiseaux" };
const smallPetSpecies: ReferenceTag = {
  id: "small-pet",
  code: "small_pet",
  label: "Petits mammifères",
};

const seniorCare: ReferenceTag = {
  id: "senior",
  code: "senior",
  label: "Animal âgé",
};
const medicationCare: ReferenceTag = {
  id: "medication",
  code: "medication",
  label: "Sous traitement",
};
const anxiousCare: ReferenceTag = {
  id: "anxious",
  code: "anxious",
  label: "Anxieux",
};
const monitoringCare: ReferenceTag = {
  id: "monitoring",
  code: "monitoring",
  label: "Surveillance renforcée",
};
const foodCare: ReferenceTag = {
  id: "food",
  code: "food",
  label: "Alimentation spécifique",
};
const multiPetCare: ReferenceTag = {
  id: "multi",
  code: "multi_pet",
  label: "Multi-animaux",
};

const sitterHome: ReferenceTag = {
  id: "sitter-home",
  code: "sitter_home",
  label: "Chez le pet-sitter",
};
const ownerHome: ReferenceTag = {
  id: "owner-home",
  code: "owner_home",
  label: "À domicile",
};
const dayCareFormat: ReferenceTag = { id: "day", code: "day", label: "Journée" };
const nightCareFormat: ReferenceTag = { id: "night", code: "night", label: "Nuit" };
const dropInCareFormat: ReferenceTag = {
  id: "drop-in",
  code: "drop_in",
  label: "Visite",
};

const boardingService: ReferenceTag = {
  id: "boarding",
  code: "boarding",
  label: "Garde chez pet-sitter",
};
const houseSittingService: ReferenceTag = {
  id: "house",
  code: "house_sitting",
  label: "Garde à domicile",
};
const walkService: ReferenceTag = {
  id: "walk",
  code: "walk",
  label: "Promenade",
};
const photoService: ReferenceTag = {
  id: "photo",
  code: "photo",
  label: "Suivi photo",
};

const sharedGallery = [
  {
    url: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1600&q=82",
    alt: "Chien calme en lumière naturelle",
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
    url: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=1600&q=82",
    alt: "Animal accompagné pendant une garde",
  },
];

const parisGallery = [
  {
    url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1600&q=82",
    alt: "Deux chiens en promenade",
  },
  {
    url: "https://images.unsplash.com/photo-1559190394-df5a28aab5c5?auto=format&fit=crop&w=1600&q=82",
    alt: "Chien photographié dehors",
  },
  ...sharedGallery.slice(0, 2),
];

const lyonGallery = [
  {
    url: "https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?auto=format&fit=crop&w=1600&q=82",
    alt: "Chat dans un intérieur chaleureux",
  },
  {
    url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1600&q=82",
    alt: "Chat calme sur un canapé",
  },
  {
    url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=1600&q=82",
    alt: "Chien en extérieur",
  },
  {
    url: "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=1600&q=82",
    alt: "Chat observant son environnement",
  },
];

const marseilleGallery = [
  {
    url: "https://images.unsplash.com/photo-1525253013412-55c1a69a5738?auto=format&fit=crop&w=1600&q=82",
    alt: "Petit chien porté avec douceur",
  },
  {
    url: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=1600&q=82",
    alt: "Chien accompagné pendant une garde",
  },
  {
    url: "https://images.unsplash.com/photo-1559190394-df5a28aab5c5?auto=format&fit=crop&w=1600&q=82",
    alt: "Chien photographié dehors",
  },
  {
    url: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1600&q=82",
    alt: "Chien calme en lumière naturelle",
  },
];

const bordeauxGallery = [
  {
    url: "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=1600&q=82",
    alt: "Chat attentif près d'une fenêtre",
  },
  {
    url: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=1600&q=82",
    alt: "Chat allongé en sécurité",
  },
  {
    url: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=1600&q=82",
    alt: "Chat installé dans un intérieur calme",
  },
  {
    url: "https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=1600&q=82",
    alt: "Petit chien en lumière naturelle",
  },
];

const toulouseGallery = [
  {
    url: "https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=1600&q=82",
    alt: "Chien lors d'une promenade",
  },
  {
    url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=1600&q=82",
    alt: "Chien dehors pendant une sortie",
  },
  {
    url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1600&q=82",
    alt: "Deux chiens en promenade",
  },
  {
    url: "https://images.unsplash.com/photo-1601758064224-c3c75d147a0d?auto=format&fit=crop&w=1600&q=82",
    alt: "Animal accompagné pendant une garde",
  },
];

const nantesGallery = [
  {
    url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1600&q=82",
    alt: "Chat calme sur un canapé",
  },
  {
    url: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=1600&q=82",
    alt: "Chat posé près d'une fenêtre",
  },
  {
    url: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=1600&q=82",
    alt: "Chat allongé en sécurité",
  },
  {
    url: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=1600&q=82",
    alt: "Chien accompagné pendant une garde",
  },
];

const lilleGallery = [
  {
    url: "https://images.unsplash.com/photo-1601758064224-c3c75d147a0d?auto=format&fit=crop&w=1600&q=82",
    alt: "Animal accompagné pendant une garde",
  },
  {
    url: "https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=1600&q=82",
    alt: "Petit chien photographié en lumière naturelle",
  },
  {
    url: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1600&q=82",
    alt: "Chien calme en lumière naturelle",
  },
  {
    url: "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=1600&q=82",
    alt: "Chat attentif",
  },
];

const strasbourgGallery = [
  {
    url: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=1600&q=82",
    alt: "Chat allongé en sécurité",
  },
  {
    url: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=1600&q=82",
    alt: "Chat installé près d'une fenêtre",
  },
  {
    url: "https://images.unsplash.com/photo-1525253013412-55c1a69a5738?auto=format&fit=crop&w=1600&q=82",
    alt: "Petit chien accompagné",
  },
  {
    url: "https://images.unsplash.com/photo-1559190394-df5a28aab5c5?auto=format&fit=crop&w=1600&q=82",
    alt: "Chien photographié dehors",
  },
];

const niceGallery = [
  {
    url: "https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=1600&q=82",
    alt: "Petit chien photographié en lumière naturelle",
  },
  {
    url: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1600&q=82",
    alt: "Chien golden retriever calme",
  },
  {
    url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1600&q=82",
    alt: "Deux chiens en promenade",
  },
  {
    url: "https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?auto=format&fit=crop&w=1600&q=82",
    alt: "Chat en intérieur",
  },
];

const rennesGallery = [
  {
    url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=1600&q=82",
    alt: "Chien en extérieur",
  },
  {
    url: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=1600&q=82",
    alt: "Chien accompagné pendant une garde",
  },
  {
    url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1600&q=82",
    alt: "Chat calme sur un canapé",
  },
  {
    url: "https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=1600&q=82",
    alt: "Chien lors d'une promenade",
  },
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
  {
    id: "amelie-bernard",
    firstName: "Amélie",
    lastInitial: "B.",
    city: "Paris",
    approximateAddress: "Quartier Montmartre, Paris",
    latitude: 48.8867,
    longitude: 2.3431,
    distanceLabel: "Paris nord",
    rating: 4.9,
    reviewCount: 142,
    basePriceCents: 3400,
    priceUnit: "jour",
    responseTime: "35 min",
    availabilitySummary: "Disponible cette semaine",
    description:
      "Accompagnement très structuré pour chiens anxieux et chats sous traitement.",
    verificationStatus: "professional_verified",
    badges: [identityBadge, proBadge, insuranceBadge],
    species: [dogSpecies, catSpecies],
    careCapabilities: [anxiousCare, medicationCare, monitoringCare],
    careLocations: [ownerHome, sitterHome],
    careFormats: [dayCareFormat, nightCareFormat],
    services: [boardingService, houseSittingService, photoService],
    imageUrl:
      "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1800&q=82",
    imageAlt: "Pet-sitter en promenade avec deux chiens",
    gallery: parisGallery,
  },
  {
    id: "hugo-martin",
    firstName: "Hugo",
    lastInitial: "M.",
    city: "Lyon",
    approximateAddress: "Croix-Rousse, Lyon",
    latitude: 45.774,
    longitude: 4.832,
    distanceLabel: "Lyon centre",
    rating: 4.8,
    reviewCount: 88,
    basePriceCents: 3100,
    priceUnit: "jour",
    responseTime: "1 h",
    availabilitySummary: "Prochain créneau vendredi",
    description:
      "Garde posée pour foyers multi-animaux, avec routines et comptes rendus précis.",
    verificationStatus: "identity_verified",
    badges: [identityBadge, reviewBadge],
    species: [dogSpecies, catSpecies, smallPetSpecies],
    careCapabilities: [multiPetCare, foodCare, anxiousCare],
    careLocations: [ownerHome],
    careFormats: [dropInCareFormat, nightCareFormat],
    services: [houseSittingService, walkService, photoService],
    imageUrl:
      "https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?auto=format&fit=crop&w=1800&q=82",
    imageAlt: "Pet-sitter avec un chat dans un cadre chaleureux",
    gallery: lyonGallery,
  },
  {
    id: "ines-robert",
    firstName: "Inès",
    lastInitial: "R.",
    city: "Marseille",
    approximateAddress: "Quartier Longchamp, Marseille",
    latitude: 43.3046,
    longitude: 5.3941,
    distanceLabel: "Marseille centre",
    rating: 4.7,
    reviewCount: 64,
    basePriceCents: 3200,
    priceUnit: "jour",
    responseTime: "2 h",
    availabilitySummary: "Disponible le week-end",
    description:
      "Profil calme pour chiens seniors et animaux avec consignes vétérinaires légères.",
    verificationStatus: "professional_verified",
    badges: [identityBadge, expertBadge, insuranceBadge],
    species: [dogSpecies, catSpecies],
    careCapabilities: [seniorCare, medicationCare, monitoringCare],
    careLocations: [sitterHome],
    careFormats: [dayCareFormat, nightCareFormat],
    services: [boardingService, walkService, photoService],
    imageUrl:
      "https://images.unsplash.com/photo-1525253013412-55c1a69a5738?auto=format&fit=crop&w=1800&q=82",
    imageAlt: "Pet-sitter tenant un petit chien avec douceur",
    gallery: marseilleGallery,
  },
  {
    id: "camille-durand",
    firstName: "Camille",
    lastInitial: "D.",
    city: "Bordeaux",
    approximateAddress: "Quartier Saint-Augustin, Bordeaux",
    latitude: 44.8378,
    longitude: -0.5792,
    distanceLabel: "Bordeaux centre",
    rating: 4.9,
    reviewCount: 103,
    basePriceCents: 2900,
    priceUnit: "jour",
    responseTime: "50 min",
    availabilitySummary: "Disponible demain",
    description:
      "Garde attentive pour chats craintifs, chiens âgés et animaux à alimentation spécifique.",
    verificationStatus: "professional_verified",
    badges: [identityBadge, proBadge, reviewBadge],
    species: [dogSpecies, catSpecies, rabbitSpecies],
    careCapabilities: [seniorCare, foodCare, anxiousCare],
    careLocations: [ownerHome, sitterHome],
    careFormats: [dayCareFormat, dropInCareFormat],
    services: [boardingService, houseSittingService, photoService],
    imageUrl:
      "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=1800&q=82",
    imageAlt: "Chat observant son environnement",
    gallery: bordeauxGallery,
  },
  {
    id: "nora-garcia",
    firstName: "Nora",
    lastInitial: "G.",
    city: "Toulouse",
    approximateAddress: "Quartier Saint-Cyprien, Toulouse",
    latitude: 43.6007,
    longitude: 1.4328,
    distanceLabel: "Toulouse rive gauche",
    rating: 4.8,
    reviewCount: 71,
    basePriceCents: 3000,
    priceUnit: "jour",
    responseTime: "1 h 20",
    availabilitySummary: "Disponible cette semaine",
    description:
      "Pet-sitter rigoureuse pour traitements simples, animaux anxieux et suivi quotidien.",
    verificationStatus: "identity_verified",
    badges: [identityBadge, reviewBadge],
    species: [dogSpecies, catSpecies, birdSpecies],
    careCapabilities: [medicationCare, anxiousCare, monitoringCare],
    careLocations: [ownerHome],
    careFormats: [dayCareFormat, dropInCareFormat],
    services: [houseSittingService, walkService, photoService],
    imageUrl:
      "https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=1800&q=82",
    imageAlt: "Chien lors d'une promenade",
    gallery: toulouseGallery,
  },
  {
    id: "jules-moreau",
    firstName: "Jules",
    lastInitial: "M.",
    city: "Nantes",
    approximateAddress: "Île de Nantes, Nantes",
    latitude: 47.2064,
    longitude: -1.5596,
    distanceLabel: "Nantes centre",
    rating: 4.6,
    reviewCount: 57,
    basePriceCents: 2800,
    priceUnit: "jour",
    responseTime: "2 h",
    availabilitySummary: "Disponible le soir",
    description:
      "Garde à domicile pour chats, lapins et petits mammifères avec environnement calme.",
    verificationStatus: "identity_verified",
    badges: [identityBadge],
    species: [catSpecies, rabbitSpecies, smallPetSpecies],
    careCapabilities: [foodCare, anxiousCare, multiPetCare],
    careLocations: [ownerHome],
    careFormats: [dropInCareFormat, nightCareFormat],
    services: [houseSittingService, photoService],
    imageUrl:
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1800&q=82",
    imageAlt: "Chat calme sur un canapé",
    gallery: nantesGallery,
  },
  {
    id: "elise-legrand",
    firstName: "Élise",
    lastInitial: "L.",
    city: "Lille",
    approximateAddress: "Vieux-Lille, Lille",
    latitude: 50.6412,
    longitude: 3.0633,
    distanceLabel: "Lille centre",
    rating: 4.9,
    reviewCount: 92,
    basePriceCents: 2700,
    priceUnit: "jour",
    responseTime: "45 min",
    availabilitySummary: "Disponible cette semaine",
    description:
      "Garde rassurante pour chiens sociables, chats seniors et animaux sous traitement léger.",
    verificationStatus: "professional_verified",
    badges: [identityBadge, proBadge, insuranceBadge],
    species: [dogSpecies, catSpecies],
    careCapabilities: [seniorCare, medicationCare, foodCare],
    careLocations: [sitterHome, ownerHome],
    careFormats: [dayCareFormat, nightCareFormat],
    services: [boardingService, houseSittingService, walkService],
    imageUrl:
      "https://images.unsplash.com/photo-1601758064224-c3c75d147a0d?auto=format&fit=crop&w=1800&q=82",
    imageAlt: "Animal accompagné pendant une garde",
    gallery: lilleGallery,
  },
  {
    id: "manon-schmitt",
    firstName: "Manon",
    lastInitial: "S.",
    city: "Strasbourg",
    approximateAddress: "Neudorf, Strasbourg",
    latitude: 48.5667,
    longitude: 7.7677,
    distanceLabel: "Strasbourg sud",
    rating: 4.8,
    reviewCount: 69,
    basePriceCents: 3000,
    priceUnit: "jour",
    responseTime: "1 h",
    availabilitySummary: "Disponible ce mois-ci",
    description:
      "Profil patient pour chats anxieux, oiseaux et chiens âgés avec routines strictes.",
    verificationStatus: "professional_verified",
    badges: [identityBadge, expertBadge, reviewBadge],
    species: [dogSpecies, catSpecies, birdSpecies],
    careCapabilities: [seniorCare, anxiousCare, monitoringCare],
    careLocations: [ownerHome],
    careFormats: [dropInCareFormat, nightCareFormat],
    services: [houseSittingService, photoService],
    imageUrl:
      "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=1800&q=82",
    imageAlt: "Chat allongé en sécurité",
    gallery: strasbourgGallery,
  },
  {
    id: "clara-rossi",
    firstName: "Clara",
    lastInitial: "R.",
    city: "Nice",
    approximateAddress: "Quartier Libération, Nice",
    latitude: 43.7153,
    longitude: 7.262,
    distanceLabel: "Nice centre",
    rating: 5,
    reviewCount: 81,
    basePriceCents: 3500,
    priceUnit: "jour",
    responseTime: "30 min",
    availabilitySummary: "Disponible le week-end",
    description:
      "Garde premium pour chiens sensibles, animaux âgés et besoins de surveillance renforcée.",
    verificationStatus: "professional_verified",
    badges: [identityBadge, proBadge, expertBadge, insuranceBadge],
    species: [dogSpecies, catSpecies],
    careCapabilities: [seniorCare, anxiousCare, monitoringCare],
    careLocations: [sitterHome],
    careFormats: [dayCareFormat, nightCareFormat],
    services: [boardingService, walkService, photoService],
    imageUrl:
      "https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=1800&q=82",
    imageAlt: "Petit chien photographié en lumière naturelle",
    gallery: niceGallery,
  },
  {
    id: "mael-le-gall",
    firstName: "Maël",
    lastInitial: "L.",
    city: "Rennes",
    approximateAddress: "Quartier Thabor, Rennes",
    latitude: 48.1147,
    longitude: -1.6671,
    distanceLabel: "Rennes centre",
    rating: 4.7,
    reviewCount: 58,
    basePriceCents: 2800,
    priceUnit: "jour",
    responseTime: "1 h 45",
    availabilitySummary: "Disponible la semaine prochaine",
    description:
      "Pet-sitter méthodique pour garde à domicile, chats craintifs et petits animaux.",
    verificationStatus: "identity_verified",
    badges: [identityBadge, reviewBadge],
    species: [catSpecies, rabbitSpecies, smallPetSpecies],
    careCapabilities: [anxiousCare, foodCare, multiPetCare],
    careLocations: [ownerHome],
    careFormats: [dropInCareFormat, nightCareFormat],
    services: [houseSittingService, photoService],
    imageUrl:
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=1800&q=82",
    imageAlt: "Chien en extérieur",
    gallery: rennesGallery,
  },
];
