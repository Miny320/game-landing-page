import { redirect } from "next/navigation";

/** Legacy URL — checkout now lives on the product page and hands off to Stripe Checkout. */
export default function CheckoutPage() {
  redirect("/subscribe#purchase");
}
