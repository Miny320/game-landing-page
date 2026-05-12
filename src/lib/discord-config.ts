export type DiscordGuildEnv = {
  guildId: string;
  paidSubscriberRoleId: string;
  botToken: string;
};

export function getDiscordGuildEnv(): DiscordGuildEnv | null {
  const guildId = process.env.DISCORD_GUILD_ID?.trim();
  const paidSubscriberRoleId = process.env.DISCORD_SUBSCRIBER_ROLE_ID?.trim();
  const botToken = process.env.DISCORD_BOT_TOKEN?.trim();
  if (!guildId || !paidSubscriberRoleId || !botToken) return null;
  return { guildId, paidSubscriberRoleId, botToken };
}

/** Public invite to the community server (browser-safe). */
export function getDiscordInviteUrl(): string | null {
  const u = process.env.NEXT_PUBLIC_DISCORD_INVITE_URL?.trim();
  return u || null;
}

/**
 * Hub “Subscribe for full access” can assign the Paid User role without Stripe.
 * Set `DISCORD_DISABLE_MANUAL_SUBSCRIBE_GRANT=true` when webhooks should be the only source of truth.
 */
export function isManualSubscribeGrantEnabled(): boolean {
  return process.env.DISCORD_DISABLE_MANUAL_SUBSCRIBE_GRANT?.trim() !== "true";
}
