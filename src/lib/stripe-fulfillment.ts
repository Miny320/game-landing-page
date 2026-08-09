import { connectMongo } from "@/lib/db";
import {
  grantPaidSubscriberRole,
  revokePaidSubscriberRole,
} from "@/lib/discord-guild";
import { StripeFulfillment } from "@/models/StripeFulfillment";
import {
  applyStripeSubscriptionWindow,
  getEffectiveSubscriptionPeriodEnd,
  revokeSubscriptionAccess,
} from "@/lib/user-db";
import {
  getSubscriptionPeriodDays,
  setSubscriptionPeriodEndCookie,
} from "@/lib/subscription-cookie";
import { getSubscriptionAmountCents } from "@/lib/stripe-config";

export type FulfillStripeResult =
  | { ok: true; alreadyFulfilled?: boolean }
  | {
      ok: false;
      reason: "not_paid" | "discord_error" | "api_error" | "no_pending";
      message?: string;
    };

/**
 * Fallback access window used only when Stripe did not give us a period end.
 * Extends from the existing end so a renewal never shortens paid access.
 */
export function computeSubscriptionWindow(existing: Date | null): {
  periodStart: Date;
  periodEnd: Date;
} {
  const days = getSubscriptionPeriodDays();
  const ms = days * 86400000;
  const now = Date.now();
  const base = existing && existing.getTime() > now ? existing.getTime() : now;
  return {
    periodStart: new Date(base),
    periodEnd: new Date(base + ms),
  };
}

async function isPaymentAlreadyRecorded(paymentRef: string): Promise<boolean> {
  if (!(await connectMongo())) return false;
  const existing = await StripeFulfillment.findOne({ paymentRef }).lean();
  return existing != null;
}

async function recordFulfillment(data: {
  paymentRef: string;
  discordId: string;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  amount?: number;
  currency?: string;
  eventType?: string;
  periodStart: Date;
  periodEnd: Date;
}): Promise<void> {
  if (!(await connectMongo())) return;

  const amount = data.amount ?? getSubscriptionAmountCents() / 100;
  const currency = (data.currency ?? "usd").toUpperCase();

  await StripeFulfillment.findOneAndUpdate(
    { paymentRef: data.paymentRef },
    {
      $setOnInsert: {
        paymentRef: data.paymentRef,
        discordId: data.discordId,
        eventType: data.eventType,
        periodStart: data.periodStart,
        periodEnd: data.periodEnd,
      },
      $set: {
        amount,
        currency,
        ...(data.stripeCustomerId
          ? { stripeCustomerId: data.stripeCustomerId }
          : {}),
        ...(data.stripeSubscriptionId
          ? { stripeSubscriptionId: data.stripeSubscriptionId }
          : {}),
      },
    },
    { upsert: true }
  );
}

/**
 * Grants Discord access for a verified Stripe payment.
 *
 * `periodEnd` should come from the Stripe subscription — it is an absolute date, so
 * replaying the same event (or receiving both `checkout.session.completed` and
 * `invoice.paid` for one payment) converges on the same window instead of stacking days.
 */
export async function fulfillStripeSubscription(params: {
  /** Stripe Invoice id when available, else the Checkout Session id. */
  paymentRef: string;
  discordId: string;
  periodEnd?: Date | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  cancelAtPeriodEnd?: boolean;
  eventType?: string;
  amount?: number;
  currency?: string;
  /** Set the browser cookie when called from a logged-in request (never from webhooks). */
  setPeriodCookie?: boolean;
}): Promise<FulfillStripeResult> {
  const {
    paymentRef,
    discordId,
    stripeCustomerId,
    stripeSubscriptionId,
    cancelAtPeriodEnd,
    eventType,
    amount,
    currency,
    setPeriodCookie = false,
  } = params;

  if (await isPaymentAlreadyRecorded(paymentRef)) {
    return { ok: true, alreadyFulfilled: true };
  }

  try {
    await grantPaidSubscriberRole(discordId);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Discord role grant failed";
    return { ok: false, reason: "discord_error", message };
  }

  const existingEnd = await getEffectiveSubscriptionPeriodEnd(discordId);
  const fallback = computeSubscriptionWindow(existingEnd);
  const periodEnd = params.periodEnd ?? fallback.periodEnd;
  const periodStart = params.periodEnd ? new Date() : fallback.periodStart;

  if (setPeriodCookie) {
    await setSubscriptionPeriodEndCookie(periodEnd);
  }

  await applyStripeSubscriptionWindow(discordId, periodEnd, {
    stripeSubscriptionId,
    stripeCustomerId,
    cancelAtPeriodEnd,
  });

  await recordFulfillment({
    paymentRef,
    discordId,
    stripeCustomerId,
    stripeSubscriptionId,
    amount,
    currency,
    eventType,
    periodStart,
    periodEnd,
  });

  return { ok: true };
}

/** Removes the Discord Paid User role and clears the subscription in Mongo. */
export async function revokeStripeAccessForDiscord(
  discordId: string
): Promise<void> {
  try {
    await revokePaidSubscriberRole(discordId);
  } catch (e) {
    console.error("[stripe] revoke Discord role failed:", e);
  }
  await revokeSubscriptionAccess(discordId);
}

/**
 * Recovery path used whenever we know a Checkout Session id but did not get (or trust)
 * a webhook — billing success page, manual activation, retry cron.
 * The session is re-read from Stripe, so an unpaid or abandoned checkout never grants access.
 */
export async function fulfillStripeCheckoutSessionId(
  checkoutSessionId: string,
  discordId: string,
  options?: { setPeriodCookie?: boolean; eventType?: string }
): Promise<FulfillStripeResult> {
  const { getStripe, getSubscriptionPeriodEnd, toStripeId } = await import(
    "@/lib/stripe-client"
  );

  let session;
  try {
    session = await getStripe().checkout.sessions.retrieve(checkoutSessionId, {
      expand: ["subscription"],
    });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Stripe session lookup failed";
    return { ok: false, reason: "api_error", message };
  }

  if (
    session.payment_status !== "paid" &&
    session.payment_status !== "no_payment_required"
  ) {
    return { ok: false, reason: "not_paid" };
  }

  const subscription =
    session.subscription && typeof session.subscription !== "string"
      ? session.subscription
      : null;

  return fulfillStripeSubscription({
    paymentRef: toStripeId(session.invoice) ?? session.id,
    discordId,
    periodEnd: subscription ? getSubscriptionPeriodEnd(subscription) : null,
    stripeCustomerId: toStripeId(session.customer),
    stripeSubscriptionId: toStripeId(session.subscription),
    cancelAtPeriodEnd: subscription?.cancel_at_period_end,
    eventType: options?.eventType ?? "checkout.session.recovered",
    amount:
      session.amount_total != null ? session.amount_total / 100 : undefined,
    currency: session.currency ?? undefined,
    setPeriodCookie: options?.setPeriodCookie,
  });
}

/**
 * Backup path for when the user lands on billing success before the Stripe webhook runs.
 * Requires Mongo plus the pending checkout saved when checkout started.
 */
export async function tryFulfillPendingStripeForDiscord(
  discordId: string,
  orderUuid?: string | null
): Promise<FulfillStripeResult> {
  const { getUserByDiscordId } = await import("@/lib/user-db");
  const user = await getUserByDiscordId(discordId);
  const checkoutSessionId = user?.pendingCheckoutSessionId?.trim();
  if (!checkoutSessionId) {
    return { ok: false, reason: "no_pending" };
  }
  if (orderUuid?.trim() && user?.pendingCheckoutOrderUuid !== orderUuid.trim()) {
    return { ok: false, reason: "no_pending" };
  }

  return fulfillStripeCheckoutSessionId(checkoutSessionId, discordId, {
    setPeriodCookie: true,
  });
}
