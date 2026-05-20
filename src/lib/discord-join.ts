import { getDiscordGuildEnv } from "@/lib/discord-config";
import { fetchGuildMember } from "@/lib/discord-guild";

const DISCORD_API = "https://discord.com/api/v10";

export type GuildJoinResult =
  | { ok: true; status: "joined" | "already_member" }
  | { ok: false; reason: "not_configured" | "discord_error"; message?: string };

/**
 * Adds the user to the configured guild using their OAuth access token (`guilds.join` scope).
 * @see https://discord.com/developers/docs/resources/guild#add-guild-member
 */
export async function addGuildMemberViaOAuth(
  discordUserId: string,
  oauthAccessToken: string
): Promise<GuildJoinResult> {
  const env = getDiscordGuildEnv();
  if (!env) {
    return { ok: false, reason: "not_configured" };
  }

  try {
    const existing = await fetchGuildMember(
      env.guildId,
      discordUserId,
      env.botToken
    );
    if (existing) {
      return { ok: true, status: "already_member" };
    }

    const res = await fetch(
      `${DISCORD_API}/guilds/${env.guildId}/members/${discordUserId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bot ${env.botToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ access_token: oauthAccessToken }),
      }
    );

    if (res.status === 201 || res.status === 204) {
      return { ok: true, status: "joined" };
    }

    const body = await res.text();
    return {
      ok: false,
      reason: "discord_error",
      message: `Discord guild join failed (${res.status}): ${body.slice(0, 200)}`,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Guild join request failed";
    return { ok: false, reason: "discord_error", message };
  }
}

export async function isUserInGuild(discordUserId: string): Promise<boolean | null> {
  const env = getDiscordGuildEnv();
  if (!env) return null;
  try {
    const member = await fetchGuildMember(
      env.guildId,
      discordUserId,
      env.botToken
    );
    return member != null;
  } catch {
    return null;
  }
}
