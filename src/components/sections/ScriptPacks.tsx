"use client";

import React from "react";
import { motion } from "framer-motion";
import { SectionWrapper } from "../ui/SectionWrapper";
import { Card } from "../ui/Card";
import { ShoppingCart, CheckCircle2 } from "lucide-react";
import { Button } from "../ui/Button";

const scriptPacks = [
  { 
    name: "Arc Raiders: Brave Aimers", 
    image: "/scripts-visuals/arcraiders-braveaimers.png", 
    price: "$29.99",
    features: ["Aimbot V4", "Recoil Control", "ESP System"]
  },
  { 
    name: "Black Ops: Feature Zens", 
    image: "/scripts-visuals/blackopsfeaturezens.png", 
    price: "$34.99",
    features: ["Rapid Fire", "Anti-Recoil", "Quick Scope"]
  },
  { 
    name: "NBA 2K26: Lethal Panda", 
    image: "/scripts-visuals/nba2k26lethalpanda.png", 
    price: "$24.99",
    features: ["Green Shot", "Dribble Gods", "Badge Boost"]
  },
  { 
    name: "NBA 2K26: Sosa Scripts", 
    image: "/scripts-visuals/nba2k26sosacirpts.png", 
    price: "$24.99",
    features: ["Ankle Breaker", "Perfect Release", "Defense V2"]
  },
  { 
    name: "Rainbow Six: Brave Aimers", 
    image: "/scripts-visuals/rainbowsixsiegebraveaimers.png", 
    price: "$29.99",
    features: ["No Recoil", "Soft Aim", "Drone Hack"]
  },
  { 
    name: "Rust: Scarface Zens", 
    image: "/scripts-visuals/rustscarfacezens.png", 
    price: "$39.99",
    features: ["AK Control", "Loot ESP", "Auto-Farm"]
  },
];

export default function ScriptPacks() {
  return (
    <SectionWrapper className="py-32 bg-white/[0.01] border-y border-white/5">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div className="space-y-4">
            <motion.span 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-[10px] font-black text-cyan-accent uppercase tracking-[0.5em]"
            >
              PREMIUM BUNDLES
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="font-rajdhani text-4xl sm:text-5xl font-bold text-white"
            >
              Exclusive <span className="text-cyan-accent">Script Packs</span>
            </motion.h2>
          </div>
          <p className="text-gray-500 text-sm max-w-sm font-medium leading-relaxed">
            Get the most powerful script combinations in one single pack. Fully optimized for the latest game versions.
          </p>
        </div>

        {/* Packs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {scriptPacks.map((pack, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              whileHover={{ y: -10 }}
              className="group"
            >
              <Card className="p-0 overflow-hidden bg-card-bg/40 border-white/5 group-hover:border-cyan-accent/30 transition-all duration-500 flex flex-col h-full shadow-2xl">
                {/* Pack Visual */}
                <div className="relative aspect-[4/5] overflow-hidden p-8 bg-white/[0.02]">
                  <img 
                    src={pack.image} 
                    alt={pack.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700 drop-shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                  
                  {/* Price Tag */}
                  <div className="absolute top-4 right-4 px-4 py-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-none font-rajdhani font-bold text-cyan-accent text-lg shadow-xl">
                    {pack.price}
                  </div>
                </div>

                {/* Pack Details */}
                <div className="p-8 flex flex-col flex-grow space-y-6">
                  <div>
                    <h3 className="font-rajdhani text-xl font-bold text-white group-hover:text-cyan-accent transition-colors mb-4">
                      {pack.name}
                    </h3>
                    <ul className="space-y-3">
                      {pack.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-3 text-xs text-gray-500 group-hover:text-gray-300 transition-colors">
                          <CheckCircle2 className="w-4 h-4 text-cyan-accent/60" />
                          {feat}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 mt-auto">
                    <Button variant="primary" className="w-full h-12 flex items-center justify-center gap-3">
                      <ShoppingCart className="w-4 h-4" />
                      Purchase Pack
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
