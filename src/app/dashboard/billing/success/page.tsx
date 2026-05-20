import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserByDiscordId } from "@/lib/user-db";

export default async function BillingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order_uuid?: string }>;
}) {
  await searchParams;
  const session = await auth();
  if (!session?.user) {
    redirect("/auth?callbackUrl=/dashboard/billing/success");
  }

  const discordId = session.user.discordId;
  if (!discordId) {
    return (
      <BillingShell>
        <BillingMessage
          title="Missing Discord link"
          body="Sign out and sign in with Discord again, then contact support if this persists."
          variant="error"
        />
      </BillingShell>
    );
  }

  const user = await getUserByDiscordId(discordId);
  if (user?.paymentStatus === "active" && user.subscriptionSource === "ovgc") {
    redirect("/dashboard?billing=success");
  }

  return (
    <BillingShell>
      <BillingMessage
        title="Payment received"
        body="Thanks for subscribing. OVGC is confirming your payment via webhook — your Paid User role is applied automatically within a minute. Open your member hub and use Refresh status if needed."
        variant="pending"
        showDashboardLink
      />
    </BillingShell>
  );
}

function BillingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto max-w-2xl px-4 pt-32 pb-24">{children}</div>
  );
}

function BillingMessage({
  title,
  body,
  variant,
  showDashboardLink,
}: {
  title: string;
  body: string;
  variant: "error" | "pending";
  showDashboardLink?: boolean;
}) {
  const border =
    variant === "error"
      ? "border-red-500/35 bg-red-500/10"
      : "border-amber-500/35 bg-amber-500/10";
  const accent = variant === "error" ? "text-red-200" : "text-amber-200";

  return (
    <div className={`rounded-none border ${border} p-8`}>
      <p
        className={`font-rajdhani text-lg font-bold uppercase tracking-widest ${accent}`}
      >
        {title}
      </p>
      <p className="mt-3 text-sm text-gray-300 leading-relaxed">{body}</p>
      {showDashboardLink ? (
        <Link
          href="/dashboard"
          className="mt-6 inline-block font-rajdhani text-sm font-bold uppercase tracking-widest text-cyan-accent hover:text-cyan-glow"
        >
          Open member hub →
        </Link>
      ) : null}
    </div>
  );
}
