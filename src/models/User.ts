import mongoose, { Schema, type InferSchemaType } from "mongoose";

const paymentStatusValues = [
  "none",
  "manual_active",
  "active",
  "past_due",
  "canceled",
] as const;

/** "ovgc" is retained so subscribers from the previous processor stay valid. */
const subscriptionSourceValues = ["none", "manual_hub", "stripe", "ovgc"] as const;

const userSchema = new Schema(
  {
    discordId: { type: String, required: true, unique: true, index: true },
    name: { type: String },
    image: { type: String },
    email: { type: String },
    /** Last known membership in the configured Discord guild (from bot API). */
    discordInGuild: { type: Boolean },
    /** Last known Paid User role in that guild. */
    discordHasPaidRole: { type: Boolean, default: false },
    discordSyncedAt: { type: Date },
    paymentStatus: {
      type: String,
      enum: paymentStatusValues,
      default: "none",
    },
    subscriptionCurrentPeriodEnd: { type: Date },
    subscriptionSource: {
      type: String,
      enum: subscriptionSourceValues,
      default: "none",
    },
    /** Stripe subscription id (or the legacy processor's transaction id on old rows). */
    subscriptionExternalId: { type: String },
    /** Stripe customer id — reused across checkouts and required by the billing portal. */
    stripeCustomerId: { type: String, index: true },
    /** Stripe subscription id, used to resolve renewal and cancellation webhooks. */
    stripeSubscriptionId: { type: String, index: true },
    /** True when the subscriber cancelled but the paid period has not ended yet. */
    subscriptionCancelAtPeriodEnd: { type: Boolean, default: false },
    /** Our order_uuid for the checkout currently in flight. */
    pendingCheckoutOrderUuid: { type: String },
    /** Stripe Checkout Session id for the checkout currently in flight. */
    pendingCheckoutSessionId: { type: String, index: true },
  },
  { timestamps: true }
);

export type UserDoc = InferSchemaType<typeof userSchema>;

export const User =
  (mongoose.models.User as mongoose.Model<UserDoc>) ??
  mongoose.model<UserDoc>("User", userSchema);
