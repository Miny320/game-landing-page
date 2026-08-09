/**
 * Sources that represent a real paid checkout.
 * "ovgc" is kept so subscribers from the previous processor keep access until their
 * period ends and they renew through Stripe.
 */
const PAID_CHECKOUT_SOURCES = new Set(["stripe", "ovgc"]);

export function isPaidCheckoutSource(source?: string | null): boolean {
  return Boolean(source && PAID_CHECKOUT_SOURCES.has(source));
}
