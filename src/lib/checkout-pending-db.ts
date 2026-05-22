import { connectMongo } from "@/lib/db";
import { CheckoutPending } from "@/models/CheckoutPending";

export async function createCheckoutPending(data: {
  orderUuid: string;
  transactionId: string;
  email: string;
  discordId?: string;
}) {
  if (!(await connectMongo())) return null;

  const email = data.email.trim().toLowerCase();
  return CheckoutPending.findOneAndUpdate(
    { orderUuid: data.orderUuid },
    {
      $set: {
        transactionId: data.transactionId,
        email,
        ...(data.discordId ? { discordId: data.discordId } : {}),
        status: "pending",
      },
      $setOnInsert: { orderUuid: data.orderUuid },
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
  return CheckoutPending.findOne({ transactionId: transactionId.trim() }).lean();
}

export async function markCheckoutPendingPaid(transactionId: string) {
  if (!(await connectMongo())) return;
  await CheckoutPending.updateOne(
    { transactionId: transactionId.trim(), status: "pending" },
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
