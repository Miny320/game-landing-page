import {
  getSubscriptionAmountCents,
  getSubscriptionCurrency,
  getSubscriptionProductName,
} from "@/lib/stripe-config";

export function formatSubscriptionPrice(): string {
  const cents = getSubscriptionAmountCents();
  const amount = cents / 100;
  const wholeUnits = cents % 100 === 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: getSubscriptionCurrency().toUpperCase(),
    minimumFractionDigits: wholeUnits ? 0 : 2,
    maximumFractionDigits: wholeUnits ? 0 : 2,
  }).format(amount);
}

export function getSubscriptionProductTitle(): string {
  return getSubscriptionProductName();
}

export const ULTIMATE_FEATURES = [
  "200+ premium scripts across all supported games",
  "New Ultimate scripts added weekly",
  "24/7 Discord support & setup guides",
  "Paid User role applied automatically after payment",
  "Secure Stripe checkout — cancel anytime",
] as const;

export const ULTIMATE_PREVIEW_SCRIPTS = [
  { game: "Arc Raiders", name: "Brave Aimers", image: "/scripts-visuals/arcraiders-braveaimers.png" },
  { game: "NBA 2K26", name: "Lethal Panda", image: "/scripts-visuals/nba2k26lethalpanda.png" },
  { game: "NBA 2K26", name: "Sosa Scripts", image: "/scripts-visuals/nba2k26sosacirpts.png" },
  { game: "Rainbow Six", name: "Brave Aimers", image: "/scripts-visuals/rainbowsixsiegebraveaimers.png" },
  { game: "Black Ops", name: "Feature Zens", image: "/scripts-visuals/blackopsfeaturezens.png" },
] as const;
