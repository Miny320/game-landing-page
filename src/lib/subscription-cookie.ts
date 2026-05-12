import { cookies } from "next/headers";

const COOKIE = "ss_sub_until";

export function getSubscriptionPeriodDays(): number {
  const raw = process.env.SUBSCRIPTION_PERIOD_DAYS?.trim();
  const n = raw ? parseInt(raw, 10) : 30;
  if (!Number.isFinite(n) || n < 1 || n > 365) return 30;
  return n;
}

export function computeSubscriptionPeriodEnd(): Date {
  const ms = getSubscriptionPeriodDays() * 86400000;
  return new Date(Date.now() + ms);
}

export async function getSubscriptionPeriodEndFromCookie(): Promise<Date | null> {
  const jar = await cookies();
  const v = jar.get(COOKIE)?.value;
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function setSubscriptionPeriodEndCookie(periodEnd: Date): Promise<void> {
  const jar = await cookies();
  const days = getSubscriptionPeriodDays();
  jar.set(COOKIE, periodEnd.toISOString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 86400 * Math.min(days + 14, 400),
  });
}
