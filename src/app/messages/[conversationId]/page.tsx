'use client';

import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import ChatView from '@/components/messaging/ChatView';

export default function ConversationPage() {
  const router = useRouter();
  const params = useParams();
  const conversationId = params.conversationId as string;

  const { isLoading: authLoading, isAuthenticated } = useCurrentUser();

  // Protected route
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a3008] via-[#1e3a0f] to-[#0f1a05] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const handleBack = () => {
    router.push('/messages');
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#1a3008] via-[#1e3a0f] to-[#0f1a05] flex flex-col"
      dir="rtl"
    >
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 right-1/3 w-80 h-80 bg-green-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-1/3 w-64 h-64 bg-emerald-600/6 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col flex-1 max-w-2xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <ChatView
            conversationId={conversationId}
            onBack={handleBack}
          />
        </motion.div>
      </div>
    </div>
  );
}
