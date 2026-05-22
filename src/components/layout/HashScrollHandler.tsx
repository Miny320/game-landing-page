"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { scrollToSection } from "@/lib/scroll";

/** After navigating to `/#section`, scroll once the homepage sections are mounted. */
export default function HashScrollHandler() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") return;

    const run = () => {
      const hash = window.location.hash;
      if (hash) scrollToSection(hash);
    };

    const t = window.setTimeout(run, 120);
    return () => window.clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    if (pathname !== "/") return;

    const onHashChange = () => {
      const hash = window.location.hash;
      if (hash) scrollToSection(hash);
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [pathname]);

  return null;
}
