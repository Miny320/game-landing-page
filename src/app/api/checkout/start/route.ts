import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { startStripeCheckoutForSession } from "@/lib/stripe-checkout-start";
import { getAppBaseUrl, isStripeConfigured } from "@/lib/stripe-config";

/** One-click checkout when the Discord session already has an email (skips /checkout page). */
export async function GET() {
  const base = getAppBaseUrl();

  if (!isStripeConfigured()) {
    return NextResponse.redirect(new URL("/subscribe", base));
  }

  const session = await auth();
  if (!session?.user?.email?.trim()) {
    return NextResponse.redirect(new URL("/subscribe#purchase", base));
  }

  const result = await startStripeCheckoutForSession(session);
  if (result.ok) {
    return NextResponse.redirect(result.checkoutUrl);
  }

  const msg = encodeURIComponent(result.message ?? "Checkout could not start");
  return NextResponse.redirect(new URL(`/subscribe?error=${msg}#purchase`, base));
}
