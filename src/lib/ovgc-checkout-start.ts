import { randomUUID } from "crypto";
import type { Session } from "next-auth";
import { createOvgcCheckoutSession } from "@/lib/ovgc-client";
import { createCheckoutPending } from "@/lib/checkout-pending-db";
import {
  getAppBaseUrl,
  getOvgcProductTitle,
  isOvgcConfigured,
} from "@/lib/ovgc-config";
import { setPendingOvgcSession, upsertUserOnDiscordSignIn } from "@/lib/user-db";

export type StartCheckoutResult =
  | { ok: true; checkoutUrl: string; orderUuid: string }
  | {
      ok: false;
      error:
        | "not_configured"
        | "invalid_email"
        | "checkout_error";
      message?: string;
    };

function normalizeEmail(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return null;
  }
  return trimmed;
}

/** Start OVGC checkout from email only (Discord linked after payment). */
export async function startOvgcCheckoutWithEmail(
  emailInput: string,
  options?: { discordId?: string; discordName?: string; discordImage?: string }
): Promise<StartCheckoutResult> {
  if (!isOvgcConfigured()) {
    return { ok: false, error: "not_configured", message: "Checkout is not configured." };
  }

  const email = normalizeEmail(emailInput);
  if (!email) {
    return { ok: false, error: "invalid_email", message: "Enter a valid email address." };
  }

  const base = getAppBaseUrl();
  const orderUuid = randomUUID();

  try {
    const { checkoutUrl, transactionId } = await createOvgcCheckoutSession({
      email,
      product_title: getOvgcProductTitle(),
      success_url: `${base}/billing/success?order_uuid=${orderUuid}`,
      cancel_url: `${base}/billing/cancel?order_uuid=${orderUuid}`,
      order_uuid: orderUuid,
    });

    await createCheckoutPending({
      orderUuid,
      transactionId,
      email,
      discordId: options?.discordId,
    });

    if (options?.discordId) {
      await upsertUserOnDiscordSignIn({
        discordId: options.discordId,
        email,
        name: options.discordName,
        image: options.discordImage,
      });
      await setPendingOvgcSession(options.discordId, orderUuid, transactionId);
    }

    return { ok: true, checkoutUrl, orderUuid };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Could not start OVGC checkout";
    return { ok: false, error: "checkout_error", message };
  }
}

export async function startOvgcCheckoutForSession(
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

  return startOvgcCheckoutWithEmail(email, {
    discordId: session?.user?.discordId ?? undefined,
    discordName: session?.user?.name ?? undefined,
    discordImage: session?.user?.image ?? undefined,
  });
}
