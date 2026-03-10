'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, LogIn } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import Link from 'next/link'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const result = await authClient.signIn.email({ email, password })
      if (result.error) {
        const msg = result.error.message || result.error.statusText || JSON.stringify(result.error)
        setError(msg || 'البريد الإلكتروني أو كلمة المرور غير صحيحة')
      } else {
        window.location.href = '/marketplace'
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'حدث خطأ غير متوقع'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const inputBase =
    'w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#7fb069]/60 focus:ring-2 focus:ring-[#7fb069]/20 backdrop-blur-sm transition-all duration-200 text-sm'

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full max-w-md mx-auto"
    >
      {/* Card */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl shadow-black/40">

        {/* Logo / Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#2d5016]/60 border border-[#7fb069]/30 mb-4 shadow-lg shadow-[#2d5016]/40"
          >
            <span className="text-3xl">🌾</span>
          </motion.div>
          <h1 className="text-2xl font-bold text-white mb-1">مرحباً بك في الغلة</h1>
          <p className="text-white/50 text-sm">سوق المزارعين الإلكتروني</p>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 overflow-hidden"
            >
              <div className="flex items-center gap-2 bg-red-500/15 border border-red-500/30 rounded-2xl px-4 py-3 text-red-300 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email/Password Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">

          {/* Email */}
          <div className="relative">
            <label className="block text-white/60 text-xs mb-1.5 font-medium">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="absolute top-1/2 -translate-y-1/2 right-3.5 w-4 h-4 text-white/40 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
                dir="ltr"
                className={`${inputBase} pr-10 text-left`}
              />
            </div>
          </div>

          {/* Password */}
          <div className="relative">
            <label className="block text-white/60 text-xs mb-1.5 font-medium">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute top-1/2 -translate-y-1/2 right-3.5 w-4 h-4 text-white/40 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                dir="ltr"
                className={`${inputBase} pr-10 pl-10 text-left`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute top-1/2 -translate-y-1/2 left-3.5 text-white/40 hover:text-white/70 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={isLoading}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-l from-[#2d5016] to-[#7fb069] hover:from-[#3a6b1e] hover:to-[#8fc47a] text-white font-semibold rounded-2xl px-4 py-3.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-[#2d5016]/30 mt-2"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <LogIn className="w-5 h-5" />
            )}
            <span>{isLoading ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول'}</span>
          </motion.button>
        </form>

        {/* Signup link */}
        <p className="text-center text-white/45 text-sm mt-6">
          ليس لديك حساب؟{' '}
          <Link
            href="/auth/signup"
            className="text-[#7fb069] hover:text-[#a0d485] font-medium transition-colors"
          >
            إنشاء حساب جديد
          </Link>
        </p>
      </div>
    </motion.div>
  )
}
