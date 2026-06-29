"use client";

import { signInWithDiscordForOrder } from "@/actions/auth";
import { HexPrimaryCtaButton } from "@/components/ui/HexPrimaryCta";

type Props = {
  orderUuid: string;
  paymentEmail?: string;
  label?: string;
};

export function BillingActivateDiscordButton({
  orderUuid,
  paymentEmail,
  label = "Connect Discord & activate access",
}: Props) {
  return (
    <form action={signInWithDiscordForOrder} className="w-full space-y-3">
      <input type="hidden" name="order_uuid" value={orderUuid} />
      <HexPrimaryCtaButton type="submit" block>
        {label}
      </HexPrimaryCtaButton>
      {paymentEmail ? (
        <p className="font-sans text-xs text-gray-500 leading-relaxed text-center">
          Use the Discord account registered to{" "}
          <span className="font-semibold text-gray-300">{paymentEmail}</span> so we can
          match your payment automatically.
        </p>
      ) : null}
    </form>
  );
}
