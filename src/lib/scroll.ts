import type Lenis from "lenis";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/**
 * Smoothly scroll to a section by hash (e.g. "#scripts") using the global Lenis
 * instance when available, falling back to native smooth scroll. Accounts for
 * the fixed header height via the offset.
 */
export function scrollToSection(href: string, offset = -80) {
  if (typeof window === "undefined") return;
  const lenis = window.__lenis;

  if (href === "#top" || href === "/" || href === "#") {
    if (lenis) {
      lenis.scrollTo(0, { offset: 0 });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    return;
  }

  const id = href.startsWith("#") ? href.slice(1) : href;
  const target = document.getElementById(id);
  if (!target) return;

  if (lenis) {
    lenis.scrollTo(target, { offset });
  } else {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}
