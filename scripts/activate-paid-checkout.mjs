/**
 * Manually activate a paid Stripe checkout for a user who paid by email but never
 * linked Discord.
 *
 * Usage:
 *   node --env-file=.env scripts/activate-paid-checkout.mjs \
 *     --email x@example.com --username discordname
 */
import mongoose from "mongoose";

const args = process.argv.slice(2);
function getArg(name) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : null;
}

const email = getArg("--email")?.trim().toLowerCase();
const username = getArg("--username")?.trim().toLowerCase();
const discordIdArg = getArg("--discord-id")?.trim();

if (!email || (!username && !discordIdArg)) {
  console.error(
    "Usage: node --env-file=.env scripts/activate-paid-checkout.mjs --email <email> (--username <discord> | --discord-id <id>)"
  );
  process.exit(1);
}

const uri = process.env.MONGODB_URI?.trim();
const guildId = process.env.DISCORD_GUILD_ID?.trim();
const roleId = process.env.DISCORD_SUBSCRIBER_ROLE_ID?.trim();
const botToken = process.env.DISCORD_BOT_TOKEN?.trim();
const periodDays = (() => {
  const n = parseInt(process.env.SUBSCRIPTION_PERIOD_DAYS?.trim() || "30", 10);
  return Number.isFinite(n) && n >= 1 ? n : 30;
})();
const amount = (() => {
  const cents = parseInt(
    process.env.STRIPE_SUBSCRIPTION_AMOUNT_CENTS?.trim() || "1999",
    10
  );
  return Number.isFinite(cents) ? cents / 100 : 19.99;
})();

if (!uri || !guildId || !roleId || !botToken) {
  console.error("Missing MONGODB_URI or Discord bot env vars.");
  process.exit(1);
}

async function discordFetch(path) {
  const res = await fetch(`https://discord.com/api/v10${path}`, {
    headers: { Authorization: `Bot ${botToken}` },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Discord ${path} (${res.status}): ${text}`);
  }
  return text ? JSON.parse(text) : null;
}

async function resolveDiscordId() {
  if (discordIdArg) return discordIdArg;

  const members = await discordFetch(
    `/guilds/${guildId}/members/search?query=${encodeURIComponent(username)}&limit=10`
  );

  const match =
    members.find((m) => m.user.username?.toLowerCase() === username) ??
    members.find((m) => m.user.global_name?.toLowerCase() === username) ??
    members[0];

  if (!match?.user?.id) {
    throw new Error(`No guild member found for username query: ${username}`);
  }

  console.log(
    `Resolved Discord: ${match.user.global_name ?? match.user.username} (@${match.user.username}) → ${match.user.id}`
  );
  return match.user.id;
}

async function grantRole(discordId) {
  const res = await fetch(
    `https://discord.com/api/v10/guilds/${guildId}/members/${discordId}/roles/${roleId}`,
    {
      method: "PUT",
      headers: { Authorization: `Bot ${botToken}` },
    }
  );
  if (res.status !== 204) {
    const body = await res.text();
    throw new Error(`Grant role failed (${res.status}): ${body}`);
  }
}

await mongoose.connect(uri, { family: 4, serverSelectionTimeoutMS: 15_000 });
const db = mongoose.connection.db;

const checkout = await db
  .collection("checkoutpendings")
  .findOne({ email, status: { $in: ["paid", "pending"] } });

if (!checkout?.transactionId) {
  console.error(`No paid/pending checkout found for ${email}`);
  process.exit(1);
}

const discordId = await resolveDiscordId();
const now = new Date();
const periodEnd = new Date(now.getTime() + periodDays * 86400000);
const periodStart = now;
const transactionId = checkout.transactionId;
const displayName = username ?? discordId;

console.log(`Activating ${email} → ${discordId} (checkout ${transactionId})`);

await grantRole(discordId);
console.log("Paid User role granted on Discord.");

await db.collection("users").updateOne(
  { discordId },
  {
    $set: {
      discordId,
      email,
      name: displayName,
      paymentStatus: "active",
      subscriptionSource: "stripe",
      subscriptionCurrentPeriodEnd: periodEnd,
      subscriptionExternalId: transactionId,
      discordHasPaidRole: true,
      discordInGuild: true,
      discordSyncedAt: now,
    },
    $unset: { pendingCheckoutOrderUuid: "", pendingCheckoutSessionId: "" },
  },
  { upsert: true }
);
console.log("User record updated.");

await db.collection("checkoutpendings").updateOne(
  { orderUuid: checkout.orderUuid },
  { $set: { status: "fulfilled", discordId } }
);
console.log("Checkout marked fulfilled.");

await db.collection("stripefulfillments").updateOne(
  { paymentRef: transactionId },
  {
    $set: {
      amount,
      currency: "USD",
      periodStart,
      periodEnd,
    },
    $setOnInsert: {
      paymentRef: transactionId,
      discordId,
      eventType: "manual_activation",
    },
  },
  { upsert: true }
);
console.log("Fulfillment archive upserted.");
console.log(`Active until: ${periodEnd.toISOString()}`);

await mongoose.disconnect();
