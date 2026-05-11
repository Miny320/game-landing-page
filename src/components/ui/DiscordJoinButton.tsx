"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/components/ui/Button";
import { signInWithDiscord } from "@/actions/auth";

function isDiscordOAuthHref(href: string) {
  if (href.startsWith("http://") || href.startsWith("https://")) return false;
  return href.includes("/signin/discord");
}

/** Underlying layer — same as `<Button variant="accentFill" | "accentOutline" />` (starmap PNGs sit on top). */
const accentStack =
  "bg-cyan-accent text-background border border-cyan-accent hover:bg-cyan-glow hover:border-cyan-glow shadow-none";

const shell =
  "relative inline-flex items-center justify-center font-semibold transition-all duration-300 ease-out overflow-hidden z-10 group !rounded-none cursor-pointer";

/** Filled: same as Get Started (black caps, solid cyan hex). */
const primaryCtaClasses = cn(
  shell,
  accentStack,
  "px-8 py-4 text-lg starmap-login-button starmap-signup-button !w-[260px] !h-[52px] !text-lg font-rajdhani font-bold no-underline visited:text-[#0b0b0b] hover:scale-[1.02] active:scale-[0.98]"
);

/** Outline: same as header Join Discord — cyan text, dark/transparent hex, glowing border (starmap-login only). */
const outlineCtaLg = cn(
  shell,
  accentStack,
  "px-8 py-4 text-lg starmap-login-button !w-[260px] !h-[52px] !text-lg font-rajdhani font-bold no-underline visited:!text-[#00ffff] hover:scale-[1.02] active:scale-[0.98]"
);

const outlineNav = cn(
  shell,
  accentStack,
  "px-4 py-2 text-sm starmap-login-button !w-[232px] !h-[46px] !text-sm font-rajdhani font-bold no-underline visited:!text-[#00ffff] hover:scale-[1.02] active:scale-[0.98]"
);

const outlineMobile = cn(
  shell,
  accentStack,
  "px-8 py-4 text-lg starmap-login-button starmap-login-button-mobile font-rajdhani font-bold text-lg no-underline visited:!text-[#00ffff] hover:scale-[1.02] active:scale-[0.98]"
);

export type DiscordJoinButtonProps = {
  href: string;
  className?: string;
  variant?: "outline" | "filled";
  size?: "lg" | "nav" | "mobile";
  children?: ReactNode;
  onClick?: () => void;
};

export function DiscordJoinButton({
  href,
  className,
  variant = "outline",
  size = "lg",
  children = "Join Discord",
  onClick,
}: DiscordJoinButtonProps) {
  const starmap =
    variant === "filled"
      ? "starmap-login-button starmap-signup-button"
      : "starmap-login-button";

  const dimensions =
    size === "lg"
      ? "!w-[260px] !h-[52px] !text-lg font-rajdhani font-bold no-underline " +
        (variant === "filled" ? "visited:text-[#0b0b0b]" : "visited:!text-[#00ffff]")
      : size === "nav"
        ? "!w-[232px] !h-[46px] !text-sm font-rajdhani font-bold no-underline " +
          (variant === "filled" ? "visited:text-[#0b0b0b]" : "visited:!text-[#00ffff]")
        : "starmap-login-button-mobile font-rajdhani font-bold text-lg no-underline " +
          (variant === "filled" ? "visited:text-[#0b0b0b]" : "visited:!text-[#00ffff]");

  const usePrimaryCtaStack = variant === "filled" && size === "lg";
  const useOutlineCtaLg = variant === "outline" && size === "lg";
  const useOutlineNav = variant === "outline" && size === "nav";
  const useOutlineMobile = variant === "outline" && size === "mobile";

  const outerClassName = cn(
    usePrimaryCtaStack && primaryCtaClasses,
    useOutlineCtaLg && outlineCtaLg,
    useOutlineNav && outlineNav,
    useOutlineMobile && outlineMobile,
    !usePrimaryCtaStack &&
      !useOutlineCtaLg &&
      !useOutlineNav &&
      !useOutlineMobile &&
      cn(shell, starmap, dimensions),
    !usePrimaryCtaStack && !useOutlineCtaLg && !useOutlineNav && !useOutlineMobile && variant === "filled" && "hover:scale-[1.02] active:scale-[0.98]",
    className
  );

  const inner = (
    <>
      <span
        className="absolute inset-0 w-full h-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none -z-10"
        aria-hidden
      />
      <span className="relative z-10 flex items-center gap-2">
        <span className="whitespace-nowrap">{children}</span>
      </span>
    </>
  );

  if (isDiscordOAuthHref(href)) {
    return (
      <form action={signInWithDiscord} className="contents">
        <button type="submit" className={outerClassName} onClick={onClick}>
          {inner}
        </button>
      </form>
    );
  }

  return (
    <Link href={href} prefetch={false} onClick={onClick} className={outerClassName}>
      {inner}
    </Link>
  );
}
