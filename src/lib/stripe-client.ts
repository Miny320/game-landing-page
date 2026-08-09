import Stripe from "stripe";
import {
  getStripePortalConfigurationId,
  getStripePriceId,
  getStripeSecretKey,
  getSubscriptionAmountCents,
  getSubscriptionCurrency,
  getSubscriptionProductName,
} from "@/lib/stripe-config";

let cached: Stripe | null = null;
let cachedKey: string | null = null;

export function getStripe(): Stripe {
  const key = getStripeSecretKey();
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  if (!cached || cachedKey !== key) {
    // No apiVersion override — the SDK pins the version its types were generated for.
    cached = new Stripe(key, {
      appInfo: { name: "Sigma Scripts", url: "https://sigmascripts.com" },
    });
    cachedKey = key;
  }
  return cached;
}

/** Narrow a Stripe expandable field to its id. */
export function toStripeId(
  value: string | { id: string } | null | undefined
): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : (value.id ?? null);
}

/**
 * End of the current billing period.
 * Stripe moved `current_period_end` off the subscription and onto its items, so read
 * the latest item value and fall back to the legacy top-level field on older payloads.
 */
export function getSubscriptionPeriodEnd(
  subscription: Stripe.Subscription
): Date | null {
  let latest: number | null = null;
  for (const item of subscription.items?.data ?? []) {
    const end = item.current_period_end;
    if (typeof end === "number" && (latest === null || end > latest)) {
      latest = end;
    }
  }

  if (latest === null) {
    const legacy = (subscription as unknown as { current_period_end?: number })
      .current_period_end;
    if (typeof legacy === "number") latest = legacy;
  }

  return latest === null ? null : new Date(latest * 1000);
}

/**
 * Subscription that generated an invoice.
 * Current API nests this under `parent.subscription_details`; older payloads used
 * a top-level `subscription` field.
 */
export function getInvoiceSubscriptionId(
  invoice: Stripe.Invoice
): string | null {
  const nested = invoice.parent?.subscription_details?.subscription;
  if (nested) return toStripeId(nested);

  const legacy = (
    invoice as unknown as { subscription?: string | { id: string } | null }
  ).subscription;
  return toStripeId(legacy);
}

/** Metadata we attach to both the Checkout Session and the Subscription it creates. */
export type CheckoutMetadata = {
  orderUuid: string;
  discordId?: string;
  email: string;
};

function buildLineItems(): Stripe.Checkout.SessionCreateParams.LineItem[] {
  const priceId = getStripePriceId();
  if (priceId) {
    return [{ price: priceId, quantity: 1 }];
  }

  return [
    {
      quantity: 1,
      price_data: {
        currency: getSubscriptionCurrency(),
        unit_amount: getSubscriptionAmountCents(),
        recurring: { interval: "month" },
        product_data: { name: getSubscriptionProductName() },
      },
    },
  ];
}

/**
 * Creates a hosted Stripe Checkout session in `subscription` mode.
 * The card is charged immediately and then every month until cancelled.
 */
export async function createStripeCheckoutSession(input: {
  email: string;
  orderUuid: string;
  successUrl: string;
  cancelUrl: string;
  discordId?: string;
  /** Reuse an existing Stripe customer so repeat purchases stay on one record. */
  customerId?: string | null;
}): Promise<{ sessionId: string; url: string; customerId: string | null }> {
  const stripe = getStripe();

  const metadata: Record<string, string> = {
    orderUuid: input.orderUuid,
    email: input.email,
    ...(input.discordId ? { discordId: input.discordId } : {}),
  };

  const session = await stripe.checkout.sessions.create(
    {
      mode: "subscription",
      line_items: buildLineItems(),
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      client_reference_id: input.orderUuid,
      metadata,
      // Copied onto the Subscription so renewal webhooks can resolve the Discord account.
      subscription_data: { metadata },
      allow_promotion_codes: true,
      ...(input.customerId
        ? { customer: input.customerId, customer_update: { address: "auto" } }
        : { customer_email: input.email }),
    },
    // Guards against duplicate sessions when a user double-submits checkout.
    { idempotencyKey: `checkout:${input.orderUuid}` }
  );

  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL");
  }

  return {
    sessionId: session.id,
    url: session.url,
    customerId: toStripeId(session.customer),
  };
}

export async function retrieveSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return getStripe().subscriptions.retrieve(subscriptionId);
}

/** Stripe-hosted page where subscribers update their card or cancel. */
export async function createBillingPortalSession(input: {
  customerId: string;
  returnUrl: string;
}): Promise<string> {
  const configuration = getStripePortalConfigurationId();
  const session = await getStripe().billingPortal.sessions.create({
    customer: input.customerId,
    return_url: input.returnUrl,
    ...(configuration ? { configuration } : {}),
  });
  return session.url;
}

/** Subscription states that should keep the Discord Paid User role. */
const ACTIVE_STATUSES = new Set<Stripe.Subscription.Status>([
  "active",
  "trialing",
  "past_due",
]);

export function isSubscriptionActive(
  status: Stripe.Subscription.Status
): boolean {
  return ACTIVE_STATUSES.has(status);
}

/** Terminal states where access should be removed. */
export function isSubscriptionTerminated(
  status: Stripe.Subscription.Status
): boolean {
  return status === "canceled" || status === "unpaid" || status === "incomplete_expired";
}
