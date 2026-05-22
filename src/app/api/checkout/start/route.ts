import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { startOvgcCheckoutForSession } from "@/lib/ovgc-checkout-start";
import { getAppBaseUrl, isOvgcConfigured } from "@/lib/ovgc-config";

/** One-click checkout when Discord session already has an email (skips /checkout page). */
export async function GET() {
  const base = getAppBaseUrl();

  if (!isOvgcConfigured()) {
    return NextResponse.redirect(new URL("/subscribe", base));
  }

  const session = await auth();
  if (!session?.user?.email?.trim()) {
    return NextResponse.redirect(new URL("/subscribe#purchase", base));
  }

  const result = await startOvgcCheckoutForSession(session);
  if (result.ok) {
    return NextResponse.redirect(result.checkoutUrl);
  }

  const msg = encodeURIComponent(result.message ?? "Checkout could not start");
  return NextResponse.redirect(new URL(`/subscribe?error=${msg}#purchase`, base));
}
