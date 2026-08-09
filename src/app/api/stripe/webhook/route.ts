import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import type Stripe from "stripe";
import {
  getInvoiceSubscriptionId,
  getStripe,
  getSubscriptionPeriodEnd,
  isSubscriptionTerminated,
  toStripeId,
} from "@/lib/stripe-client";
import { getStripeWebhookSecret } from "@/lib/stripe-config";
import {
  fulfillStripeSubscription,
  revokeStripeAccessForDiscord,
} from "@/lib/stripe-fulfillment";
import { retryPaidCheckoutActivation } from "@/lib/paid-checkout-retry";
import {
  attachStripeRefsToCheckout,
  linkCheckoutPendingToDiscord,
  markCheckoutPendingFulfilled,
  markCheckoutPendingPaidByOrderUuid,
  resolveCheckoutPendingFromWebhookRefs,
} from "@/lib/checkout-pending-db";
import {
  getUserByEmail,
  getUserByStripeCustomerId,
  getUserByStripeSubscriptionId,
  markSubscriptionPastDue,
  setSubscriptionCancelAtPeriodEnd,
} from "@/lib/user-db";

/** Raw body is required for signature verification, so this must stay on the Node runtime. */
export const runtime = "nodejs";

type PendingCheckout = Awaited<
  ReturnType<typeof resolveCheckoutPendingFromWebhookRefs>
>;

function normalizeEmail(value?: string | null): string | null {
  const trimmed = value?.trim().toLowerCase();
  return trimmed || null;
}

/** Retrieve a subscription without letting an API hiccup fail the whole webhook. */
async function safeRetrieveSubscription(
  subscriptionId: string | null
): Promise<Stripe.Subscription | null> {
  if (!subscriptionId) return null;
  try {
    return await getStripe().subscriptions.retrieve(subscriptionId);
  } catch (e) {
    console.error("[stripe webhook] subscription retrieve failed:", e);
    return null;
  }
}

/**
 * Finds the Discord account for a payment: subscription/session metadata first (set at
 * checkout), then the stored pending checkout, then the payment email.
 */
async function resolveDiscordId(sources: {
  metadataDiscordId?: string | null;
  pending?: PendingCheckout;
  email?: string | null;
  stripeSubscriptionId?: string | null;
  stripeCustomerId?: string | null;
}): Promise<string | null> {
  const fromMetadata = sources.metadataDiscordId?.trim();
  if (fromMetadata) return fromMetadata;

  const fromPending = sources.pending?.discordId?.trim();
  if (fromPending) return fromPending;

  if (sources.stripeSubscriptionId) {
    const bySub = await getUserByStripeSubscriptionId(
      sources.stripeSubscriptionId
    );
    if (bySub?.discordId) return bySub.discordId;
  }

  if (sources.stripeCustomerId) {
    const byCustomer = await getUserByStripeCustomerId(sources.stripeCustomerId);
    if (byCustomer?.discordId) return byCustomer.discordId;
  }

  const email = normalizeEmail(sources.email);
  if (email) {
    const byEmail = await getUserByEmail(email);
    if (byEmail?.discordId) return byEmail.discordId;
  }

  return null;
}

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  eventType: string
) {
  if (session.mode !== "subscription") {
    return NextResponse.json({
      received: true,
      ignored: `mode_${session.mode}`,
    });
  }

  if (
    session.payment_status !== "paid" &&
    session.payment_status !== "no_payment_required"
  ) {
    return NextResponse.json({
      received: true,
      fulfilled: false,
      reason: `payment_status_${session.payment_status}`,
    });
  }

  const subscriptionId = toStripeId(session.subscription);
  const customerId = toStripeId(session.customer);
  const orderUuid =
    session.client_reference_id?.trim() ||
    session.metadata?.orderUuid?.trim() ||
    null;
  const email = normalizeEmail(
    session.customer_details?.email ??
      session.customer_email ??
      session.metadata?.email
  );
  // Invoice id keeps this in sync with the `invoice.paid` event for the same payment.
  const paymentRef = toStripeId(session.invoice) ?? session.id;

  const subscription = await safeRetrieveSubscription(subscriptionId);

  const pending = await resolveCheckoutPendingFromWebhookRefs({
    ids: [session.id, subscriptionId, paymentRef].filter(
      (id): id is string => Boolean(id)
    ),
    orderUuid,
    email,
    stripeCustomerId: customerId,
  });

  if (pending?.orderUuid) {
    await attachStripeRefsToCheckout(pending.orderUuid, {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
    });
    if (pending.status === "pending") {
      await markCheckoutPendingPaidByOrderUuid(pending.orderUuid);
    }
  }

  const discordId = await resolveDiscordId({
    metadataDiscordId:
      session.metadata?.discordId ?? subscription?.metadata?.discordId,
    pending,
    email,
    stripeSubscriptionId: subscriptionId,
    stripeCustomerId: customerId,
  });

  // Guest checkout: paid, but Discord is linked later on the billing success page.
  if (!discordId) {
    const retry = await retryPaidCheckoutActivation({
      orderUuid: pending?.orderUuid,
      email: pending?.email ?? email ?? undefined,
    });
    if (retry.fulfilled) {
      revalidatePath("/dashboard");
      return NextResponse.json({
        received: true,
        fulfilled: true,
        recovered_on_webhook: true,
      });
    }

    return NextResponse.json({
      received: true,
      fulfilled: false,
      awaiting_discord: true,
      retry_reason: retry.reason,
    });
  }

  if (pending?.orderUuid && !pending.discordId) {
    await linkCheckoutPendingToDiscord(pending.orderUuid, discordId);
  }

  const result = await fulfillStripeSubscription({
    paymentRef,
    discordId,
    periodEnd: subscription ? getSubscriptionPeriodEnd(subscription) : null,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
    cancelAtPeriodEnd: subscription?.cancel_at_period_end,
    eventType,
    amount: session.amount_total != null ? session.amount_total / 100 : undefined,
    currency: session.currency ?? undefined,
  });

  if (result.ok && pending?.orderUuid) {
    await markCheckoutPendingFulfilled(pending.orderUuid);
  }

  if (!result.ok) {
    console.error("[stripe webhook] fulfill failed:", result, {
      sessionId: session.id,
      orderUuid,
      email,
    });
    // 5xx tells Stripe to retry — used when Discord is momentarily unreachable.
    if (result.reason === "discord_error") {
      return NextResponse.json(
        {
          received: true,
          fulfilled: false,
          reason: result.reason,
          message: result.message,
        },
        { status: 503 }
      );
    }
  }

  revalidatePath("/dashboard");
  return NextResponse.json({ received: true, fulfilled: result.ok });
}

/** Renewals (and the first invoice) — extends access to the new period end. */
async function handleInvoicePaid(invoice: Stripe.Invoice, eventType: string) {
  const subscriptionId = getInvoiceSubscriptionId(invoice);
  if (!subscriptionId) {
    return NextResponse.json({ received: true, ignored: "no_subscription" });
  }

  const customerId = toStripeId(invoice.customer);
  const subscription = await safeRetrieveSubscription(subscriptionId);
  const email = normalizeEmail(
    invoice.customer_email ?? subscription?.metadata?.email
  );

  const pending = await resolveCheckoutPendingFromWebhookRefs({
    ids: [subscriptionId],
    email,
    stripeCustomerId: customerId,
  });

  // Record the payment even if Discord is linked later, so the retry cron can pick it up.
  if (pending?.orderUuid) {
    await attachStripeRefsToCheckout(pending.orderUuid, {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
    });
    if (pending.status === "pending") {
      await markCheckoutPendingPaidByOrderUuid(pending.orderUuid);
    }
  }

  const discordId = await resolveDiscordId({
    metadataDiscordId:
      subscription?.metadata?.discordId ??
      invoice.parent?.subscription_details?.metadata?.discordId,
    pending,
    email,
    stripeSubscriptionId: subscriptionId,
    stripeCustomerId: customerId,
  });

  if (!discordId) {
    console.error("[stripe webhook] invoice.paid but no Discord account:", {
      invoiceId: invoice.id,
      subscriptionId,
      email,
    });
    return NextResponse.json({
      received: true,
      fulfilled: false,
      awaiting_discord: true,
    });
  }

  if (pending?.orderUuid && !pending.discordId) {
    await linkCheckoutPendingToDiscord(pending.orderUuid, discordId);
  }

  const result = await fulfillStripeSubscription({
    paymentRef: invoice.id ?? `${subscriptionId}:${invoice.period_end}`,
    discordId,
    periodEnd: subscription ? getSubscriptionPeriodEnd(subscription) : null,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
    cancelAtPeriodEnd: subscription?.cancel_at_period_end,
    eventType,
    amount: invoice.amount_paid / 100,
    currency: invoice.currency,
  });

  if (result.ok && pending?.orderUuid) {
    await markCheckoutPendingFulfilled(pending.orderUuid);
  }

  if (!result.ok && result.reason === "discord_error") {
    return NextResponse.json(
      { received: true, fulfilled: false, message: result.message },
      { status: 503 }
    );
  }

  revalidatePath("/dashboard");
  return NextResponse.json({ received: true, fulfilled: result.ok });
}

/**
 * Card declined. Access is left in place — Stripe retries for a few days and only
 * `customer.subscription.deleted` (or the expiry cron) actually removes the role.
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = getInvoiceSubscriptionId(invoice);
  const customerId = toStripeId(invoice.customer);

  const discordId = await resolveDiscordId({
    email: normalizeEmail(invoice.customer_email),
    stripeSubscriptionId: subscriptionId,
    stripeCustomerId: customerId,
  });

  if (discordId) {
    await markSubscriptionPastDue(discordId);
    revalidatePath("/dashboard");
  }

  return NextResponse.json({ received: true, past_due: Boolean(discordId) });
}

async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  eventType: string
) {
  const customerId = toStripeId(subscription.customer);
  const discordId = await resolveDiscordId({
    metadataDiscordId: subscription.metadata?.discordId,
    stripeSubscriptionId: subscription.id,
    stripeCustomerId: customerId,
  });

  if (!discordId) {
    return NextResponse.json({ received: true, ignored: "no_discord_account" });
  }

  if (isSubscriptionTerminated(subscription.status)) {
    await revokeStripeAccessForDiscord(discordId);
    revalidatePath("/dashboard");
    return NextResponse.json({ received: true, revoked: true });
  }

  if (subscription.status === "past_due") {
    await markSubscriptionPastDue(discordId);
  }

  await setSubscriptionCancelAtPeriodEnd(
    discordId,
    Boolean(subscription.cancel_at_period_end)
  );

  // Keep the stored window aligned with Stripe (plan changes, trial ends, proration).
  const periodEnd = getSubscriptionPeriodEnd(subscription);
  if (periodEnd && subscription.status === "active") {
    const { applyStripeSubscriptionWindow } = await import("@/lib/user-db");
    await applyStripeSubscriptionWindow(discordId, periodEnd, {
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: customerId,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });
  }

  revalidatePath("/dashboard");
  return NextResponse.json({ received: true, synced: true, eventType });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = toStripeId(subscription.customer);
  const discordId = await resolveDiscordId({
    metadataDiscordId: subscription.metadata?.discordId,
    stripeSubscriptionId: subscription.id,
    stripeCustomerId: customerId,
  });

  if (!discordId) {
    return NextResponse.json({ received: true, ignored: "no_discord_account" });
  }

  await revokeStripeAccessForDiscord(discordId);
  revalidatePath("/dashboard");
  return NextResponse.json({ received: true, revoked: true });
}

export async function POST(req: Request) {
  const webhookSecret = getStripeWebhookSecret();
  if (!webhookSecret) {
    console.error("[stripe webhook] STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ error: "not_configured" }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = await getStripe().webhooks.constructEventAsync(
      rawBody,
      signature,
      webhookSecret
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid signature";
    console.error("[stripe webhook] rejected:", message);
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        return await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session,
          event.type
        );

      case "invoice.paid":
        return await handleInvoicePaid(
          event.data.object as Stripe.Invoice,
          event.type
        );

      case "invoice.payment_failed":
        return await handleInvoicePaymentFailed(
          event.data.object as Stripe.Invoice
        );

      case "customer.subscription.updated":
        return await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription,
          event.type
        );

      case "customer.subscription.deleted":
        return await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        );

      default:
        return NextResponse.json({ received: true, ignored: event.type });
    }
  } catch (e) {
    // Return 500 so Stripe retries rather than dropping the event.
    console.error("[stripe webhook] handler error:", event.type, e);
    return NextResponse.json(
      { error: "handler_error", event: event.type },
      { status: 500 }
    );
  }
}
