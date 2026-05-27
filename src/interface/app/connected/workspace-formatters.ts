import { demoPetSitters } from "@/interface/shared/product-data";
import type {
  DemoAdminTask,
  DemoBooking,
  DemoPet,
} from "@/interface/shared/demo-workspace-state";

export function getPrimaryPetSitter() {
  const petSitter = demoPetSitters[0];

  if (!petSitter) {
    throw new Error("At least one demo pet-sitter profile is required.");
  }

  return petSitter;
}

export function createPetById(pets: DemoPet[]): Map<string, DemoPet> {
  return new Map(pets.map((pet) => [pet.id, pet]));
}

export function formatBookingTitle(
  booking: DemoBooking,

  petById: Map<string, DemoPet>,
): string {
  const petNames = booking.petIds

    .map((petId) => petById.get(petId)?.name)

    .filter(Boolean)

    .join(" et ");

  return petNames ? `Garde de ${petNames}` : "Garde sans animal sélectionné";
}

export function formatShortDate(date: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",

    month: "short",
  }).format(new Date(`${date}T12:00:00.000Z`));
}

export function formatAdminStatus(status: DemoAdminTask["status"]): string {
  const labels: Record<DemoAdminTask["status"], string> = {
    pending: "En attente",

    validated: "Validé",

    rejected: "Refusé",

    resolved: "Traité",
  };

  return labels[status];
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Action impossible.";
}
