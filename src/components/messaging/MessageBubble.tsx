'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { formatRelativeTime } from '@/lib/formatters';

interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: 'text' | 'image' | 'offer';
  _creationTime: number;
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

function parseOfferContent(content: string): { price: string; note: string } {
  // content format expected: "عرض سعر: 5000 د.ج\nملاحظة" or plain "5000"
  const priceMatch = content.match(/[\d\s,]+/);
  const price = priceMatch ? priceMatch[0].trim() : content;
  const note = content.replace(/[\d\s,]+/, '').replace('د.ج', '').trim();
  return { price, note };
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const bubbleVariants = {
    hidden: {
      opacity: 0,
      y: 10,
      scale: 0.95,
      x: isOwn ? -10 : 10,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 28,
        duration: 0.25,
      },
    },
  };

  const wrapperClass = `flex w-full mb-2 ${isOwn ? 'justify-start' : 'justify-end'}`;

  if (message.messageType === 'image') {
    return (
      <motion.div
        className={wrapperClass}
        dir="rtl"
        variants={bubbleVariants}
        initial="hidden"
        animate="visible"
      >
        <div
          className={`
            max-w-[72%] rounded-2xl overflow-hidden
            ${
              isOwn
                ? 'rounded-tr-sm bg-green-600/30 border border-green-500/30'
                : 'rounded-tl-sm bg-white/10 border border-white/15'
            }
          `}
        >
          <img
            src={message.content}
            alt="صورة"
            className="w-full max-h-64 object-cover"
            loading="lazy"
          />
          <div className={`px-3 py-1.5 flex ${isOwn ? 'justify-start' : 'justify-end'}`}>
            <span className="text-[10px] text-white/40">
              {formatRelativeTime(message._creationTime)}
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  if (message.messageType === 'offer') {
    const { price, note } = parseOfferContent(message.content);
    return (
      <motion.div
        className={wrapperClass}
        dir="rtl"
        variants={bubbleVariants}
        initial="hidden"
        animate="visible"
      >
        <div
          className={`
            max-w-[80%] rounded-2xl overflow-hidden border
            ${
              isOwn
                ? 'rounded-tr-sm bg-gradient-to-br from-green-700/40 to-emerald-800/40 border-green-500/40'
                : 'rounded-tl-sm bg-white/10 backdrop-blur-sm border-white/20'
            }
          `}
        >
          {/* Offer header */}
          <div
            className={`
              px-4 py-2 flex items-center gap-2
              ${isOwn ? 'bg-green-600/30' : 'bg-white/10'}
            `}
          >
            <div className="w-1 h-4 bg-green-400 rounded-full" />
            <span className="text-green-300 text-xs font-semibold tracking-wide">عرض سعر</span>
          </div>

          {/* Price */}
          <div className="px-4 py-3">
            <p className="text-white font-bold text-lg leading-none mb-1">
              {price} <span className="text-green-300 text-sm font-normal">د.ج</span>
            </p>
            {note && <p className="text-white/60 text-xs mt-1">{note}</p>}
          </div>

          {/* Timestamp */}
          <div className={`px-4 pb-2 flex ${isOwn ? 'justify-start' : 'justify-end'}`}>
            <span className="text-[10px] text-white/40">
              {formatRelativeTime(message._creationTime)}
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  // Default: text message
  return (
    <motion.div
      className={wrapperClass}
      dir="rtl"
      variants={bubbleVariants}
      initial="hidden"
      animate="visible"
    >
      <div
        className={`
          max-w-[75%] px-4 py-2.5 rounded-2xl
          ${
            isOwn
              ? 'rounded-tr-sm bg-gradient-to-br from-green-600/50 to-emerald-700/50 border border-green-500/30'
              : 'rounded-tl-sm bg-white/10 backdrop-blur-sm border border-white/15'
          }
        `}
      >
        <p className="text-white text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </p>
        <div className={`flex mt-1 ${isOwn ? 'justify-start' : 'justify-end'}`}>
          <span className="text-[10px] text-white/40">
            {formatRelativeTime(message._creationTime)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
