import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { SubscribePurchase } from "@/components/subscribe/SubscribePurchase";
import {
  formatSubscriptionPrice,
  getSubscriptionProductTitle,
  ULTIMATE_FEATURES,
  ULTIMATE_PREVIEW_SCRIPTS,
} from "@/lib/pricing";

type Props = {
  price: string;
  productTitle: string;
  defaultEmail?: string;
  signedInWithDiscord?: boolean;
};

export function SubscribeProduct({
  price,
  productTitle,
  defaultEmail = "",
  signedInWithDiscord = false,
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
        <div className="space-y-8">
          <p className="font-sans text-lg text-gray-400 leading-relaxed">
            One subscription unlocks the full Zen script library — 200+ scripts, weekly drops,
            and 24/7 support. Preview the Ultimate lineup below, then purchase when you are ready.
          </p>

          <ul className="space-y-4">
            {ULTIMATE_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-cyan-accent" aria-hidden />
                <span className="font-sans text-sm text-gray-300 leading-relaxed">{feature}</span>
              </li>
            ))}
          </ul>

          <div className="flex gap-4 overflow-x-auto pb-2">
            {ULTIMATE_PREVIEW_SCRIPTS.map((script) => (
              <div
                key={`${script.game}-${script.name}`}
                className="relative w-[140px] shrink-0 overflow-hidden border border-amber-400/40 bg-black/50 sm:w-[160px]"
              >
                <div className="absolute right-2 top-2 z-10 bg-amber-400 px-2 py-0.5 font-rajdhani text-[9px] font-black uppercase tracking-widest text-black">
                  Ultimate
                </div>
                <div className="relative aspect-[4/5] w-full">
                  <Image
                    src={script.image}
                    alt={`${script.name} — ${script.game}`}
                    fill
                    className="object-cover opacity-90"
                    sizes="160px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <p className="font-rajdhani text-[9px] font-bold uppercase tracking-wider text-gray-400">
                      {script.game}
                    </p>
                    <p className="font-rajdhani text-xs font-bold text-white">{script.name}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
          />
        </aside>
      </div>
    </div>
  );
}

export function SubscribeProductStatic({
  defaultEmail = "",
  signedInWithDiscord = false,
}: {
  defaultEmail?: string;
  signedInWithDiscord?: boolean;
}) {
  return (
    <SubscribeProduct
      price={formatSubscriptionPrice()}
      productTitle={getSubscriptionProductTitle()}
      defaultEmail={defaultEmail}
      signedInWithDiscord={signedInWithDiscord}
    />
  );
}
