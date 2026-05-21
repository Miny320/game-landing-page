import { timingSafeEqual } from "crypto";
import { getOvgcWebhookSecret } from "@/lib/ovgc-config";

/** Official OVGC payment-request-api webhook payload. */
export type OvgcWebhookPayload = {
  webhook_secret?: string;
  success?: boolean;
  transaction_id?: string;
  customer_email?: string;
  payment_status?: "payment.succeeded" | "payment.declined" | string;
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

/** OVGC may omit `success`; treat as paid unless it is explicitly false. */
export function isOvgcPaymentSucceeded(payload: OvgcWebhookPayload): boolean {
  if (payload.payment_status !== "payment.succeeded") return false;
  if (payload.success === false) return false;
  return true;
}

export function isOvgcPaymentDeclined(payload: OvgcWebhookPayload): boolean {
  return payload.payment_status === "payment.declined";
}

export function extractTransactionId(
  payload: OvgcWebhookPayload
): string | null {
  const id = payload.transaction_id?.trim();
  return id || null;
}

export function extractCustomerEmail(
  payload: OvgcWebhookPayload
): string | null {
  const email = payload.customer_email?.trim().toLowerCase();
  return email || null;
}
