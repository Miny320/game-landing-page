import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { tryFulfillCheckoutOrderForDiscord } from "@/lib/checkout-fulfillment";
import { isUserInGuild } from "@/lib/discord-join";
import { startOvgcCheckoutForSession } from "@/lib/ovgc-checkout-start";
import { isManualSubscribeGrantEnabled } from "@/lib/discord-config";
import { isOvgcConfigured } from "@/lib/ovgc-config";
import { claimPaidRoleFromSubscribeButton } from "@/actions/discord-hub";
import { getAppBaseUrl } from "@/lib/ovgc-config";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const intent = searchParams.get("intent");
  const orderUuid = searchParams.get("order_uuid")?.trim();
  const base = getAppBaseUrl();

  const session = await auth();
  const discordId = session?.user?.discordId;

  if (!discordId) {
    const url = new URL(req.url);
    const callbackPath = `${url.pathname}${url.search}`;
    const callback = encodeURIComponent(callbackPath);
    return NextResponse.redirect(
      new URL(`/api/auth/discord?callbackUrl=${callback}`, base)
    );
  }

  if (intent === "link_order" && orderUuid) {
    const inGuild = await isUserInGuild(discordId);
    if (inGuild === false) {
      const msg = encodeURIComponent("Join our Discord server to activate your subscription.");
      return NextResponse.redirect(
        new URL(`/billing/success?order_uuid=${orderUuid}&link_error=${msg}`, base)
      );
    }

    const link = await tryFulfillCheckoutOrderForDiscord(orderUuid, discordId);
    if (link.ok && link.fulfilled) {
      return NextResponse.redirect(new URL("/dashboard?billing=success", base));
    }
    if (link.ok && !link.fulfilled) {
      return NextResponse.redirect(
        new URL(`/billing/success?order_uuid=${orderUuid}&pending=1`, base)
      );
    }

    const msg =
      link.ok === false && "message" in link
        ? (link.message ?? "Could not link this order.")
        : "Could not link this order.";
    const err = encodeURIComponent(msg);
    return NextResponse.redirect(
      new URL(`/billing/success?order_uuid=${orderUuid}&link_error=${err}`, base)
    );
  }

  if (intent === "upgrade") {
    return NextResponse.redirect(new URL("/subscribe", base));
  }

  if (intent === "checkout") {
    if (!isOvgcConfigured()) {
      return NextResponse.redirect(new URL("/subscribe", base));
    }
    const checkout = await startOvgcCheckoutForSession(session);
    if (checkout.ok) {
      return NextResponse.redirect(checkout.checkoutUrl);
    }
    const msg = encodeURIComponent(checkout.message ?? "Checkout could not start");
    return NextResponse.redirect(new URL(`/subscribe?error=${msg}#purchase`, base));
  }

  if (intent === "upgrade_legacy") {
    if (isOvgcConfigured()) {
      const checkout = await startOvgcCheckoutForSession(session);
      if (checkout.ok) {
        return NextResponse.redirect(checkout.checkoutUrl);
      }
      const msg = encodeURIComponent(
        checkout.message ?? "Checkout could not start"
      );
      return NextResponse.redirect(new URL(`/subscribe?error=${msg}#purchase`, base));
    }

    if (isManualSubscribeGrantEnabled()) {
      const r = await claimPaidRoleFromSubscribeButton();
      if (r.ok) {
        return NextResponse.redirect(new URL("/dashboard?billing=success", base));
      }
    }

    return NextResponse.redirect(new URL("/subscribe#purchase", base));
  }

  return NextResponse.redirect(new URL("/#store", base));
}
