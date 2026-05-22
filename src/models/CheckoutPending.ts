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
    transactionId: { type: String, required: true, unique: true, index: true },
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
