import { connectMongo } from "@/lib/db";
import { CheckoutPending } from "@/models/CheckoutPending";

export async function createCheckoutPending(data: {
  orderUuid: string;
  transactionId: string;
  email: string;
  discordId?: string;
  checkoutSessionId?: string;
  invoiceId?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}) {
  if (!(await connectMongo())) return null;

  const email = data.email.trim().toLowerCase();
  const alternateIds = [
    data.transactionId,
    data.checkoutSessionId,
    data.invoiceId,
    data.stripeSubscriptionId,
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
        ...(data.stripeCustomerId
          ? { stripeCustomerId: data.stripeCustomerId }
          : {}),
        ...(data.stripeSubscriptionId
          ? { stripeSubscriptionId: data.stripeSubscriptionId }
          : {}),
        status: "pending",
      },
      $setOnInsert: { orderUuid: data.orderUuid },
      $addToSet: { alternateIds: { $each: [...new Set(alternateIds)] } },
    },
    { upsert: true, new: true }
  ).lean();
}

/** Attach Stripe ids learned from a webhook so later events resolve to this order. */
export async function attachStripeRefsToCheckout(
  orderUuid: string,
  refs: { stripeCustomerId?: string | null; stripeSubscriptionId?: string | null }
) {
  if (!(await connectMongo())) return null;

  const customerId = refs.stripeCustomerId?.trim();
  const subscriptionId = refs.stripeSubscriptionId?.trim();
  if (!customerId && !subscriptionId) return null;

  return CheckoutPending.findOneAndUpdate(
    { orderUuid: orderUuid.trim() },
    {
      $set: {
        ...(customerId ? { stripeCustomerId: customerId } : {}),
        ...(subscriptionId ? { stripeSubscriptionId: subscriptionId } : {}),
      },
      $addToSet: {
        alternateIds: {
          $each: [customerId, subscriptionId].filter(
            (id): id is string => Boolean(id)
          ),
        },
      },
    },
    { new: true }
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

/** Match webhook ids against stored checkout / subscription / order references. */
export async function resolveCheckoutPendingFromWebhookRefs(refs: {
  ids?: string[];
  orderUuid?: string | null;
  email?: string | null;
  /** Broad fallback — only used after every precise id has missed. */
  stripeCustomerId?: string | null;
}) {
  if (!(await connectMongo())) return null;

  const ids = [...new Set((refs.ids ?? []).map((id) => id.trim()).filter(Boolean))];
  if (ids.length) {
    const byId = await CheckoutPending.findOne({
      $or: [
        { transactionId: { $in: ids } },
        { checkoutSessionId: { $in: ids } },
        { stripeSubscriptionId: { $in: ids } },
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

  const customerId = refs.stripeCustomerId?.trim();
  if (customerId) {
    const byCustomer = await CheckoutPending.findOne({
      stripeCustomerId: customerId,
    })
      .sort({ updatedAt: -1 })
      .lean();
    if (byCustomer) return byCustomer;
  }

  if (refs.email) {
    return getCheckoutPendingByEmail(refs.email);
  }

  return null;
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
