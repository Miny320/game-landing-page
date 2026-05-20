import mongoose, { Schema, type InferSchemaType } from "mongoose";

const ovgcFulfillmentSchema = new Schema(
  {
    ovgcSessionId: { type: String, required: true, unique: true, index: true },
    discordId: { type: String, required: true, index: true },
    amount: { type: Number },
    currency: { type: String },
    eventType: { type: String },
  },
  { timestamps: true }
);

export type OvgcFulfillmentDoc = InferSchemaType<typeof ovgcFulfillmentSchema>;

export const OvgcFulfillment =
  (mongoose.models.OvgcFulfillment as mongoose.Model<OvgcFulfillmentDoc>) ??
  mongoose.model<OvgcFulfillmentDoc>("OvgcFulfillment", ovgcFulfillmentSchema);
