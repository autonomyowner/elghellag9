'use client';

import React, { useEffect, useRef } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Package, Loader2, MessageCircle } from 'lucide-react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';

interface ChatViewProps {
  conversationId: string;
  onBack?: () => void;
}

export default function ChatView({ conversationId, onBack }: ChatViewProps) {
  const { user } = useCurrentUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const convId = conversationId as Id<'conversations'>;

  const conversation = useQuery(api.conversations.getById, {
    conversationId: convId,
  });

  const messages = useQuery(api.messages.listByConversation, {
    conversationId: convId,
  });

  const sendMessage = useMutation(api.messages.send);
  const markAsRead = useMutation(api.conversations.markAsRead);

  // Mark as read on mount and when new messages arrive
  useEffect(() => {
    if (conversationId) {
      markAsRead({ conversationId: convId }).catch(() => {});
    }
  }, [conversationId, messages?.length]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages?.length]);

  const handleSend = async (content: string, type: 'text' | 'image' | 'offer') => {
    if (!content.trim()) return;
    try {
      await sendMessage({
        conversationId: convId,
        content: content.trim(),
        messageType: type,
      });
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const isLoading = conversation === undefined || messages === undefined;
  const otherUser = conversation?.otherUser;
  const listing = conversation?.listing;

  return (
    <div className="flex flex-col h-full" dir="rtl">
      {/* Header */}
      <div
        className="flex-shrink-0 bg-white/8 backdrop-blur-xl border-b border-white/10
          px-4 py-3 flex items-center gap-3"
      >
        {/* Back button */}
        {onBack && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15
              flex items-center justify-center transition-all duration-200 flex-shrink-0"
          >
            <ArrowRight className="w-4 h-4 text-white" />
          </motion.button>
        )}

        {/* Avatar */}
        {otherUser && (
          <div
            className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500/40 to-emerald-600/40
              border border-green-400/30 flex items-center justify-center flex-shrink-0
              font-bold text-green-200 text-base"
          >
            {otherUser.name?.charAt(0).toUpperCase() ?? '?'}
          </div>
        )}

        {/* Name + listing */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="h-4 w-24 bg-white/10 rounded-full animate-pulse" />
          ) : (
            <>
              <p className="text-white font-semibold text-sm truncate">
                {otherUser?.name ?? 'مستخدم'}
              </p>
              {listing && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Package className="w-3 h-3 text-green-400/70" />
                  <span className="text-green-400/70 text-[11px] truncate">
                    {listing.title}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-3 py-4
          scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
          </div>
        ) : messages && messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full gap-3 text-center py-12"
          >
            <div
              className="w-14 h-14 rounded-full bg-white/8 border border-white/15
                flex items-center justify-center"
            >
              <MessageCircle className="w-7 h-7 text-white/30" />
            </div>
            <p className="text-white/40 text-sm">ابدأ المحادثة</p>
          </motion.div>
        ) : (
          <AnimatePresence initial={false}>
            {messages?.map((message) => (
              <MessageBubble
                key={message._id}
                message={message}
                isOwn={message.senderId === user?._id}
              />
            ))}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-white/10">
        <ChatInput onSend={handleSend} disabled={isLoading} />
      </div>
    </div>
  );
}
