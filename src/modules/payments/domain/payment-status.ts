export const paymentStatuses = [
  "pending",
  "succeeded",
  "failed",
  "refunded",
  "partially_refunded",
  "expired",
] as const;

export type PaymentStatus = (typeof paymentStatuses)[number];
