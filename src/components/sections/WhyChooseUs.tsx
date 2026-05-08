"use client";

import React from "react";
import { motion } from "framer-motion";
import { SectionWrapper } from "../ui/SectionWrapper";
import { ShieldCheck, Zap, HeartHandshake, Award } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Undetected Technology",
    desc: "Our scripts use advanced kernel-level protection to stay ahead of all major anti-cheat systems.",
  },
  {
    icon: Zap,
    title: "Instant Setup",
    desc: "No complex configuration required. Download, run, and dominate your game in seconds.",
  },
  {
    icon: Award,
    title: "Premium Quality",
    desc: "Each script is hand-crafted and rigorously tested by elite competitive players.",
  },
  {
    icon: HeartHandshake,
    title: "24/7 Elite Support",
    desc: "Access our dedicated Discord community for instant help from our technical experts.",
  },
];

export default function WhyChooseUs() {
  return (
    <SectionWrapper id="why-us" className="py-32 bg-white/[0.01]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* Left: Video Showcase */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative aspect-video rounded-none overflow-hidden border-4 border-white/5 bg-black shadow-2xl group">
              <video
                src="/visuals/IMG_7785.mov"
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
                autoPlay
                muted
                loop
                playsInline
                suppressHydrationWarning
              />
              
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-accent/30 rounded-none" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-accent/30 rounded-none" />
              
              {/* Inner Glow */}
              <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.6)] pointer-events-none" />
            </div>

            {/* Background Glow */}
            <div className="absolute -inset-10 bg-cyan-accent/5 blur-[100px] -z-10 rounded-full" />
          </motion.div>

          {/* Right Content */}
          <div className="space-y-12">
            <div className="space-y-4">
              <motion.span 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="text-[10px] font-black text-cyan-accent uppercase tracking-[0.5em]"
              >
                THE SIGMA ADVANTAGE
              </motion.span>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="font-rajdhani text-4xl sm:text-5xl font-bold text-white"
              >
                Why Elite Players <br />
                <span className="text-cyan-accent">Choose Us</span>
              </motion.h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10">
              {features.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="group"
                  >
                    <div className="flex flex-col gap-4 border border-white/10 p-5">
                      <div className="w-12 h-12 rounded-none flex items-center justify-center transition-all duration-500">
                        <Icon className="w-6 h-6 text-gray-400 group-hover:text-cyan-accent transition-colors" />
                      </div>
                      <div>
                        <h4 className="font-rajdhani text-sm font-bold text-white mb-2 group-hover:text-cyan-accent transition-colors">
                          {feature.title}
                        </h4>
                        <p className="text-xs text-gray-500 leading-relaxed font-medium">
                          {feature.desc}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </SectionWrapper>
  );
}
