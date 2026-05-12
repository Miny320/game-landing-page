"use client";

import React from "react";
import Link from "next/link";
import { Send } from "lucide-react";
import { Button } from "../ui/Button";
import { scrollToSection } from "@/lib/scroll";

const navigationLinks = [
  { name: "Home", href: "#top" },
  { name: "Store", href: "#store" },
  { name: "Scripts", href: "#scripts" },
  { name: "Why Us", href: "#why-us" },
  { name: "Showcase", href: "#showcase" },
  { name: "Reviews", href: "#reviews" },
  { name: "FAQ", href: "#faq" },
];

const brandDescription =
  "Sigma Scripts provides elite gaming solutions with focus on performance, security, and user experience. Join the future of competitive gaming today.";

export default function Footer() {
  const discordInviteUrl = process.env.NEXT_PUBLIC_DISCORD_INVITE_URL?.trim();

  return (
    <footer className="bg-background pt-24 pb-12 border-t border-white/5 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-accent/20 to-transparent" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          {/* Brand Info */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center group">
              <div className="relative w-12 h-12 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <img
                  src="/logos/logo.png"
                  alt="Sigma Logo"
                  className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(0,245,212,0.8)] z-10"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                  }}
                />
                <div className="hidden absolute inset-0 flex items-center justify-center bg-white/5 border border-white/10 rounded-lg group-hover:border-cyan-accent/50 transition-colors">
                  <span className="font-rajdhani font-bold text-lg text-cyan-accent">Σ</span>
                </div>
              </div>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              {brandDescription}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-rajdhani text-xs font-bold text-white uppercase tracking-[0.2em] mb-8">
              Navigation
            </h4>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-4">
              {navigationLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(link.href);
                      history.replaceState(null, "", link.href === "#top" ? " " : link.href);
                    }}
                    className="text-sm text-gray-500 hover:text-cyan-accent transition-colors cursor-pointer"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          {discordInviteUrl && (
            <div>
              <h4 className="font-rajdhani text-xs font-bold text-white uppercase tracking-[0.2em] mb-8">
                Community
              </h4>
              <ul className="space-y-4">
                <li>
                  <Link
                    href={discordInviteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-500 hover:text-cyan-accent transition-colors"
                  >
                    Discord
                  </Link>
                </li>
              </ul>
            </div>
          )}

          {/* Newsletter */}
          <div>
            <h4 className="font-rajdhani text-xs font-bold text-white uppercase tracking-[0.2em] mb-6">
              Newsletter
            </h4>
            <p className="text-sm text-gray-500 mb-6">
              Subscribe for the latest updates and exclusive offers.
            </p>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <div className="relative flex-grow">
                <input
                  type="email"
                  required
                  placeholder="Enter email"
                  aria-label="Email address"
                  className="w-full bg-white/5 border border-white/10 rounded-none px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-accent/50 transition-colors"
                />
              </div>
              <Button type="submit" variant="primary" size="sm" className="px-4" aria-label="Subscribe">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex justify-center">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} Sigma Scripts. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
