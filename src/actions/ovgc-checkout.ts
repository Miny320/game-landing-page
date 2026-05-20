"use server";

import { auth } from "@/auth";
import { startOvgcCheckoutForSession, type StartCheckoutResult } from "@/lib/ovgc-checkout-shared";

export type StartOvgcCheckoutResult = StartCheckoutResult;

export async function startOvgcCheckout(): Promise<StartOvgcCheckoutResult> {
  const session = await auth();
  return startOvgcCheckoutForSession(session);
}
