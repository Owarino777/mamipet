import { z } from "zod";
import { createStripeCheckoutSession } from "@/modules/payments/infrastructure/stripe-checkout";
import { getSiteUrl } from "@/shared/config/site";
import { HttpError } from "@/shared/errors/http-error";
import { parseJsonBody } from "@/shared/http/request-json";
import { jsonError, jsonOk } from "@/shared/http/route-response";

const createDemoCheckoutSchema = z.object({
  bookingId: z.string().trim().min(1),
  careType: z.string().trim().min(1).max(120),
  endDate: z.string().trim().min(1).max(40),
  petSitterName: z.string().trim().min(1).max(120),
  startDate: z.string().trim().min(1).max(40),
  totalAmountCents: z.number().int().positive().max(100_000),
});

export async function POST(request: Request) {
  try {
    const input = await parseJsonBody(request, createDemoCheckoutSchema);
    const siteUrl = getSiteUrl();

    if (siteUrl.protocol !== "http:" && siteUrl.protocol !== "https:") {
      throw new HttpError("Invalid application URL.", 500, "INVALID_APP_URL");
    }

    const successUrl = new URL("/dashboard", siteUrl);
    successUrl.searchParams.set("demoCheckout", "success");
    successUrl.searchParams.set("bookingId", input.bookingId);

    const cancelUrl = new URL("/dashboard", siteUrl);
    cancelUrl.searchParams.set("demoCheckout", "cancelled");
    cancelUrl.searchParams.set("bookingId", input.bookingId);

    const checkout = await createStripeCheckoutSession({
      cancelUrl: cancelUrl.toString(),
      clientReferenceId: input.bookingId,
      lineItem: {
        amountCents: input.totalAmountCents,
        description: `${input.careType} du ${input.startDate} au ${input.endDate}`,
        name: `Garde MamiPet avec ${input.petSitterName}`,
      },
      metadata: {
        bookingId: input.bookingId,
        checkoutKind: "demo",
      },
      successUrl: successUrl.toString(),
    });

    return jsonOk({
      checkoutSessionId: checkout.id,
      checkoutUrl: checkout.url,
    });
  } catch (error) {
    return jsonError(error);
  }
}
