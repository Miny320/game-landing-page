import mongoose, { Schema, type InferSchemaType } from "mongoose";

const checkoutStatusValues = [
  "pending",
  "paid",
  "fulfilled",
  "canceled",
] as const;

const checkoutPendingSchema = new Schema(
  {
    orderUuid: { type: String, required: true, unique: true, index: true },
    /** Stripe Checkout Session id (`cs_...`) for this attempt. */
    transactionId: { type: String, required: true, index: true },
    /** Same Stripe Checkout Session id, kept for lookups by session. */
    checkoutSessionId: { type: String, index: true },
    /** Related Stripe ids (subscription, invoice, customer) learned from webhooks. */
    alternateIds: { type: [String], default: [], index: true },
    stripeCustomerId: { type: String, index: true },
    stripeSubscriptionId: { type: String, index: true },
    email: { type: String, required: true, index: true },
    discordId: { type: String, index: true },
    status: {
      type: String,
      enum: checkoutStatusValues,
      default: "pending",
    },
  },
  { timestamps: true }
);

export type CheckoutPendingDoc = InferSchemaType<typeof checkoutPendingSchema>;

export const CheckoutPending =
  (mongoose.models.CheckoutPending as mongoose.Model<CheckoutPendingDoc>) ??
  mongoose.model<CheckoutPendingDoc>("CheckoutPending", checkoutPendingSchema);
