import { CheckCircle2 } from "lucide-react";
import { SubscribePurchase } from "@/components/subscribe/SubscribePurchase";
import { UltimateScriptPreviewRow } from "@/components/subscribe/UltimateScriptPreviewRow";
import {
  formatSubscriptionPrice,
  getSubscriptionProductTitle,
  ULTIMATE_FEATURES,
} from "@/lib/pricing";

type Props = {
  price: string;
  productTitle: string;
  defaultEmail?: string;
  signedInWithDiscord?: boolean;
  discordUserName?: string | null;
};

export function SubscribeProduct({
  price,
  productTitle,
  defaultEmail = "",
  signedInWithDiscord = false,
  discordUserName = null,
}: Props) {
  return (
    <div className="container relative z-10 mx-auto max-w-5xl px-4 pb-24 pt-32">
      <p className="font-rajdhani text-[10px] font-black uppercase tracking-[0.25em] text-cyan-accent">
        Ultimate access
      </p>
      <h1 className="mt-3 font-rajdhani text-4xl font-bold text-white md:text-5xl leading-tight">
        {productTitle}
      </h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px] lg:items-start">
        {/* min-w-0: a grid item defaults to min-width:auto and would otherwise stretch to the
            preview row's min-content width (~920px), pushing the page off-screen on mobile. */}
        <div className="min-w-0 space-y-8">
          <p className="font-sans text-lg text-gray-400 leading-relaxed">
            One subscription unlocks the full Zen script library —{" "}
            <span className="font-bold text-white">200+ scripts</span> with more added frequently,
            plus weekly drops and 24/7 support. The previews below are just a sample.
          </p>

          <ul className="space-y-4">
            {ULTIMATE_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-cyan-accent" aria-hidden />
                <span className="font-sans text-sm text-gray-300 leading-relaxed">{feature}</span>
              </li>
            ))}
          </ul>

          <UltimateScriptPreviewRow />
        </div>

        <aside className="sticky top-28 border border-cyan-accent/30 bg-card-bg/60 p-8 shadow-2xl">
          <p className="font-rajdhani text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
            Monthly
          </p>
          <p className="mt-2 font-rajdhani text-5xl font-bold text-white tabular-nums">{price}</p>
          <p className="mt-1 font-sans text-sm text-gray-500">per month · cancel anytime</p>

          <SubscribePurchase
            defaultEmail={defaultEmail}
            signedInWithDiscord={signedInWithDiscord}
            discordUserName={discordUserName}
          />
        </aside>
      </div>
    </div>
  );
}

export function SubscribeProductStatic({
  defaultEmail = "",
  signedInWithDiscord = false,
  discordUserName = null,
}: {
  defaultEmail?: string;
  signedInWithDiscord?: boolean;
  discordUserName?: string | null;
}) {
  return (
    <SubscribeProduct
      price={formatSubscriptionPrice()}
      productTitle={getSubscriptionProductTitle()}
      defaultEmail={defaultEmail}
      signedInWithDiscord={signedInWithDiscord}
      discordUserName={discordUserName}
    />
  );
}
