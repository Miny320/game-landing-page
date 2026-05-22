"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/components/ui/Button";
import {
  HEX_CTA_CENTER_ROW,
  HEX_CTA_CLASS,
  HEX_CTA_LABEL_CLASS,
  HEX_CTA_WIDE_CLASS,
} from "@/lib/hex-cta-classes";

type CommonProps = {
  children: ReactNode;
  className?: string;
  block?: boolean;
};

type ButtonProps = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

type LinkProps = CommonProps & {
  href: string;
};

function wrapLabel(children: ReactNode) {
  return <span className={HEX_CTA_LABEL_CLASS}>{children}</span>;
}

export function HexPrimaryCtaButton({
  children,
  className,
  block = false,
  type = "button",
  ...props
}: ButtonProps) {
  const btn = (
    <button
      type={type}
      className={cn(HEX_CTA_CLASS, block && HEX_CTA_WIDE_CLASS)}
      {...props}
    >
      {wrapLabel(children)}
    </button>
  );

  if (block) {
    return <div className={cn(HEX_CTA_CENTER_ROW, className)}>{btn}</div>;
  }

  return (
    <button type={type} className={cn(HEX_CTA_CLASS, className)} {...props}>
      {wrapLabel(children)}
    </button>
  );
}

export function HexPrimaryCtaLink({
  children,
  className,
  block = false,
  href,
}: LinkProps) {
  const link = (
    <Link href={href} className={cn(HEX_CTA_CLASS, block && HEX_CTA_WIDE_CLASS)}>
      {wrapLabel(children)}
    </Link>
  );

  if (block) {
    return <div className={cn(HEX_CTA_CENTER_ROW, className)}>{link}</div>;
  }

  return (
    <Link href={href} className={cn(HEX_CTA_CLASS, className)}>
      {wrapLabel(children)}
    </Link>
  );
}
