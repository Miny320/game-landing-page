import { redirect } from "next/navigation";

/** Legacy cancel URL — use public billing cancel flow. */
export default async function BillingCancelPage({
  searchParams,
}: {
  searchParams: Promise<{ order_uuid?: string }>;
}) {
  const { order_uuid: orderUuid } = await searchParams;
  const q = orderUuid?.trim()
    ? `?order_uuid=${encodeURIComponent(orderUuid.trim())}`
    : "";
  redirect(`/billing/cancel${q}`);
}
