'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { formatRelativeTime } from '@/lib/formatters';

interface OtherUser {
  _id: string;
  name: string;
  avatarUrl?: string;
}

interface Listing {
  _id: string;
  title: string;
}

interface LastMessage {
  _id: string;
  content: string;
  messageType: 'text' | 'image' | 'offer';
  senderId: string;
  _creationTime: number;
}

interface Conversation {
  _id: string;
  otherUser: OtherUser | null;
  listing: Listing | null;
  lastMessage: LastMessage | null;
  unread: number;
  lastMessageAt?: number;
  _creationTime: number;
}

interface ConversationListProps {
  conversations: Conversation[];
  activeId?: string | null;
  onSelect: (conversationId: string) => void;
}

function getMessagePreview(message: LastMessage | null): string {
  if (!message) return 'لا توجد رسائل بعد';
  if (message.messageType === 'image') return 'صورة';
  if (message.messageType === 'offer') {
    const match = message.content.match(/\d+/);
    return match ? `عرض سعر: ${match[0]} د.ج` : 'عرض سعر';
  }
  return message.content;
}

function AvatarCircle({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const letter = name ? name.charAt(0).toUpperCase() : '?';
  const sizeClasses = size === 'sm' ? 'w-10 h-10 text-sm' : 'w-12 h-12 text-base';
  return (
    <div
      className={`${sizeClasses} rounded-full bg-gradient-to-br from-green-500/40 to-emerald-600/40
        border border-green-400/30 flex items-center justify-center flex-shrink-0
        font-bold text-green-200`}
    >
      {letter}
    </div>
  );
}

export default function ConversationList({
  conversations,
  activeId,
  onSelect,
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 px-6 text-center">
        <div
          className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20
            flex items-center justify-center mb-4"
        >
          <MessageCircle className="w-8 h-8 text-white/40" />
        </div>
        <p className="text-white/50 text-sm leading-relaxed">لا توجد محادثات بعد</p>
        <p className="text-white/30 text-xs mt-1">ابدأ محادثة من صفحة إعلان</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 p-3" dir="rtl">
      <AnimatePresence initial={false}>
        {conversations.map((conv, index) => {
          const isActive = conv._id === activeId;
          const otherUser = conv.otherUser;
          const name = otherUser?.name ?? 'مستخدم';
          const preview = getMessagePreview(conv.lastMessage);
          const timestamp = conv.lastMessageAt ?? conv._creationTime;
          const hasUnread = conv.unread > 0;

          return (
            <motion.button
              key={conv._id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, delay: index * 0.04 }}
              onClick={() => onSelect(conv._id)}
              className={`
                w-full text-right rounded-2xl p-3 flex items-start gap-3
                transition-all duration-200 cursor-pointer border
                ${
                  isActive
                    ? 'bg-green-500/20 border-green-400/40 shadow-lg shadow-green-900/20'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }
              `}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <AvatarCircle name={name} />
                {hasUnread && (
                  <span
                    className="absolute -top-1 -left-1 min-w-[18px] h-[18px] rounded-full
                      bg-green-500 text-white text-[10px] font-bold flex items-center justify-center
                      px-1 shadow-md shadow-green-900/40"
                  >
                    {conv.unread > 99 ? '99+' : conv.unread}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span
                    className={`font-semibold text-sm truncate ${
                      isActive ? 'text-green-200' : 'text-white'
                    }`}
                  >
                    {name}
                  </span>
                  <span className="text-white/40 text-[11px] flex-shrink-0">
                    {formatRelativeTime(timestamp)}
                  </span>
                </div>

                {/* Listing subtitle */}
                {conv.listing && (
                  <p className="text-green-400/70 text-[11px] truncate mb-0.5">
                    {conv.listing.title}
                  </p>
                )}

                {/* Last message preview */}
                <p
                  className={`text-xs truncate ${
                    hasUnread ? 'text-white/80 font-medium' : 'text-white/40'
                  }`}
                >
                  {preview}
                </p>
              </div>

              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeConvIndicator"
                  className="w-1 h-8 bg-gradient-to-b from-green-400 to-emerald-500 rounded-full self-center flex-shrink-0"
                />
              )}
            </motion.button>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
