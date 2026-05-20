/** OVGC merchant API — dashboard shows billing.ovgcpayments.com (not ovgcpayments.com/docs checkout-sessions). */

export function getOvgcApiKey(): string | null {
  return process.env.OVGC_API_KEY?.trim() || null;
}

export function getOvgcWebhookSecret(): string | null {
  return process.env.OVGC_WEBHOOK_SECRET?.trim() || null;
}

export function isOvgcConfigured(): boolean {
  return Boolean(getOvgcApiKey());
}

/**
 * Full URL for creating a payment (from dashboard → API Keys → API ENDPOINT).
 * Default matches the merchant dashboard, not the public marketing docs.
 */
export function getOvgcPaymentRequestUrl(): string {
  return (
    process.env.OVGC_PAYMENT_REQUEST_URL?.trim() ||
    process.env.OVGC_API_CREATE_URL?.trim() ||
    "https://billing.ovgcpayments.com/backend/api/payment-request-api"
  );
}

/** Optional: checkout-sessions verify URL base (legacy docs API). Leave unset for dashboard API. */
export function getOvgcCheckoutSessionsBaseUrl(): string | null {
  const u = process.env.OVGC_CHECKOUT_SESSIONS_BASE_URL?.trim();
  return u || null;
}

export function getOvgcSubscriptionAmountCents(): number {
  const raw = process.env.OVGC_SUBSCRIPTION_AMOUNT_CENTS?.trim();
  const n = raw ? parseInt(raw, 10) : 2999;
  if (!Number.isFinite(n) || n < 100) return 2999;
  return n;
}

/** Amount sent as `total_amount` to payment-request-api (OVGC expects dollars, e.g. 29.99). */
export function getOvgcTotalAmount(): number {
  const cents = getOvgcSubscriptionAmountCents();
  if (process.env.OVGC_TOTAL_AMOUNT_UNIT?.trim() === "cents") {
    return cents;
  }
  return Math.round(cents) / 100;
}

export function getOvgcProductTitle(): string {
  return (
    process.env.OVGC_PRODUCT_TITLE?.trim() ||
    "Sigma Scripts — Monthly Access"
  );
}

export function getAppBaseUrl(): string {
  const u = (
    process.env.AUTH_URL ??
    process.env.NEXTAUTH_URL ??
    "http://localhost:3000"
  )
    .trim()
    .replace(/\/$/, "");
  return u;
}
