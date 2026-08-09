import { connectMongo } from "@/lib/db";
import type { DiscordAccessSnapshot } from "@/lib/discord-guild";
import { User } from "@/models/User";
import { getSubscriptionPeriodEndFromCookie } from "@/lib/subscription-cookie";

export async function upsertUserOnDiscordSignIn(data: {
  discordId: string;
  name?: string | null;
  image?: string | null;
  email?: string | null;
}): Promise<void> {
  if (!(await connectMongo())) return;

  await User.findOneAndUpdate(
    { discordId: data.discordId },
    {
      $set: {
        ...(data.name != null && { name: data.name }),
        ...(data.image != null && { image: data.image }),
        ...(data.email != null && { email: data.email.trim().toLowerCase() }),
      },
      $setOnInsert: {
        paymentStatus: "none",
        subscriptionSource: "none",
        discordHasPaidRole: false,
      },
    },
    { upsert: true }
  );
}

export async function syncUserDiscordFromSnapshot(
  discordId: string,
  snapshot: DiscordAccessSnapshot
): Promise<void> {
  if (!(await connectMongo())) return;
  if (!snapshot.configured || "error" in snapshot) return;

  const inGuild = snapshot.inGuild;
  const hasPaidRole = snapshot.hasPaidRole;

  await User.findOneAndUpdate(
    { discordId },
    {
      $set: {
        discordInGuild: inGuild,
        discordHasPaidRole: hasPaidRole,
        discordSyncedAt: new Date(),
      },
      $setOnInsert: {
        paymentStatus: "none",
        subscriptionSource: "none",
      },
    },
    { upsert: true }
  );
}

export async function getUserByDiscordId(discordId: string) {
  if (!(await connectMongo())) return null;
  return User.findOne({ discordId }).lean();
}

export async function getUserByStripeSubscriptionId(subscriptionId: string) {
  if (!(await connectMongo())) return null;
  const id = subscriptionId.trim();
  if (!id) return null;
  return User.findOne({
    $or: [{ stripeSubscriptionId: id }, { subscriptionExternalId: id }],
  }).lean();
}

export async function getUserByStripeCustomerId(customerId: string) {
  if (!(await connectMongo())) return null;
  const id = customerId.trim();
  if (!id) return null;
  return User.findOne({ stripeCustomerId: id }).lean();
}

export async function getUserByEmail(email: string) {
  if (!(await connectMongo())) return null;
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;
  return User.findOne({ email: normalized }).lean();
}

/** Prefer DB period end; fall back to cookie for older sessions. */
export async function getEffectiveSubscriptionPeriodEnd(
  discordId: string
): Promise<Date | null> {
  if (await connectMongo()) {
    const u = await User.findOne({ discordId })
      .select("subscriptionCurrentPeriodEnd")
      .lean();
    if (u?.subscriptionCurrentPeriodEnd) {
      return new Date(u.subscriptionCurrentPeriodEnd);
    }
  }
  return getSubscriptionPeriodEndFromCookie();
}

export async function applyManualSubscriptionWindow(
  discordId: string,
  periodEnd: Date
): Promise<void> {
  if (!(await connectMongo())) return;

  await User.findOneAndUpdate(
    { discordId },
    {
      $set: {
        paymentStatus: "manual_active",
        subscriptionSource: "manual_hub",
        subscriptionCurrentPeriodEnd: periodEnd,
        discordHasPaidRole: true,
      },
    },
    { upsert: true }
  );
}

export async function setPendingCheckoutSession(
  discordId: string,
  orderUuid: string,
  checkoutSessionId: string
): Promise<void> {
  if (!(await connectMongo())) return;
  await User.findOneAndUpdate(
    { discordId },
    {
      $set: {
        pendingCheckoutOrderUuid: orderUuid,
        pendingCheckoutSessionId: checkoutSessionId,
      },
    },
    { upsert: true }
  );
}

export async function clearPendingCheckoutSession(
  discordId: string
): Promise<void> {
  if (!(await connectMongo())) return;
  await User.findOneAndUpdate(
    { discordId },
    {
      $unset: {
        pendingCheckoutOrderUuid: "",
        pendingCheckoutSessionId: "",
      },
    }
  );
}

/**
 * Stores the paid window for a Stripe subscription, along with the customer and
 * subscription ids used by renewals and the billing portal.
 */
export async function applyStripeSubscriptionWindow(
  discordId: string,
  periodEnd: Date,
  refs: {
    stripeSubscriptionId?: string | null;
    stripeCustomerId?: string | null;
    cancelAtPeriodEnd?: boolean;
  } = {}
): Promise<void> {
  if (!(await connectMongo())) return;

  const subscriptionId = refs.stripeSubscriptionId?.trim();
  const customerId = refs.stripeCustomerId?.trim();

  await User.findOneAndUpdate(
    { discordId },
    {
      $set: {
        paymentStatus: "active",
        subscriptionSource: "stripe",
        subscriptionCurrentPeriodEnd: periodEnd,
        discordHasPaidRole: true,
        ...(subscriptionId
          ? {
              stripeSubscriptionId: subscriptionId,
              subscriptionExternalId: subscriptionId,
            }
          : {}),
        ...(customerId ? { stripeCustomerId: customerId } : {}),
        ...(refs.cancelAtPeriodEnd != null
          ? { subscriptionCancelAtPeriodEnd: refs.cancelAtPeriodEnd }
          : {}),
      },
      $unset: { pendingCheckoutOrderUuid: "", pendingCheckoutSessionId: "" },
    },
    { upsert: true }
  );
}

/** Payment failed but Stripe is still retrying — keep access until the subscription ends. */
export async function markSubscriptionPastDue(discordId: string): Promise<void> {
  if (!(await connectMongo())) return;
  await User.findOneAndUpdate(
    { discordId },
    { $set: { paymentStatus: "past_due" } }
  );
}

export async function setSubscriptionCancelAtPeriodEnd(
  discordId: string,
  cancelAtPeriodEnd: boolean
): Promise<void> {
  if (!(await connectMongo())) return;
  await User.findOneAndUpdate(
    { discordId },
    { $set: { subscriptionCancelAtPeriodEnd: cancelAtPeriodEnd } }
  );
}

/** Active subscribers whose paid window has ended (for scheduled expiry). */
export async function listUsersWithExpiredSubscription(): Promise<
  Array<{
    discordId: string;
    subscriptionCurrentPeriodEnd: Date;
    paymentStatus: string;
  }>
> {
  if (!(await connectMongo())) return [];

  const rows = await User.find({
    paymentStatus: { $in: ["active", "manual_active", "past_due"] },
    subscriptionCurrentPeriodEnd: { $exists: true, $lte: new Date() },
  })
    .select("discordId subscriptionCurrentPeriodEnd paymentStatus")
    .lean();

  return rows.map((row) => ({
    discordId: row.discordId,
    subscriptionCurrentPeriodEnd: new Date(row.subscriptionCurrentPeriodEnd!),
    paymentStatus: row.paymentStatus,
  }));
}

export async function revokeSubscriptionAccess(discordId: string): Promise<void> {
  if (!(await connectMongo())) return;

  await User.findOneAndUpdate(
    { discordId },
    {
      $set: {
        paymentStatus: "canceled",
        subscriptionSource: "none",
        discordHasPaidRole: false,
        subscriptionCancelAtPeriodEnd: false,
      },
      $unset: {
        subscriptionCurrentPeriodEnd: "",
        subscriptionExternalId: "",
        stripeSubscriptionId: "",
        pendingCheckoutOrderUuid: "",
        pendingCheckoutSessionId: "",
      },
    }
  );
}
