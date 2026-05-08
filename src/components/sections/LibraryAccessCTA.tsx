"use client";

import React from "react";
import { motion } from "framer-motion";
import { SectionWrapper } from "../ui/SectionWrapper";
import { Button } from "../ui/Button";
import { Sparkles, Layers } from "lucide-react";

const scriptVisuals = [
  "/scripts-visuals/arcraiders-braveaimers.png",
  "/scripts-visuals/blackopsfeaturezens.png",
  "/scripts-visuals/nba2k26lethalpanda.png",
  "/scripts-visuals/nba2k26sosacirpts.png",
  "/scripts-visuals/rainbowsixsiegebraveaimers.png",
  "/scripts-visuals/rustscarfacezens.png",
];

export default function LibraryAccessCTA() {
  return (
    <SectionWrapper className="py-24 relative overflow-hidden bg-cyan-accent/[0.02]">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-accent/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="bg-card-bg/40 border border-white/10 rounded-none p-8 md:p-16 overflow-hidden relative shadow-2xl">
          {/* Decorative Corner */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-accent/10 blur-3xl rounded-full" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-accent/10 border border-cyan-accent/20">
                <Sparkles className="w-3 h-3 text-cyan-accent" />
                <span className="text-[10px] font-black text-cyan-accent tracking-widest uppercase">Unlimited Access</span>
              </div>

              <h2 className="font-rajdhani text-4xl sm:text-5xl font-bold text-white leading-tight">
                Get access to our <br />
                <span className="text-cyan-accent">Full Library of Scripts</span>
              </h2>

              <p className="text-xl text-gray-400 font-light leading-relaxed">
                Over <span className="text-white font-bold">200+ scripts</span> worth over <span className="text-white font-bold">$5,000</span> for only <span className="text-cyan-accent font-black">$29.99 a month</span> right now, with new scripts added regularly.
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-4">
                <Button
                  size="lg"
                  variant="primary"
                  className="starmap-login-button starmap-signup-button !w-[260px] !h-[52px] !text-base"
                >
                  <span className="whitespace-nowrap">Subscribe Now →</span>
                </Button>
                <div className="flex items-center gap-3 text-xs text-gray-500 font-bold uppercase tracking-widest">
                  <Layers className="w-4 h-4 text-cyan-accent" />
                  Instant Unlock
                </div>
              </div>
            </div>

            {/* Right: Visual Carousel/Marquee */}
            <div className="relative h-[400px] flex items-center justify-center overflow-hidden rounded-none bg-white/[0.02] border border-white/5 group">
              <div className="absolute inset-0 z-10 bg-gradient-to-r from-card-bg via-transparent to-card-bg pointer-events-none" />
              
              <motion.div 
                animate={{ x: ["0%", "-50%"] }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="flex gap-6 whitespace-nowrap"
              >
                {[...scriptVisuals, ...scriptVisuals].map((src, i) => (
                  <div key={i} className="w-48 aspect-[3/4] flex-shrink-0 bg-white/5 border border-white/10 rounded-none overflow-hidden p-4 group-hover:border-cyan-accent/30 transition-colors">
                    <img src={src} alt="Script pack" className="w-full h-full object-contain grayscale-[30%] group-hover:grayscale-0 transition-all duration-500" />
                  </div>
                ))}
              </motion.div>

              {/* Overlay Text for Preview */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase">
                Library Preview
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
