"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/Button";

const FOLDER_CLIP =
  "polygon(0% 0%, 60% 0%, 64% 5%, 100% 5%, 100% 100%, 0% 100%)" as const;

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoEnded, setVideoEnded] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = 1.5;

    const startVideo = () => {
      setVideoLoaded(true);
      video.play().catch(console.error);
    };

    if (video.readyState >= 4) {
      startVideo();
    } else {
      video.addEventListener("canplaythrough", startVideo);
    }

    const handleEnded = () => {
      setVideoEnded(true);
    };

    video.addEventListener("ended", handleEnded);

    const handleInteraction = () => {
      if (video) {
        video.muted = false;
        video.volume = 1;
        video.play().catch(() => {});
      }
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("scroll", handleInteraction);
    };

    window.addEventListener("click", handleInteraction);
    window.addEventListener("keydown", handleInteraction);
    window.addEventListener("touchstart", handleInteraction, { passive: true });
    window.addEventListener("scroll", handleInteraction, { passive: true });

    return () => {
      video.removeEventListener("canplaythrough", startVideo);
      video.removeEventListener("ended", handleEnded);
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("scroll", handleInteraction);
    };
  }, []);

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black">
      {/* Full-screen background video */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          src="/visuals/animation.mp4"
          className={`h-full w-full object-cover brightness-[1.06] contrast-[1.03] saturate-[1.05] transition-all duration-700 ease-out ${
            videoLoaded ? "opacity-100" : "opacity-0"
          }`}
          playsInline
          preload="auto"
          autoPlay
          muted
          suppressHydrationWarning
        />
        <div
          className={`pointer-events-none absolute inset-0 bg-gradient-to-b from-black/35 via-black/5 to-black/25 transition-opacity duration-700 ease-out ${
            videoEnded ? "opacity-0" : "opacity-100"
          }`}
          aria-hidden
        />
      </div>

      {/* Folder glass card — glassmorphism on video (backdrop blur only on this panel) */}
      <AnimatePresence>
        {videoEnded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-20 isolate flex w-full max-w-4xl items-center justify-center px-4"
          >
            <div
              className="relative flex w-full flex-col items-center justify-center overflow-hidden border border-white/18 bg-[#0a1628]/42 px-8 py-12 shadow-[0_20px_50px_-18px_rgba(0,0,0,0.62),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-[6px] backdrop-saturate-[125%] sm:px-12 sm:py-14 md:px-14 md:py-16"
              style={{
                clipPath: FOLDER_CLIP,
                WebkitClipPath: FOLDER_CLIP,
              }}
            >
              {/* Subtle sheen without creating a milky block */}
              <div
                className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-white/[0.04] via-transparent to-transparent"
                aria-hidden
              />
              <div className="relative z-10 flex w-full flex-col items-center justify-center">
              <div className="relative mb-4 max-w-4xl [filter:drop-shadow(0_0_18px_rgba(255,255,255,0.38))]">
                <h1 className="text-center font-rajdhani text-4xl font-black italic tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                  <span className="bg-gradient-to-r from-cyan-200 via-white to-fuchsia-200 bg-clip-text text-transparent">
                    #1 Zen Script Library
                  </span>
                </h1>
              </div>

              <p className="mx-auto mb-10 max-w-lg text-center font-rajdhani text-lg font-medium text-white/90 md:text-xl">
                Get Access to the best scripts for every game.
              </p>

              <Link href="/auth">
                <Button variant="accentFill" size="sm" className="starmap-login-button starmap-signup-button">
                  Shop Scripts
                </Button>
              </Link>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={`pointer-events-none absolute inset-0 z-[13] bg-scanlines transition-opacity duration-700 ${
          videoEnded ? "opacity-0" : "opacity-[0.02]"
        }`}
        aria-hidden
      />
    </section>
  );
}
