import { assertPositiveMoneyCents, type MoneyCents } from "@/shared/domain/money";

export const PLATFORM_COMMISSION_RATE = 0.15;

export type PaymentBreakdown = {
  totalAmountCents: MoneyCents;
  platformCommissionCents: MoneyCents;
  providerAmountCents: MoneyCents;
};

export function calculatePaymentBreakdown(
  totalAmountCents: MoneyCents,
  commissionRate = PLATFORM_COMMISSION_RATE,
): PaymentBreakdown {
  assertPositiveMoneyCents(totalAmountCents, "totalAmountCents");

  const platformCommissionCents = Math.round(totalAmountCents * commissionRate);
  const providerAmountCents = totalAmountCents - platformCommissionCents;

  return {
    totalAmountCents,
    platformCommissionCents,
    providerAmountCents,
  };
}
