"use client";

import { useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { startGuestCheckout } from "@/actions/checkout";
import { HexPrimaryCtaButton } from "@/components/ui/HexPrimaryCta";

type Props = {
  defaultEmail?: string;
  signedInWithDiscord?: boolean;
};

/**
 * Product-page purchase (BraveAimers-style): one click → OVGC hosted checkout.
 * Email is only shown here when we need it for the payment API (guests without Discord).
 */
export function SubscribePurchase({
  defaultEmail = "",
  signedInWithDiscord = false,
}: Props) {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(defaultEmail);
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const q = searchParams.get("error");
    if (q) setErr(decodeURIComponent(q));
  }, [searchParams]);

  const needsEmail = !signedInWithDiscord || !defaultEmail.trim();

  const onPurchase = () => {
    setErr(null);
    if (needsEmail && !email.trim()) {
      setErr("Enter your email to continue.");
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

  return (
    <div id="purchase" className="mt-8 scroll-mt-28">
      {needsEmail ? (
        <label className="block">
          <span className="font-rajdhani text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
            Email for receipt
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
            placeholder="you@example.com"
          />
        </label>
      ) : null}

      <HexPrimaryCtaButton
        type="button"
        onClick={onPurchase}
        disabled={pending}
        block
        className={needsEmail ? "mt-6" : "mt-2"}
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
        <p className="mt-3 text-sm text-red-300" role="alert">
          {err}
        </p>
      ) : null}

      <p className="mt-4 font-sans text-xs text-gray-500 leading-relaxed">
        {needsEmail
          ? "Opens secure checkout (card & billing on the next page). Discord only after payment."
          : "Opens secure checkout on the next page. Discord only after payment."}
      </p>
    </div>
  );
}
