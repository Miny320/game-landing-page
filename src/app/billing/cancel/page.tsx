import Link from "next/link";
import { auth } from "@/auth";
import { markCheckoutPendingCanceled } from "@/lib/checkout-pending-db";
import { clearPendingCheckoutSession } from "@/lib/user-db";

export default async function BillingCancelPage({
  searchParams,
}: {
  searchParams: Promise<{ order_uuid?: string }>;
}) {
  const { order_uuid: orderUuid } = await searchParams;

  if (orderUuid?.trim()) {
    await markCheckoutPendingCanceled(orderUuid.trim());
  }

  const session = await auth();
  const discordId = session?.user?.discordId;
  if (discordId) {
    await clearPendingCheckoutSession(discordId);
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 pt-32 pb-24">
      <div className="rounded-none border border-white/10 bg-card-bg/40 p-8 md:p-10">
        <p className="font-rajdhani text-lg font-bold uppercase tracking-widest text-white">
          Checkout cancelled
        </p>
        <p className="mt-3 text-sm text-gray-400 leading-relaxed">
          No charge was made. You can review Ultimate access and try again when you are ready.
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <Link
            href="/subscribe"
            className="font-rajdhani text-sm font-bold uppercase tracking-widest text-cyan-accent hover:text-cyan-glow"
          >
            View product →
          </Link>
          <Link
            href="/subscribe#purchase"
            className="font-rajdhani text-sm font-bold uppercase tracking-widest text-gray-500 hover:text-white"
          >
            Try again
          </Link>
        </div>
      </div>
    </div>
  );
}
