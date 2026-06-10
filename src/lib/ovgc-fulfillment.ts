import { connectMongo } from "@/lib/db";
import {
  getOvgcCheckoutSession,
  isOvgcSessionPaid,
  type OvgcCheckoutSession,
} from "@/lib/ovgc-client";
import {
  grantPaidSubscriberRole,
  revokePaidSubscriberRole,
} from "@/lib/discord-guild";
import { OvgcFulfillment } from "@/models/OvgcFulfillment";
import {
  applyOvgcSubscriptionWindow,
  getEffectiveSubscriptionPeriodEnd,
  revokeOvgcSubscription,
} from "@/lib/user-db";
import {
  getSubscriptionPeriodDays,
  setSubscriptionPeriodEndCookie,
} from "@/lib/subscription-cookie";

export type FulfillOvgcResult =
  | { ok: true; alreadyFulfilled?: boolean }
  | { ok: false; reason: "not_paid" | "discord_mismatch" | "discord_error" | "api_error"; message?: string };

export function computeSubscriptionWindow(existing: Date | null): {
  periodStart: Date;
  periodEnd: Date;
} {
  const days = getSubscriptionPeriodDays();
  const ms = days * 86400000;
  const now = Date.now();
  const base =
    existing && existing.getTime() > now ? existing.getTime() : now;
  return {
    periodStart: new Date(base),
    periodEnd: new Date(base + ms),
  };
}

function computeExtendedPeriodEnd(existing: Date | null): Date {
  return computeSubscriptionWindow(existing).periodEnd;
}

function metadataDiscordId(session: OvgcCheckoutSession): string | null {
  const meta = session.metadata;
  if (!meta) return null;
  const id = meta.discordId ?? meta.discord_id;
  return typeof id === "string" && id.trim() ? id.trim() : null;
}

async function isSessionAlreadyFulfilled(ovgcSessionId: string): Promise<boolean> {
  if (!(await connectMongo())) return false;
  const existing = await OvgcFulfillment.findOne({ ovgcSessionId }).lean();
  return existing != null;
}

async function recordFulfillment(data: {
  ovgcSessionId: string;
  discordId: string;
  amount?: number;
  currency?: string;
  eventType?: string;
  periodStart: Date;
  periodEnd: Date;
}): Promise<void> {
  if (!(await connectMongo())) return;
  await OvgcFulfillment.findOneAndUpdate(
    { ovgcSessionId: data.ovgcSessionId },
    {
      $setOnInsert: {
        ovgcSessionId: data.ovgcSessionId,
        discordId: data.discordId,
        amount: data.amount,
        currency: data.currency,
        eventType: data.eventType,
        periodStart: data.periodStart,
        periodEnd: data.periodEnd,
      },
    },
    { upsert: true }
  );
}

/** Grant access after a trusted webhook (payment-request-api has no status GET). */
export async function fulfillOvgcCheckoutSessionTrusted(params: {
  ovgcSessionId: string;
  discordId: string;
  eventType?: string;
  amount?: number;
  currency?: string;
  /** Set browser cookie when called from a logged-in request (not webhooks). */
  setPeriodCookie?: boolean;
}): Promise<FulfillOvgcResult> {
  const {
    ovgcSessionId,
    discordId,
    eventType,
    amount,
    currency,
    setPeriodCookie = false,
  } = params;

  if (await isSessionAlreadyFulfilled(ovgcSessionId)) {
    return { ok: true, alreadyFulfilled: true };
  }

  try {
    await grantPaidSubscriberRole(discordId);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Discord role grant failed";
    return { ok: false, reason: "discord_error", message };
  }

  const existingEnd = await getEffectiveSubscriptionPeriodEnd(discordId);
  const { periodStart, periodEnd } = computeSubscriptionWindow(existingEnd);
  if (setPeriodCookie) {
    await setSubscriptionPeriodEndCookie(periodEnd);
  }
  await applyOvgcSubscriptionWindow(discordId, periodEnd, ovgcSessionId);
  await recordFulfillment({
    ovgcSessionId,
    discordId,
    amount,
    currency,
    eventType,
    periodStart,
    periodEnd,
  });

  return { ok: true };
}

/**
 * Verifies OVGC session when a status API exists; otherwise only fulfills if already recorded.
 * Idempotent per order/session id.
 */
export async function fulfillOvgcCheckoutSession(params: {
  ovgcSessionId: string;
  discordId: string;
  eventType?: string;
  /** Skip remote status check (e.g. signed webhook). */
  trusted?: boolean;
}): Promise<FulfillOvgcResult> {
  const { ovgcSessionId, discordId, eventType, trusted } = params;

  if (await isSessionAlreadyFulfilled(ovgcSessionId)) {
    return { ok: true, alreadyFulfilled: true };
  }

  if (trusted) {
    return fulfillOvgcCheckoutSessionTrusted({
      ovgcSessionId,
      discordId,
      eventType,
    });
  }

  let session: OvgcCheckoutSession;
  try {
    session = await getOvgcCheckoutSession(ovgcSessionId);
  } catch (e) {
    const message = e instanceof Error ? e.message : "OVGC session lookup failed";
    return { ok: false, reason: "api_error", message };
  }

  if (!isOvgcSessionPaid(session.status)) {
    return { ok: false, reason: "not_paid" };
  }

  const metaDiscord = metadataDiscordId(session);
  if (metaDiscord && metaDiscord !== discordId) {
    return { ok: false, reason: "discord_mismatch" };
  }

  return fulfillOvgcCheckoutSessionTrusted({
    ovgcSessionId,
    discordId,
    eventType,
    amount: session.amount,
    currency: session.currency,
  });
}

export async function revokeOvgcAccessForDiscord(discordId: string): Promise<void> {
  try {
    await revokePaidSubscriberRole(discordId);
  } catch (e) {
    console.error("[ovgc] revoke Discord role failed:", e);
  }
  await revokeOvgcSubscription(discordId);
}

/**
 * Backup when the user lands on billing success before the OVGC webhook runs.
 * Requires Mongo + pending transaction saved at checkout start.
 */
export async function tryFulfillPendingOvgcForDiscord(
  discordId: string,
  orderUuid?: string | null
): Promise<FulfillOvgcResult | { ok: false; reason: "no_pending" }> {
  const { getUserByDiscordId } = await import("@/lib/user-db");
  const user = await getUserByDiscordId(discordId);
  const transactionId = user?.pendingOvgcTransactionId?.trim();
  if (!transactionId) {
    return { ok: false, reason: "no_pending" };
  }
  if (orderUuid?.trim() && user?.pendingOvgcSessionId !== orderUuid.trim()) {
    return { ok: false, reason: "no_pending" };
  }

  return fulfillOvgcCheckoutSessionTrusted({
    ovgcSessionId: transactionId,
    discordId,
    setPeriodCookie: true,
  });
}

/** Fulfill from webhook using order/session id (payment-request-api). */
export async function fulfillOvgcCheckoutSessionById(
  transactionId: string,
  eventType?: string
): Promise<FulfillOvgcResult> {
  const {
    markCheckoutPendingFulfilled,
    markCheckoutPendingPaid,
    markCheckoutPendingPaidByOrderUuid,
    resolveCheckoutPendingFromWebhookRefs,
  } = await import("@/lib/checkout-pending-db");
  const pending = await resolveCheckoutPendingFromWebhookRefs({
    ids: [transactionId],
  });

  if (pending?.discordId) {
    const result = await fulfillOvgcCheckoutSessionTrusted({
      ovgcSessionId: transactionId,
      discordId: pending.discordId,
      eventType,
    });
    if (result.ok && pending.orderUuid) {
      await markCheckoutPendingFulfilled(pending.orderUuid);
    }
    return result;
  }

  if (pending && !pending.discordId) {
    if (pending.orderUuid) {
      await markCheckoutPendingPaidByOrderUuid(pending.orderUuid);
    } else {
      await markCheckoutPendingPaid(transactionId);
    }
    return {
      ok: false,
      reason: "discord_mismatch",
      message: "Payment recorded; awaiting Discord link",
    };
  }

  const { getUserByPendingOvgcTransaction } = await import("@/lib/user-db");
  const user = await getUserByPendingOvgcTransaction(transactionId);
  const discordId = user?.discordId;
  if (!discordId) {
    return {
      ok: false,
      reason: "discord_mismatch",
      message: "No user found for this transaction id",
    };
  }

  return fulfillOvgcCheckoutSessionTrusted({
    ovgcSessionId: transactionId,
    discordId,
    eventType,
  });
}
