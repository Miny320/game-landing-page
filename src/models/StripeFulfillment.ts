import mongoose, { Schema, type InferSchemaType } from "mongoose";

const stripeFulfillmentSchema = new Schema(
  {
    /** Stripe Checkout Session id (first payment) or Invoice id (renewals) — idempotency key. */
    paymentRef: { type: String, required: true, unique: true, index: true },
    discordId: { type: String, required: true, index: true },
    stripeCustomerId: { type: String, index: true },
    stripeSubscriptionId: { type: String, index: true },
    /** Charged amount in major units (e.g. 19.99). */
    amount: { type: Number },
    currency: { type: String },
    /** Stripe event type that produced this record. */
    eventType: { type: String },
    /** Start of the access window granted by this payment. */
    periodStart: { type: Date },
    /** When this payment's access ends (mirrors users.subscriptionCurrentPeriodEnd). */
    periodEnd: { type: Date, index: true },
  },
  { timestamps: true }
);

export type StripeFulfillmentDoc = InferSchemaType<typeof stripeFulfillmentSchema>;

export const StripeFulfillment =
  (mongoose.models.StripeFulfillment as mongoose.Model<StripeFulfillmentDoc>) ??
  mongoose.model<StripeFulfillmentDoc>(
    "StripeFulfillment",
    stripeFulfillmentSchema
  );
