import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI?.trim();

const globalForMongoose = globalThis as typeof globalThis & {
  __mongooseConn?: Promise<typeof mongoose>;
};

/**
 * Returns false when MONGODB_URI is unset (app still runs; DB features are skipped).
 * Uses a cached promise so serverless does not open a new pool on every invocation.
 */
export async function connectMongo(): Promise<boolean> {
  if (!MONGODB_URI) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[db] MONGODB_URI is not set — user records will not persist.");
    }
    return false;
  }

  if (mongoose.connection.readyState === 1) {
    return true;
  }

  if (!globalForMongoose.__mongooseConn) {
    globalForMongoose.__mongooseConn = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      family: 4,
      serverSelectionTimeoutMS: 15_000,
    });
  }

  try {
    await globalForMongoose.__mongooseConn;
    return true;
  } catch (e) {
    console.error("[db] Mongo connection failed:", e);
    if (
      e instanceof Error &&
      "code" in e &&
      (e as NodeJS.ErrnoException).code === "ECONNREFUSED" &&
      typeof e.message === "string" &&
      e.message.includes("querySrv")
    ) {
      console.error(
        "[db] SRV DNS lookup failed. Try: (1) different network or DNS 1.1.1.1 / 8.8.8.8, (2) disable VPN, " +
          "(3) in Atlas Connect → Drivers, use the standard `mongodb://host1:27017,...` string instead of `mongodb+srv://`."
      );
    }
    globalForMongoose.__mongooseConn = undefined;
    return false;
  }
}
