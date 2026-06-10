import { connectMongo } from "@/lib/db";
import { getSubscriptionPeriodDays } from "@/lib/subscription-cookie";
import { OvgcFulfillment } from "@/models/OvgcFulfillment";
import { User } from "@/models/User";

/**
 * Fills periodStart/periodEnd on older fulfillment rows using users.subscriptionExternalId
 * or the user’s current subscriptionCurrentPeriodEnd.
 */
export async function backfillOvgcFulfillmentPeriods(): Promise<{
  scanned: number;
  updated: number;
}> {
  if (!(await connectMongo())) {
    return { scanned: 0, updated: 0 };
  }

  const rows = await OvgcFulfillment.find({
    $or: [{ periodEnd: { $exists: false } }, { periodEnd: null }],
  }).lean();

  let updated = 0;
  const periodMs = getSubscriptionPeriodDays() * 86400000;

  for (const row of rows) {
    const user =
      (await User.findOne({
        discordId: row.discordId,
        subscriptionExternalId: row.ovgcSessionId,
      })
        .select("subscriptionCurrentPeriodEnd")
        .lean()) ??
      (await User.findOne({ discordId: row.discordId })
        .select("subscriptionCurrentPeriodEnd")
        .lean());

    const periodEnd = user?.subscriptionCurrentPeriodEnd
      ? new Date(user.subscriptionCurrentPeriodEnd)
      : row.createdAt
        ? new Date(new Date(row.createdAt).getTime() + periodMs)
        : null;

    if (!periodEnd) continue;

    const periodStart = new Date(periodEnd.getTime() - periodMs);

    await OvgcFulfillment.updateOne(
      { _id: row._id },
      { $set: { periodStart, periodEnd } }
    );
    updated += 1;
  }

  return { scanned: rows.length, updated };
}
