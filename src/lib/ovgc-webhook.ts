import { timingSafeEqual } from "crypto";
import { getOvgcWebhookSecret } from "@/lib/ovgc-config";

/** OVGC payment-request-api webhook payload (field names vary by event version). */
export type OvgcWebhookPayload = {
  webhook_secret?: string;
  success?: boolean;
  transaction_id?: string;
  invoice_id?: string;
  invoice?: string;
  order_uuid?: string;
  orderUuid?: string;
  customer_email?: string;
  email?: string;
  amount?: number | string;
  total_amount?: number | string;
  currency?: string;
  payment_status?: string;
  status?: string;
  event_type?: string;
  event?: string;
  data?: {
    transaction_id?: string;
    invoice_id?: string;
    order_uuid?: string;
    customer_email?: string;
    email?: string;
    amount?: number | string;
    total_amount?: number | string;
    currency?: string;
    payment_status?: string;
    status?: string;
  };
};

function secretsMatch(provided: string, expected: string): boolean {
  try {
    const a = Buffer.from(provided, "utf8");
    const b = Buffer.from(expected, "utf8");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/** OVGC sends webhook_secret in the JSON body — compare to OVGC_WEBHOOK_SECRET. */
export function verifyOvgcWebhookPayload(payload: OvgcWebhookPayload): boolean {
  const expected = getOvgcWebhookSecret();
  const provided = payload.webhook_secret?.trim();
  if (!expected || !provided) return false;
  return secretsMatch(provided, expected);
}

function normalizePaymentStatus(payload: OvgcWebhookPayload): string {
  return (
    payload.payment_status?.trim().toLowerCase() ??
    payload.status?.trim().toLowerCase() ??
    payload.event_type?.trim().toLowerCase() ??
    payload.event?.trim().toLowerCase() ??
    payload.data?.payment_status?.trim().toLowerCase() ??
    payload.data?.status?.trim().toLowerCase() ??
    ""
  );
}

const SUCCEEDED_STATUSES = new Set([
  "payment.succeeded",
  "payment_succeeded",
  "payment.success",
  "payment_success",
  "succeeded",
  "success",
  "paid",
  "completed",
  "captured",
]);

/** OVGC may omit `success`; treat as paid unless it is explicitly false. */
export function isOvgcPaymentSucceeded(payload: OvgcWebhookPayload): boolean {
  if (payload.success === false) return false;

  const status = normalizePaymentStatus(payload);
  if (SUCCEEDED_STATUSES.has(status)) return true;

  // Some payloads only set top-level success without payment_status.
  if (payload.success === true && !status) return true;

  return false;
}

export function isOvgcPaymentDeclined(payload: OvgcWebhookPayload): boolean {
  const status = normalizePaymentStatus(payload);
  return (
    status === "payment.declined" ||
    status === "payment_declined" ||
    status === "declined" ||
    status === "failed" ||
    status === "payment.failed"
  );
}

function pickId(...values: (string | undefined)[]): string | null {
  for (const v of values) {
    const trimmed = v?.trim();
    if (trimmed) return trimmed;
  }
  return null;
}

/** Collect every id OVGC might send (checkout session, invoice, order). */
export function extractWebhookReferenceIds(payload: OvgcWebhookPayload): string[] {
  const candidates = [
    payload.transaction_id,
    payload.invoice_id,
    payload.invoice,
    payload.order_uuid,
    payload.orderUuid,
    payload.data?.transaction_id,
    payload.data?.invoice_id,
    payload.data?.order_uuid,
  ];
  return [
    ...new Set(
      candidates
        .map((v) => v?.trim())
        .filter((v): v is string => Boolean(v))
    ),
  ];
}

/** Primary id for fulfillment records (prefer invoice, then transaction). */
export function extractTransactionId(payload: OvgcWebhookPayload): string | null {
  const ids = extractWebhookReferenceIds(payload);
  const invoice = ids.find((id) => id.startsWith("invoice_"));
  if (invoice) return invoice;
  return ids[0] ?? null;
}

export function extractOrderUuid(payload: OvgcWebhookPayload): string | null {
  return pickId(payload.order_uuid, payload.orderUuid, payload.data?.order_uuid);
}

export function extractCustomerEmail(payload: OvgcWebhookPayload): string | null {
  const email = pickId(
    payload.customer_email,
    payload.email,
    payload.data?.customer_email,
    payload.data?.email
  );
  return email?.toLowerCase() ?? null;
}

function parseAmount(raw: number | string | undefined): number | undefined {
  if (raw == null) return undefined;
  const n = typeof raw === "number" ? raw : parseFloat(String(raw).trim());
  return Number.isFinite(n) ? n : undefined;
}

/** Payment amount from webhook when OVGC includes it (otherwise use site config at fulfillment). */
export function extractPaymentAmount(payload: OvgcWebhookPayload): number | undefined {
  return (
    parseAmount(payload.amount) ??
    parseAmount(payload.total_amount) ??
    parseAmount(payload.data?.amount) ??
    parseAmount(payload.data?.total_amount)
  );
}

export function extractPaymentCurrency(payload: OvgcWebhookPayload): string | undefined {
  const c = pickId(payload.currency, payload.data?.currency);
  return c?.toUpperCase() ?? undefined;
}

/** Parse checkout session id from hosted OVGC checkout URL. */
export function extractCheckoutSessionIdFromUrl(checkoutUrl: string): string | null {
  try {
    const path = new URL(checkoutUrl).pathname;
    const match = path.match(/\/checkout\/([^/]+)/i);
    return match?.[1]?.trim() || null;
  } catch {
    const match = checkoutUrl.match(/\/checkout\/([^/?]+)/i);
    return match?.[1]?.trim() || null;
  }
}
