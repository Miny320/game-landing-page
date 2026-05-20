import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { startOvgcCheckoutForSession } from "@/lib/ovgc-checkout-shared";
import { isManualSubscribeGrantEnabled } from "@/lib/discord-config";
import { isOvgcConfigured } from "@/lib/ovgc-config";
import { claimPaidRoleFromSubscribeButton } from "@/actions/discord-hub";
import { getAppBaseUrl } from "@/lib/ovgc-config";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const intent = searchParams.get("intent");
  const base = getAppBaseUrl();

  const session = await auth();
  if (!session?.user?.discordId) {
    const url = new URL(req.url);
    const callbackPath = `${url.pathname}${url.search}`;
    const callback = encodeURIComponent(callbackPath);
    return NextResponse.redirect(
      new URL(`/api/auth/discord?callbackUrl=${callback}`, base)
    );
  }

  if (intent === "upgrade") {
    if (isOvgcConfigured()) {
      const checkout = await startOvgcCheckoutForSession(session);
      if (checkout.ok) {
        return NextResponse.redirect(checkout.checkoutUrl);
      }
      const msg = encodeURIComponent(
        checkout.message ?? "Checkout could not start"
      );
      return NextResponse.redirect(new URL(`/#store?checkout_error=${msg}`, base));
    }

    if (isManualSubscribeGrantEnabled()) {
      const r = await claimPaidRoleFromSubscribeButton();
      if (r.ok) {
        return NextResponse.redirect(new URL("/dashboard?billing=success", base));
      }
    }

    return NextResponse.redirect(new URL("/#store?checkout_error=1", base));
  }

  return NextResponse.redirect(new URL("/#scripts", base));
}
