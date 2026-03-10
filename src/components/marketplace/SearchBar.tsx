"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  onSearch: (term: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  onSearch,
  placeholder = "ابحث عن منتجات زراعية...",
}: SearchBarProps) {
  const [value, setValue] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onSearch(value.trim());
    }, 400);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value, onSearch]);

  const handleClear = () => {
    setValue("");
    onSearch("");
  };

  return (
    <div className="relative w-full">
      {/* Search icon - right side for RTL */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
        <Search className="w-5 h-5 text-white/40" />
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        dir="rtl"
        className="w-full pr-12 pl-12 py-3.5 rounded-2xl text-white placeholder-white/40 text-base font-medium outline-none transition-all duration-200 focus:ring-2 focus:ring-green-500/30"
        style={{
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.14)",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "rgba(127,176,105,0.5)";
          e.target.style.background = "rgba(255,255,255,0.11)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "rgba(255,255,255,0.14)";
          e.target.style.background = "rgba(255,255,255,0.08)";
        }}
      />

      {/* Clear button - left side for RTL */}
      {value && (
        <button
          onClick={handleClear}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
        >
          <X className="w-3 h-3 text-white" />
        </button>
      )}
    </div>
  );
}
