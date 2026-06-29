import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyCronRequest } from "@/lib/cron-auth";
import { retryAllStuckPaidCheckouts } from "@/lib/paid-checkout-retry";

export const runtime = "nodejs";

export async function GET(req: Request) {
  if (!verifyCronRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = await retryAllStuckPaidCheckouts();

  if (result.fulfilled > 0) {
    revalidatePath("/dashboard");
    console.info(
      "[cron/retry-checkout-fulfillment] fulfilled:",
      result.fulfilled,
      "awaiting_discord:",
      result.awaitingDiscord
    );
  }

  if (result.failed.length) {
    console.error("[cron/retry-checkout-fulfillment] failures:", result.failed);
  }

  return NextResponse.json(result);
}

export async function POST(req: Request) {
  return GET(req);
}
