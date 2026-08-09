import mongoose from "mongoose";

const emails = process.argv.slice(2);
if (!emails.length) {
  console.error("Usage: node --env-file=.env scripts/check-subscriptions.mjs <email>...");
  process.exit(1);
}

const uri = process.env.MONGODB_URI?.trim();
if (!uri) {
  console.error("MONGODB_URI is not set");
  process.exit(1);
}

function isSubscriptionActive(user, now) {
  const paidStatus =
    user.paymentStatus === "active" || user.paymentStatus === "manual_active";
  const end = user.subscriptionCurrentPeriodEnd
    ? new Date(user.subscriptionCurrentPeriodEnd)
    : null;
  const expired = end ? end.getTime() <= now.getTime() : false;
  return { active: paidStatus && !expired, paidStatus, expired, end };
}

await mongoose.connect(uri, { family: 4, serverSelectionTimeoutMS: 15_000 });
const db = mongoose.connection.db;
const now = new Date();

for (const email of emails) {
  const norm = email.trim().toLowerCase();
  console.log(`\n========== ${email} ==========`);

  const users = await db
    .collection("users")
    .find({ email: norm })
    .toArray();

  if (!users.length) {
    console.log("User record: NOT FOUND by email");
  } else {
    for (const u of users) {
      const { active, paidStatus, expired, end } = isSubscriptionActive(u, now);
      console.log("User record:");
      console.log("  discordId:", u.discordId);
      console.log("  name:", u.name ?? "(none)");
      console.log("  paymentStatus:", u.paymentStatus);
      console.log("  subscriptionSource:", u.subscriptionSource);
      console.log(
        "  subscriptionExternalId:",
        u.subscriptionExternalId ?? "(none)"
      );
      console.log("  periodEnd:", end ? end.toISOString() : "(none)");
      console.log("  discordHasPaidRole:", u.discordHasPaidRole ?? false);
      console.log("  discordInGuild:", u.discordInGuild ?? "(unknown)");
      console.log(
        "  => subscriptionActive:",
        active ? "YES" : "NO",
        expired ? "(expired)" : !paidStatus ? "(not paid status)" : ""
      );
    }
  }

  const checkouts = await db
    .collection("checkoutpendings")
    .find({ email: norm })
    .sort({ createdAt: -1 })
    .toArray();

  if (!checkouts.length) {
    console.log("Checkout records: none");
  } else {
    console.log(`Checkout records (${checkouts.length}):`);
    for (const c of checkouts) {
      console.log("  orderUuid:", c.orderUuid);
      console.log("  status:", c.status);
      console.log("  transactionId:", c.transactionId);
      console.log("  discordId:", c.discordId ?? "(not linked)");
      console.log("  createdAt:", c.createdAt);
    }
  }

  const discordIds = users.map((u) => u.discordId).filter(Boolean);
  if (discordIds.length) {
    // "ovgcfulfillments" is the archive from the previous processor, kept for history.
    for (const collection of ["stripefulfillments", "ovgcfulfillments"]) {
      const fulfillments = await db
        .collection(collection)
        .find({ discordId: { $in: discordIds } })
        .sort({ createdAt: -1 })
        .toArray();

      if (!fulfillments.length) continue;

      console.log(`Fulfillment archive — ${collection} (${fulfillments.length}):`);
      for (const f of fulfillments) {
        console.log("  ref:", f.paymentRef ?? f.ovgcSessionId);
        console.log("  subscription:", f.stripeSubscriptionId ?? "(none)");
        console.log("  periodEnd:", f.periodEnd ?? "(none)");
        console.log("  amount:", f.amount ?? "(none)", f.currency ?? "");
      }
    }
  }
}

await mongoose.disconnect();
