import { describe, expect, it } from "vitest";
import {
  acceptBooking,
  createBooking,
  initialDemoWorkspaceState,
  openReport,
  payBooking,
  submitReview,
} from "@/interface/shared/demo-workspace-state";

describe("demo workspace state", () => {
  it("creates a booking request visible to the pet-sitter workflow", () => {
    const state = createBooking(initialDemoWorkspaceState, {
      petIds: ["pet-luna"],
      petSitterId: "sarah-johnson",
      petSitterName: "Sarah J.",
      startDate: "2026-06-10",
      endDate: "2026-06-12",
      careType: "Garde chez le pet-sitter",
      instructions: "Traitement le matin.",
      baseAmountCents: 10800,
      insuranceLevel: "standard",
    });

    expect(state.bookings[0]).toMatchObject({
      status: "awaiting_response",
      petIds: ["pet-luna"],
      platformCommissionCents: 1620,
    });
  });

  it("runs the direct reservation flow until payment contract generation", () => {
    const requestedState = createBooking(initialDemoWorkspaceState, {
      petIds: ["pet-luna", "pet-milo"],
      petSitterId: "sarah-johnson",
      petSitterName: "Sarah J.",
      startDate: "2026-06-10",
      endDate: "2026-06-12",
      careType: "Garde chez le pet-sitter",
      instructions: "Consignes détaillées.",
      baseAmountCents: 12100,
      insuranceLevel: "premium",
    });
    const bookingId = requestedState.bookings[0]?.id ?? "";
    const acceptedState = acceptBooking(requestedState, bookingId);
    const paidState = payBooking(acceptedState, bookingId);

    expect(paidState.bookings[0]).toMatchObject({
      status: "paid",
      insuranceLevel: "premium",
    });
    expect(paidState.bookings[0]?.contractSummary).toContain("commission 15 %");
  });

  it("prevents reviews before the booking is completed", () => {
    expect(() =>
      submitReview(initialDemoWorkspaceState, "booking-demo-1", {
        rating: 5,
        comment: "Très bonne garde.",
        careScore: 5,
        communicationScore: 5,
        trustScore: 5,
      }),
    ).toThrow("Un avis est possible seulement après une garde terminée.");
  });

  it("opens an admin-visible report and marks the booking as incident reported", () => {
    const state = openReport(
      initialDemoWorkspaceState,
      "booking-demo-1",
      "Photos quotidiennes non reçues.",
    );

    expect(state.bookings[0]?.status).toBe("incident_reported");
    expect(state.reports[0]).toMatchObject({
      label: "Signalement · Sarah J.",
      status: "pending",
    });
  });
});
