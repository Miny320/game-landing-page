import {
  getOvgcProductTitle,
  getOvgcSubscriptionAmountCents,
} from "@/lib/ovgc-config";

export function formatSubscriptionPrice(): string {
  const cents = getOvgcSubscriptionAmountCents();
  const dollars = cents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(dollars);
}

export function getSubscriptionProductTitle(): string {
  return getOvgcProductTitle();
}

export const ULTIMATE_FEATURES = [
  "200+ premium scripts across all supported games",
  "New Ultimate scripts added weekly",
  "24/7 Discord support & setup guides",
  "Paid User role applied automatically after payment",
  "Secure OVGC checkout — cancel anytime",
] as const;

export const ULTIMATE_PREVIEW_SCRIPTS = [
  { game: "Arc Raiders", name: "Brave Aimers", image: "/scripts-visuals/arcraiders-braveaimers.png" },
  { game: "NBA 2K26", name: "Lethal Panda", image: "/scripts-visuals/nba2k26lethalpanda.png" },
  { game: "NBA 2K26", name: "Sosa Scripts", image: "/scripts-visuals/nba2k26sosacirpts.png" },
  { game: "Rainbow Six", name: "Brave Aimers", image: "/scripts-visuals/rainbowsixsiegebraveaimers.png" },
  { game: "Black Ops", name: "Feature Zens", image: "/scripts-visuals/blackopsfeaturezens.png" },
] as const;
