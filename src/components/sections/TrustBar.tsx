"use client";

import React from "react";
import { Bot, Cpu, Zap, ShieldAlert, Terminal, Activity } from "lucide-react";
import { SectionWrapper } from "../ui/SectionWrapper";
import { motion } from "framer-motion";
import { Card } from "../ui/Card";

const trustStats = [
  { icon: Bot, value: "15,000+", label: "ELITE AI-BOTS ACTIVE", desc: "Join thousands of players powered by our proprietary gaming AI." },
  { icon: Cpu, value: "99.9%", label: "CORE SYSTEM STABILITY", desc: "Our high-performance kernels ensure zero crashes and peak efficiency." },
  { icon: Zap, value: "Instant", label: "NEURAL LINK DELIVERY", desc: "Hyper-fast key injection and immediate dashboard activation." },
  { icon: ShieldAlert, value: "Secure", label: "ENCRYPTED BYPASS V4", desc: "State-of-the-art protection against all current detection methods." },
  { icon: Terminal, value: "Daily", label: "KERNEL-LEVEL UPDATES", desc: "Continuous code optimization and daily bypass refinements." },
];

export default function TrustBar() {
  return (
    <SectionWrapper className="py-32 relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02),transparent_70%)] pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-10 relative z-10">
        {trustStats.map((stat, idx) => {
          const Icon = stat.icon;
          const isRightShift = idx % 2 === 0;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: isRightShift ? 100 : -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className={`w-full max-w-3xl ${isRightShift ? "ml-auto" : "mr-auto"}`}
            >
              <Card 
                className="group relative flex flex-col sm:flex-row items-center gap-6 sm:gap-8 p-6 sm:p-8 transition-all duration-700 bg-card-bg/40 border-white/5 hover:border-cyan-accent/40 hover:bg-white/[0.04] overflow-visible"
                hoverEffect={false}
              >
                {/* Horizontal Shift on Hover - Disabled for mobile */}
                <motion.div 
                  whileHover={{ x: isRightShift ? 10 : -10 }}
                  className={`flex items-center gap-6 sm:gap-8 w-full ${isRightShift ? "flex-row text-left" : "flex-row sm:flex-row-reverse text-left sm:text-right"}`}
                >
                  {/* Content Side */}
                  <div className="flex-grow space-y-2">
                    <div className="text-[10px] font-black text-cyan-accent tracking-[0.4em] uppercase opacity-60 group-hover:opacity-100 transition-opacity">
                      {stat.label}
                    </div>
                    <h3 className="font-rajdhani text-2xl sm:text-3xl md:text-4xl font-bold text-white group-hover:text-cyan-accent transition-colors duration-500 drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                      {stat.value}
                    </h3>
                    <p className={`text-[10px] sm:text-xs text-gray-500 font-medium leading-relaxed max-w-md group-hover:text-gray-400 transition-colors duration-500 ${isRightShift ? "mr-auto" : "ml-auto"}`}>
                      {stat.desc}
                    </p>
                  </div>

                  {/* Icon Side - No square box, just glowing icon */}
                  <div className="relative">
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: idx * 0.5 }}
                      className="relative z-10"
                    >
                      <Icon className="w-12 h-12 text-gray-400 group-hover:text-cyan-accent group-hover:drop-shadow-[0_0_15px_rgba(0,245,212,0.8)] transition-all duration-500" />
                    </motion.div>
                    
                    {/* Decorative glowing ring behind icon */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-cyan-accent/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Animated scanning line for robotic feel */}
                    <motion.div 
                      className="absolute left-0 right-0 h-0.5 bg-cyan-accent/30 hidden group-hover:block"
                      animate={{ top: ["0%", "100%", "0%"] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                </motion.div>

                {/* Background Number Decal */}
                <div className="absolute top-2 right-4 text-7xl font-bold text-white/[0.02] pointer-events-none select-none font-rajdhani">
                  0{idx + 1}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Decorative vertical line connecting cards (optional visual enhancement) */}
      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-transparent via-white/5 to-transparent -z-10" />
    </SectionWrapper>
  );
}
