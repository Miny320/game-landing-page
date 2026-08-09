"use client";

import { useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { startGuestCheckout } from "@/actions/checkout";
import { signInWithDiscordForSubscribe } from "@/actions/auth";
import { HexPrimaryCtaButton } from "@/components/ui/HexPrimaryCta";

type Props = {
  defaultEmail?: string;
  signedInWithDiscord?: boolean;
  discordUserName?: string | null;
};

export function SubscribePurchase({
  defaultEmail = "",
  signedInWithDiscord = false,
  discordUserName = null,
}: Props) {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(defaultEmail);
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const q = searchParams.get("error");
    if (q) setErr(decodeURIComponent(q));
  }, [searchParams]);

  useEffect(() => {
    if (defaultEmail) setEmail(defaultEmail);
  }, [defaultEmail]);

  const needsReceiptEmail = signedInWithDiscord && !defaultEmail.trim();
  const guestNeedsEmail = !signedInWithDiscord;

  const onPurchase = () => {
    setErr(null);
    if ((guestNeedsEmail || needsReceiptEmail) && !email.trim()) {
      setErr("Enter your Discord account email to continue.");
      return;
    }
    startTransition(async () => {
      const result = await startGuestCheckout(email);
      if (!result.ok) {
        setErr(result.message);
        return;
      }
      window.location.href = result.checkoutUrl;
    });
  };

  if (signedInWithDiscord) {
    return (
      <div id="purchase" className="mt-8 scroll-mt-28 space-y-4">
        <div className="border border-cyan-accent/25 bg-cyan-accent/[0.06] px-4 py-3">
          <p className="font-rajdhani text-[10px] font-black uppercase tracking-[0.2em] text-cyan-accent">
            Discord connected
          </p>
          <p className="mt-1 font-sans text-sm text-gray-300">
            Signed in as{" "}
            <span className="font-semibold text-white">
              {discordUserName?.trim() || "Discord user"}
            </span>
            . Your Paid User role is applied automatically when payment confirms.
          </p>
        </div>

        {needsReceiptEmail ? (
          <label className="block">
            <span className="font-rajdhani text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
              Discord account email
            </span>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={pending}
              className="mt-2 w-full border border-white/15 bg-black/40 px-4 py-3 font-sans text-sm text-white outline-none focus:border-cyan-accent/50"
              placeholder="Same email linked to your Discord"
            />
            <p className="mt-2 font-sans text-xs text-gray-500 leading-relaxed">
              Use the email on your Discord account so we can grant your Paid User role
              automatically.
            </p>
          </label>
        ) : null}

        <HexPrimaryCtaButton
          type="button"
          onClick={onPurchase}
          disabled={pending}
          block
          className={needsReceiptEmail ? "mt-2" : undefined}
        >
          {pending ? (
            <Loader2 className="size-5 shrink-0 animate-spin" aria-hidden />
          ) : (
            <>
              <span className="whitespace-nowrap">Purchase now</span>
              <ArrowRight className="size-5 shrink-0" aria-hidden />
            </>
          )}
        </HexPrimaryCtaButton>

        {err ? (
          <p className="text-sm text-red-300" role="alert">
            {err}
          </p>
        ) : null}

        <p className="font-sans text-xs text-gray-500 leading-relaxed">
          Secure Stripe checkout on the next page. Billed monthly, cancel anytime.
        </p>
      </div>
    );
  }

  return (
    <div id="purchase" className="mt-8 scroll-mt-28 space-y-6">
      <div className="space-y-3">
        <label className="block">
          <span className="font-rajdhani text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
            Discord account email
          </span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={pending}
            className="mt-2 w-full border border-white/15 bg-black/40 px-4 py-3 font-sans text-sm text-white outline-none focus:border-cyan-accent/50"
            placeholder="Same email linked to your Discord"
          />
          <p className="mt-2 font-sans text-xs text-amber-200/90 leading-relaxed">
            Important: enter the email on your Discord account. If this does not match, you
            will not receive your Paid User role after payment.
          </p>
        </label>

        <HexPrimaryCtaButton type="button" onClick={onPurchase} disabled={pending} block>
          {pending ? (
            <Loader2 className="size-5 shrink-0 animate-spin" aria-hidden />
          ) : (
            <>
              <span className="whitespace-nowrap">Continue to payment</span>
              <ArrowRight className="size-5 shrink-0" aria-hidden />
            </>
          )}
        </HexPrimaryCtaButton>

        <p className="font-sans text-xs text-gray-500 leading-relaxed">
          Pay with card on the next page. After payment, connect Discord using this same email
          to activate your Paid User role and script downloads.
        </p>
      </div>

      <div className="relative flex items-center gap-3 py-1">
        <div className="h-px flex-1 bg-white/10" aria-hidden />
        <span className="font-rajdhani text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">
          or
        </span>
        <div className="h-px flex-1 bg-white/10" aria-hidden />
      </div>

      <div className="space-y-3">
        <p className="font-sans text-sm text-gray-300 leading-relaxed">
          Already use Discord? Connect first for{" "}
          <span className="font-semibold text-white">instant activation</span> when payment
          completes — no second step.
        </p>
        <form action={signInWithDiscordForSubscribe} className="w-full">
          <HexPrimaryCtaButton type="submit" block>
            Connect Discord, then purchase
          </HexPrimaryCtaButton>
        </form>
      </div>

      {err ? (
        <p className="text-sm text-red-300" role="alert">
          {err}
        </p>
      ) : null}
    </div>
  );
}
