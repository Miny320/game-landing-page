"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
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
        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <h1 className="font-rajdhani text-2xl font-bold text-white mt-6 tracking-tight">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            {mode === "login" ? "Access your elite script library" : "Join the world's most advanced script community"}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-card-bg/40 backdrop-blur-xl border border-white/10 rounded-none p-8 shadow-2xl relative overflow-hidden">
          {/* Form Toggle */}
          <div className="flex bg-white/5 p-1 rounded-none mb-8 border border-white/5">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-2 text-xs font-bold font-rajdhani rounded-none border transition-all ${mode === "login" ? "bg-cyan-accent text-background border-cyan-accent shadow-[0_0_20px_rgba(0,245,212,0.35)]" : "bg-transparent text-cyan-accent border-cyan-accent hover:bg-cyan-accent hover:text-background"
                }`}
            >
              LOGIN
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 py-2 text-xs font-bold font-rajdhani rounded-none border transition-all ${mode === "signup" ? "bg-cyan-accent text-background border-cyan-accent shadow-[0_0_20px_rgba(0,245,212,0.35)]" : "bg-transparent text-cyan-accent border-cyan-accent hover:bg-cyan-accent hover:text-background"
                }`}
            >
              SIGN UP
            </button>
          </div>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <AnimatePresence mode="wait">
              {mode === "signup" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="relative"
                >
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Username"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-accent/50 transition-all"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-accent/50 transition-all"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="password"
                placeholder="Password"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-accent/50 transition-all"
              />
            </div>

            {mode === "login" && (
              <div className="flex justify-end">
                <Link href="#" className="text-[10px] font-bold text-cyan-accent/60 hover:text-cyan-accent uppercase tracking-widest transition-colors">
                  Forgot Password?
                </Link>
              </div>
            )}

            <Button variant="primary" className="w-full h-14 group">
              {mode === "login" ? "Access Dashboard" : "Register Now"}
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600">
              <span className="bg-[#0a0a0a] px-4">OR CONTINUE WITH</span>
            </div>
          </div>

          {/* Social Auth */}
          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-3 bg-cyan-accent border border-cyan-accent rounded-none py-3 hover:bg-cyan-glow hover:border-cyan-glow transition-all group text-background">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  className="text-[#4285F4]"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  className="text-[#34A853]"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  className="text-[#FBBC05]"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                  className="text-[#EA4335]"
                />
              </svg>
              <span className="text-xs font-bold text-background">Google</span>
            </button>
            <button className="flex items-center justify-center gap-3 bg-cyan-accent border border-cyan-accent rounded-none py-3 hover:bg-cyan-glow hover:border-cyan-glow transition-all group text-background">
              <svg className="w-4 h-4 text-background" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.61-4.041-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.362.81 1.096.81 2.22v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <span className="text-xs font-bold text-background">Github</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
