"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SectionWrapper } from "../ui/SectionWrapper";
import { Button } from "../ui/Button";
import { DiscordJoinButton } from "../ui/DiscordJoinButton";

interface Particle {
  id: number;
  x: string;
  y: string;
  duration: number;
}

const discordCtaHref =
  process.env.NEXT_PUBLIC_DISCORD_INVITE_URL ?? "/api/auth/signin/discord";

export default function FinalCTA() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const generatedParticles = [...Array(20)].map((_, i) => ({
      id: i,
      x: Math.random() * 100 + "%",
      y: Math.random() * 100 + "%",
      duration: 3 + Math.random() * 5,
    }));
    setParticles(generatedParticles);
  }, []);

  return (
    <SectionWrapper className="relative py-32 sm:py-48">
      {/* Background Glow Orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl aspect-square bg-cyan-accent/10 blur-[150px] rounded-full -z-10 pointer-events-none" />
      
      <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-accent/10 border border-cyan-accent/20 backdrop-blur-sm mb-4">
            <span className="w-2 h-2 rounded-full bg-cyan-accent animate-pulse shadow-[0_0_10px_rgba(0,245,212,0.8)]" />
            <span className="text-[10px] font-bold text-cyan-accent uppercase tracking-widest">Join 15,000+ Players</span>
          </div>

          <h2 className="font-rajdhani text-5xl sm:text-7xl font-bold text-white leading-tight">
            Ready To Upgrade Your <br />
            <span className="text-gradient">Gameplay?</span>
          </h2>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
            Don't wait. Join thousands of elite players using Sigma Scripts every day to dominate their favorite games. Fast delivery, secure bypass, and 24/7 support.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-8">
            <Button
              size="lg"
              variant="accentFill"
              className="starmap-login-button starmap-signup-button !w-[260px] !h-[52px] !text-lg"
            >
              <span className="whitespace-nowrap">Get Started Now</span>
            </Button>
            <DiscordJoinButton href={discordCtaHref} size="lg" variant="outline">
              Join Discord
            </DiscordJoinButton>
          </div>
          
          <div className="flex items-center justify-center gap-8 pt-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
             <div className="text-xs font-bold font-rajdhani tracking-widest text-white uppercase">Instant Delivery</div>
             <div className="w-1 h-1 rounded-full bg-white/20" />
             <div className="text-xs font-bold font-rajdhani tracking-widest text-white uppercase">Secure Payments</div>
             <div className="w-1 h-1 rounded-full bg-white/20" />
             <div className="text-xs font-bold font-rajdhani tracking-widest text-white uppercase">Daily Updates</div>
          </div>
        </motion.div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ 
              x: particle.x, 
              y: particle.y,
              opacity: 0 
            }}
            animate={{ 
              y: [null, "-20px", "20px"],
              opacity: [0, 0.2, 0] 
            }}
            transition={{ 
              duration: particle.duration, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
            className="absolute w-1 h-1 bg-cyan-accent rounded-full"
          />
        ))}
      </div>
    </SectionWrapper>
  );
}
