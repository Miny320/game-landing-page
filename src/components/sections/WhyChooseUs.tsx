"use client";

import React from "react";
import { motion } from "framer-motion";
import { SectionWrapper } from "../ui/SectionWrapper";

type IconProps = {
  className?: string;
};

function AtomicShieldIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M50 10L85 25V50C85 70 50 90 50 90C50 90 15 70 15 50V25L50 10Z" stroke="currentColor" strokeWidth="2" />
      <circle cx="50" cy="50" r="8" stroke="currentColor" strokeWidth="2" />
      <ellipse cx="50" cy="50" rx="20" ry="8" stroke="currentColor" strokeWidth="1.5" transform="rotate(45 50 50)" />
      <ellipse cx="50" cy="50" rx="20" ry="8" stroke="currentColor" strokeWidth="1.5" transform="rotate(-45 50 50)" />
    </svg>
  );
}

function DigitalDriveIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="20" y="30" width="60" height="35" rx="4" stroke="currentColor" strokeWidth="2.5" />
      <rect x="30" y="40" width="40" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="38" cy="47" r="3" fill="currentColor" />
      <circle cx="62" cy="47" r="3" fill="currentColor" />
      <path d="M40 65V80H60V65" stroke="currentColor" strokeWidth="2" />
      <path d="M65 75H75M65 80H72" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function PremiumQualityIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M50 10L55 20H65L60 25L65 35L55 35L50 45L45 35L35 35L40 25L35 20H45L50 10Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M50 5C55 5 62 12 65 15C75 20 85 30 85 45C85 60 75 75 50 85C25 75 15 60 15 45C15 30 25 20 35 15C38 12 45 5 50 5Z"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.3"
      />
      <path
        d="M50 18C58 18 68 25 72 35C75 45 72 55 65 62M50 18C42 18 32 25 28 35C25 45 28 55 35 62"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path d="M35 62C40 68 45 72 50 72C55 72 60 68 65 62" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M42 45C42 38 45 35 50 35C55 35 58 38 58 45C58 52 55 55 50 55C48 55 46 54 44 52L40 58M52 50L58 56"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M50 82L52 86H56L53 88L54 92L50 90L46 92L47 88L44 86H48L50 82Z" fill="currentColor" />
      <path d="M35 78L37 81H40L38 83L39 86L35 84L31 86L32 83L30 81H33L35 78Z" fill="currentColor" opacity="0.8" />
      <path d="M65 78L67 81H70L68 83L69 86L65 84L61 86L62 83L60 81H63L65 78Z" fill="currentColor" opacity="0.8" />
    </svg>
  );
}

function CrownedChatIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M35 55H25C22 55 20 53 20 50V35C20 32 22 30 25 30H50C53 30 55 32 55 35V40" stroke="currentColor" strokeWidth="2" />
      <path d="M45 45H75C78 45 80 47 80 50V65C80 68 78 70 75 70H65L55 80V70H45C42 70 40 68 40 65V50C40 47 42 45 45 45Z" stroke="currentColor" strokeWidth="2.5" />
      <path d="M45 25L50 15L55 25L65 20L60 30H40L35 20L45 25Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

const features = [
  {
    icon: AtomicShieldIcon,
    title: "Undetected Technology",
    desc: "Our scripts use advanced kernel-level protection to stay ahead of all major anti-cheat systems.",
  },
  {
    icon: DigitalDriveIcon,
    title: "Instant Setup",
    desc: "No complex configuration required. Download, run, and dominate your game in seconds.",
  },
  {
    icon: PremiumQualityIcon,
    title: "Premium Quality",
    desc: "Each script is hand-crafted and rigorously tested by elite competitive players.",
  },
  {
    icon: CrownedChatIcon,
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
                      <div className="w-14 h-14 text-cyan-accent/80 group-hover:text-cyan-accent drop-shadow-[0_0_10px_rgba(45,212,191,0.8)] group-hover:drop-shadow-[0_0_18px_rgba(45,212,191,0.95)] transition-all duration-500">
                        <Icon className="w-full h-full transition-colors" />
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
