import {
  getOvgcApiKey,
  getOvgcCheckoutSessionsBaseUrl,
  getOvgcPaymentRequestUrl,
  getOvgcTotalAmount,
} from "@/lib/ovgc-config";
import { connectMongo } from "@/lib/db";
import { OvgcFulfillment } from "@/models/OvgcFulfillment";

export type OvgcCheckoutSessionStatus =
  | "pending"
  | "completed"
  | "declined"
  | "expired"
  | "paid"
  | "settled"
  | string;

export type OvgcCheckoutSession = {
  id: string;
  amount?: number;
  currency?: string;
  status: OvgcCheckoutSessionStatus;
  metadata?: Record<string, string>;
  expires_at?: string;
};

type PaymentRequestBody = {
  total_amount: number;
  email: string;
  api_key: string;
  success_url: string;
  cancel_url: string;
  order_uuid: string;
  product_title?: string;
  first_name?: string;
  last_name?: string;
};

type PaymentRequestResponse = {
  status?: boolean;
  error?: string;
  message?: string;
  transaction_id?: string;
  url?: string;
  checkout_url?: string;
  payment_url?: string;
  redirect_url?: string;
  data?: {
    transaction_id?: string;
    checkout_url?: string;
    payment_url?: string;
    url?: string;
    redirect_url?: string;
    order_uuid?: string;
    status?: string;
  };
};

function extractCheckoutUrl(json: PaymentRequestResponse): string | null {
  return (
    json.url ??
    json.checkout_url ??
    json.payment_url ??
    json.redirect_url ??
    json.data?.url ??
    json.data?.checkout_url ??
    json.data?.payment_url ??
    json.data?.redirect_url ??
    null
  );
}

function extractTransactionId(json: PaymentRequestResponse): string | null {
  return json.transaction_id ?? json.data?.transaction_id ?? null;
}

/**
 * Creates a hosted checkout via the dashboard Payment Request API.
 * @see https://billing.ovgcpayments.com/backend/api/payment-request-api
 */
export async function createOvgcCheckoutSession(input: {
  email: string;
  product_title?: string;
  success_url: string;
  cancel_url: string;
  order_uuid: string;
  first_name?: string;
  last_name?: string;
}): Promise<{
  session: OvgcCheckoutSession;
  checkoutUrl: string;
  transactionId: string;
}> {
  const apiKey = getOvgcApiKey();
  if (!apiKey) {
    throw new Error("OVGC_API_KEY is not configured");
  }

  const url = getOvgcPaymentRequestUrl();
  const body: PaymentRequestBody = {
    total_amount: getOvgcTotalAmount(),
    email: input.email,
    api_key: apiKey,
    success_url: input.success_url,
    cancel_url: input.cancel_url,
    order_uuid: input.order_uuid,
    product_title: input.product_title,
    first_name: input.first_name,
    last_name: input.last_name,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const text = await res.text();
  let json: PaymentRequestResponse;
  try {
    json = text ? (JSON.parse(text) as PaymentRequestResponse) : {};
  } catch {
    throw new Error(`OVGC invalid JSON (${res.status}): ${text.slice(0, 200)}`);
  }

  if (!res.ok) {
    throw new Error(
      `OVGC API ${res.status}: ${json.error ?? json.message ?? text.slice(0, 300)}`
    );
  }

  if (json.status === false) {
    throw new Error(json.error ?? json.message ?? "OVGC payment request failed");
  }

  const checkoutUrl = extractCheckoutUrl(json);
  if (!checkoutUrl) {
    throw new Error(
      "OVGC response missing checkout URL. Check dashboard API docs for the response field name."
    );
  }

  const transactionId = extractTransactionId(json);
  if (!transactionId) {
    throw new Error("OVGC response missing transaction_id");
  }

  const session: OvgcCheckoutSession = {
    id: transactionId,
    amount: getOvgcTotalAmount(),
    currency: "USD",
    status: "pending",
  };

  return { session, checkoutUrl, transactionId };
}

/** Legacy checkout-sessions GET (only when OVGC_CHECKOUT_SESSIONS_BASE_URL is set). */
async function getOvgcCheckoutSessionViaDocsApi(
  sessionId: string
): Promise<OvgcCheckoutSession> {
  const apiKey = getOvgcApiKey();
  const base = getOvgcCheckoutSessionsBaseUrl();
  if (!apiKey || !base) {
    throw new Error("Checkout sessions verify API is not configured");
  }

  const res = await fetch(
    `${base.replace(/\/$/, "")}/api/checkout-sessions/${encodeURIComponent(sessionId)}`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    }
  );

  const text = await res.text();
  const json = text ? (JSON.parse(text) as { data?: OvgcCheckoutSession }) : {};
  if (!res.ok || !json.data?.id) {
    throw new Error(`OVGC session lookup failed (${res.status})`);
  }
  return json.data;
}

/**
 * For payment-request-api there is no public status GET — treat fulfilled webhooks as completed.
 */
export async function getOvgcCheckoutSession(
  sessionId: string
): Promise<OvgcCheckoutSession> {
  const docsBase = getOvgcCheckoutSessionsBaseUrl();
  if (docsBase) {
    return getOvgcCheckoutSessionViaDocsApi(sessionId);
  }

  if (await connectMongo()) {
    const row = await OvgcFulfillment.findOne({ ovgcSessionId: sessionId }).lean();
    if (row) {
      return {
        id: sessionId,
        status: "completed",
        metadata: { discordId: row.discordId },
      };
    }
  }

  return { id: sessionId, status: "pending" };
}

export function isOvgcSessionPaid(status: OvgcCheckoutSessionStatus): boolean {
  return status === "completed" || status === "paid" || status === "settled";
}
