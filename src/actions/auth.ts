"use server";

import { signIn } from "@/auth";

/** GET /api/auth/signin/:provider is unsupported in Auth.js v5 (throws UnknownAction); use this from a form action instead. */
export async function signInWithDiscord() {
  await signIn("discord", { redirectTo: "/" });
}
