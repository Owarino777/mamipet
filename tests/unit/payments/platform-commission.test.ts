import { describe, expect, it } from "vitest";
import { calculatePaymentBreakdown } from "@/modules/payments/domain/platform-commission";

describe("calculatePaymentBreakdown", () => {
  it("calculates the 15 percent MamiPet commission", () => {
    expect(calculatePaymentBreakdown(15_000)).toEqual({
      totalAmountCents: 15_000,
      platformCommissionCents: 2_250,
      providerAmountCents: 12_750,
    });
  });

  it("rounds commission cents predictably", () => {
    expect(calculatePaymentBreakdown(9_999)).toEqual({
      totalAmountCents: 9_999,
      platformCommissionCents: 1_500,
      providerAmountCents: 8_499,
    });
  });
});
