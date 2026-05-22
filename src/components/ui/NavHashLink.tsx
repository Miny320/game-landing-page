"use client";

import type { ReactNode, MouseEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { homeSectionHref, scrollToSection } from "@/lib/scroll";

type Props = {
  href: string;
  className?: string;
  children: ReactNode;
  onNavigate?: () => void;
};

/** Hash section link — scrolls in-place on `/`, navigates to `/#section` on other pages. */
export function NavHashLink({ href, className, children, onNavigate }: Props) {
  const pathname = usePathname();
  const onHome = pathname === "/";

  const handleHomeClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    scrollToSection(href);
    history.replaceState(null, "", href === "#top" ? " " : href);
    onNavigate?.();
  };

  if (!onHome) {
    return (
      <Link href={homeSectionHref(href)} className={className} onClick={onNavigate}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} onClick={handleHomeClick} className={className}>
      {children}
    </a>
  );
}
