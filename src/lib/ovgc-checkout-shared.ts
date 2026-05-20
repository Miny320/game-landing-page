import { randomUUID } from "crypto";
import type { Session } from "next-auth";
import { createOvgcCheckoutSession } from "@/lib/ovgc-client";
import {
  getAppBaseUrl,
  getOvgcProductTitle,
  isOvgcConfigured,
} from "@/lib/ovgc-config";
import { setPendingOvgcSession } from "@/lib/user-db";

export type StartCheckoutResult =
  | { ok: true; checkoutUrl: string }
  | {
      ok: false;
      error: "not_signed_in" | "not_configured" | "missing_email" | "checkout_error";
      message?: string;
    };

export async function startOvgcCheckoutForSession(
  session: Session | null
): Promise<StartCheckoutResult> {
  const discordId = session?.user?.discordId;
  if (!discordId) {
    return { ok: false, error: "not_signed_in" };
  }

  if (!isOvgcConfigured()) {
    return { ok: false, error: "not_configured" };
  }

  const email = session.user.email?.trim();
  if (!email) {
    return {
      ok: false,
      error: "missing_email",
      message:
        "Your Discord account has no email on file. Enable email on Discord and sign in again.",
    };
  }

  const base = getAppBaseUrl();
  const orderUuid = randomUUID();

  try {
    const { checkoutUrl, transactionId } = await createOvgcCheckoutSession({
        email,
        product_title: getOvgcProductTitle(),
        success_url: `${base}/dashboard/billing/success?order_uuid=${orderUuid}`,
        cancel_url: `${base}/dashboard/billing/cancel`,
        order_uuid: orderUuid,
      });

    await setPendingOvgcSession(discordId, orderUuid, transactionId);
    return { ok: true, checkoutUrl };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Could not start OVGC checkout";
    return { ok: false, error: "checkout_error", message };
  }
}
