"use client";

import React, { forwardRef } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "ghost" | "accentOutline" | "accentFill";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  className?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", children, className, ...props }, ref) => {
    const baseStyles =
      "relative inline-flex items-center justify-center font-semibold transition-all duration-300 ease-out overflow-hidden z-10 group";

    const variants = {
      primary:
        "bg-cyan-accent text-background border border-cyan-accent hover:bg-cyan-glow hover:border-cyan-glow shadow-none",
      secondary:
        "bg-cyan-accent text-background border border-cyan-accent hover:bg-cyan-glow hover:border-cyan-glow shadow-none",
      ghost:
        "bg-cyan-accent text-background border border-cyan-accent hover:bg-cyan-glow hover:border-cyan-glow shadow-none",
      accentOutline:
        "bg-cyan-accent text-background border border-cyan-accent hover:bg-cyan-glow hover:border-cyan-glow shadow-none",
      accentFill:
        "bg-cyan-accent text-background border border-cyan-accent hover:bg-cyan-glow hover:border-cyan-glow shadow-none",
    };

    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(baseStyles, variants[variant], sizes[size], className, "!rounded-none")}
        {...props}
      >
        {/* Keep a consistent soft highlight for all buttons */}
        {variant && (
          <span className="absolute inset-0 w-full h-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none -z-10" />
        )}
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </motion.button>
    );
  }
);

Button.displayName = "Button";
