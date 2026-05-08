"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "./Button";

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const SectionWrapper = ({ children, className, id }: SectionWrapperProps) => {
  return (
    <section id={id} className={cn("relative py-24 sm:py-32 overflow-hidden", className)}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
      >
        {children}
      </motion.div>
    </section>
  );
};
