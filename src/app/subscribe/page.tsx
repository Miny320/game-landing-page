import { auth } from "@/auth";
import { Suspense } from "react";
import { SubscribeProductStatic } from "@/components/subscribe/SubscribeProduct";
import { isOvgcConfigured } from "@/lib/ovgc-config";
import Link from "next/link";

export const metadata = {
  title: "Ultimate Access | Sigma Scripts",
  description: "Unlock the full Zen script library with one monthly subscription.",
};

export default async function SubscribePage() {
  const checkoutReady = isOvgcConfigured();
  const session = await auth();
  const defaultEmail = session?.user?.email?.trim() ?? "";
  const signedInWithDiscord = Boolean(session?.user?.discordId);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute top-0 left-1/2 h-[600px] w-[600px] -translate-x-1/2 bg-cyan-accent/10 blur-[140px]" />

      {!checkoutReady ? (
        <div className="container relative z-10 mx-auto max-w-2xl px-4 pt-32 pb-8">
          <div className="border border-amber-500/35 bg-amber-500/10 p-6">
            <p className="font-rajdhani text-sm font-bold uppercase tracking-widest text-amber-200">
              Checkout not configured
            </p>
            <p className="mt-2 text-sm text-gray-300">
              OVGC billing is not set up on this environment yet.
            </p>
          </div>
        </div>
      ) : null}

      <Suspense fallback={null}>
        <SubscribeProductStatic
          defaultEmail={defaultEmail}
          signedInWithDiscord={signedInWithDiscord}
        />
      </Suspense>

      <div className="container mx-auto max-w-5xl px-4 pb-16">
        <Link
          href="/#store"
          className="font-rajdhani text-sm font-bold uppercase tracking-widest text-gray-500 hover:text-cyan-accent"
        >
          ← Back to store
        </Link>
      </div>
    </div>
  );
}
