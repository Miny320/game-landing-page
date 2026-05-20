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

export async function getUserByPendingOvgcSession(ovgcSessionId: string) {
  if (!(await connectMongo())) return null;
  return User.findOne({ pendingOvgcSessionId: ovgcSessionId }).lean();
}

export async function getUserByPendingOvgcTransaction(transactionId: string) {
  if (!(await connectMongo())) return null;
  return User.findOne({ pendingOvgcTransactionId: transactionId }).lean();
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

export async function setPendingOvgcSession(
  discordId: string,
  orderUuid: string,
  transactionId: string
): Promise<void> {
  if (!(await connectMongo())) return;
  await User.findOneAndUpdate(
    { discordId },
    {
      $set: {
        pendingOvgcSessionId: orderUuid,
        pendingOvgcTransactionId: transactionId,
      },
    },
    { upsert: true }
  );
}

export async function clearPendingOvgcSession(discordId: string): Promise<void> {
  if (!(await connectMongo())) return;
  await User.findOneAndUpdate(
    { discordId },
    { $unset: { pendingOvgcSessionId: "", pendingOvgcTransactionId: "" } }
  );
}

export async function applyOvgcSubscriptionWindow(
  discordId: string,
  periodEnd: Date,
  ovgcSessionId: string
): Promise<void> {
  if (!(await connectMongo())) return;

  await User.findOneAndUpdate(
    { discordId },
    {
      $set: {
        paymentStatus: "active",
        subscriptionSource: "ovgc",
        subscriptionCurrentPeriodEnd: periodEnd,
        subscriptionExternalId: ovgcSessionId,
        discordHasPaidRole: true,
      },
      $unset: { pendingOvgcSessionId: "", pendingOvgcTransactionId: "" },
    },
    { upsert: true }
  );
}

export async function revokeOvgcSubscription(discordId: string): Promise<void> {
  if (!(await connectMongo())) return;

  await User.findOneAndUpdate(
    { discordId },
    {
      $set: {
        paymentStatus: "canceled",
        subscriptionSource: "none",
        discordHasPaidRole: false,
      },
      $unset: {
        subscriptionCurrentPeriodEnd: "",
        subscriptionExternalId: "",
        pendingOvgcSessionId: "",
        pendingOvgcTransactionId: "",
      },
    }
  );
}
