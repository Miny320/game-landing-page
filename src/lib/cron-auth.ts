import { timingSafeEqual } from "crypto";

function secretsMatch(provided: string, expected: string): boolean {
  try {
    const a = Buffer.from(provided, "utf8");
    const b = Buffer.from(expected, "utf8");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/** Protects scheduled jobs — set CRON_SECRET in production (Vercel Cron sends Authorization: Bearer). */
export function verifyCronRequest(req: Request): boolean {
  const expected = process.env.CRON_SECRET?.trim();
  if (!expected) return false;

  const auth = req.headers.get("authorization")?.trim();
  if (auth?.startsWith("Bearer ")) {
    return secretsMatch(auth.slice(7).trim(), expected);
  }

  const header = req.headers.get("x-cron-secret")?.trim();
  if (header && secretsMatch(header, expected)) return true;

  try {
    const url = new URL(req.url);
    const query = url.searchParams.get("secret")?.trim();
    if (query && secretsMatch(query, expected)) return true;
  } catch {
    /* ignore */
  }

  return false;
}
