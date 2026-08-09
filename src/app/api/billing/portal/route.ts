import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createBillingPortalSession } from "@/lib/stripe-client";
import { getAppBaseUrl, isStripeConfigured } from "@/lib/stripe-config";
import { getUserByDiscordId } from "@/lib/user-db";

export const runtime = "nodejs";

/**
 * Sends a subscriber to the Stripe Billing Portal to update their card,
 * see invoices, or cancel. Requires a Stripe customer on their account.
 */
export async function GET() {
  const base = getAppBaseUrl();

  if (!isStripeConfigured()) {
    return NextResponse.redirect(new URL("/dashboard", base));
  }

  const session = await auth();
  const discordId = session?.user?.discordId;
  if (!discordId) {
    return NextResponse.redirect(new URL("/dashboard", base));
  }

  const user = await getUserByDiscordId(discordId);
  const customerId = user?.stripeCustomerId?.trim();
  if (!customerId) {
    const msg = encodeURIComponent(
      "No Stripe billing record found for this account yet."
    );
    return NextResponse.redirect(new URL(`/dashboard?billing_error=${msg}`, base));
  }

  try {
    const url = await createBillingPortalSession({
      customerId,
      returnUrl: `${base}/dashboard`,
    });
    return NextResponse.redirect(url);
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Could not open the billing portal";
    console.error("[billing portal]", message);
    return NextResponse.redirect(
      new URL(`/dashboard?billing_error=${encodeURIComponent(message)}`, base)
    );
  }
}
