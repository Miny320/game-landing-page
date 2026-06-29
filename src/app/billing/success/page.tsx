import Link from "next/link";
import { auth } from "@/auth";
import { tryFulfillCheckoutOrderForDiscord } from "@/lib/checkout-fulfillment";
import { getCheckoutPendingByOrderUuid } from "@/lib/checkout-pending-db";
import { formatSubscriptionPrice } from "@/lib/pricing";
import { BillingActivateDiscordButton } from "@/components/billing/BillingActivateDiscordButton";
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
  const paymentEmail = pending?.email?.trim().toLowerCase() ?? null;
  const sessionEmail = session?.user?.email?.trim().toLowerCase() ?? null;
  const emailMismatch =
    Boolean(paymentEmail && sessionEmail) && paymentEmail !== sessionEmail;

  if (discordId) {
    const user = await getUserByDiscordId(discordId);
    if (user?.paymentStatus === "active" && user.subscriptionSource === "ovgc") {
      redirect("/dashboard?billing=success");
    }

    const link = await tryFulfillCheckoutOrderForDiscord(
      orderUuid,
      discordId,
      session.user.email ?? pending?.email
    );
    if (link.ok && link.fulfilled) {
      redirect("/dashboard?billing=success");
    }

    if (link.ok && !link.fulfilled) {
      return (
        <BillingShell>
          <ActivationSteps paymentConfirmed={pending?.status === "paid"} />
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
          <ActivationSteps paymentConfirmed={pending?.status === "paid"} />
          <BillingMessage
            title="Join our Discord server"
            body={
              link.message ??
              "Your payment is on file. Join the Sigma Scripts Discord server, then return here to activate Ultimate access."
            }
            variant="pending"
            orderUuid={orderUuid}
            paymentEmail={paymentEmail ?? undefined}
            showActivate
          />
        </BillingShell>
      );
    }

    if (!link.ok && link.reason === "already_linked_other") {
      return (
        <BillingShell>
          <ActivationSteps paymentConfirmed={pending?.status === "paid"} />
          <BillingMessage
            title="Order linked to another account"
            body={
              link.message ??
              "This payment is linked to a different Discord account. Sign in with the Discord account that matches your payment email, or contact support."
            }
            variant="error"
            orderUuid={orderUuid}
            paymentEmail={paymentEmail ?? undefined}
            showActivate
            href="/subscribe"
            hrefLabel="Back to product"
          />
        </BillingShell>
      );
    }

    if (!link.ok && (linkError || link.message)) {
      return (
        <BillingShell>
          <ActivationSteps paymentConfirmed={pending?.status === "paid"} />
          <BillingMessage
            title="Could not activate yet"
            body={linkError ?? link.message ?? "Try connecting Discord again."}
            variant="error"
            orderUuid={orderUuid}
            paymentEmail={paymentEmail ?? undefined}
            showActivate
            emailMismatch={emailMismatch}
            sessionEmail={sessionEmail ?? undefined}
          />
        </BillingShell>
      );
    }

    if (!link.ok) {
      return (
        <BillingShell>
          <ActivationSteps paymentConfirmed={pending?.status === "paid"} />
          <BillingMessage
            title="Almost there"
            body="Your payment is on file. Connect Discord below to activate your Paid User role on our server."
            variant="pending"
            orderUuid={orderUuid}
            paymentEmail={paymentEmail ?? undefined}
            showActivate
            emailMismatch={emailMismatch}
            sessionEmail={sessionEmail ?? undefined}
            href="/dashboard"
            hrefLabel="Open member hub"
          />
        </BillingShell>
      );
    }
  }

  const paymentConfirmed = pending?.status === "paid";
  const paymentPending = pending?.status === "pending";

  return (
    <BillingShell>
      <ActivationSteps paymentConfirmed={paymentConfirmed} />

      <BillingMessage
        title={paymentConfirmed ? "Payment confirmed" : "Payment received"}
        body={
          paymentConfirmed
            ? `Your ${price}/mo subscription is paid. This is the final step: connect Discord with ${paymentEmail ?? "the same email you paid with"} to receive your Paid User role and unlock script downloads.`
            : paymentPending
              ? `Thanks for your order (${price}/mo). When OVGC confirms payment, connect Discord with the same email you used at checkout to activate your Paid User role.`
              : `Your Ultimate access (${price}/mo) is being finalized. Connect Discord to activate your subscription on our server.`
        }
        variant="pending"
        orderUuid={orderUuid}
        paymentEmail={paymentEmail ?? undefined}
        showActivate
        href="/subscribe"
        hrefLabel="Back to product"
      />
    </BillingShell>
  );
}

function BillingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto max-w-2xl px-4 pt-32 pb-24 space-y-6">
      {children}
    </div>
  );
}

function ActivationSteps({ paymentConfirmed }: { paymentConfirmed?: boolean }) {
  return (
    <ol className="grid gap-3 sm:grid-cols-2">
      <li className="border border-cyan-accent/30 bg-cyan-accent/[0.08] px-4 py-3">
        <p className="font-rajdhani text-[10px] font-black uppercase tracking-[0.2em] text-cyan-accent">
          Step 1 · Payment
        </p>
        <p className="mt-1 font-sans text-sm text-white">
          {paymentConfirmed ? "Confirmed" : "Processing"}
        </p>
      </li>
      <li className="border border-white/15 bg-white/[0.03] px-4 py-3">
        <p className="font-rajdhani text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
          Step 2 · Discord
        </p>
        <p className="mt-1 font-sans text-sm text-gray-300">Connect to activate access</p>
      </li>
    </ol>
  );
}

function BillingMessage({
  title,
  body,
  variant,
  showActivate,
  orderUuid,
  paymentEmail,
  emailMismatch,
  sessionEmail,
  href,
  hrefLabel,
}: {
  title: string;
  body: string;
  variant: "error" | "pending";
  showActivate?: boolean;
  orderUuid?: string;
  paymentEmail?: string;
  emailMismatch?: boolean;
  sessionEmail?: string;
  href?: string;
  hrefLabel?: string;
}) {
  const border =
    variant === "error"
      ? "border-red-500/35 bg-red-500/10"
      : "border-cyan-accent/25 bg-cyan-accent/[0.06]";
  const accent = variant === "error" ? "text-red-200" : "text-cyan-accent";

  return (
    <div className={`rounded-none border ${border} p-8 md:p-10`}>
      <p className={`font-rajdhani text-lg font-bold uppercase tracking-widest ${accent}`}>
        {title}
      </p>
      <p className="mt-3 text-sm text-gray-300 leading-relaxed">{body}</p>

      {emailMismatch && paymentEmail && sessionEmail ? (
        <p className="mt-4 rounded-none border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/95 leading-relaxed">
          You signed in as <span className="font-semibold">{sessionEmail}</span>, but this order
          was paid with <span className="font-semibold">{paymentEmail}</span>. Sign out and
          connect Discord using the payment email, or contact support if you need help.
        </p>
      ) : null}

      {showActivate && orderUuid ? (
        <div className="mt-8">
          <BillingActivateDiscordButton
            orderUuid={orderUuid}
            paymentEmail={paymentEmail}
          />
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
