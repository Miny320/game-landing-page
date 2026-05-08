"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { SectionWrapper } from "../ui/SectionWrapper";
import { Users, FileCode, Radio } from "lucide-react";

export default function CommunityIntro() {
  const [onlineCount, setOnlineCount] = useState(49);

  // Simulate live online count
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineCount(prev => {
        const change = Math.floor(Math.random() * 5) - 2;
        return Math.max(40, Math.min(65, prev + change));
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SectionWrapper className="py-24 border-y border-white/5 bg-white/[0.01]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-end mb-20">
          {/* Left: Heading */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-rajdhani text-4xl sm:text-5xl font-bold text-white leading-tight tracking-tight">
              Dominate any game with the <br />
              <span className="text-cyan-accent drop-shadow-[0_0_15px_rgba(0,245,212,0.3)]">
                best Cronus Zen scripts.
              </span>
            </h2>
          </motion.div>

          {/* Right: Description */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col gap-6"
          >
            <p className="text-xl text-gray-400 font-light leading-relaxed max-w-xl">
              Join the best Cronus Zen community to access the library of all the best paid scripts for only one price.
            </p>
            <div className="w-20 h-1 bg-cyan-accent/20 rounded-full" />
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12">
          {/* Stat 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center gap-6 p-6 rounded-none bg-white/[0.03] border border-white/5 hover:border-cyan-accent/20 transition-all group"
          >
            <div className="p-3 rounded-none bg-white/5 text-gray-500 group-hover:text-cyan-accent transition-colors">
              <FileCode className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-rajdhani font-bold text-white">1,000+</div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Premium Scripts</div>
            </div>
          </motion.div>

          {/* Stat 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex items-center gap-6 p-6 rounded-none bg-white/[0.03] border border-white/5 hover:border-cyan-accent/20 transition-all group"
          >
            <div className="p-3 rounded-none bg-white/5 text-gray-500 group-hover:text-cyan-accent transition-colors">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-rajdhani font-bold text-white">23,704+</div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Global Members</div>
            </div>
          </motion.div>

          {/* Stat 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex items-center gap-6 p-6 rounded-none bg-white/[0.03] border border-white/5 hover:border-cyan-accent/20 transition-all group"
          >
            <div className="p-3 rounded-none bg-white/5 text-gray-500 group-hover:text-cyan-accent transition-colors relative">
              <Radio className="w-6 h-6" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
            <div>
              <div className="text-2xl font-rajdhani font-bold text-white flex items-center gap-2">
                {onlineCount}
                <span className="text-[10px] font-bold text-green-500 uppercase tracking-tighter animate-pulse">Live</span>
              </div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Active Now</div>
            </div>
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  );
}
