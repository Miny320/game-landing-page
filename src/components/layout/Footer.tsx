"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Send, MessageSquare, ShieldCheck } from "lucide-react";
import { Button } from "../ui/Button";

const footerLinks = {
  brand: {
    desc: "Sigma Scripts provides elite gaming solutions with focus on performance, security, and user experience. Join the future of competitive gaming today.",
  },
  navigation: [
    { name: "Home", href: "/" },
    { name: "Store", href: "#store" },
    { name: "Scripts", href: "#scripts" },
    { name: "Reviews", href: "#reviews" },
    { name: "Contact", href: "#contact" },
  ],
  support: [
    { name: "FAQ", href: "#faq" },
    { name: "Terms", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Discord", href: "/discord" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-background pt-24 pb-12 border-t border-white/5 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-accent/20 to-transparent" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          {/* Brand Info */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center group">
              <div className="relative w-12 h-12 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                {/* Logo Image */}
                <img
                  src="/logos/logo.png"
                  alt="Sigma Logo"
                  className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(0,245,212,0.8)] z-10"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                  }}
                />
                {/* Fallback Logo (Styled Sigma Icon) */}
                <div className="hidden absolute inset-0 flex items-center justify-center bg-white/5 border border-white/10 rounded-lg group-hover:border-cyan-accent/50 transition-colors">
                  <span className="font-rajdhani font-bold text-lg text-cyan-accent">Σ</span>
                </div>
              </div>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              {footerLinks.brand.desc}
            </p>
            <div className="flex items-center gap-4">
              <Link href="#" className="p-2 rounded-none bg-white/5 text-gray-400 hover:text-white hover:bg-cyan-accent/10 transition-all border border-transparent hover:border-cyan-accent/20">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
              </Link>
              <Link href="#" className="p-2 rounded-none bg-white/5 text-gray-400 hover:text-white hover:bg-cyan-accent/10 transition-all border border-transparent hover:border-cyan-accent/20">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              </Link>
              <Link href="#" className="p-2 rounded-none bg-white/5 text-gray-400 hover:text-white hover:bg-cyan-accent/10 transition-all border border-transparent hover:border-cyan-accent/20">
                <MessageSquare className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-rajdhani text-xs font-bold text-white uppercase tracking-[0.2em] mb-8">Navigation</h4>
            <ul className="space-y-4">
              {footerLinks.navigation.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-gray-500 hover:text-cyan-accent transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-rajdhani text-xs font-bold text-white uppercase tracking-[0.2em] mb-8">Support</h4>
            <ul className="space-y-4">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-gray-500 hover:text-cyan-accent transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-8">
            <div>
              <h4 className="font-rajdhani text-xs font-bold text-white uppercase tracking-[0.2em] mb-6">Newsletter</h4>
              <p className="text-sm text-gray-500 mb-6">Subscribe for the latest updates and exclusive offers.</p>
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <input
                    type="email"
                    placeholder="Enter email"
                    className="w-full bg-white/5 border border-white/10 rounded-none px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-accent/50 transition-colors"
                  />
                </div>
                <Button variant="primary" size="sm" className="px-4">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="p-4 rounded-none bg-cyan-accent/5 border border-cyan-accent/10 flex items-center gap-4">
              <ShieldCheck className="w-8 h-8 text-cyan-accent" />
              <div>
                <div className="text-[10px] font-bold text-white uppercase tracking-widest">Secured By</div>
                <div className="text-xs text-gray-500">SigmaGuard™ V4.2</div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-gray-600">
            © 2026 Sigma Scripts. All rights reserved.
          </p>
          <div className="flex items-center gap-8">
            <Link href="#" className="text-[10px] font-bold text-gray-600 hover:text-gray-400 uppercase tracking-widest transition-colors">Terms of Service</Link>
            <Link href="#" className="text-[10px] font-bold text-gray-600 hover:text-gray-400 uppercase tracking-widest transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
