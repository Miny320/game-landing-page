"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionWrapper } from "../ui/SectionWrapper";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Are scripts updated?",
    answer: "Yes, our team of dedicated developers monitors anticheat updates 24/7. Scripts are updated automatically on our server-side to ensure you always have the latest, most secure version.",
  },
  {
    question: "Is delivery instant?",
    answer: "Absolutely. Once your payment is processed, you will receive an email with your license key and access instructions instantly. You can also view your active subscriptions in your user dashboard.",
  },
  {
    question: "Which payment methods are supported?",
    answer: "We support a wide range of payment methods including all major Credit/Debit cards, PayPal, and various Cryptocurrencies (BTC, ETH, LTC, USDT) for maximum privacy.",
  },
  {
    question: "Are scripts safe?",
    answer: "Safety is our number one priority. Our scripts use advanced external injection techniques and polymorphic code to minimize detection risk. However, we always recommend using scripts responsibly on non-main accounts.",
  },
  {
    question: "How do updates work?",
    answer: "Our software features an auto-updater. When you launch the client, it checks for the latest version and downloads any necessary updates automatically. No manual re-installation is required.",
  },
];

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  return (
    <SectionWrapper id="faq">
      <div className="flex flex-col items-center text-center mb-16">
        <span className="text-cyan-accent text-xs font-bold uppercase tracking-[0.2em] mb-4 block">Information</span>
        <h2 className="font-rajdhani text-4xl font-bold text-white mb-6">Frequently Asked <span className="text-gradient">Questions</span></h2>
        <p className="text-gray-400 max-w-2xl">
          Got questions? We've got answers. If you can't find what you're looking for, feel free to reach out to our support team.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map((faq, idx) => (
          <div key={idx} className="rounded-none border border-white/5 bg-white/[0.02] overflow-hidden transition-all duration-300 hover:border-white/10">
            <button
              onClick={() => setActiveIndex(activeIndex === idx ? null : idx)}
              className="w-full p-6 flex items-center justify-between text-left transition-colors rounded-none border-b border-white/10 text-white hover:text-white"
            >
              <span className="font-bold text-white">{faq.question}</span>
              <motion.div
                animate={{ rotate: activeIndex === idx ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className={`w-5 h-5 ${activeIndex === idx ? "text-white" : "text-white/70"}`} />
              </motion.div>
            </button>
            <AnimatePresence>
              {activeIndex === idx && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="px-6 pb-6 text-gray-400 text-sm leading-relaxed border-t border-white/5 pt-4">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
