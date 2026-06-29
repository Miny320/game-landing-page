import { connectMongo } from "@/lib/db";
import { fulfillOvgcCheckoutSessionTrusted } from "@/lib/ovgc-fulfillment";
import { isUserInGuild } from "@/lib/discord-join";
import {
  linkCheckoutPendingToDiscord,
  markCheckoutPendingFulfilled,
  markCheckoutPendingPaidByOrderUuid,
} from "@/lib/checkout-pending-db";
import { getUserByEmail } from "@/lib/user-db";
import { CheckoutPending } from "@/models/CheckoutPending";
import { getOvgcTotalAmount } from "@/lib/ovgc-config";

export type PaidCheckoutRetryResult = {
  scanned: number;
  fulfilled: number;
  awaitingDiscord: number;
  failed: Array<{ orderUuid: string; email: string; reason: string }>;
};

type PaidCheckoutRow = {
  orderUuid: string;
  email: string;
  transactionId: string;
  discordId?: string | null;
  status: string;
};

async function activatePaidCheckoutRow(
  row: PaidCheckoutRow,
  discordId: string
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (row.status === "fulfilled") {
    return { ok: true };
  }

  if (row.status === "pending") {
    await markCheckoutPendingPaidByOrderUuid(row.orderUuid);
  }

  if (row.status !== "paid" && row.status !== "pending") {
    return { ok: false, reason: `invalid_status_${row.status}` };
  }

  const inGuild = await isUserInGuild(discordId);
  if (inGuild === false) {
    return { ok: false, reason: "not_in_guild" };
  }

  await linkCheckoutPendingToDiscord(row.orderUuid, discordId);

  const result = await fulfillOvgcCheckoutSessionTrusted({
    ovgcSessionId: row.transactionId,
    discordId,
    amount: getOvgcTotalAmount(),
    currency: "USD",
  });

  if (!result.ok) {
    return {
      ok: false,
      reason: result.reason ?? "fulfill_failed",
    };
  }

  await markCheckoutPendingFulfilled(row.orderUuid);
  return { ok: true };
}

/** Try to grant Paid User access for one paid checkout (by order or payment email). */
export async function retryPaidCheckoutActivation(params: {
  orderUuid?: string;
  email?: string;
}): Promise<{ fulfilled: boolean; reason?: string }> {
  if (!(await connectMongo())) {
    return { fulfilled: false, reason: "db_unavailable" };
  }

  const orderUuid = params.orderUuid?.trim();
  const email = params.email?.trim().toLowerCase();

  let row: PaidCheckoutRow | null = null;

  if (orderUuid) {
    const found = await CheckoutPending.findOne({
      orderUuid,
      status: { $in: ["paid", "pending"] },
    }).lean();
    if (found?.transactionId) {
      row = {
        orderUuid: found.orderUuid,
        email: found.email,
        transactionId: found.transactionId,
        discordId: found.discordId,
        status: found.status,
      };
    }
  }

  if (!row && email) {
    const found = await CheckoutPending.findOne({
      email,
      status: "paid",
    })
      .sort({ updatedAt: -1 })
      .lean();
    if (found?.transactionId) {
      row = {
        orderUuid: found.orderUuid,
        email: found.email,
        transactionId: found.transactionId,
        discordId: found.discordId,
        status: found.status,
      };
    }
  }

  if (!row) {
    return { fulfilled: false, reason: "not_found" };
  }

  const discordId =
    row.discordId?.trim() ||
    (await getUserByEmail(row.email))?.discordId?.trim();

  if (!discordId) {
    return { fulfilled: false, reason: "awaiting_discord" };
  }

  const activated = await activatePaidCheckoutRow(row, discordId);
  return activated.ok
    ? { fulfilled: true }
    : { fulfilled: false, reason: activated.reason };
}

/** Safety net: activate paid checkouts when Discord is known (linked at checkout or via email). */
export async function retryAllStuckPaidCheckouts(): Promise<PaidCheckoutRetryResult> {
  const result: PaidCheckoutRetryResult = {
    scanned: 0,
    fulfilled: 0,
    awaitingDiscord: 0,
    failed: [],
  };

  if (!(await connectMongo())) {
    return result;
  }

  const rows = await CheckoutPending.find({ status: "paid" })
    .sort({ updatedAt: 1 })
    .lean();

  result.scanned = rows.length;

  for (const raw of rows) {
    if (!raw.transactionId) continue;

    const row: PaidCheckoutRow = {
      orderUuid: raw.orderUuid,
      email: raw.email,
      transactionId: raw.transactionId,
      discordId: raw.discordId,
      status: raw.status,
    };

    const discordId =
      row.discordId?.trim() ||
      (await getUserByEmail(row.email))?.discordId?.trim();

    if (!discordId) {
      result.awaitingDiscord += 1;
      continue;
    }

    const activated = await activatePaidCheckoutRow(row, discordId);
    if (activated.ok) {
      result.fulfilled += 1;
    } else {
      result.failed.push({
        orderUuid: row.orderUuid,
        email: row.email,
        reason: activated.reason,
      });
    }
  }

  return result;
}
