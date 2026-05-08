"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { SectionWrapper } from "../ui/SectionWrapper";
import { Card } from "../ui/Card";
import { Star, ShieldCheck, Quote } from "lucide-react";

const reviews = [
  { name: "Ghost_Active", rank: "Apex Predator", text: "Been using Sigma for 3 months. The ESP is pixel-perfect and I haven't seen a single frame drop.", rating: 5, tag: "Verified Buyer" },
  { name: "Viper_FN", rank: "Unreal Rank", text: "The Cronus Zen scripts here are on another level. The aim assist boost feels like a soft aimbot.", rating: 5, tag: "Pro Player" },
  { name: "Shadow_R6", rank: "Champion", text: "R6 Siege scripts are incredible. The recoil control is so smooth it looks 100% natural.", rating: 5, tag: "Verified Buyer" },
  { name: "Nexus_User", rank: "Global Elite", text: "Finally found a provider that actually cares about security. Daily updates and a very helpful community.", rating: 5, tag: "Lifetime Member" },
  { name: "BladeRunner", rank: "Master", text: "The bypass is flawless. Played over 500 hours without a single detection. Truly elite tech.", rating: 5, tag: "Verified Buyer" },
  { name: "RacerX", rank: "Diamond I", text: "Best value for money. The script packs are comprehensive and very easy to configure for any game.", rating: 5, tag: "Verified Buyer" },
  { name: "Kronic", rank: "Radiant", text: "Valorant scripts are super subtle. No one can tell I'm using anything. 10/10 performance.", rating: 5, tag: "Verified Buyer" },
];

export default function Reviews() {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <SectionWrapper id="reviews" className="py-32 relative overflow-hidden">
      {/* Background Decorative Quotes */}
      <div className="absolute top-20 right-20 text-[200px] font-black text-white/[0.02] pointer-events-none select-none">
        <Quote className="w-64 h-64" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-24 space-y-4">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-[10px] font-black text-cyan-accent uppercase tracking-[0.5em]"
          >
            TESTIMONIALS
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-rajdhani text-4xl sm:text-5xl font-bold text-white"
          >
            Trusted By <br />
            <span className="text-cyan-accent">Competitive Players</span>
          </motion.h2>
        </div>

        {/* Sliding Marquee Container */}
        <div 
          className="relative flex overflow-hidden py-10"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <motion.div 
            animate={{ x: isPaused ? undefined : ["0%", "-50%"] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="flex gap-6 whitespace-nowrap"
          >
            {[...reviews, ...reviews].map((review, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05, y: -10, zIndex: 10 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="w-[85vw] sm:w-[350px] flex-shrink-0"
              >
                <Card className="h-full flex flex-col p-8 bg-card-bg/40 border-white/5 hover:border-cyan-accent/40 transition-all duration-500 relative group overflow-hidden whitespace-normal shadow-2xl">
                  {/* Top: Stars & Tag */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-1">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-cyan-accent fill-cyan-accent shadow-[0_0_8px_rgba(0,245,212,0.5)]" />
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-cyan-accent/10 border border-cyan-accent/20">
                      <ShieldCheck className="w-2.5 h-2.5 text-cyan-accent" />
                      <span className="text-[8px] font-bold text-cyan-accent uppercase tracking-wider">{review.tag}</span>
                    </div>
                  </div>

                  {/* Body: Text */}
                  <p className="text-gray-400 text-sm leading-relaxed mb-8 italic group-hover:text-gray-300 transition-colors">
                    "{review.text}"
                  </p>

                  {/* Footer: User Info */}
                  <div className="mt-auto flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-rajdhani font-bold text-cyan-accent group-hover:bg-cyan-accent group-hover:text-background transition-all duration-500">
                      {review.name[0]}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-cyan-accent transition-colors">{review.name}</h4>
                      <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{review.rank}</div>
                    </div>
                  </div>
                  
                  {/* Background Glow */}
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-cyan-accent/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Side Fades Removed */}
        </div>

        {/* Bottom Trust Stat */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 flex flex-col items-center gap-4"
        >
          <div className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em]">Overall Rating</div>
          <div className="flex items-center gap-3">
            <div className="text-4xl font-rajdhani font-bold text-white">4.9/5</div>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-cyan-accent fill-cyan-accent" />
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-500 font-medium">Based on 15,000+ customer reviews worldwide</p>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
