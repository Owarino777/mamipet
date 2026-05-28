import { calculatePaymentBreakdown } from "@/modules/payments/domain/platform-commission";

export type DemoPet = {
  id: string;
  name: string;
  species: string;
  age: string;
  needs: string[];
  image: string;
  medicalRecordStatus: "complete" | "incomplete";
};

export type DemoBookingStatus =
  | "awaiting_response"
  | "accepted"
  | "paid"
  | "completed"
  | "refused"
  | "cancelled"
  | "incident_reported";

export type DemoBookingRequestKind = "direct" | "open";

export type DemoBooking = {
  id: string;
  ownerId: string;
  ownerName: string;
  requestKind: DemoBookingRequestKind;
  petSitterId: string | null;
  petSitterName: string;
  petIds: string[];
  startDate: string;
  endDate: string;
  careType: string;
  instructions: string;
  status: DemoBookingStatus;
  totalAmountCents: number;
  platformCommissionCents: number;
  providerAmountCents: number;
  insuranceLevel: "standard" | "premium";
  contractSummary: string | null;
  review: DemoReview | null;
};

export type DemoReview = {
  rating: number;
  comment: string;
  careScore: number;
  communicationScore: number;
  trustScore: number;
};

export type DemoAdminTaskStatus = "pending" | "validated" | "rejected" | "resolved";

export type DemoAdminTask = {
  id: string;
  label: string;
  detail: string;
  status: DemoAdminTaskStatus;
};

export type DemoWorkspaceState = {
  pets: DemoPet[];
  bookings: DemoBooking[];
  documents: DemoAdminTask[];
  reports: DemoAdminTask[];
};

export type CreateBookingCommand = {
  ownerId?: string;
  ownerName?: string;
  petIds: string[];
  requestKind?: DemoBookingRequestKind;
  petSitterId?: string | null;
  petSitterName?: string;
  startDate: string;
  endDate: string;
  careType: string;
  instructions: string;
  baseAmountCents: number;
  insuranceLevel: "standard" | "premium";
};

export const emptyDemoWorkspaceState: DemoWorkspaceState = {
  pets: [],
  bookings: [],
  documents: [],
  reports: [],
};

export const initialDemoWorkspaceState: DemoWorkspaceState = {
  pets: [
    {
      id: "pet-luna",
      name: "Luna",
      species: "Chien",
      age: "3 ans",
      needs: ["Anxiété", "Pas de chats"],
      image:
        "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1200&q=82",
      medicalRecordStatus: "incomplete",
    },
    {
      id: "pet-milo",
      name: "Milo",
      species: "Chat",
      age: "2 ans",
      needs: ["Intérieur", "Traitement léger"],
      image:
        "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=1200&q=82",
      medicalRecordStatus: "complete",
    },
  ],
  bookings: [
    createInitialBooking({
      id: "booking-demo-1",
      petIds: ["pet-luna", "pet-milo"],
      status: "accepted",
      totalAmountCents: 12100,
      instructions:
        "Luna devient anxieuse pendant les orages. Milo doit rester à l'intérieur.",
      contractSummary: null,
      review: null,
    }),
  ],
  documents: [
    {
      id: "document-sarah-acaced",
      label: "Sarah Johnson · Attestation ACACED",
      detail: "Profil pet-sitter professionnel",
      status: "pending",
    },
    {
      id: "document-thomas-rc",
      label: "Thomas L. · RC Pro",
      detail: "Justificatif professionnel",
      status: "pending",
    },
    {
      id: "document-elodie-id",
      label: "Élodie M. · Identité",
      detail: "Vérification identité",
      status: "validated",
    },
  ],
  reports: [
    {
      id: "report-incident-1",
      label: "Incident pendant une garde",
      detail: "Réservation #booking-demo-1 · à traiter",
      status: "pending",
    },
    {
      id: "report-review-1",
      label: "Avis litigieux",
      detail: "Contrôle modération de premier niveau",
      status: "pending",
    },
  ],
};

export function addPet(
  state: DemoWorkspaceState,
  pet: Omit<DemoPet, "id" | "medicalRecordStatus">,
): DemoWorkspaceState {
  const normalizedName = pet.name.trim();

  if (!normalizedName || !pet.species.trim() || !pet.age.trim()) {
    throw new Error("Nom, espèce et âge sont obligatoires.");
  }

  return {
    ...state,
    pets: [
      ...state.pets,
      {
        ...pet,
        id: `pet-${normalizedName.toLowerCase().replaceAll(/\s+/g, "-")}-${state.pets.length + 1}`,
        name: normalizedName,
        medicalRecordStatus: "incomplete",
      },
    ],
  };
}

export function completePetMedicalRecord(
  state: DemoWorkspaceState,
  petId: string,
): DemoWorkspaceState {
  let didFindPet = false;
  const pets = state.pets.map((pet) => {
    if (pet.id !== petId) {
      return pet;
    }

    didFindPet = true;

    return {
      ...pet,
      medicalRecordStatus: "complete" as const,
      needs:
        pet.needs.length > 0 && !pet.needs.includes("Carnet de santé validé")
          ? [...pet.needs, "Carnet de santé validé"]
          : pet.needs,
    };
  });

  if (!didFindPet) {
    throw new Error("Animal introuvable.");
  }

  return { ...state, pets };
}

export function completeBookingPetMedicalRecords(
  state: DemoWorkspaceState,
  bookingId: string,
): DemoWorkspaceState {
  const booking = state.bookings.find((candidate) => candidate.id === bookingId);

  if (!booking) {
    throw new Error("Réservation introuvable.");
  }

  return booking.petIds.reduce(
    (currentState, petId) => completePetMedicalRecord(currentState, petId),
    state,
  );
}

export function createBooking(
  state: DemoWorkspaceState,
  command: CreateBookingCommand,
): DemoWorkspaceState {
  if (command.petIds.length === 0) {
    throw new Error("Sélectionnez au moins un animal.");
  }

  const knownPetIds = new Set(state.pets.map((pet) => pet.id));
  const allPetsBelongToOwner = command.petIds.every((petId) => knownPetIds.has(petId));

  if (!allPetsBelongToOwner) {
    throw new Error("Une réservation ne peut contenir que vos animaux.");
  }

  const payment = calculatePaymentBreakdown(command.baseAmountCents);
  const requestKind = command.requestKind ?? "direct";

  if (requestKind === "direct" && !command.petSitterId) {
    throw new Error("Sélectionnez un pet-sitter pour une demande directe.");
  }

  return {
    ...state,
    bookings: [
      createInitialBooking({
        id: createDemoBookingId(state),
        ownerId: command.ownerId ?? "owner",
        ownerName: command.ownerName ?? "Olivia Carter",
        petIds: command.petIds,
        status: "awaiting_response",
        totalAmountCents: payment.totalAmountCents,
        instructions: command.instructions.trim(),
        contractSummary: null,
        review: null,
        requestKind,
        petSitterId:
          requestKind === "open" ? null : (command.petSitterId ?? null),
        petSitterName:
          requestKind === "open"
            ? "À attribuer"
            : (command.petSitterName ?? "Pet-sitter"),
        startDate: command.startDate,
        endDate: command.endDate,
        careType: command.careType,
        insuranceLevel: command.insuranceLevel,
      }),
      ...state.bookings,
    ],
  };
}

function createDemoBookingId(state: DemoWorkspaceState): string {
  const randomId = globalThis.crypto?.randomUUID?.();

  if (randomId) {
    return `booking-demo-${randomId}`;
  }

  return `booking-demo-${state.bookings.length + 1}-${Date.now()}`;
}

export function acceptBooking(
  state: DemoWorkspaceState,
  bookingId: string,
  assignee?: { petSitterId: string; petSitterName: string },
): DemoWorkspaceState {
  return updateBooking(state, bookingId, (booking) => {
    assertStatus(booking, ["awaiting_response"], "Seule une demande en attente peut être acceptée.");

    if (booking.requestKind === "open") {
      if (!assignee) {
        throw new Error("Un pet-sitter doit être identifié pour accepter une annonce générale.");
      }

      return {
        ...booking,
        petSitterId: assignee.petSitterId,
        petSitterName: assignee.petSitterName,
        status: "accepted",
      };
    }

    return { ...booking, status: "accepted" };
  });
}

export function refuseBooking(
  state: DemoWorkspaceState,
  bookingId: string,
): DemoWorkspaceState {
  return updateBooking(state, bookingId, (booking) => {
    assertStatus(booking, ["awaiting_response"], "Seule une demande en attente peut être refusée.");

    return { ...booking, status: "refused" };
  });
}

export function payBooking(
  state: DemoWorkspaceState,
  bookingId: string,
): DemoWorkspaceState {
  return updateBooking(state, bookingId, (booking) => {
    assertStatus(booking, ["accepted"], "Seule une réservation acceptée peut être payée.");

    return {
      ...booking,
      status: "paid",
      contractSummary: createContractSummary(booking),
    };
  });
}

function createContractSummary(booking: DemoBooking): string {
  return [
    "Contrat de mission MamiPet généré après paiement Stripe test.",
    `Garde du ${booking.startDate} au ${booking.endDate}.`,
    `Montant total ${formatCents(booking.totalAmountCents)}, net pet-sitter ${formatCents(booking.providerAmountCents)}, commission 15 % MamiPet ${formatCents(booking.platformCommissionCents)}.`,
    `Assurance ${booking.insuranceLevel}.`,
  ].join(" ");
}

function formatCents(amountCents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    currency: "EUR",
    style: "currency",
  }).format(amountCents / 100);
}

export function completeBooking(
  state: DemoWorkspaceState,
  bookingId: string,
): DemoWorkspaceState {
  return updateBooking(state, bookingId, (booking) => {
    assertStatus(booking, ["paid"], "Seule une réservation payée peut être terminée.");

    return { ...booking, status: "completed" };
  });
}

export function submitReview(
  state: DemoWorkspaceState,
  bookingId: string,
  review: DemoReview,
): DemoWorkspaceState {
  return updateBooking(state, bookingId, (booking) => {
    assertStatus(booking, ["completed"], "Un avis est possible seulement après une garde terminée.");

    if (booking.review) {
      throw new Error("Un avis existe déjà pour cette réservation.");
    }

    return { ...booking, review };
  });
}

export function openReport(
  state: DemoWorkspaceState,
  bookingId: string,
  reason: string,
): DemoWorkspaceState {
  const booking = state.bookings.find((candidate) => candidate.id === bookingId);

  if (!booking) {
    throw new Error("Réservation introuvable.");
  }

  const trimmedReason = reason.trim();

  if (!trimmedReason) {
    throw new Error("Le motif du signalement est obligatoire.");
  }

  return {
    ...state,
    bookings: state.bookings.map((candidate) =>
      candidate.id === bookingId
        ? { ...candidate, status: "incident_reported" }
        : candidate,
    ),
    reports: [
      {
        id: `report-demo-${state.reports.length + 1}`,
        label: `Signalement · ${booking.petSitterName}`,
        detail: trimmedReason,
        status: "pending",
      },
      ...state.reports,
    ],
  };
}

export function updateAdminTask(
  state: DemoWorkspaceState,
  collection: "documents" | "reports",
  taskId: string,
  status: DemoAdminTaskStatus,
): DemoWorkspaceState {
  return {
    ...state,
    [collection]: state[collection].map((task) =>
      task.id === taskId ? { ...task, status } : task,
    ),
  };
}

export function getBookingStatusLabel(status: DemoBookingStatus): string {
  const labels: Record<DemoBookingStatus, string> = {
    awaiting_response: "En attente de réponse",
    accepted: "Acceptée",
    paid: "Payée",
    completed: "Terminée",
    refused: "Refusée",
    cancelled: "Annulée",
    incident_reported: "Incident signalé",
  };

  return labels[status];
}

function createInitialBooking({
  id,
  ownerId = "owner",
  ownerName = "Olivia Carter",
  petIds,
  status,
  totalAmountCents,
  instructions,
  contractSummary,
  review,
  petSitterId = "sarah-johnson",
  petSitterName = "Sarah J.",
  requestKind = "direct",
  startDate = "2026-05-24",
  endDate = "2026-05-26",
  careType = "Garde chez le pet-sitter",
  insuranceLevel = "standard",
}: {
  id: string;
  ownerId?: string;
  ownerName?: string;
  petIds: string[];
  status: DemoBookingStatus;
  totalAmountCents: number;
  instructions: string;
  contractSummary: string | null;
  review: DemoReview | null;
  petSitterId?: string | null;
  petSitterName?: string;
  requestKind?: DemoBookingRequestKind;
  startDate?: string;
  endDate?: string;
  careType?: string;
  insuranceLevel?: "standard" | "premium";
}): DemoBooking {
  const payment = calculatePaymentBreakdown(totalAmountCents);

  return {
    id,
    ownerId,
    ownerName,
    requestKind,
    petSitterId,
    petSitterName,
    petIds,
    startDate,
    endDate,
    careType,
    instructions,
    status,
    totalAmountCents: payment.totalAmountCents,
    platformCommissionCents: payment.platformCommissionCents,
    providerAmountCents: payment.providerAmountCents,
    insuranceLevel,
    contractSummary,
    review,
  };
}

function updateBooking(
  state: DemoWorkspaceState,
  bookingId: string,
  update: (booking: DemoBooking) => DemoBooking,
): DemoWorkspaceState {
  let didFindBooking = false;

  const bookings = state.bookings.map((booking) => {
    if (booking.id !== bookingId) {
      return booking;
    }

    didFindBooking = true;

    return update(booking);
  });

  if (!didFindBooking) {
    throw new Error("Réservation introuvable.");
  }

  return { ...state, bookings };
}

function assertStatus(
  booking: DemoBooking,
  acceptedStatuses: DemoBookingStatus[],
  message: string,
) {
  if (!acceptedStatuses.includes(booking.status)) {
    throw new Error(message);
  }
}
