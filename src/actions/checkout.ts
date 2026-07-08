"use server";

import { auth } from "@/auth";
import {
  startOvgcCheckoutForSession,
  startOvgcCheckoutWithEmail,
} from "@/lib/ovgc-checkout-start";

export type CheckoutActionResult =
  | { ok: true; checkoutUrl: string; linkedDiscord: boolean }
  | { ok: false; message: string };

/**
 * Path A — signed in with Discord: checkout links discordId → instant Paid User on webhook.
 * Path B — guest email: pay first, activate Discord on billing success (same payment email).
 */
export async function startGuestCheckout(email: string): Promise<CheckoutActionResult> {
  const session = await auth();
  const discordId = session?.user?.discordId;

  if (discordId) {
    const receiptEmail = email.trim() || session.user?.email?.trim() || "";
    const result = receiptEmail
      ? await startOvgcCheckoutWithEmail(receiptEmail, {
          discordId,
          discordName: session.user?.name ?? undefined,
          discordImage: session.user?.image ?? undefined,
        })
      : await startOvgcCheckoutForSession(session);

    if (!result.ok) {
      return {
        ok: false,
        message: result.message ?? "Could not start checkout.",
      };
    }

    return { ok: true, checkoutUrl: result.checkoutUrl, linkedDiscord: true };
  }

  const trimmed = email.trim();
  if (!trimmed) {
    return {
      ok: false,
      message: "Enter your Discord account email to continue to secure checkout.",
    };
  }

  const result = await startOvgcCheckoutWithEmail(trimmed);
  if (!result.ok) {
    return {
      ok: false,
      message: result.message ?? "Could not start checkout.",
    };
  }

  return { ok: true, checkoutUrl: result.checkoutUrl, linkedDiscord: false };
}
