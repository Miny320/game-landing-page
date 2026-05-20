import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  extractCustomerEmail,
  extractTransactionId,
  isOvgcPaymentDeclined,
  isOvgcPaymentSucceeded,
  verifyOvgcWebhookPayload,
  type OvgcWebhookPayload,
} from "@/lib/ovgc-webhook";
import { fulfillOvgcCheckoutSessionTrusted } from "@/lib/ovgc-fulfillment";
import {
  getUserByEmail,
  getUserByPendingOvgcTransaction,
} from "@/lib/user-db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let payload: OvgcWebhookPayload;
  try {
    payload = (await req.json()) as OvgcWebhookPayload;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!verifyOvgcWebhookPayload(payload)) {
    return NextResponse.json({ error: "invalid_webhook_secret" }, { status: 401 });
  }

  const transactionId = extractTransactionId(payload);
  if (!transactionId) {
    return NextResponse.json({ error: "missing_transaction_id" }, { status: 400 });
  }

  if (isOvgcPaymentSucceeded(payload)) {
    const user =
      (await getUserByPendingOvgcTransaction(transactionId)) ??
      (await getUserByEmail(extractCustomerEmail(payload) ?? ""));

    if (!user?.discordId) {
      console.error(
        "[ovgc webhook] payment.succeeded but no user for transaction:",
        transactionId
      );
      return NextResponse.json({ received: true, fulfilled: false });
    }

    const result = await fulfillOvgcCheckoutSessionTrusted({
      ovgcSessionId: transactionId,
      discordId: user.discordId,
      eventType: payload.payment_status,
    });

    if (!result.ok) {
      console.error("[ovgc webhook] fulfill failed:", result);
    }

    revalidatePath("/dashboard");
    return NextResponse.json({ received: true, fulfilled: result.ok });
  }

  if (isOvgcPaymentDeclined(payload)) {
    return NextResponse.json({ received: true, declined: true });
  }

  return NextResponse.json({
    received: true,
    ignored: payload.payment_status ?? "unknown",
  });
}
