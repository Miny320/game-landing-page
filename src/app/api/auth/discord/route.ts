import { signIn } from "@/auth";
import type { NextRequest } from "next/server";

/**
 * Discord OAuth entry for flows that must start via redirect (e.g. Route Handler → redirect).
 * Auth.js v5 does not support GET /api/auth/signin/discord; signIn() performs the supported POST.
 */
export async function GET(req: NextRequest) {
  const callbackUrl = req.nextUrl.searchParams.get("callbackUrl")?.trim() || "/";
  await signIn("discord", { redirectTo: callbackUrl });
}
