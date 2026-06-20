import { connectMongo } from "@/lib/db";
import { CheckoutPending } from "@/models/CheckoutPending";

export async function createCheckoutPending(data: {
  orderUuid: string;
  transactionId: string;
  email: string;
  discordId?: string;
  checkoutSessionId?: string;
  invoiceId?: string;
}) {
  if (!(await connectMongo())) return null;

  const email = data.email.trim().toLowerCase();
  const alternateIds = [
    data.transactionId,
    data.checkoutSessionId,
    data.invoiceId,
  ].filter((id): id is string => Boolean(id?.trim()));

  return CheckoutPending.findOneAndUpdate(
    { orderUuid: data.orderUuid },
    {
      $set: {
        transactionId: data.transactionId,
        email,
        ...(data.discordId ? { discordId: data.discordId } : {}),
        ...(data.checkoutSessionId
          ? { checkoutSessionId: data.checkoutSessionId }
          : {}),
        status: "pending",
      },
      $setOnInsert: { orderUuid: data.orderUuid },
      $addToSet: { alternateIds: { $each: [...new Set(alternateIds)] } },
    },
    { upsert: true, new: true }
  ).lean();
}

export async function getCheckoutPendingByOrderUuid(orderUuid: string) {
  if (!(await connectMongo())) return null;
  return CheckoutPending.findOne({ orderUuid: orderUuid.trim() }).lean();
}

export async function getCheckoutPendingByTransactionId(transactionId: string) {
  if (!(await connectMongo())) return null;
  const id = transactionId.trim();
  return CheckoutPending.findOne({
    $or: [{ transactionId: id }, { alternateIds: id }, { checkoutSessionId: id }],
  }).lean();
}

export async function getPaidUnfulfilledCheckoutByEmail(email: string) {
  if (!(await connectMongo())) return null;
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;
  return CheckoutPending.findOne({
    email: normalized,
    status: "paid",
  })
    .sort({ updatedAt: -1 })
    .lean();
}

export async function getCheckoutPendingByEmail(email: string) {
  if (!(await connectMongo())) return null;
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;

  const paid = await CheckoutPending.findOne({
    email: normalized,
    status: "paid",
  })
    .sort({ updatedAt: -1 })
    .lean();
  if (paid) return paid;

  return CheckoutPending.findOne({
    email: normalized,
    status: "pending",
  })
    .sort({ updatedAt: -1 })
    .lean();
}

/** Match webhook ids against stored checkout / invoice / order references. */
export async function resolveCheckoutPendingFromWebhookRefs(refs: {
  ids?: string[];
  orderUuid?: string | null;
  email?: string | null;
}) {
  if (!(await connectMongo())) return null;

  const ids = [...new Set((refs.ids ?? []).map((id) => id.trim()).filter(Boolean))];
  if (ids.length) {
    const byId = await CheckoutPending.findOne({
      $or: [
        { transactionId: { $in: ids } },
        { checkoutSessionId: { $in: ids } },
        { alternateIds: { $in: ids } },
      ],
    })
      .sort({ updatedAt: -1 })
      .lean();
    if (byId) return byId;
  }

  const orderUuid = refs.orderUuid?.trim();
  if (orderUuid) {
    const byOrder = await getCheckoutPendingByOrderUuid(orderUuid);
    if (byOrder) return byOrder;
  }

  if (refs.email) {
    return getCheckoutPendingByEmail(refs.email);
  }

  return null;
}

export async function markCheckoutPendingPaid(transactionId: string) {
  if (!(await connectMongo())) return;
  const id = transactionId.trim();
  await CheckoutPending.updateOne(
    {
      status: "pending",
      $or: [
        { transactionId: id },
        { checkoutSessionId: id },
        { alternateIds: id },
      ],
    },
    { $set: { status: "paid" } }
  );
}

export async function markCheckoutPendingPaidByOrderUuid(orderUuid: string) {
  if (!(await connectMongo())) return;
  await CheckoutPending.updateOne(
    { orderUuid: orderUuid.trim(), status: "pending" },
    { $set: { status: "paid" } }
  );
}

export async function markCheckoutPendingFulfilled(orderUuid: string) {
  if (!(await connectMongo())) return;
  await CheckoutPending.updateOne(
    { orderUuid: orderUuid.trim() },
    { $set: { status: "fulfilled" } }
  );
}

export async function markCheckoutPendingCanceled(orderUuid: string) {
  if (!(await connectMongo())) return;
  await CheckoutPending.updateOne(
    { orderUuid: orderUuid.trim(), status: { $in: ["pending", "paid"] } },
    { $set: { status: "canceled" } }
  );
}

export async function linkCheckoutPendingToDiscord(
  orderUuid: string,
  discordId: string
) {
  if (!(await connectMongo())) return null;
  return CheckoutPending.findOneAndUpdate(
    { orderUuid: orderUuid.trim() },
    { $set: { discordId } },
    { new: true }
  ).lean();
}
