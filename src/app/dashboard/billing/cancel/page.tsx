import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { clearPendingOvgcSession } from "@/lib/user-db";

export default async function BillingCancelPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth?callbackUrl=/dashboard");
  }

  const discordId = session.user.discordId;
  if (discordId) {
    await clearPendingOvgcSession(discordId);
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 pt-32 pb-24">
      <div className="rounded-none border border-white/10 bg-card-bg/40 p-8">
        <p className="font-rajdhani text-lg font-bold uppercase tracking-widest text-white">
          Checkout cancelled
        </p>
        <p className="mt-3 text-sm text-gray-400 leading-relaxed">
          No charge was made. You can return to the member hub and try again when you are ready.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block font-rajdhani text-sm font-bold uppercase tracking-widest text-cyan-accent hover:text-cyan-glow"
        >
          ← Back to member hub
        </Link>
      </div>
    </div>
  );
}
