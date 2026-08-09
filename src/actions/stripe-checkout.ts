"use server";

import { auth } from "@/auth";
import {
  startStripeCheckoutForSession,
  type StartCheckoutResult,
} from "@/lib/stripe-checkout-start";

export type StartStripeCheckoutResult = StartCheckoutResult;

export async function startStripeCheckout(): Promise<StartStripeCheckoutResult> {
  const session = await auth();
  return startStripeCheckoutForSession(session);
}
