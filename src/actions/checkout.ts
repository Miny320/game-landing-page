"use server";

import { auth } from "@/auth";
import {
  startOvgcCheckoutForSession,
  startOvgcCheckoutWithEmail,
} from "@/lib/ovgc-checkout-start";

export type CheckoutActionResult =
  | { ok: true; checkoutUrl: string }
  | { ok: false; message: string };

export async function startGuestCheckout(email: string): Promise<CheckoutActionResult> {
  const session = await auth();
  const result = session?.user?.discordId
    ? await startOvgcCheckoutForSession(session)
    : await startOvgcCheckoutWithEmail(email);

  if (!result.ok) {
    return {
      ok: false,
      message: result.message ?? "Could not start checkout.",
    };
  }

  return { ok: true, checkoutUrl: result.checkoutUrl };
}
