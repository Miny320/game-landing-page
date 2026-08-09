import { randomUUID } from "crypto";
import type { Session } from "next-auth";
import { createStripeCheckoutSession } from "@/lib/stripe-client";
import { createCheckoutPending } from "@/lib/checkout-pending-db";
import { getAppBaseUrl, isStripeConfigured } from "@/lib/stripe-config";
import {
  getUserByDiscordId,
  setPendingCheckoutSession,
  upsertUserOnDiscordSignIn,
} from "@/lib/user-db";

export type StartCheckoutResult =
  | { ok: true; checkoutUrl: string; orderUuid: string }
  | {
      ok: false;
      error: "not_configured" | "invalid_email" | "checkout_error";
      message?: string;
    };

function normalizeEmail(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return null;
  }
  return trimmed;
}

/** Start Stripe checkout from an email only (Discord linked after payment). */
export async function startStripeCheckoutWithEmail(
  emailInput: string,
  options?: { discordId?: string; discordName?: string; discordImage?: string }
): Promise<StartCheckoutResult> {
  if (!isStripeConfigured()) {
    return {
      ok: false,
      error: "not_configured",
      message: "Checkout is not configured.",
    };
  }

  const email = normalizeEmail(emailInput);
  if (!email) {
    return {
      ok: false,
      error: "invalid_email",
      message: "Enter a valid email address.",
    };
  }

  const base = getAppBaseUrl();
  const orderUuid = randomUUID();

  try {
    // Reuse the Stripe customer so a returning subscriber keeps one billing record.
    const existingCustomerId = options?.discordId
      ? (await getUserByDiscordId(options.discordId))?.stripeCustomerId?.trim()
      : null;

    const { sessionId, url, customerId } = await createStripeCheckoutSession({
      email,
      orderUuid,
      discordId: options?.discordId,
      customerId: existingCustomerId || null,
      successUrl: `${base}/billing/success?order_uuid=${orderUuid}&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${base}/billing/cancel?order_uuid=${orderUuid}`,
    });

    await createCheckoutPending({
      orderUuid,
      transactionId: sessionId,
      email,
      discordId: options?.discordId,
      checkoutSessionId: sessionId,
      stripeCustomerId: customerId ?? undefined,
    });

    if (options?.discordId) {
      await upsertUserOnDiscordSignIn({
        discordId: options.discordId,
        email,
        name: options.discordName,
        image: options.discordImage,
      });
      await setPendingCheckoutSession(options.discordId, orderUuid, sessionId);
    }

    return { ok: true, checkoutUrl: url, orderUuid };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Could not start Stripe checkout";
    return { ok: false, error: "checkout_error", message };
  }
}

export async function startStripeCheckoutForSession(
  session: Session | null
): Promise<StartCheckoutResult> {
  const email = session?.user?.email?.trim();
  if (!email) {
    return {
      ok: false,
      error: "invalid_email",
      message:
        "Your Discord account has no email on file. Enable email on Discord and sign in again, or use checkout with your email.",
    };
  }

  return startStripeCheckoutWithEmail(email, {
    discordId: session?.user?.discordId ?? undefined,
    discordName: session?.user?.name ?? undefined,
    discordImage: session?.user?.image ?? undefined,
  });
}
