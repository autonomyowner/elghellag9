"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { CATEGORIES } from "@/lib/constants";

interface CategoryFilterProps {
  selected: string | null;
  onSelect: (value: string | null) => void;
}

export default function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative">
      {/* Fade edges */}
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-transparent to-transparent pointer-events-none z-10" />
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-transparent pointer-events-none z-10" />

      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        dir="rtl"
      >
        {/* All option */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(null)}
          className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 border"
          style={
            selected === null
              ? {
                  background: "linear-gradient(135deg, #2d5016, #7fb069)",
                  borderColor: "rgba(127,176,105,0.4)",
                  color: "#fff",
                  boxShadow: "0 0 16px rgba(127,176,105,0.3)",
                }
              : {
                  background: "rgba(255,255,255,0.07)",
                  backdropFilter: "blur(12px)",
                  borderColor: "rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.7)",
                }
          }
        >
          <span>🌿</span>
          <span>الكل</span>
        </motion.button>

        {/* Category pills */}
        {CATEGORIES.map((cat) => {
          const isActive = selected === cat.value;
          return (
            <motion.button
              key={cat.value}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(cat.value)}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 border"
              style={
                isActive
                  ? {
                      background: "linear-gradient(135deg, #2d5016, #7fb069)",
                      borderColor: "rgba(127,176,105,0.4)",
                      color: "#fff",
                      boxShadow: "0 0 16px rgba(127,176,105,0.3)",
                    }
                  : {
                      background: "rgba(255,255,255,0.07)",
                      backdropFilter: "blur(12px)",
                      borderColor: "rgba(255,255,255,0.12)",
                      color: "rgba(255,255,255,0.7)",
                    }
              }
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
