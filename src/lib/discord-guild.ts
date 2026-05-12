import { getDiscordGuildEnv } from "@/lib/discord-config";

const DISCORD_API = "https://discord.com/api/v10";

type DiscordMemberPayload = {
  roles: string[];
};

async function botFetch(
  botToken: string,
  path: string,
  init?: RequestInit
): Promise<Response> {
  return fetch(`${DISCORD_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bot ${botToken}`,
      ...init?.headers,
    },
  });
}

/** Returns member payload or null if the user is not in the guild. */
export async function fetchGuildMember(
  guildId: string,
  userId: string,
  botToken: string
): Promise<DiscordMemberPayload | null> {
  const res = await botFetch(
    botToken,
    `/guilds/${guildId}/members/${userId}`,
    { method: "GET", cache: "no-store" }
  );
  if (res.status === 404) return null;
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Discord GET member failed (${res.status}): ${body}`);
  }
  return (await res.json()) as DiscordMemberPayload;
}

export async function addGuildMemberRole(
  guildId: string,
  userId: string,
  roleId: string,
  botToken: string
): Promise<void> {
  const res = await botFetch(
    botToken,
    `/guilds/${guildId}/members/${userId}/roles/${roleId}`,
    { method: "PUT" }
  );
  if (res.status === 204) return;
  const body = await res.text();
  throw new Error(`Discord PUT role failed (${res.status}): ${body}`);
}

export async function removeGuildMemberRole(
  guildId: string,
  userId: string,
  roleId: string,
  botToken: string
): Promise<void> {
  const res = await botFetch(
    botToken,
    `/guilds/${guildId}/members/${userId}/roles/${roleId}`,
    { method: "DELETE" }
  );
  if (res.status === 204) return;
  const body = await res.text();
  throw new Error(`Discord DELETE role failed (${res.status}): ${body}`);
}

export type DiscordAccessSnapshot =
  | {
      configured: false;
      reason: "missing_env";
    }
  | {
      configured: true;
      inGuild: false;
      hasPaidRole: false;
    }
  | {
      configured: true;
      inGuild: true;
      hasPaidRole: boolean;
    }
  | {
      configured: true;
      error: string;
    };

export async function getDiscordAccessSnapshot(
  discordUserId: string
): Promise<DiscordAccessSnapshot> {
  const env = getDiscordGuildEnv();
  if (!env) {
    return { configured: false, reason: "missing_env" };
  }

  try {
    const member = await fetchGuildMember(
      env.guildId,
      discordUserId,
      env.botToken
    );
    if (!member) {
      return { configured: true, inGuild: false, hasPaidRole: false };
    }
    const hasPaidRole = member.roles.includes(env.paidSubscriberRoleId);
    return { configured: true, inGuild: true, hasPaidRole };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown Discord error";
    return { configured: true, error: message };
  }
}

/** Call from payment webhooks when a subscription becomes active. */
export async function grantPaidSubscriberRole(
  discordUserId: string
): Promise<void> {
  const env = getDiscordGuildEnv();
  if (!env) throw new Error("Discord guild env is not configured");
  await addGuildMemberRole(
    env.guildId,
    discordUserId,
    env.paidSubscriberRoleId,
    env.botToken
  );
}

/** Call from payment webhooks when a subscription ends or is revoked. */
export async function revokePaidSubscriberRole(
  discordUserId: string
): Promise<void> {
  const env = getDiscordGuildEnv();
  if (!env) throw new Error("Discord guild env is not configured");
  await removeGuildMemberRole(
    env.guildId,
    discordUserId,
    env.paidSubscriberRoleId,
    env.botToken
  );
}
