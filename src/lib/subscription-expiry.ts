import { revokeStripeAccessForDiscord } from "@/lib/stripe-fulfillment";
import {
  applyStripeSubscriptionWindow,
  getUserByDiscordId,
  listUsersWithExpiredSubscription,
} from "@/lib/user-db";
import { isStripeConfigured } from "@/lib/stripe-config";
import {
  getSubscriptionPeriodEnd,
  isSubscriptionActive,
  retrieveSubscription,
  toStripeId,
} from "@/lib/stripe-client";

export type ExpireSubscriptionsResult = {
  checkedAt: string;
  expiredCount: number;
  revoked: string[];
  /** Still active in Stripe — the stored period end was stale and has been refreshed. */
  renewed: string[];
  failed: Array<{ discordId: string; error: string }>;
  skipped: boolean;
};

/**
 * Before revoking, confirm with Stripe that the subscription really ended.
 * A dropped `invoice.paid` webhook would otherwise cut off a paying subscriber.
 *
 * Returns true when access was refreshed and should be kept.
 */
async function tryRenewFromStripe(discordId: string): Promise<boolean> {
  if (!isStripeConfigured()) return false;

  const user = await getUserByDiscordId(discordId);
  const subscriptionId = user?.stripeSubscriptionId?.trim();
  if (!subscriptionId) return false;

  try {
    const subscription = await retrieveSubscription(subscriptionId);
    if (!isSubscriptionActive(subscription.status)) return false;

    const periodEnd = getSubscriptionPeriodEnd(subscription);
    if (!periodEnd || periodEnd.getTime() <= Date.now()) return false;

    await applyStripeSubscriptionWindow(discordId, periodEnd, {
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: toStripeId(subscription.customer),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });
    return true;
  } catch (e) {
    console.error(
      "[subscription-expiry] Stripe re-check failed:",
      discordId,
      e instanceof Error ? e.message : e
    );
    return false;
  }
}

/**
 * Finds subscribers past subscriptionCurrentPeriodEnd, re-checks Stripe, and removes the
 * Paid User role (marking them canceled in Mongo) only for those genuinely lapsed.
 */
export async function expireSubscriptionsPastDue(): Promise<ExpireSubscriptionsResult> {
  const checkedAt = new Date().toISOString();
  const expired = await listUsersWithExpiredSubscription();

  if (!expired.length) {
    return {
      checkedAt,
      expiredCount: 0,
      revoked: [],
      renewed: [],
      failed: [],
      skipped: false,
    };
  }

  const revoked: string[] = [];
  const renewed: string[] = [];
  const failed: Array<{ discordId: string; error: string }> = [];

  for (const user of expired) {
    try {
      if (await tryRenewFromStripe(user.discordId)) {
        renewed.push(user.discordId);
        continue;
      }

      await revokeStripeAccessForDiscord(user.discordId);
      revoked.push(user.discordId);
    } catch (e) {
      const error = e instanceof Error ? e.message : "Unknown error";
      failed.push({ discordId: user.discordId, error });
      console.error(
        "[subscription-expiry] revoke failed:",
        user.discordId,
        error
      );
    }
  }

  return {
    checkedAt,
    expiredCount: expired.length,
    revoked,
    renewed,
    failed,
    skipped: false,
  };
}
