import { revokeOvgcAccessForDiscord } from "@/lib/ovgc-fulfillment";
import { listUsersWithExpiredSubscription } from "@/lib/user-db";

export type ExpireSubscriptionsResult = {
  checkedAt: string;
  expiredCount: number;
  revoked: string[];
  failed: Array<{ discordId: string; error: string }>;
  skipped: boolean;
};

/**
 * Finds active/manual subscribers past subscriptionCurrentPeriodEnd,
 * removes Paid User in Discord, and marks them canceled in Mongo.
 */
export async function expireSubscriptionsPastDue(): Promise<ExpireSubscriptionsResult> {
  const checkedAt = new Date().toISOString();
  const expired = await listUsersWithExpiredSubscription();

  if (!expired.length) {
    return {
      checkedAt,
      expiredCount: 0,
      revoked: [],
      failed: [],
      skipped: false,
    };
  }

  const revoked: string[] = [];
  const failed: Array<{ discordId: string; error: string }> = [];

  for (const user of expired) {
    try {
      await revokeOvgcAccessForDiscord(user.discordId);
      revoked.push(user.discordId);
    } catch (e) {
      const error = e instanceof Error ? e.message : "Unknown error";
      failed.push({ discordId: user.discordId, error });
      console.error("[subscription-expiry] revoke failed:", user.discordId, error);
    }
  }

  return {
    checkedAt,
    expiredCount: expired.length,
    revoked,
    failed,
    skipped: false,
  };
}
