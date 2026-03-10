'use client'

import { useEffect, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { useConvexAuth } from '@/hooks/useCurrentUser'

interface AuthGuardProps {
  children: ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useConvexAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = '/auth/login'
    }
  }, [isLoading, isAuthenticated])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 to-gray-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative w-16 h-16 rounded-2xl bg-[#2d5016]/60 border border-[#7fb069]/30 flex items-center justify-center shadow-xl shadow-[#2d5016]/40">
            <span className="text-3xl">🌾</span>
            <motion.div
              className="absolute inset-0 rounded-2xl border-2 border-[#7fb069]/40"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>جارٍ التحقق من الهوية...</span>
          </div>
        </motion.div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
