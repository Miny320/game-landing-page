"use server";

import { auth, signIn } from "@/auth";
import { isUserInGuild } from "@/lib/discord-join";
import { startOvgcCheckoutForSession } from "@/lib/ovgc-checkout-shared";
import { isManualSubscribeGrantEnabled } from "@/lib/discord-config";
import { isOvgcConfigured } from "@/lib/ovgc-config";
import { claimPaidRoleFromSubscribeButton } from "@/actions/discord-hub";

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

/** Upgrade: ensure Discord + guild (via OAuth if needed), then OVGC checkout. */
export async function handleUpgradeAccess(): Promise<AccessFlowResult> {
  const session = await auth();
  const discordId = session?.user?.discordId;

  if (!discordId) {
    await redirectToDiscordSignIn("upgrade");
  } else {
    const inGuild = await isUserInGuild(discordId);
    if (inGuild === false) {
      await redirectToDiscordSignIn("upgrade");
    }

    if (isOvgcConfigured()) {
      const checkout = await startOvgcCheckoutForSession(session);
      if (checkout.ok) {
        return { action: "checkout", checkoutUrl: checkout.checkoutUrl };
      }
      return {
        action: "error",
        message: checkout.message ?? "Could not start checkout.",
      };
    }

    if (isManualSubscribeGrantEnabled()) {
      const r = await claimPaidRoleFromSubscribeButton();
      if (r.ok) {
        return { action: "redirect", url: "/dashboard?billing=success" };
      }
      return {
        action: "error",
        message:
          r.error === "not_in_guild"
            ? "Join the Discord server first."
            : (r.message ?? "Could not grant access."),
      };
    }
  }

  return {
    action: "error",
    message: "Paid checkout is not configured yet.",
  };
}
