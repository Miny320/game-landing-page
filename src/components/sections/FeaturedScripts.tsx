"use client";

import React from "react";
import { motion } from "framer-motion";
import { SectionWrapper } from "../ui/SectionWrapper";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { ArrowRight } from "lucide-react";

const games = [
  { name: "Fortnite", image: "/visuals/fortnite.png", position: "object-center" },
  { name: "Arc Raiders", image: "/visuals/arcraiders.png", position: "object-top" },
  { name: "NBA 2K26", image: "/visuals/nba2k26.png", position: "object-center" },
  { name: "Rainbow Six Siege", image: "/visuals/rainbowsix.png", position: "object-center" },
  { name: "Battlefield 6", image: "/visuals/battlefiled.png", position: "object-top" },
  { name: "Apex Legends", image: "/visuals/apexlegends.png", position: "object-top" },
  { name: "Rust", image: "/visuals/rust.png", position: "object-center" },
  { name: "Black Ops 7", image: "/visuals/blackops.png", position: "object-center" },
];

export default function FeaturedScripts() {
  return (
    <SectionWrapper id="scripts" className="py-32">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-20 space-y-4">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em]"
          >
            POPULAR SCRIPTS
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-rajdhani text-4xl sm:text-5xl md:text-6xl font-bold text-white"
          >
            Get Access to Scripts <br />
            <span className="text-cyan-accent">for ALL Games</span>
          </motion.h2>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {games.map((game, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="relative group cursor-pointer"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-b from-cyan-accent/20 to-transparent rounded-none opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
              <Card className="p-0 overflow-hidden bg-card-bg/40 backdrop-blur-xl border-white/5 group-hover:border-cyan-accent/40 aspect-[4/5] relative transition-all duration-500">
                {/* Character Image */}
                <div className="absolute inset-0 z-0">
                  <img 
                    src={game.image} 
                    alt={game.name}
                    className={`w-full h-full object-cover ${game.position} opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 grayscale-[100%] group-hover:grayscale-0`}
                  />
                  {/* Overlay Gradients */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-b from-cyan-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Game Info - Bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-8 z-10 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-px w-8 bg-cyan-accent/50 group-hover:w-12 transition-all duration-500" />
                    <span className="text-[10px] font-black text-cyan-accent uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Access Ready</span>
                  </div>
                  <h3 className="font-rajdhani text-2xl font-bold text-white group-hover:text-cyan-accent transition-colors drop-shadow-lg">
                    {game.name}
                  </h3>
                </div>
                
                {/* Corner Decorative Element */}
                <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-y-2 group-hover:translate-y-0">
                  <ArrowRight className="w-5 h-5 text-cyan-accent" />
                </div>
              </Card>
            </motion.div>
          ))}

        </div>

        {/* Action Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20 flex justify-center"
        >
          <Button
            size="lg"
            variant="primary"
            className="starmap-login-button starmap-signup-button !w-[380px] !h-[56px] !text-xl"
          >
            <span className="whitespace-nowrap">Get Started with All Access</span>
          </Button>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
