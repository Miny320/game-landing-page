"use server";

import { auth, signIn } from "@/auth";
import { isUserInGuild } from "@/lib/discord-join";
const CONTINUE_BASE = "/api/access/continue";

export type AccessFlowResult =
  | { action: "redirect"; url: string }
  | { action: "checkout"; checkoutUrl: string }
  | { action: "error"; message: string };

/** Auth.js v5 rejects GET /signin/[provider]; use signIn() which POSTs with CSRF handled. */
async function redirectToDiscordSignIn(intent: "free" | "upgrade") {
  await signIn("discord", {
    redirectTo: `${CONTINUE_BASE}?intent=${intent}`,
  });
}

/** Free: Discord login + auto guild join (no script downloads). */
export async function handleFreeAccess(): Promise<AccessFlowResult> {
  const session = await auth();
  const discordId = session?.user?.discordId;

  if (!discordId) {
    await redirectToDiscordSignIn("free");
  } else {
    const inGuild = await isUserInGuild(discordId);
    if (inGuild === false) {
      await redirectToDiscordSignIn("free");
    }
  }

  return { action: "redirect", url: "/#store" };
}

/** Upgrade: product page → checkout (Discord after payment). */
export async function handleUpgradeAccess(): Promise<AccessFlowResult> {
  return { action: "redirect", url: "/subscribe" };
}
