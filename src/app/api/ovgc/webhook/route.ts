import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  extractCustomerEmail,
  extractOrderUuid,
  extractPaymentAmount,
  extractPaymentCurrency,
  extractTransactionId,
  extractWebhookReferenceIds,
  isOvgcPaymentDeclined,
  isOvgcPaymentSucceeded,
  verifyOvgcWebhookPayload,
  type OvgcWebhookPayload,
} from "@/lib/ovgc-webhook";
import { getOvgcTotalAmount } from "@/lib/ovgc-config";
import { fulfillOvgcCheckoutSessionTrusted } from "@/lib/ovgc-fulfillment";
import { retryPaidCheckoutActivation } from "@/lib/paid-checkout-retry";
import {
  markCheckoutPendingFulfilled,
  markCheckoutPendingPaid,
  markCheckoutPendingPaidByOrderUuid,
  resolveCheckoutPendingFromWebhookRefs,
} from "@/lib/checkout-pending-db";
import {
  getUserByEmail,
  getUserByPendingOvgcTransaction,
} from "@/lib/user-db";

export const runtime = "nodejs";

async function fulfillForDiscord(
  transactionId: string,
  discordId: string,
  eventType?: string,
  amount?: number,
  currency?: string
) {
  return fulfillOvgcCheckoutSessionTrusted({
    ovgcSessionId: transactionId,
    discordId,
    eventType,
    amount: amount ?? getOvgcTotalAmount(),
    currency: currency ?? "USD",
  });
}

export async function POST(req: Request) {
  let payload: OvgcWebhookPayload;
  try {
    payload = (await req.json()) as OvgcWebhookPayload;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!verifyOvgcWebhookPayload(payload)) {
    console.error("[ovgc webhook] rejected: invalid webhook_secret");
    return NextResponse.json({ error: "invalid_webhook_secret" }, { status: 401 });
  }

  const transactionId = extractTransactionId(payload);
  const referenceIds = extractWebhookReferenceIds(payload);
  const customerEmail = extractCustomerEmail(payload);
  const orderUuid = extractOrderUuid(payload);

  if (!transactionId && referenceIds.length === 0) {
    return NextResponse.json({ error: "missing_transaction_id" }, { status: 400 });
  }

  if (isOvgcPaymentSucceeded(payload)) {
    const fulfillId = transactionId ?? referenceIds[0]!;
    const paymentAmount = extractPaymentAmount(payload) ?? getOvgcTotalAmount();
    const paymentCurrency = extractPaymentCurrency(payload) ?? "USD";

    const pending = await resolveCheckoutPendingFromWebhookRefs({
      ids: referenceIds,
      orderUuid,
      email: customerEmail,
    });

    if (pending?.discordId) {
      if (pending.orderUuid && pending.status === "pending") {
        await markCheckoutPendingPaidByOrderUuid(pending.orderUuid);
      }

      const result = await fulfillForDiscord(
        fulfillId,
        pending.discordId,
        payload.payment_status,
        paymentAmount,
        paymentCurrency
      );

      if (result.ok && pending.orderUuid) {
        await markCheckoutPendingFulfilled(pending.orderUuid);
      }

      if (!result.ok) {
        console.error("[ovgc webhook] fulfill failed:", result, {
          referenceIds,
          orderUuid,
          email: customerEmail,
        });
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

    if (pending && !pending.discordId) {
      if (pending.orderUuid) {
        await markCheckoutPendingPaidByOrderUuid(pending.orderUuid);
      } else {
        await markCheckoutPendingPaid(fulfillId);
      }

      const emailUser = customerEmail
        ? await getUserByEmail(customerEmail)
        : null;
      if (emailUser?.discordId) {
        const { linkCheckoutPendingToDiscord } = await import(
          "@/lib/checkout-pending-db"
        );
        await linkCheckoutPendingToDiscord(pending.orderUuid, emailUser.discordId);
        const result = await fulfillForDiscord(
          fulfillId,
          emailUser.discordId,
          payload.payment_status,
          paymentAmount,
          paymentCurrency
        );
        if (result.ok && pending.orderUuid) {
          await markCheckoutPendingFulfilled(pending.orderUuid);
        }
        revalidatePath("/dashboard");
        return NextResponse.json({
          received: true,
          fulfilled: result.ok,
          linked_existing_discord: true,
        });
      }

      const retry = await retryPaidCheckoutActivation({
        orderUuid: pending.orderUuid,
        email: pending.email ?? customerEmail ?? undefined,
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

    const user =
      (await getUserByPendingOvgcTransaction(fulfillId)) ??
      (referenceIds.length
        ? (
            await Promise.all(
              referenceIds.map((id) => getUserByPendingOvgcTransaction(id))
            )
          ).find(Boolean)
        : null) ??
      (customerEmail ? await getUserByEmail(customerEmail) : null);

    if (!user?.discordId) {
      console.error(
        "[ovgc webhook] payment.succeeded but no user for transaction:",
        { referenceIds, orderUuid, email: customerEmail }
      );
      return NextResponse.json({ received: true, fulfilled: false });
    }

    const result = await fulfillForDiscord(
      fulfillId,
      user.discordId,
      payload.payment_status,
      paymentAmount,
      paymentCurrency
    );

    if (!result.ok) {
      console.error("[ovgc webhook] fulfill failed:", result, {
        referenceIds,
        orderUuid,
        email: customerEmail,
      });
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

  if (isOvgcPaymentDeclined(payload)) {
    return NextResponse.json({ received: true, declined: true });
  }

  console.warn("[ovgc webhook] ignored event:", {
    payment_status: payload.payment_status,
    status: payload.status,
    event_type: payload.event_type,
    referenceIds,
  });

  return NextResponse.json({
    received: true,
    ignored: payload.payment_status ?? payload.status ?? "unknown",
  });
}
