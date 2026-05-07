"use client";

import { useSyncExternalStore } from "react";
import {
  acceptBooking,
  addPet,
  completeBooking,
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
  },

  addPet(pet: Omit<DemoPet, "id" | "medicalRecordStatus">) {
    applyWorkspaceUpdate((state) => addPet(state, pet));
  },

  createBooking(command: CreateBookingCommand) {
    applyWorkspaceUpdate((state) => createBooking(state, command));
  },

  acceptBooking(bookingId: string) {
    applyWorkspaceUpdate((state) => acceptBooking(state, bookingId));
  },

  refuseBooking(bookingId: string) {
    applyWorkspaceUpdate((state) => refuseBooking(state, bookingId));
  },

  payBooking(bookingId: string) {
    applyWorkspaceUpdate((state) => payBooking(state, bookingId));
  },

  completeBooking(bookingId: string) {
    applyWorkspaceUpdate((state) => completeBooking(state, bookingId));
  },

  submitReview(bookingId: string, review: DemoReview) {
    applyWorkspaceUpdate((state) => submitReview(state, bookingId, review));
  },

  openReport(bookingId: string, reason: string) {
    applyWorkspaceUpdate((state) => openReport(state, bookingId, reason));
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

function saveWorkspaceState(state: DemoWorkspaceState) {
  window.localStorage.setItem(getCurrentWorkspaceStorageKey(), JSON.stringify(state));
  window.dispatchEvent(new Event(workspaceEventName));
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
      bookings: parsedState.bookings as DemoWorkspaceState["bookings"],
      documents: parsedState.documents as DemoWorkspaceState["documents"],
      reports: parsedState.reports as DemoWorkspaceState["reports"],
    };
  } catch {
    return initialDemoWorkspaceState;
  }
}
