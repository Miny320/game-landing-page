import { redirect } from "next/navigation";

/** Legacy URL — checkout is on the product page + OVGC hosted payment (BraveAimers-style). */
export default function CheckoutPage() {
  redirect("/subscribe#purchase");
}
