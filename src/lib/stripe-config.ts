/** Stripe billing config — recurring monthly subscription via Stripe Checkout. */

export function getStripeSecretKey(): string | null {
  return process.env.STRIPE_SECRET_KEY?.trim() || null;
}

/** Signing secret for /api/stripe/webhook (Dashboard → Developers → Webhooks). */
export function getStripeWebhookSecret(): string | null {
  return process.env.STRIPE_WEBHOOK_SECRET?.trim() || null;
}

export function isStripeConfigured(): boolean {
  return Boolean(getStripeSecretKey());
}

/**
 * Recurring price created in the Stripe dashboard (`price_...`).
 * When unset we build an inline monthly price from the amount/currency below,
 * which keeps local and preview environments working without dashboard setup.
 */
export function getStripePriceId(): string | null {
  return process.env.STRIPE_PRICE_ID?.trim() || null;
}

export function getSubscriptionAmountCents(): number {
  const raw = process.env.STRIPE_SUBSCRIPTION_AMOUNT_CENTS?.trim();
  const n = raw ? parseInt(raw, 10) : 1999;
  if (!Number.isFinite(n) || n < 100) return 1999;
  return n;
}

export function getSubscriptionCurrency(): string {
  return (process.env.STRIPE_CURRENCY?.trim() || "usd").toLowerCase();
}

export function getSubscriptionProductName(): string {
  return (
    process.env.STRIPE_PRODUCT_TITLE?.trim() ||
    "Sigma Scripts — Monthly Access"
  );
}

/** Optional Billing Portal configuration id (`bpc_...`) for the manage-subscription link. */
export function getStripePortalConfigurationId(): string | null {
  return process.env.STRIPE_PORTAL_CONFIGURATION_ID?.trim() || null;
}

export { getAppBaseUrl } from "@/lib/app-url";
