'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useQuery } from 'convex/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Loader2 } from 'lucide-react';
import { api } from '../../../convex/_generated/api';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import ConversationList from '@/components/messaging/ConversationList';
import ChatView from '@/components/messaging/ChatView';

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading, isAuthenticated } = useCurrentUser();

  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    searchParams.get('conv') ?? null
  );
  const [showChatMobile, setShowChatMobile] = useState<boolean>(!!searchParams.get('conv'));

  const conversations = useQuery(
    api.conversations.listForUser,
    isAuthenticated ? {} : 'skip'
  );

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setShowChatMobile(true);
    const url = new URL(window.location.href);
    url.searchParams.set('conv', id);
    window.history.pushState({}, '', url.toString());
  };

  const handleBackToList = () => {
    setShowChatMobile(false);
    setActiveConversationId(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('conv');
    window.history.pushState({}, '', url.toString());
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a3008] via-[#1e3a0f] to-[#0f1a05] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const isLoadingConvs = conversations === undefined;

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#1a3008] via-[#1e3a0f] to-[#0f1a05]"
      dir="rtl"
    >
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-green-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-emerald-600/6 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 h-screen flex flex-col">
        <header className="flex-shrink-0 bg-black/20 backdrop-blur-xl border-b border-white/10 px-4 py-4">
          <div className="max-w-6xl mx-auto flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-white font-bold text-lg">الرسائل</h1>
            {!isLoadingConvs && conversations && conversations.length > 0 && (
              <span className="bg-green-500/20 border border-green-400/30 text-green-300 text-xs px-2 py-0.5 rounded-full font-medium">
                {conversations.length}
              </span>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-hidden max-w-6xl mx-auto w-full">
          {/* Desktop split layout */}
          <div className="hidden md:flex h-full gap-0">
            <div className="w-80 lg:w-96 flex-shrink-0 border-l border-white/10 overflow-y-auto bg-black/10 backdrop-blur-sm">
              {isLoadingConvs ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="w-5 h-5 text-white/30 animate-spin" />
                </div>
              ) : (
                <ConversationList
                  conversations={conversations ?? []}
                  activeId={activeConversationId}
                  onSelect={handleSelectConversation}
                />
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              {activeConversationId ? (
                <motion.div
                  key={activeConversationId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full"
                >
                  <ChatView conversationId={activeConversationId} />
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
                  <div className="w-20 h-20 rounded-full bg-white/8 backdrop-blur-sm border border-white/15 flex items-center justify-center">
                    <MessageCircle className="w-10 h-10 text-white/20" />
                  </div>
                  <p className="text-white/50 text-base font-medium">اختر محادثة</p>
                  <p className="text-white/30 text-sm">اختر محادثة من القائمة لعرض الرسائل</p>
                </div>
              )}
            </div>
          </div>

          {/* Mobile conditional view */}
          <div className="flex md:hidden h-full flex-col">
            <AnimatePresence mode="wait">
              {showChatMobile && activeConversationId ? (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex-1 overflow-hidden"
                >
                  <ChatView conversationId={activeConversationId} onBack={handleBackToList} />
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-1 overflow-y-auto"
                >
                  {isLoadingConvs ? (
                    <div className="flex items-center justify-center h-32">
                      <Loader2 className="w-5 h-5 text-white/30 animate-spin" />
                    </div>
                  ) : (
                    <ConversationList
                      conversations={conversations ?? []}
                      activeId={activeConversationId}
                      onSelect={handleSelectConversation}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-[#1a3008] via-[#1e3a0f] to-[#0f1a05] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
