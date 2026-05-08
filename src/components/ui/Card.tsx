"use client";

import React, { forwardRef } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "./Button"; // Reusing the cn utility

export interface CardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  overflowVisible?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className, hoverEffect = true, overflowVisible = false, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={hoverEffect ? { y: -5, scale: 1.01 } : {}}
        className={cn(
          "glass-card relative rounded-none transition-all duration-300",
          !overflowVisible && "overflow-hidden",
          hoverEffect && "hover:border-cyan-accent/50 hover:shadow-[0_0_30px_rgba(0,245,212,0.15)]",
          className
        )}
        {...props}
      >
        {/* Subtle inner top highlight */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        {children}
      </motion.div>
    );
  }
);

Card.displayName = "Card";
