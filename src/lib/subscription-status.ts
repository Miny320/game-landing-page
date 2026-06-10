import { auth } from "@/auth";
import { getDiscordAccessSnapshot } from "@/lib/discord-guild";
import { isUserInGuild } from "@/lib/discord-join";
import {
  getEffectiveSubscriptionPeriodEnd,
  getUserByDiscordId,
} from "@/lib/user-db";

export type SubscriptionStatus = {
  signedIn: boolean;
  /** guest = not signed in, free = signed in without paid, paid = active subscriber */
  tier: "guest" | "free" | "paid";
  userName: string | null;
  inGuild: boolean | null;
  hasPaidRole: boolean;
  paymentStatus: string | null;
  subscriptionPeriodEndIso: string | null;
  subscriptionExpired: boolean;
  /** DB says paid but Discord Paid User role is missing */
  discordRoleMismatch: boolean;
};

export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  const session = await auth();
  const discordId = session?.user?.discordId;

  if (!discordId) {
    return {
      signedIn: false,
      tier: "guest",
      userName: null,
      inGuild: null,
      hasPaidRole: false,
      paymentStatus: null,
      subscriptionPeriodEndIso: null,
      subscriptionExpired: false,
      discordRoleMismatch: false,
    };
  }

  const [snapshot, dbUser, periodEnd, inGuild] = await Promise.all([
    getDiscordAccessSnapshot(discordId),
    getUserByDiscordId(discordId),
    getEffectiveSubscriptionPeriodEnd(discordId),
    isUserInGuild(discordId),
  ]);

  const hasPaidRole =
    snapshot.configured &&
    !("error" in snapshot) &&
    snapshot.inGuild &&
    snapshot.hasPaidRole;

  const paymentStatus = dbUser?.paymentStatus ?? null;
  const dbPaid =
    paymentStatus === "active" || paymentStatus === "manual_active";

  const subscriptionPeriodEndIso = periodEnd?.toISOString() ?? null;
  const subscriptionExpired = periodEnd
    ? periodEnd.getTime() <= Date.now()
    : false;

  const dbSubscriptionActive = dbPaid && !subscriptionExpired;
  // Expired period = no paid access on site, even if Discord role not removed yet.
  const isPaid = subscriptionExpired
    ? false
    : Boolean(hasPaidRole || dbSubscriptionActive);
  const discordRoleMismatch = Boolean(
    !subscriptionExpired && dbSubscriptionActive && !hasPaidRole
  );

  return {
    signedIn: true,
    tier: isPaid ? "paid" : "free",
    userName: session.user.name ?? null,
    inGuild,
    hasPaidRole: Boolean(hasPaidRole),
    paymentStatus,
    subscriptionPeriodEndIso,
    subscriptionExpired,
    discordRoleMismatch,
  };
}
