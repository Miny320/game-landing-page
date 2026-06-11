import { isUserInGuild } from "@/lib/discord-join";
import {
  getCheckoutPendingByOrderUuid,
  getPaidUnfulfilledCheckoutByEmail,
  linkCheckoutPendingToDiscord,
  markCheckoutPendingFulfilled,
  markCheckoutPendingPaidByOrderUuid,
} from "@/lib/checkout-pending-db";
import { fulfillOvgcCheckoutSessionTrusted } from "@/lib/ovgc-fulfillment";
import { setPendingOvgcSession, upsertUserOnDiscordSignIn } from "@/lib/user-db";

export type LinkOrderResult =
  | { ok: true; fulfilled: boolean; orderUuid?: string }
  | {
      ok: false;
      reason:
        | "not_found"
        | "not_paid"
        | "not_in_guild"
        | "fulfill_failed"
        | "already_linked_other";
      message?: string;
    };

type PendingCheckout = NonNullable<
  Awaited<ReturnType<typeof getCheckoutPendingByOrderUuid>>
>;

async function fulfillPendingCheckout(
  orderUuid: string,
  discordId: string,
  linked: PendingCheckout
): Promise<LinkOrderResult> {
  if (linked.discordId && linked.discordId !== discordId) {
    return {
      ok: false,
      reason: "already_linked_other",
      message: "This order is linked to another Discord account.",
    };
  }

  if (linked.status === "fulfilled") {
    return { ok: true, fulfilled: true, orderUuid };
  }

  if (linked.status === "pending") {
    await markCheckoutPendingPaidByOrderUuid(orderUuid);
  }

  if (linked.status !== "paid" && linked.status !== "pending") {
    return { ok: true, fulfilled: false, orderUuid };
  }

  const inGuild = await isUserInGuild(discordId);
  if (inGuild === false) {
    return {
      ok: false,
      reason: "not_in_guild",
      message: "Join the Sigma Scripts Discord server to activate your subscription.",
    };
  }

  const result = await fulfillOvgcCheckoutSessionTrusted({
    ovgcSessionId: linked.transactionId,
    discordId,
    setPeriodCookie: true,
  });

  if (!result.ok) {
    return {
      ok: false,
      reason: "fulfill_failed",
      message: result.message ?? "Could not activate your subscription.",
    };
  }

  await markCheckoutPendingFulfilled(orderUuid);
  return { ok: true, fulfilled: true, orderUuid };
}

/**
 * Guest checkout: payment succeeded before Discord was linked.
 * Finds the newest paid (unfulfilled) checkout for this email and activates access.
 */
export async function tryFulfillPaidCheckoutForDiscord(
  discordId: string,
  email?: string | null
): Promise<LinkOrderResult> {
  const normalized = email?.trim().toLowerCase();
  if (!normalized) {
    return { ok: false, reason: "not_found" };
  }

  const paid = await getPaidUnfulfilledCheckoutByEmail(normalized);
  if (!paid?.transactionId) {
    return { ok: false, reason: "not_found" };
  }

  const linked = await linkCheckoutPendingToDiscord(paid.orderUuid, discordId);
  if (!linked) {
    return { ok: false, reason: "not_found" };
  }

  await upsertUserOnDiscordSignIn({ discordId, email: linked.email });
  await setPendingOvgcSession(discordId, paid.orderUuid, linked.transactionId);

  return fulfillPendingCheckout(paid.orderUuid, discordId, linked);
}

export async function tryFulfillCheckoutOrderForDiscord(
  orderUuid: string,
  discordId: string,
  email?: string | null
): Promise<LinkOrderResult> {
  const pending = await getCheckoutPendingByOrderUuid(orderUuid);
  if (!pending?.transactionId) {
    return tryFulfillPaidCheckoutForDiscord(discordId, email);
  }

  if (pending.discordId && pending.discordId !== discordId) {
    return {
      ok: false,
      reason: "already_linked_other",
      message: "This order is linked to another Discord account.",
    };
  }

  const linked = await linkCheckoutPendingToDiscord(orderUuid, discordId);
  if (!linked) {
    return { ok: false, reason: "not_found" };
  }

  await upsertUserOnDiscordSignIn({ discordId, email: linked.email });

  const result = await fulfillPendingCheckout(orderUuid, discordId, linked);
  if (result.ok && result.fulfilled) {
    return result;
  }

  // Current order may be a new unpaid attempt — activate an earlier paid checkout instead.
  const paidFallback = await tryFulfillPaidCheckoutForDiscord(
    discordId,
    email ?? linked.email
  );
  if (paidFallback.ok && paidFallback.fulfilled) {
    return paidFallback;
  }

  await setPendingOvgcSession(discordId, orderUuid, linked.transactionId);
  return result;
}
