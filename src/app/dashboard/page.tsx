import Link from "next/link";
import { auth } from "@/auth";
import { MemberHubPanel } from "@/components/discord/MemberHubPanel";
import { getDiscordAccessSnapshot } from "@/lib/discord-guild";
import {
  getDiscordInviteUrl,
  isManualSubscribeGrantEnabled,
} from "@/lib/discord-config";
import { isOvgcConfigured } from "@/lib/ovgc-config";
import {
  getEffectiveSubscriptionPeriodEnd,
  getUserByDiscordId,
  syncUserDiscordFromSnapshot,
} from "@/lib/user-db";
import { tryFulfillPaidCheckoutForDiscord } from "@/lib/checkout-fulfillment";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ billing?: string }>;
}) {
  const { billing } = await searchParams;
  const session = await auth();
  if (!session?.user) {
    return null;
  }

  const discordId = session.user.discordId;
  if (!discordId) {
    return (
      <div className="container mx-auto max-w-2xl px-4 pt-32 pb-24">
        <div className="rounded-none border border-white/10 bg-card-bg/40 p-8 text-gray-300">
          <p className="font-rajdhani text-lg font-bold text-white">
            Session missing Discord id
          </p>
          <p className="mt-2 text-sm leading-relaxed">
            Sign out and sign in with Discord again so we can sync your server roles.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block font-rajdhani text-sm font-bold uppercase tracking-widest text-cyan-accent hover:text-cyan-glow"
          >
            ← Home
          </Link>
        </div>
      </div>
    );
  }

  const snapshot = await getDiscordAccessSnapshot(discordId);
  await syncUserDiscordFromSnapshot(discordId, snapshot);

  const dbUserBefore = await getUserByDiscordId(discordId);
  if (
    dbUserBefore?.paymentStatus !== "active" &&
    dbUserBefore?.paymentStatus !== "manual_active" &&
    session.user.email
  ) {
    await tryFulfillPaidCheckoutForDiscord(discordId, session.user.email);
  }

  const inviteUrl = getDiscordInviteUrl();
  const ovgcCheckoutEnabled = isOvgcConfigured();
  const manualSubscribeGrantEnabled = isManualSubscribeGrantEnabled();
  const periodEnd = await getEffectiveSubscriptionPeriodEnd(discordId);
  const subscriptionPeriodEndIso = periodEnd?.toISOString() ?? null;
  const nowMs = Date.now();
  const subscriptionPeriodExpired = periodEnd
    ? periodEnd.getTime() <= nowMs
    : false;

  const dbUser = await getUserByDiscordId(discordId);
  const paymentStatus = dbUser?.paymentStatus ?? null;
  const accountPersisted = dbUser != null;

  return (
    <div className="container mx-auto max-w-3xl px-4 pt-28 pb-24 md:pt-32">
      <MemberHubPanel
        userName={session.user.name}
        snapshot={snapshot}
        inviteUrl={inviteUrl}
        ovgcCheckoutEnabled={ovgcCheckoutEnabled}
        manualSubscribeGrantEnabled={manualSubscribeGrantEnabled}
        subscriptionPeriodEndIso={subscriptionPeriodEndIso}
        subscriptionPeriodExpired={subscriptionPeriodExpired}
        paymentStatus={paymentStatus}
        accountPersisted={accountPersisted}
        billingSuccess={billing === "success"}
      />
    </div>
  );
}
