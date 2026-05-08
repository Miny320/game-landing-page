"use client";

import React from "react";
import { motion } from "framer-motion";
import { SectionWrapper } from "../ui/SectionWrapper";
import { Play } from "lucide-react";

const showcases = [
  { url: "/visuals/19de679f8c731-master_playlist.mov", title: "Sigma Community Footage 01", category: "Live Gameplay" },
  { url: "/visuals/19df172838782-master_playlist.mov", title: "Sigma Community Footage 02", category: "Live Gameplay" },
  { url: "/visuals/copy_E08D8FDC-A955-453F-90E1-C2CD84564775.mov", title: "Sigma Community Footage 03", category: "Live Gameplay" },
  { url: "/visuals/IMG_4429.mov", title: "Sigma Community Footage 04", category: "Live Gameplay" },
  { url: "/visuals/IMG_7616.mov", title: "Sigma Community Footage 05", category: "Live Gameplay" },
  { url: "/visuals/VID-20260211-WA0005.mov", title: "Sigma Community Footage 06", category: "Live Gameplay" },
];

export default function Showcase() {
  return (
    <SectionWrapper id="showcase" className="py-32 border-y border-white/5 bg-cyan-accent/[0.01] overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row justify-between items-end mb-24 gap-8">
          <div className="space-y-4">
            <motion.span 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-[10px] font-black text-cyan-accent uppercase tracking-[0.5em]"
            >
              COMMUNITY SHOWCASE
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="font-rajdhani text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight max-w-2xl"
            >
              Footage From Members who Use Our{" "}
              <span className="text-cyan-accent">scripts</span>
            </motion.h2>
          </div>
          <p className="text-gray-500 text-sm max-w-sm font-medium leading-relaxed mb-4">
            Watch real gameplay recorded by our community members. Experience the power of Sigma Scripts through their eyes.
          </p>
        </div>
      </div>

      {/* Carousel UI */}
      <div className="relative group">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
          className="flex gap-4 sm:gap-8 px-4 w-max"
        >
          {[...showcases, ...showcases].map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -10, scale: 1.02 }}
              className="relative flex-shrink-0 w-[75vw] sm:w-[400px] md:w-[600px] aspect-video group/card cursor-pointer"
            >
              <div className="relative w-full h-full rounded-none overflow-hidden border-2 border-white/5 group-hover/card:border-cyan-accent/40 bg-transparent shadow-2xl transition-all duration-700">
                <video
                  src={item.url}
                  className="w-full h-full object-cover transition-all duration-1000 scale-105 group-hover/card:scale-100"
                  autoPlay
                  muted
                  loop
                  playsInline
                  suppressHydrationWarning
                />

                {/* Info Overlay - No black fade */}
                <div className="absolute inset-0 p-6 sm:p-12 flex flex-col justify-end transition-all duration-500">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 rounded-full bg-cyan-accent/20 border border-cyan-accent/30 text-[10px] font-bold text-cyan-accent uppercase tracking-widest">
                      {item.category}
                    </span>
                  </div>
                  <h3 className="font-rajdhani text-xl sm:text-3xl font-bold text-white group-hover/card:text-cyan-accent transition-colors">
                    {item.title}
                  </h3>
                </div>

                {/* Play Button */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-cyan-accent/10 border border-cyan-accent/20 flex items-center justify-center opacity-0 group-hover/card:opacity-100 scale-50 group-hover/card:scale-100 transition-all duration-700 backdrop-blur-md">
                  <Play className="w-8 h-8 text-cyan-accent fill-cyan-accent" />
                </div>
              </div>

              {/* Enhanced Glow */}
              <div className="absolute -inset-4 bg-cyan-accent/5 blur-3xl rounded-none opacity-0 group-hover/card:opacity-100 transition-opacity -z-10" />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Bottom CTA for Section */}
      <div className="container mx-auto px-4 mt-20">
        <div className="flex items-center justify-center gap-4 text-gray-500 font-bold uppercase tracking-widest text-[10px]">
          <div className="h-px w-12 bg-white/10" />
          More footage available in our Discord
          <div className="h-px w-12 bg-white/10" />
        </div>
      </div>
    </SectionWrapper>
  );
}
