export const reservationStatuses = [
  "awaiting_response",
  "accepted",
  "refused",
  "awaiting_payment",
  "paid",
  "cancelled",
  "completed",
  "incident_reported",
] as const;

export type ReservationStatus = (typeof reservationStatuses)[number];

export const initialReservationStatus: ReservationStatus = "awaiting_response";
