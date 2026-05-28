"use client";

import { useSyncExternalStore } from "react";
import {
  acceptBooking,
  addPet,
  completeBooking,
  completeBookingPetMedicalRecords,
  completePetMedicalRecord,
  createBooking,
  emptyDemoWorkspaceState,
  initialDemoWorkspaceState,
  payBooking,
  openReport,
  refuseBooking,
  submitReview,
  updateAdminTask,
  type CreateBookingCommand,
  type DemoAdminTaskStatus,
  type DemoBooking,
  type DemoPet,
  type DemoReview,
  type DemoWorkspaceState,
} from "./demo-workspace-state";
import { demoSessionStorageKey, type DemoSession } from "./demo-session-client";

const workspaceStorageKeyPrefix = "mamipet.demoWorkspaceState";
const workspaceEventName = "mamipet-demo-workspace";

export function useDemoWorkspace() {
  const stateSnapshot = useSyncExternalStore(
    subscribeToWorkspace,
    getWorkspaceSnapshot,
    () => JSON.stringify(initialDemoWorkspaceState),
  );

  return parseWorkspaceState(stateSnapshot);
}

export const demoWorkspaceActions = {
  reset() {
    saveWorkspaceState(getInitialWorkspaceForCurrentSession());
  },

  startEmptyWorkspace() {
    saveWorkspaceState(emptyDemoWorkspaceState);
  },

  ensureWorkspaceForCurrentSession() {
    const key = getCurrentWorkspaceStorageKey();

    if (!window.localStorage.getItem(key)) {
      saveWorkspaceState(getInitialWorkspaceForCurrentSession());
    }

    syncIncomingPetSitterBookingsForCurrentSession();
    syncExistingBookingUpdatesForCurrentSession();
  },

  addPet(pet: Omit<DemoPet, "id" | "medicalRecordStatus">) {
    applyWorkspaceUpdate((state) => addPet(state, pet));
  },

  completePetMedicalRecord(petId: string) {
    applyWorkspaceUpdate((state) => completePetMedicalRecord(state, petId));
  },

  completeBookingPetMedicalRecords(bookingId: string) {
    const nextState = completeBookingPetMedicalRecords(
      readWorkspaceState(),
      bookingId,
    );
    const booking = nextState.bookings.find(
      (candidate) => candidate.id === bookingId,
    );

    saveWorkspaceState(nextState);

    if (booking) {
      mirrorBookingToRelatedWorkspaces(
        booking,
        nextState.pets.filter((pet) => booking.petIds.includes(pet.id)),
      );
    }
  },

  createBooking(command: CreateBookingCommand) {
    const currentState = readWorkspaceState();
    const session = readDemoSession();
    const nextState = createBooking(currentState, {
      ...command,
      ownerId: command.ownerId ?? session?.id ?? "anonymous-owner",
      ownerName: command.ownerName ?? session?.name ?? "Propriétaire",
    });
    const createdBooking = nextState.bookings[0];

    saveWorkspaceState(nextState);

    if (createdBooking) {
      const pets = currentState.pets.filter((pet) =>
        command.petIds.includes(pet.id),
      );

      if (createdBooking.requestKind === "open") {
        mirrorBookingToOpenMarketplaceWorkspaces(createdBooking, pets);
      } else {
        mirrorBookingToPetSitterWorkspaces(createdBooking, pets);
      }
    }
  },

  acceptBooking(bookingId: string) {
    applySharedBookingUpdate(bookingId, (state) =>
      acceptBooking(state, bookingId, getCurrentPetSitterAssignee()),
    );
  },

  refuseBooking(bookingId: string) {
    applySharedBookingUpdate(bookingId, (state) =>
      refuseBooking(state, bookingId),
    );
  },

  payBooking(bookingId: string) {
    applySharedBookingUpdate(bookingId, (state) => payBooking(state, bookingId));
  },

  completeBooking(bookingId: string) {
    applySharedBookingUpdate(bookingId, (state) =>
      completeBooking(state, bookingId),
    );
  },

  submitReview(bookingId: string, review: DemoReview) {
    applySharedBookingUpdate(bookingId, (state) =>
      submitReview(state, bookingId, review),
    );
  },

  openReport(bookingId: string, reason: string) {
    applySharedBookingUpdate(bookingId, (state) =>
      openReport(state, bookingId, reason),
    );
  },

  updateAdminTask(
    collection: "documents" | "reports",
    taskId: string,
    status: DemoAdminTaskStatus,
  ) {
    applyWorkspaceUpdate((state) => updateAdminTask(state, collection, taskId, status));
  },
};

function applyWorkspaceUpdate(
  update: (state: DemoWorkspaceState) => DemoWorkspaceState,
) {
  saveWorkspaceState(update(readWorkspaceState()));
}

function applySharedBookingUpdate(
  bookingId: string,
  update: (state: DemoWorkspaceState) => DemoWorkspaceState,
) {
  const nextState = update(readWorkspaceState());
  const updatedBooking = nextState.bookings.find(
    (booking) => booking.id === bookingId,
  );

  saveWorkspaceState(nextState);

  if (updatedBooking) {
    mirrorBookingToRelatedWorkspaces(
      updatedBooking,
      nextState.pets.filter((pet) => updatedBooking.petIds.includes(pet.id)),
    );
  }
}

function saveWorkspaceState(state: DemoWorkspaceState) {
  window.localStorage.setItem(getCurrentWorkspaceStorageKey(), JSON.stringify(state));
  window.dispatchEvent(new Event(workspaceEventName));
}

function mirrorBookingToPetSitterWorkspaces(
  booking: DemoBooking,
  pets: DemoPet[],
) {
  if (!booking.petSitterId) {
    return;
  }

  mirrorBookingToWorkspaceKeys(
    booking,
    pets,
    getPetSitterWorkspaceStorageKeys(booking.petSitterId),
  );
}

function mirrorBookingToOpenMarketplaceWorkspaces(
  booking: DemoBooking,
  pets: DemoPet[],
) {
  mirrorBookingToWorkspaceKeys(
    booking,
    pets,
    getOpenMarketplaceWorkspaceStorageKeys(),
  );
}

function mirrorBookingToRelatedWorkspaces(
  booking: DemoBooking,
  pets: DemoPet[],
) {
  const currentKey = getCurrentWorkspaceStorageKey();
  const targetKeys = Array.from(
    new Set([
      ...(booking.petSitterId
        ? getPetSitterWorkspaceStorageKeys(booking.petSitterId)
        : []),
      ...(booking.requestKind === "open"
        ? getOpenMarketplaceWorkspaceStorageKeys()
        : []),
      ...getAllWorkspaceStorageKeys().filter((storageKey) => {
        if (storageKey === currentKey) {
          return false;
        }

        return readWorkspaceStateFromKey(storageKey).bookings.some(
          (candidate) => candidate.id === booking.id,
        );
      }),
    ]),
  );

  mirrorBookingToWorkspaceKeys(booking, pets, targetKeys);
}

function mirrorBookingToWorkspaceKeys(
  booking: DemoBooking,
  pets: DemoPet[],
  targetKeys: string[],
) {
  const currentKey = getCurrentWorkspaceStorageKey();
  const keysToUpdate = targetKeys.filter((targetKey) => targetKey !== currentKey);

  for (const targetKey of keysToUpdate) {
    const existingState = readWorkspaceStateFromKey(targetKey);

    window.localStorage.setItem(
      targetKey,
      JSON.stringify(upsertSharedBooking(existingState, booking, pets)),
    );
  }

  if (keysToUpdate.length > 0) {
    window.dispatchEvent(new Event(workspaceEventName));
  }
}

function syncIncomingPetSitterBookingsForCurrentSession() {
  const session = readDemoSession();
  const petSitterId = getPetSitterProfileIdFromSession(session);

  if (!petSitterId) {
    return;
  }

  const currentKey = getCurrentWorkspaceStorageKey();
  const initialState = readWorkspaceStateFromKey(currentKey);
  const nextState = getAllWorkspaceStorageKeys()
    .filter((storageKey) => storageKey !== currentKey)
    .reduce((state, storageKey) => {
      const sourceState = readWorkspaceStateFromKey(storageKey);

      return sourceState.bookings
        .filter(
          (booking) =>
            booking.petSitterId === petSitterId ||
            isOpenMarketplaceBooking(booking),
        )
        .reduce((mergedState, booking) => {
          const pets = sourceState.pets.filter((pet) =>
            booking.petIds.includes(pet.id),
          );

          return upsertSharedBooking(mergedState, booking, pets);
        }, state);
    }, initialState);

  if (JSON.stringify(nextState) !== JSON.stringify(initialState)) {
    window.localStorage.setItem(currentKey, JSON.stringify(nextState));
    window.dispatchEvent(new Event(workspaceEventName));
  }
}

function syncExistingBookingUpdatesForCurrentSession() {
  const currentKey = getCurrentWorkspaceStorageKey();
  const initialState = readWorkspaceStateFromKey(currentKey);
  const knownBookingIds = new Set(
    initialState.bookings.map((booking) => booking.id),
  );

  if (knownBookingIds.size === 0) {
    return;
  }

  const nextState = getAllWorkspaceStorageKeys()
    .filter((storageKey) => storageKey !== currentKey)
    .reduce((state, storageKey) => {
      const sourceState = readWorkspaceStateFromKey(storageKey);

      return sourceState.bookings
        .filter((booking) => knownBookingIds.has(booking.id))
        .reduce((mergedState, booking) => {
          const pets = sourceState.pets.filter((pet) =>
            booking.petIds.includes(pet.id),
          );

          return upsertSharedBooking(mergedState, booking, pets);
        }, state);
    }, initialState);

  if (JSON.stringify(nextState) !== JSON.stringify(initialState)) {
    window.localStorage.setItem(currentKey, JSON.stringify(nextState));
    window.dispatchEvent(new Event(workspaceEventName));
  }
}

function getAllWorkspaceStorageKeys(): string[] {
  const storageKeys: string[] = [];

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const storageKey = window.localStorage.key(index);

    if (storageKey?.startsWith(`${workspaceStorageKeyPrefix}:`)) {
      storageKeys.push(storageKey);
    }
  }

  return storageKeys;
}

function getPetSitterWorkspaceStorageKeys(petSitterId: string): string[] {
  const fixtureTargets: Record<string, string[]> = {
    "amelie-bernard": [
      `${workspaceStorageKeyPrefix}:local:local-petSitter-amelie.sitter@mamipet.test`,
    ],
    "hugo-martin": [
      `${workspaceStorageKeyPrefix}:local:local-petSitter-hugo.sitter@mamipet.test`,
    ],
    "sarah-johnson": [
      `${workspaceStorageKeyPrefix}:fixture:petSitter`,
      `${workspaceStorageKeyPrefix}:local:local-petSitter-sarah.sitter@mamipet.test`,
    ],
  };

  return fixtureTargets[petSitterId] ?? [];
}

function getOpenMarketplaceWorkspaceStorageKeys(): string[] {
  const fixtureTargets = [
    `${workspaceStorageKeyPrefix}:fixture:petSitter`,
    `${workspaceStorageKeyPrefix}:local:local-petSitter-sarah.sitter@mamipet.test`,
    `${workspaceStorageKeyPrefix}:local:local-petSitter-amelie.sitter@mamipet.test`,
    `${workspaceStorageKeyPrefix}:local:local-petSitter-hugo.sitter@mamipet.test`,
  ];
  const existingPetSitterTargets = getAllWorkspaceStorageKeys().filter(
    (storageKey) =>
      storageKey.includes("petSitter") ||
      storageKey.includes("sitter@mamipet.test"),
  );

  return Array.from(new Set([...fixtureTargets, ...existingPetSitterTargets]));
}

function isOpenMarketplaceBooking(booking: DemoBooking): boolean {
  return (
    booking.requestKind === "open" &&
    booking.status === "awaiting_response" &&
    !booking.petSitterId
  );
}

function getCurrentPetSitterAssignee():
  | { petSitterId: string; petSitterName: string }
  | undefined {
  const session = readDemoSession();
  const petSitterId = getPetSitterProfileIdFromSession(session);

  if (!petSitterId || !session) {
    return undefined;
  }

  return {
    petSitterId,
    petSitterName: formatSessionPetSitterName(session),
  };
}

function getPetSitterProfileIdFromSession(
  session: DemoSession | null,
): string | null {
  const isPetSitterSession = Boolean(
    session?.enabledRoles?.includes("petSitter") ||
      session?.roleLabel.toLowerCase().includes("pet-sitter"),
  );

  if (!session || !isPetSitterSession) {
    return null;
  }

  const normalizedId = session.id.toLowerCase();

  if (session.source === "fixture" && session.id === "petSitter") {
    return "sarah-johnson";
  }

  if (normalizedId.includes("sarah.sitter@mamipet.test")) {
    return "sarah-johnson";
  }

  if (normalizedId.includes("amelie.sitter@mamipet.test")) {
    return "amelie-bernard";
  }

  if (normalizedId.includes("hugo.sitter@mamipet.test")) {
    return "hugo-martin";
  }

  return `local-pet-sitter-${session.id}`;
}

function formatSessionPetSitterName(session: DemoSession): string {
  if (session.source === "fixture" && session.id === "petSitter") {
    return "Sarah J.";
  }

  const [firstName = "Pet-sitter", lastName = ""] = session.name.trim().split(/\s+/);
  const lastInitial = lastName ? `${lastName[0]?.toUpperCase()}.` : "";

  return [firstName, lastInitial].filter(Boolean).join(" ");
}

function readWorkspaceStateFromKey(storageKey: string): DemoWorkspaceState {
  const rawState = window.localStorage.getItem(storageKey);

  if (rawState) {
    return parseWorkspaceState(rawState);
  }

  return storageKey.endsWith(":fixture:petSitter")
    ? initialDemoWorkspaceState
    : emptyDemoWorkspaceState;
}

function upsertSharedBooking(
  state: DemoWorkspaceState,
  booking: DemoBooking,
  pets: DemoPet[],
): DemoWorkspaceState {
  const existingPetIds = new Set(state.pets.map((pet) => pet.id));
  const mergedPets = [
    ...state.pets,
    ...pets.filter((pet) => !existingPetIds.has(pet.id)),
  ];
  const existingBookingIndex = state.bookings.findIndex(
    (currentBooking) => currentBooking.id === booking.id,
  );
  const existingBooking =
    existingBookingIndex === -1 ? null : state.bookings[existingBookingIndex];
  const bookingToStore =
    existingBooking && isBookingStateNewer(existingBooking, booking)
      ? existingBooking
      : booking;

  if (existingBookingIndex === -1) {
    return {
      ...state,
      pets: mergedPets,
      bookings: [bookingToStore, ...state.bookings],
    };
  }

  return {
    ...state,
    pets: mergedPets,
    bookings: state.bookings.map((currentBooking, index) =>
      index === existingBookingIndex ? bookingToStore : currentBooking,
    ),
  };
}

function isBookingStateNewer(
  existingBooking: DemoBooking,
  incomingBooking: DemoBooking,
): boolean {
  return (
    getBookingStatusRank(existingBooking.status) >
    getBookingStatusRank(incomingBooking.status)
  );
}

function getBookingStatusRank(status: DemoBooking["status"]): number {
  const ranks: Record<DemoBooking["status"], number> = {
    awaiting_response: 0,
    accepted: 1,
    refused: 1,
    cancelled: 2,
    paid: 3,
    incident_reported: 4,
    completed: 5,
  };

  return ranks[status];
}

function readWorkspaceState(): DemoWorkspaceState {
  return parseWorkspaceState(getWorkspaceSnapshot());
}

function subscribeToWorkspace(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(workspaceEventName, onStoreChange);
  window.addEventListener("mamipet-demo-session", onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(workspaceEventName, onStoreChange);
    window.removeEventListener("mamipet-demo-session", onStoreChange);
  };
}

function getWorkspaceSnapshot(): string {
  return (
    window.localStorage.getItem(getCurrentWorkspaceStorageKey()) ??
    JSON.stringify(getInitialWorkspaceForCurrentSession())
  );
}

function getCurrentWorkspaceStorageKey(): string {
  const session = readDemoSession();

  if (!session) {
    return `${workspaceStorageKeyPrefix}:anonymous`;
  }

  return `${workspaceStorageKeyPrefix}:${session.source ?? "fixture"}:${session.id}`;
}

function getInitialWorkspaceForCurrentSession(): DemoWorkspaceState {
  const session = readDemoSession();

  return session?.source === "local" ? emptyDemoWorkspaceState : initialDemoWorkspaceState;
}

function readDemoSession(): DemoSession | null {
  try {
    const rawSession = window.localStorage.getItem(demoSessionStorageKey);

    if (!rawSession) {
      return null;
    }

    const session = JSON.parse(rawSession) as Partial<DemoSession>;

    if (
      typeof session.id !== "string" ||
      typeof session.name !== "string" ||
      typeof session.roleLabel !== "string" ||
      typeof session.route !== "string"
    ) {
      return null;
    }

    return session as DemoSession;
  } catch {
    return null;
  }
}

function parseWorkspaceState(rawState: string): DemoWorkspaceState {
  try {
    const parsedState = JSON.parse(rawState) as Partial<DemoWorkspaceState>;

    if (
      !Array.isArray(parsedState.pets) ||
      !Array.isArray(parsedState.bookings) ||
      !Array.isArray(parsedState.documents) ||
      !Array.isArray(parsedState.reports)
    ) {
      return initialDemoWorkspaceState;
    }

    return {
      pets: parsedState.pets as DemoWorkspaceState["pets"],
      bookings: (parsedState.bookings as DemoWorkspaceState["bookings"]).map(
        normalizeStoredBooking,
      ),
      documents: parsedState.documents as DemoWorkspaceState["documents"],
      reports: parsedState.reports as DemoWorkspaceState["reports"],
    };
  } catch {
    return initialDemoWorkspaceState;
  }
}

function normalizeStoredBooking(booking: DemoBooking): DemoBooking {
  return {
    ...booking,
    ownerId: booking.ownerId ?? "owner",
    requestKind: booking.requestKind ?? "direct",
    petSitterId: booking.petSitterId ?? null,
    petSitterName: booking.petSitterName ?? "À attribuer",
  };
}
