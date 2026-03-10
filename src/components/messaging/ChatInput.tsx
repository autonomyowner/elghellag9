'use client';

import React, { useState, useRef, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSend: (content: string, type: 'text' | 'image' | 'offer') => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed, 'text');
    setValue('');
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div
      className="flex items-end gap-2 p-3"
      dir="rtl"
    >
      {/* Input area */}
      <div
        className="flex-1 bg-white/8 backdrop-blur-xl border border-white/15 rounded-2xl
          focus-within:border-green-400/50 focus-within:bg-white/12
          transition-all duration-200 overflow-hidden"
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          disabled={disabled}
          placeholder="اكتب رسالتك..."
          rows={1}
          className="w-full bg-transparent px-4 py-3 text-sm text-white placeholder-white/30
            resize-none outline-none leading-relaxed max-h-[120px] overflow-y-auto
            scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
          dir="rtl"
        />
      </div>

      {/* Send button */}
      <motion.button
        onClick={handleSend}
        disabled={!canSend}
        whileTap={canSend ? { scale: 0.9 } : undefined}
        whileHover={canSend ? { scale: 1.05 } : undefined}
        className={`
          w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0
          transition-all duration-200 border
          ${
            canSend
              ? 'bg-gradient-to-br from-green-500 to-emerald-600 border-green-400/30 shadow-lg shadow-green-900/30 cursor-pointer'
              : 'bg-white/5 border-white/10 cursor-not-allowed opacity-40'
          }
        `}
      >
        {/* Mirror the send icon for RTL — arrow points right (toward left side in RTL) */}
        <Send
          className="w-4 h-4 text-white"
          style={{ transform: 'scaleX(-1)' }}
        />
      </motion.button>
    </div>
  );
}
