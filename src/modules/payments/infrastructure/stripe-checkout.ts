import Stripe from "stripe";
import { ConfigurationError } from "@/shared/errors/http-error";

type CheckoutLineItem = {
  amountCents: number;
  description: string;
  name: string;
};

type CreateCheckoutSessionInput = {
  cancelUrl: string;
  clientReferenceId: string;
  lineItem: CheckoutLineItem;
  metadata: Record<string, string>;
  successUrl: string;
};

type CheckoutSessionResult = {
  id: string;
  url: string;
};

let stripeClient: Stripe | null = null;

export async function createStripeCheckoutSession(
  input: CreateCheckoutSessionInput,
): Promise<CheckoutSessionResult> {
  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.create({
    client_reference_id: input.clientReferenceId,
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            description: input.lineItem.description,
            name: input.lineItem.name,
          },
          unit_amount: input.lineItem.amountCents,
        },
        quantity: 1,
      },
    ],
    metadata: input.metadata,
    mode: "payment",
    payment_method_types: ["card"],
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
  });

  if (!session.url) {
    throw new ConfigurationError("Stripe did not return a Checkout URL.");
  }

  return {
    id: session.id,
    url: session.url,
  };
}

function getStripeClient(): Stripe {
  if (stripeClient) {
    return stripeClient;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new ConfigurationError("STRIPE_SECRET_KEY must be configured.");
  }

  stripeClient = new Stripe(secretKey, {
    appInfo: {
      name: "MamiPet",
      version: "0.1.0",
    },
  });

  return stripeClient;
}
