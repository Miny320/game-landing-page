"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { DiscordJoinButton } from "../ui/DiscordJoinButton";
import { DiscordHeaderProfile } from "../ui/DiscordHeaderProfile";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Store", href: "#store" },
  { name: "Scripts", href: "#scripts" },
  { name: "Reviews", href: "#reviews" },
  { name: "Guides", href: "#guides" },
  { name: "Support", href: "#support" },
];

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`font-rajdhani fixed left-0 right-0 top-0 z-50 transition-all duration-300 ease-out ${
        isScrolled
          ? "bg-black/25 backdrop-blur-xl backdrop-saturate-150 border-b border-white/[0.08] py-3 shadow-[0_1px_0_rgba(255,255,255,0.06)_inset]"
          : "bg-transparent py-6 border-b border-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <div className={`relative transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) flex items-center justify-center group-hover:scale-110 ${
              isScrolled ? "w-10 h-10 sm:w-12 sm:h-12" : "w-12 h-12 sm:w-16 sm:h-16"
            }`}>
              {/* Logo Image */}
              <img
                src="/logos/logo.png"
                alt="Sigma Scripts"
                className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(0,245,212,0.8)] z-10"
              />
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-7 lg:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-base lg:text-lg font-semibold text-gray-300 hover:text-white relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-accent transition-all duration-300 group-hover:w-full drop-shadow-[0_0_5px_rgba(0,245,212,0.8)]"></span>
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            {status === "loading" ? (
              <div
                className="h-[46px] min-w-[7rem] w-36 animate-pulse discord-profile-tag-clip border border-[color:var(--discord-profile-neon)]/25 bg-black/40"
                aria-hidden
              />
            ) : session?.user ? (
              <DiscordHeaderProfile
                variant="nav"
                user={{
                  name: session.user.name,
                  image: session.user.image,
                }}
              />
            ) : (
              <DiscordJoinButton
                href="/api/auth/signin/discord"
                size="nav"
                variant="outline"
              >
                Join Discord
              </DiscordJoinButton>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden bg-cyan-accent border border-cyan-accent text-background p-2 rounded-none hover:bg-cyan-glow hover:border-cyan-glow transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-8 h-8 text-background" />
            ) : (
              <Menu className="w-8 h-8 text-background" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black border-t border-white/5 overflow-hidden"
          >
            <div className="container mx-auto px-6 py-10 flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-2xl font-black text-gray-400 hover:text-cyan-accent transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-6 border-t border-white/5 flex flex-col gap-4">
                {status === "loading" ? (
                  <div
                    className="h-14 w-full animate-pulse discord-profile-tag-clip border border-[color:var(--discord-profile-neon)]/25 bg-black/40"
                    aria-hidden
                  />
                ) : session?.user ? (
                  <DiscordHeaderProfile
                    variant="mobile"
                    user={{
                      name: session.user.name,
                      image: session.user.image,
                    }}
                    onNavigate={() => setIsMobileMenuOpen(false)}
                  />
                ) : (
                  <DiscordJoinButton
                    href="/api/auth/signin/discord"
                    size="mobile"
                    variant="outline"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Join Discord
                  </DiscordJoinButton>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
