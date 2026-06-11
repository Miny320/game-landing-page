import Link from "next/link";
import { auth } from "@/auth";
import { tryFulfillCheckoutOrderForDiscord } from "@/lib/checkout-fulfillment";
import { getCheckoutPendingByOrderUuid } from "@/lib/checkout-pending-db";
import { formatSubscriptionPrice } from "@/lib/pricing";
import { DiscordJoinButton } from "@/components/ui/DiscordJoinButton";
import { getUserByDiscordId } from "@/lib/user-db";
import { redirect } from "next/navigation";

export default async function BillingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{
    order_uuid?: string;
    pending?: string;
    link_error?: string;
  }>;
}) {
  const params = await searchParams;
  const orderUuid = params.order_uuid?.trim();
  const linkError = params.link_error
    ? decodeURIComponent(params.link_error)
    : null;

  if (!orderUuid) {
    return (
      <BillingShell>
        <BillingMessage
          title="Missing order reference"
          body="Return to the store and try checkout again."
          variant="error"
          href="/subscribe"
          hrefLabel="View Ultimate access"
        />
      </BillingShell>
    );
  }

  const pending = await getCheckoutPendingByOrderUuid(orderUuid);
  const session = await auth();
  const discordId = session?.user?.discordId;
  const price = formatSubscriptionPrice();

  if (discordId) {
    const user = await getUserByDiscordId(discordId);
    if (user?.paymentStatus === "active" && user.subscriptionSource === "ovgc") {
      redirect("/dashboard?billing=success");
    }

    const link = await tryFulfillCheckoutOrderForDiscord(
      orderUuid,
      discordId,
      session.user.email
    );
    if (link.ok && link.fulfilled) {
      redirect("/dashboard?billing=success");
    }

    if (link.ok && !link.fulfilled) {
      return (
        <BillingShell>
          <BillingMessage
            title="Payment received"
            body={`Thanks for subscribing (${price}/mo). OVGC is confirming your payment — your Paid User role will apply automatically within a minute. Open your member hub and refresh status if needed.`}
            variant="pending"
            href="/dashboard"
            hrefLabel="Open member hub"
          />
        </BillingShell>
      );
    }

    if (!link.ok && link.reason === "not_in_guild") {
      return (
        <BillingShell>
          <BillingMessage
            title="Join our Discord server"
            body={
              link.message ??
              "Your payment is on file. Join the Sigma Scripts Discord server, then connect again to activate Ultimate access."
            }
            variant="pending"
            showDiscord
            orderUuid={orderUuid}
          />
        </BillingShell>
      );
    }

    if (!link.ok && linkError) {
      return (
        <BillingShell>
          <BillingMessage
            title="Could not activate yet"
            body={linkError}
            variant="error"
            showDiscord
            orderUuid={orderUuid}
          />
        </BillingShell>
      );
    }
  }

  const awaitingDiscord =
    pending?.status === "paid" || pending?.status === "pending" || !pending;

  return (
    <BillingShell>
      <BillingMessage
        title="Payment received"
        body={
          awaitingDiscord
            ? `Thanks for your order (${price}/mo). Connect Discord to join our server, receive your Paid User role, and unlock script downloads.`
            : `Your Ultimate access (${price}/mo) is being finalized. Connect Discord if you have not already.`
        }
        variant="pending"
        showDiscord
        orderUuid={orderUuid}
        href="/subscribe"
        hrefLabel="Back to product"
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
  showDiscord,
  orderUuid,
  href,
  hrefLabel,
}: {
  title: string;
  body: string;
  variant: "error" | "pending";
  showDiscord?: boolean;
  orderUuid?: string;
  href?: string;
  hrefLabel?: string;
}) {
  const border =
    variant === "error"
      ? "border-red-500/35 bg-red-500/10"
      : "border-cyan-accent/25 bg-cyan-accent/[0.06]";
  const accent = variant === "error" ? "text-red-200" : "text-cyan-accent";

  const discordHref = orderUuid
    ? `/api/auth/discord?callbackUrl=${encodeURIComponent(
        `/api/access/continue?intent=link_order&order_uuid=${orderUuid}`
      )}`
    : "/api/auth/discord";

  return (
    <div className={`rounded-none border ${border} p-8 md:p-10`}>
      <p className={`font-rajdhani text-lg font-bold uppercase tracking-widest ${accent}`}>
        {title}
      </p>
      <p className="mt-3 text-sm text-gray-300 leading-relaxed">{body}</p>

      {showDiscord ? (
        <div className="mt-8">
          <DiscordJoinButton href={discordHref} size="lg" variant="outline">
            Connect Discord &amp; activate access
          </DiscordJoinButton>
        </div>
      ) : null}

      {href && hrefLabel ? (
        <Link
          href={href}
          className="mt-6 inline-block font-rajdhani text-sm font-bold uppercase tracking-widest text-cyan-accent hover:text-cyan-glow"
        >
          {hrefLabel} →
        </Link>
      ) : null}
    </div>
  );
}
