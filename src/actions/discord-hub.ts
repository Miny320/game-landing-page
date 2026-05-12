"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  getDiscordGuildEnv,
  isManualSubscribeGrantEnabled,
} from "@/lib/discord-config";
import {
  fetchGuildMember,
  grantPaidSubscriberRole,
} from "@/lib/discord-guild";
import {
  computeSubscriptionPeriodEnd,
  setSubscriptionPeriodEndCookie,
} from "@/lib/subscription-cookie";
import {
  applyManualSubscriptionWindow,
  getEffectiveSubscriptionPeriodEnd,
} from "@/lib/user-db";

/** After the user joins the Discord server, call this so the dashboard refetches membership from Discord. */
export async function refreshDiscordHub() {
  const session = await auth();
  if (!session?.user?.discordId) {
    return { ok: false as const, error: "not_signed_in" };
  }
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export type ClaimPaidRoleResult =
  | { ok: true; alreadyHadRole?: boolean; renewed?: boolean }
  | {
      ok: false;
      error:
        | "not_signed_in"
        | "manual_grant_disabled"
        | "not_configured"
        | "not_in_guild"
        | "discord_error";
      message?: string;
    };

/**
 * Pre–Stripe: assigns Paid User in Discord when the member clicks “Subscribe for full access”.
 * Disable with `DISCORD_DISABLE_MANUAL_SUBSCRIBE_GRANT=true` once checkout webhooks grant roles.
 */
export async function claimPaidRoleFromSubscribeButton(): Promise<ClaimPaidRoleResult> {
  const session = await auth();
  const discordId = session?.user?.discordId;
  if (!discordId) {
    return { ok: false, error: "not_signed_in" };
  }

  if (!isManualSubscribeGrantEnabled()) {
    return { ok: false, error: "manual_grant_disabled" };
  }

  const env = getDiscordGuildEnv();
  if (!env) {
    return { ok: false, error: "not_configured" };
  }

  try {
    const member = await fetchGuildMember(env.guildId, discordId, env.botToken);
    if (!member) {
      return { ok: false, error: "not_in_guild" };
    }
    const hasRole = member.roles.includes(env.paidSubscriberRoleId);
    const periodEndExisting = await getEffectiveSubscriptionPeriodEnd(discordId);
    const now = Date.now();
    const periodMissingOrExpired =
      !periodEndExisting || periodEndExisting.getTime() <= now;

    if (hasRole) {
      if (isManualSubscribeGrantEnabled() && periodMissingOrExpired) {
        const nextEnd = computeSubscriptionPeriodEnd();
        await setSubscriptionPeriodEndCookie(nextEnd);
        await applyManualSubscriptionWindow(discordId, nextEnd);
        revalidatePath("/dashboard");
        return { ok: true, renewed: true as const };
      }
      revalidatePath("/dashboard");
      return { ok: true, alreadyHadRole: true as const };
    }
    await grantPaidSubscriberRole(discordId);
    const nextEnd = computeSubscriptionPeriodEnd();
    await setSubscriptionPeriodEndCookie(nextEnd);
    await applyManualSubscriptionWindow(discordId, nextEnd);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Discord request failed";
    return { ok: false, error: "discord_error", message };
  }

  revalidatePath("/dashboard");
  return { ok: true };
}
