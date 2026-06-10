import mongoose, { Schema, type InferSchemaType } from "mongoose";

const ovgcFulfillmentSchema = new Schema(
  {
    ovgcSessionId: { type: String, required: true, unique: true, index: true },
    discordId: { type: String, required: true, index: true },
    amount: { type: Number },
    currency: { type: String },
    eventType: { type: String },
    /** Start of the access window granted by this fulfillment. */
    periodStart: { type: Date },
    /** When this payment’s access ends (same value stored on users.subscriptionCurrentPeriodEnd). */
    periodEnd: { type: Date, index: true },
  },
  { timestamps: true }
);

export type OvgcFulfillmentDoc = InferSchemaType<typeof ovgcFulfillmentSchema>;

export const OvgcFulfillment =
  (mongoose.models.OvgcFulfillment as mongoose.Model<OvgcFulfillmentDoc>) ??
  mongoose.model<OvgcFulfillmentDoc>("OvgcFulfillment", ovgcFulfillmentSchema);
