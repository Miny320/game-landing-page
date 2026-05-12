"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  ExternalLink,
  Loader2,
  RefreshCw,
  Shield,
  Sparkles,
  Unlock,
} from "lucide-react";
import {
  claimPaidRoleFromSubscribeButton,
  refreshDiscordHub,
} from "@/actions/discord-hub";
import type { DiscordAccessSnapshot } from "@/lib/discord-guild";

const memberHubHexCtaClassName =
  "member-hub-starmap-cta group relative z-10 inline-flex items-center justify-center overflow-hidden font-rajdhani text-base font-bold uppercase tracking-wide transition-[transform,filter] duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:scale-100 starmap-login-button starmap-signup-button !w-[260px] !h-[52px] !text-base";

type Props = {
  userName?: string | null;
  snapshot: DiscordAccessSnapshot;
  inviteUrl: string | null;
  /** When true, “Subscribe for full access” assigns the Paid User role (pre–Stripe). */
  manualSubscribeGrantEnabled: boolean;
  /** ISO end of current monthly period (httpOnly cookie; set on hub subscribe / renew). */
  subscriptionPeriodEndIso: string | null;
  subscriptionPeriodExpired: boolean;
  /** From Mongo when connected (`paymentStatus` on User). */
  paymentStatus: string | null;
  /** True when a User document exists for this Discord id. */
  accountPersisted: boolean;
};

function StepRow({
  done,
  label,
  description,
}: {
  done: boolean;
  label: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="mt-0.5 shrink-0">
        {done ? (
          <CheckCircle2 className="size-6 text-cyan-accent" aria-hidden />
        ) : (
          <Circle className="size-6 text-white/25" aria-hidden />
        )}
      </div>
      <div>
        <p className="font-rajdhani text-sm font-bold uppercase tracking-[0.14em] text-white">
          {label}
        </p>
        <p className="mt-1 text-sm text-gray-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export function MemberHubPanel({
  userName,
  snapshot,
  inviteUrl,
  manualSubscribeGrantEnabled,
  subscriptionPeriodEndIso,
  subscriptionPeriodExpired,
  paymentStatus,
  accountPersisted,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const onRefresh = () => {
    setErr(null);
    startTransition(async () => {
      const r = await refreshDiscordHub();
      if (!r.ok) {
        setErr("Could not refresh. Try signing in again.");
        return;
      }
      router.refresh();
    });
  };

  const onSubscribeForAccess = () => {
    setErr(null);
    startTransition(async () => {
      const r = await claimPaidRoleFromSubscribeButton();
      if (!r.ok) {
        if (r.error === "manual_grant_disabled") {
          setErr("Manual role grant is turned off. Use checkout when it is live.");
        } else if (r.error === "not_in_guild") {
          setErr("Join the Discord server first, then refresh status and try again.");
        } else if (r.error === "not_configured") {
          setErr("Server is missing Discord bot configuration.");
        } else if (r.error === "not_signed_in") {
          setErr("Sign in again, then retry.");
        } else {
          setErr(r.message ?? "Could not assign the role. Check bot permissions and role order.");
        }
        return;
      }
      router.refresh();
    });
  };

  if (!snapshot.configured) {
    return (
      <div className="rounded-none border border-amber-500/35 bg-amber-500/10 p-6 text-sm text-amber-100/95">
        <p className="font-rajdhani font-bold uppercase tracking-widest text-amber-200">
          Server configuration
        </p>
        <p className="mt-2 text-amber-50/90 leading-relaxed">
          Set <code className="rounded bg-black/40 px-1.5 py-0.5">DISCORD_BOT_TOKEN</code>,{" "}
          <code className="rounded bg-black/40 px-1.5 py-0.5">DISCORD_GUILD_ID</code>, and{" "}
          <code className="rounded bg-black/40 px-1.5 py-0.5">DISCORD_SUBSCRIBER_ROLE_ID</code>{" "}
          on the deployment host, then reload this page.
        </p>
      </div>
    );
  }

  if ("error" in snapshot) {
    return (
      <div className="rounded-none border border-red-500/35 bg-red-500/10 p-6 text-sm text-red-100/95">
        <p className="font-rajdhani font-bold uppercase tracking-widest text-red-200">
          Discord check failed
        </p>
        <p className="mt-2 font-mono text-xs opacity-90 break-all">{snapshot.error}</p>
        <p className="mt-4 text-red-100/80">
          Confirm the bot is in the server, has <strong>Manage Roles</strong>, and its role sits{" "}
          <strong>above</strong> the paid role in Server Settings → Roles.
        </p>
        <button
          type="button"
          onClick={onRefresh}
          disabled={pending}
          className="mt-6 inline-flex items-center gap-2 border border-red-400/50 bg-black/30 px-4 py-2.5 font-rajdhani text-xs font-bold uppercase tracking-widest text-red-100 transition hover:bg-red-500/15 disabled:opacity-50"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <RefreshCw className="size-4" aria-hidden />
          )}
          Try again
        </button>
      </div>
    );
  }

  const inGuild = snapshot.inGuild;
  const hasPaidRole = snapshot.hasPaidRole;
  const needsSubscribe = inGuild && !hasPaidRole;
  const canExtendMonthlyPeriod =
    hasPaidRole &&
    manualSubscribeGrantEnabled &&
    (!subscriptionPeriodEndIso || subscriptionPeriodExpired);
  const showSubscribePrimaryCta = needsSubscribe || canExtendMonthlyPeriod;

  const periodEndDisplay = subscriptionPeriodEndIso
    ? new Date(subscriptionPeriodEndIso).toLocaleDateString(undefined, {
        dateStyle: "long",
      })
    : null;

  const paidStepDescription = !inGuild
    ? "Join the Sigma Scripts Discord first. When you subscribe, we add the Paid User role to this same account (no ID to paste)."
    : hasPaidRole
      ? subscriptionPeriodEndIso
        ? subscriptionPeriodExpired
          ? `Paid User role is active. Your tracked monthly period ended on ${periodEndDisplay}. Use Extend monthly access on this page when available, or use checkout when live.`
          : `You have the Paid User role. Current monthly access is tracked until ${periodEndDisplay}.`
        : "You have the Paid User role. Full library access is tied to this subscription. Period dates appear after you use the hub subscribe flow (or when checkout is connected)."
      : manualSubscribeGrantEnabled
        ? "You are in the server. Use Subscribe now in the Next step card to receive the Paid User role in Discord right away (until checkout replaces this flow)."
        : "You are in the server. Complete checkout on the store when it is live — the Paid User role will be applied automatically to this Discord account.";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-none border border-white/10 bg-card-bg/50 shadow-[0_0_60px_-20px_rgba(0,245,212,0.25)]"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-accent/[0.07] via-transparent to-transparent" />
      <div className="relative p-8 md:p-12">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 border border-cyan-accent/25 bg-cyan-accent/10 px-3 py-1.5">
              <Sparkles className="size-3.5 text-cyan-accent" aria-hidden />
              <span className="font-rajdhani text-[10px] font-black uppercase tracking-[0.2em] text-cyan-accent">
                Member hub
              </span>
            </div>
            <h1 className="mt-5 font-rajdhani text-3xl font-bold text-white md:text-4xl">
              Discord access
            </h1>
            <p className="mt-3 max-w-xl text-gray-400 leading-relaxed">
              You are signed in as{" "}
              <span className="text-white font-semibold">
                {userName?.trim() || "Discord user"}
              </span>
              . We use your Discord account automatically — you never need to paste a numeric ID.
            </p>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-rajdhani font-bold uppercase tracking-widest text-gray-500">
              <span>
                Database:{" "}
                <span className={accountPersisted ? "text-cyan-accent" : "text-amber-200/90"}>
                  {accountPersisted ? "profile saved" : "not connected / no record"}
                </span>
              </span>
              {paymentStatus ? (
                <span>
                  Payment status:{" "}
                  <span className="text-cyan-accent/90">{paymentStatus.replace(/_/g, " ")}</span>
                </span>
              ) : null}
            </div>
          </div>
          <Shield className="size-14 shrink-0 text-cyan-accent/40 hidden sm:block" aria-hidden />
        </div>

        <div className="mt-10 space-y-8 border-t border-white/10 pt-10">
          <StepRow
            done
            label="Sign in with Discord"
            description="Your site session is linked to this Discord account."
          />
          <StepRow
            done={inGuild}
            label="Join the Sigma Scripts server"
            description="You must be a member of the server before we can assign the Paid User role."
          />
          <StepRow
            done={hasPaidRole}
            label="Subscribe & Paid User role"
            description={paidStepDescription}
          />
        </div>

        {needsSubscribe ? (
          <div className="mt-10 rounded-none border border-cyan-accent/30 bg-cyan-accent/[0.06] p-6 md:p-8">
            <p className="font-rajdhani text-xs font-black uppercase tracking-[0.2em] text-cyan-accent">
              Next step
            </p>
            <h2 className="mt-2 font-rajdhani text-xl font-bold text-white md:text-2xl">
              Subscribe for full script access
            </h2>
            <div className="mt-6 rounded-none border border-white/10 bg-black/35 p-5 md:p-6">
              <p className="font-rajdhani text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                Pricing
              </p>
              <p className="mt-2 font-rajdhani text-4xl font-black tracking-tight text-cyan-accent md:text-5xl">
                $29.99
                <span className="ml-1.5 align-baseline text-xl font-bold text-gray-400 md:text-2xl">
                  / month
                </span>
              </p>
              <p className="mt-4 max-w-2xl text-base text-gray-400 leading-relaxed md:text-lg">
                Over <span className="font-bold text-white">200+ scripts</span> worth over{" "}
                <span className="font-bold text-white line-through decoration-white/50">$5,000</span>{" "}
                for only{" "}
                <span className="font-black text-cyan-accent">$29.99 a month</span> right now, with
                new scripts added regularly — same offer as the{" "}
                <Link href="/#store" className="font-bold text-cyan-accent underline-offset-4 hover:underline">
                  store section
                </Link>{" "}
                on the homepage.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
              {manualSubscribeGrantEnabled ? (
                <button
                  type="button"
                  onClick={onSubscribeForAccess}
                  disabled={pending}
                  className={memberHubHexCtaClassName}
                >
                  {pending ? (
                    <Loader2
                      className="size-5 animate-spin text-[#0b0b0b] group-hover:text-[#00ffff]"
                      aria-hidden
                    />
                  ) : (
                    <span className="whitespace-nowrap">SUBSCRIBE NOW</span>
                  )}
                </button>
              ) : (
                <Link href="/#store" className={`${memberHubHexCtaClassName} cursor-pointer no-underline`}>
                  <span className="whitespace-nowrap">SUBSCRIBE NOW</span>
                </Link>
              )}
            </div>

            <p className="mt-4 max-w-2xl text-sm text-gray-300 leading-relaxed">
              {manualSubscribeGrantEnabled ? (
                <>
                  You are already in the Discord server.{" "}
                  <strong className="text-white">Subscribe now</strong> assigns the{" "}
                  <strong className="text-white">Paid User</strong> role to this same Discord account
                  — no checkout yet, nothing to paste.
                </>
              ) : (
                <>
                  You are in the server. When checkout is enabled, subscribe on the store for the
                  plan above and the <strong className="text-white">Paid User</strong> role will be
                  applied automatically to this Discord account.
                </>
              )}
            </p>
          </div>
        ) : hasPaidRole ? (
          <div className="mt-10 rounded-none border border-cyan-accent/25 bg-cyan-accent/10 p-6 md:p-8">
            <p className="font-rajdhani text-sm font-bold text-white">
              You are set up for subscriber access.
            </p>
            <p className="mt-2 text-sm text-gray-300 leading-relaxed">
              Head back to the site for scripts and updates. If a role ever looks wrong in Discord,
              use refresh below.
            </p>
            {periodEndDisplay ? (
              <div
                className={`mt-5 flex flex-wrap items-center gap-3 border-t border-white/10 pt-5 ${
                  subscriptionPeriodExpired ? "text-amber-200/95" : "text-cyan-accent/95"
                }`}
              >
                <CalendarDays className="size-5 shrink-0" aria-hidden />
                <div>
                  <p className="font-rajdhani text-[10px] font-black uppercase tracking-[0.2em] opacity-90">
                    {subscriptionPeriodExpired ? "Period ended" : "Monthly access until"}
                  </p>
                  <p className="mt-1 font-rajdhani text-lg font-bold text-white">
                    {periodEndDisplay}
                  </p>
                  {subscriptionPeriodExpired && manualSubscribeGrantEnabled ? (
                    <p className="mt-2 text-xs text-gray-400 leading-relaxed">
                      Use <strong className="text-white">Extend monthly access</strong> below to
                      start a new monthly window (same Discord role).
                    </p>
                  ) : null}
                </div>
              </div>
            ) : (
              <p className="mt-4 text-xs text-gray-500 leading-relaxed">
                A renewal date will show here after you subscribe through this hub, or when billing
                is connected.
              </p>
            )}
          </div>
        ) : null}

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-10 sm:flex-row sm:flex-wrap sm:items-center">
          {showSubscribePrimaryCta && !needsSubscribe ? (
            <>
              <button
                type="button"
                onClick={onSubscribeForAccess}
                disabled={pending}
                className="inline-flex items-center justify-center gap-2 border border-cyan-accent bg-cyan-accent px-6 py-3.5 font-rajdhani text-sm font-bold uppercase tracking-widest text-background transition hover:bg-cyan-glow hover:border-cyan-glow disabled:opacity-60"
              >
                {pending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <Unlock className="size-4" aria-hidden />
                )}
                Extend monthly access
              </button>
              {inviteUrl ? (
                <a
                  href={inviteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 border border-white/25 bg-transparent px-6 py-3.5 font-rajdhani text-sm font-bold uppercase tracking-widest text-white transition hover:bg-white/10"
                >
                  Open Discord
                  <ExternalLink className="size-4" aria-hidden />
                </a>
              ) : null}
            </>
          ) : needsSubscribe && inviteUrl ? (
            <a
              href={inviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border border-white/25 bg-transparent px-6 py-3.5 font-rajdhani text-sm font-bold uppercase tracking-widest text-white transition hover:bg-white/10"
            >
              Open Discord
              <ExternalLink className="size-4" aria-hidden />
            </a>
          ) : !showSubscribePrimaryCta && inviteUrl ? (
            <a
              href={inviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border border-cyan-accent bg-cyan-accent px-6 py-3.5 font-rajdhani text-sm font-bold uppercase tracking-widest text-background transition hover:bg-cyan-glow hover:border-cyan-glow"
            >
              Open Discord invite
              <ExternalLink className="size-4" aria-hidden />
            </a>
          ) : !showSubscribePrimaryCta ? (
            <p className="text-sm text-amber-200/90">
              Set <code className="mx-1 rounded bg-black/40 px-1.5 py-0.5">NEXT_PUBLIC_DISCORD_INVITE_URL</code>{" "}
              so this button opens your permanent server invite.
            </p>
          ) : null}

          <button
            type="button"
            onClick={onRefresh}
            disabled={pending}
            className="inline-flex items-center justify-center gap-2 border border-white/20 bg-white/5 px-6 py-3.5 font-rajdhani text-sm font-bold uppercase tracking-widest text-white transition hover:bg-white/10 disabled:opacity-50"
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <RefreshCw className="size-4" aria-hidden />
            )}
            {inGuild ? "Refresh status" : "I joined — refresh status"}
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center text-sm font-rajdhani font-bold uppercase tracking-widest text-gray-500 transition hover:text-cyan-accent sm:ml-auto"
          >
            ← Back to site
          </Link>
        </div>

        {err ? (
          <p className="mt-4 text-sm text-red-300" role="alert">
            {err}
          </p>
        ) : null}
      </div>
    </motion.div>
  );
}
