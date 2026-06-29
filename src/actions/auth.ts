"use server";

import { signIn } from "@/auth";

/** Default Discord sign-in (member hub). */
export async function signInWithDiscord() {
  await signIn("discord", { redirectTo: "/dashboard" });
}

export async function signInWithDiscordForSubscribe() {
  await signIn("discord", { redirectTo: "/subscribe#purchase" });
}

/** After email checkout — link paid order and grant Paid User role. */
export async function signInWithDiscordForOrder(formData: FormData) {
  const orderUuid = String(formData.get("order_uuid") ?? "").trim();
  if (!orderUuid) {
    throw new Error("Missing order reference.");
  }
  const redirectTo = `/api/access/continue?intent=link_order&order_uuid=${encodeURIComponent(orderUuid)}`;
  await signIn("discord", { redirectTo });
}
