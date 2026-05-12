import mongoose, { Schema, type InferSchemaType } from "mongoose";

const paymentStatusValues = [
  "none",
  "manual_active",
  "active",
  "past_due",
  "canceled",
] as const;

const subscriptionSourceValues = ["none", "manual_hub", "ovgc"] as const;

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
    /** Optional external id when OVGC / other billing is wired. */
    subscriptionExternalId: { type: String },
  },
  { timestamps: true }
);

export type UserDoc = InferSchemaType<typeof userSchema>;

export const User =
  (mongoose.models.User as mongoose.Model<UserDoc>) ??
  mongoose.model<UserDoc>("User", userSchema);
