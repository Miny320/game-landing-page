import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyCronRequest } from "@/lib/cron-auth";
import { expireSubscriptionsPastDue } from "@/lib/subscription-expiry";

export const runtime = "nodejs";

export async function GET(req: Request) {
  if (!verifyCronRequest(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = await expireSubscriptionsPastDue();

  if (result.revoked.length) {
    revalidatePath("/dashboard");
  }

  if (result.failed.length) {
    console.error("[cron/expire-subscriptions] partial failure:", result);
  } else if (result.revoked.length) {
    console.info("[cron/expire-subscriptions] revoked:", result.revoked.length);
  }

  return NextResponse.json(result);
}

export async function POST(req: Request) {
  return GET(req);
}
