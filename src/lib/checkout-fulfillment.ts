import { isUserInGuild } from "@/lib/discord-join";
import {
  getCheckoutPendingByOrderUuid,
  linkCheckoutPendingToDiscord,
  markCheckoutPendingFulfilled,
  markCheckoutPendingPaidByOrderUuid,
} from "@/lib/checkout-pending-db";
import { fulfillOvgcCheckoutSessionTrusted } from "@/lib/ovgc-fulfillment";
import { setPendingOvgcSession, upsertUserOnDiscordSignIn } from "@/lib/user-db";

export type LinkOrderResult =
  | { ok: true; fulfilled: boolean }
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

export async function tryFulfillCheckoutOrderForDiscord(
  orderUuid: string,
  discordId: string
): Promise<LinkOrderResult> {
  const pending = await getCheckoutPendingByOrderUuid(orderUuid);
  if (!pending?.transactionId) {
    return { ok: false, reason: "not_found" };
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
  await setPendingOvgcSession(discordId, orderUuid, linked.transactionId);

  if (linked.status === "fulfilled") {
    return { ok: true, fulfilled: true };
  }

  // Landing on /billing/success means OVGC accepted payment — fulfill even if webhook lagged.
  if (linked.status === "pending") {
    await markCheckoutPendingPaidByOrderUuid(orderUuid);
  }

  if (linked.status !== "paid" && linked.status !== "pending") {
    return { ok: true, fulfilled: false };
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
  return { ok: true, fulfilled: true };
}
