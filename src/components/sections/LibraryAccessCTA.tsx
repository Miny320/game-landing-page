"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Sparkles,
  Star,
} from "lucide-react";
import { SectionWrapper } from "../ui/SectionWrapper";
import {
  handleFreeAccess,
  handleUpgradeAccess,
  type AccessFlowResult,
} from "@/actions/access-flow";
import type { SubscriptionStatus } from "@/lib/subscription-status";

const hexCtaClassName =
  "member-hub-starmap-cta group relative z-10 inline-flex items-center justify-center gap-2 overflow-hidden font-rajdhani text-base font-bold uppercase tracking-wide transition-[transform,filter] duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:scale-100 starmap-login-button starmap-signup-button !h-[52px] !text-base";

const freeCommunityFeatures = [
  "Discord Server Access",
  "24/7 Support",
  "Setup Guides",
] as const;

const previewVisuals = [
  "/scripts-visuals/rustscarfacezens.png",
  "/scripts-visuals/arcraiders-braveaimers.png",
  "/scripts-visuals/blackopsfeaturezens.png",
  "/scripts-visuals/nba2k26lethalpanda.png",
  "/scripts-visuals/rainbowsixsiegebraveaimers.png",
];

const ultimatePreviews = [
  { game: "Arc Raiders", name: "Brave Aimers", image: "/scripts-visuals/arcraiders-braveaimers.png" },
  { game: "NBA 2K26", name: "Lethal Panda", image: "/scripts-visuals/nba2k26lethalpanda.png" },
  { game: "NBA 2K26", name: "Sosa Scripts", image: "/scripts-visuals/nba2k26sosacirpts.png" },
  { game: "Rainbow Six", name: "Brave Aimers", image: "/scripts-visuals/rainbowsixsiegebraveaimers.png" },
  { game: "Black Ops", name: "Feature Zens", image: "/scripts-visuals/blackopsfeaturezens.png" },
] as const;

function StarRating({ label }: { label: string }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex gap-0.5" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <span className="font-sans text-sm text-gray-400">{label}</span>
    </div>
  );
}

function runFlowResult(result: AccessFlowResult) {
  if (result.action === "redirect") {
    window.location.href = result.url;
    return;
  }
  if (result.action === "checkout") {
    window.location.href = result.checkoutUrl;
  }
}

function formatPeriodEnd(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: "long" });
}

type Props = {
  subscription: SubscriptionStatus;
};

export default function LibraryAccessCTA({ subscription }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const { tier, signedIn, userName } = subscription;
  const isPaid = tier === "paid";
  const periodLabel = formatPeriodEnd(subscription.subscriptionPeriodEndIso);

  const onFree = () => {
    setErr(null);
    startTransition(async () => {
      const r = await handleFreeAccess();
      if (r.action === "error") {
        setErr(r.message);
        return;
      }
      runFlowResult(r);
      if (r.action === "redirect") router.refresh();
    });
  };

  const onUpgrade = () => {
    setErr(null);
    startTransition(async () => {
      const r = await handleUpgradeAccess();
      if (r.action === "error") {
        setErr(r.message);
        return;
      }
      runFlowResult(r);
    });
  };

  return (
    <SectionWrapper id="store" className="py-24 relative overflow-hidden bg-cyan-accent/[0.02]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-accent/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 space-y-8">
        {signedIn && isPaid ? (
          <div
            className={`rounded-none border p-6 md:p-8 overflow-hidden relative shadow-2xl ${
              subscription.discordRoleMismatch
                ? "border-amber-500/35 bg-amber-500/10"
                : "border-cyan-accent/25 bg-cyan-accent/[0.06]"
            }`}
          >
            <p className="font-rajdhani text-[10px] font-black uppercase tracking-[0.25em] text-cyan-accent">
              Ultimate access active
            </p>
            <p className="mt-2 font-rajdhani text-xl font-bold text-white md:text-2xl">
              Welcome back, {userName?.trim() || "Discord user"}
            </p>
            <p className="mt-2 font-sans text-sm text-gray-300 leading-relaxed">
              You are subscribed
              {subscription.paymentStatus
                ? ` (${subscription.paymentStatus.replace(/_/g, " ")})`
                : ""}
              {periodLabel ? ` until ${periodLabel}` : ""}.
              {subscription.hasPaidRole
                ? " Your Paid User role is active in Discord."
                : null}
            </p>
            {subscription.discordRoleMismatch ? (
              <p className="mt-3 font-sans text-sm text-amber-100/95 leading-relaxed">
                Your subscription is on file, but the Paid User role is missing in Discord. Open
                the member hub and refresh status, or contact support.
              </p>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                href="/#scripts"
                className={`${hexCtaClassName} no-underline !w-auto !min-w-[200px]`}
              >
                <span className="whitespace-nowrap">Browse library</span>
                <ArrowRight className="size-5 shrink-0" aria-hidden />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center border border-white/25 px-6 py-3 font-rajdhani text-sm font-bold uppercase tracking-widest text-white transition hover:bg-white/10"
              >
                Member hub
              </Link>
            </div>
          </div>
        ) : signedIn ? (
          <div className="bg-card-bg/40 border border-cyan-accent/25 rounded-none p-6 md:p-8 overflow-hidden relative shadow-2xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-rajdhani text-[10px] font-black uppercase tracking-[0.25em] text-cyan-accent">
                  Discord access active
                </p>
                <p className="mt-2 font-rajdhani text-xl font-bold text-white md:text-2xl">
                  Welcome back, {userName?.trim() || "Discord user"}
                </p>
                <p className="mt-2 font-sans text-sm text-gray-400 leading-relaxed">
                  You are signed in and in our Discord server. Script downloads require Ultimate
                  paid access — upgrade below to unlock the full library.
                </p>
              </div>
              <Link
                href="/#store"
                className={`${hexCtaClassName} shrink-0 no-underline !w-full sm:!w-auto sm:!min-w-[240px]`}
              >
                <span className="whitespace-nowrap">Upgrade for scripts</span>
                <ArrowRight className="size-5 shrink-0" aria-hidden />
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-card-bg/40 border border-white/10 rounded-none p-8 md:p-12 overflow-hidden relative shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-accent/10 blur-3xl rounded-full pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center relative">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-accent/10 border border-cyan-accent/20">
                  <Sparkles className="size-3 text-cyan-accent" aria-hidden />
                  <span className="font-rajdhani text-[10px] font-black text-cyan-accent tracking-widest uppercase">
                    Free to join
                  </span>
                </div>

                <h2 className="font-rajdhani text-4xl sm:text-5xl font-bold text-white leading-tight">
                  Join with Discord
                </h2>

                <p className="font-sans text-lg text-gray-400 leading-relaxed">
                  Sign up <span className="font-bold text-white">free</span> with Discord to join our
                  server automatically. The full script library is{" "}
                  <span className="font-bold text-white">paid only</span> — unlock every script with
                  Ultimate access below.
                </p>

                <StarRating label="4.8/5 from 21,000+ Users" />

                <button
                  type="button"
                  onClick={onFree}
                  disabled={pending}
                  className={`${hexCtaClassName} !w-full max-w-[360px]`}
                >
                  {pending ? (
                    <Loader2 className="size-5 animate-spin" aria-hidden />
                  ) : (
                    <>
                      <span className="whitespace-nowrap">Join free with Discord</span>
                      <ArrowRight className="size-5 shrink-0" aria-hidden />
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-6">
                <div className="rounded-none border border-white/10 bg-black/30 p-6 md:p-8">
                  <ul className="space-y-5">
                    {freeCommunityFeatures.map((feature) => (
                      <li key={feature} className="flex items-center gap-4">
                        <CheckCircle2 className="size-6 shrink-0 text-cyan-accent" aria-hidden />
                        <span className="font-rajdhani text-lg font-bold uppercase tracking-wide text-white">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="relative h-[220px] overflow-hidden rounded-none border border-white/10 bg-white/[0.02]">
                  <div className="absolute inset-0 z-10 bg-gradient-to-r from-card-bg via-transparent to-card-bg pointer-events-none" />
                  <motion.div
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
                    className="flex h-full items-center gap-4 px-4"
                  >
                    {[...previewVisuals, ...previewVisuals].map((src, i) => (
                      <div
                        key={`${src}-${i}`}
                        className="relative h-[160px] w-[120px] shrink-0 border border-white/10 bg-white/5 p-2"
                      >
                        <Image src={src} alt="" fill className="object-contain p-1" sizes="120px" />
                      </div>
                    ))}
                  </motion.div>
                  <div className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 font-rajdhani text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase">
                    Library preview
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!isPaid ? (
          <div className="bg-card-bg/40 border border-white/10 rounded-none p-8 md:p-12 overflow-hidden relative shadow-2xl">
            <div className="text-center max-w-2xl mx-auto">
              <p className="font-rajdhani text-[10px] font-black uppercase tracking-[0.25em] text-cyan-accent">
                Ultimate access
              </p>
              <h3 className="mt-2 font-rajdhani text-3xl font-bold uppercase tracking-wide text-white md:text-4xl">
                Unlock the full Zen script library
              </h3>
              <p className="mt-3 font-sans text-gray-400">
                Over <span className="font-bold text-white">200+ scripts</span> worth over{" "}
                <span className="font-bold text-white">$5,000</span> for only{" "}
                <span className="font-black text-cyan-accent">$29.99 a month</span> — preview our{" "}
                <strong className="text-white">Ultimate</strong> library below.
              </p>
            </div>

            <div className="mt-10 flex gap-4 overflow-x-auto pb-2 md:flex-wrap md:justify-center md:overflow-visible">
              {ultimatePreviews.map((script) => (
                <div
                  key={`${script.game}-${script.name}`}
                  className="group relative w-[168px] shrink-0 overflow-hidden rounded-none border border-amber-400/40 bg-black/50 sm:w-[180px]"
                >
                  <div className="absolute right-2 top-2 z-10 bg-amber-400 px-2 py-0.5 font-rajdhani text-[9px] font-black uppercase tracking-widest text-black">
                    Ultimate
                  </div>
                  <div className="relative aspect-[4/5] w-full overflow-hidden">
                    <Image
                      src={script.image}
                      alt={`${script.name} — ${script.game}`}
                      fill
                      className="object-cover opacity-90 transition duration-300 group-hover:scale-105"
                      sizes="180px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="font-rajdhani text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        {script.game}
                      </p>
                      <p className="font-rajdhani text-sm font-bold text-white">{script.name}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-col items-center gap-6">
              <button
                type="button"
                onClick={onUpgrade}
                disabled={pending}
                className={`${hexCtaClassName} !w-full max-w-xl`}
              >
                {pending ? (
                  <Loader2 className="size-5 animate-spin" aria-hidden />
                ) : (
                  <>
                    <span className="whitespace-nowrap">Upgrade for full access</span>
                    <ArrowRight className="size-5 shrink-0" aria-hidden />
                  </>
                )}
              </button>

              <StarRating label="4.8/5 from 9,000+ Users" />

              <p className="max-w-lg text-center font-sans text-xs text-gray-500 leading-relaxed">
                Joins you to Discord if needed, then opens secure checkout. Paid User role is
                applied automatically after payment.
              </p>

              {err ? (
                <p className="text-sm text-red-300" role="alert">
                  {err}
                </p>
              ) : null}

              {signedIn ? (
                <p className="font-sans text-sm text-gray-500">
                  Manage access in{" "}
                  <Link href="/dashboard" className="font-bold text-cyan-accent hover:text-cyan-glow">
                    member hub
                  </Link>
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </SectionWrapper>
  );
}
