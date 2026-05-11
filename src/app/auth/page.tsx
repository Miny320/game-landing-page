"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { DiscordJoinButton } from "@/components/ui/DiscordJoinButton";

const discordSignInHref = "/api/auth/signin/discord";

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-accent/5 rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <h1 className="font-rajdhani text-2xl font-bold text-white mt-6 tracking-tight">
            Sign in
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Continue with your Discord account to access the script library
          </p>
        </div>

        <div className="bg-card-bg/40 backdrop-blur-xl border border-white/10 rounded-none p-8 shadow-2xl relative overflow-hidden flex flex-col items-center">
          <DiscordJoinButton
            href={discordSignInHref}
            size="lg"
            variant="filled"
            className="!w-full max-w-[380px]"
          >
            Join Discord
          </DiscordJoinButton>

          <p className="mt-6 text-center text-[11px] text-gray-500 leading-relaxed">
            We use Discord to verify your account. You will be asked to authorize this app in
            Discord.
          </p>
        </div>

        <p className="text-center mt-8">
          <Link
            href="/"
            className="text-xs font-bold text-cyan-accent/80 hover:text-cyan-accent uppercase tracking-widest transition-colors"
          >
            ← Back to home
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
