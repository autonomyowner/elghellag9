'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, User, AlertCircle, Loader2, UserPlus, ShoppingCart, Store } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import Link from 'next/link'

type Role = 'buyer' | 'seller'

export default function SignupForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<Role>('buyer')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createOrUpdate = useMutation(api.users.createOrUpdate)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const { error: authError } = await authClient.signUp.email({
        email,
        password,
        name,
      })

      if (authError) {
        setError(authError.message || 'فشل إنشاء الحساب. حاول مرة أخرى.')
        return
      }

      await createOrUpdate({ email, name, role })
      window.location.href = '/marketplace'
    } catch {
      setError('حدث خطأ غير متوقع. حاول مرة أخرى.')
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
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl shadow-black/40">

        {/* Logo / Title */}
        <div className="text-center mb-7">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#2d5016]/60 border border-[#7fb069]/30 mb-4 shadow-lg shadow-[#2d5016]/40"
          >
            <span className="text-3xl">🌾</span>
          </motion.div>
          <h1 className="text-2xl font-bold text-white mb-1">إنشاء حساب جديد</h1>
          <p className="text-white/50 text-sm">انضم إلى سوق الغلة الإلكتروني</p>
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

        <form onSubmit={handleSignup} className="space-y-4">

          {/* Role Selector */}
          <div>
            <label className="block text-white/60 text-xs mb-2 font-medium">نوع الحساب</label>
            <div className="grid grid-cols-2 gap-3">
              {/* Buyer */}
              <motion.button
                type="button"
                onClick={() => setRole('buyer')}
                whileTap={{ scale: 0.97 }}
                className={`relative flex flex-col items-center gap-2 py-4 px-3 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  role === 'buyer'
                    ? 'bg-[#2d5016]/50 border-[#7fb069]/60 shadow-lg shadow-[#2d5016]/20'
                    : 'bg-white/5 border-white/15 hover:bg-white/10 hover:border-white/25'
                }`}
              >
                <ShoppingCart
                  className={`w-6 h-6 transition-colors duration-200 ${
                    role === 'buyer' ? 'text-[#7fb069]' : 'text-white/40'
                  }`}
                />
                <span
                  className={`text-sm font-semibold transition-colors duration-200 ${
                    role === 'buyer' ? 'text-white' : 'text-white/50'
                  }`}
                >
                  مشتري
                </span>
                <span
                  className={`text-xs text-center transition-colors duration-200 ${
                    role === 'buyer' ? 'text-white/60' : 'text-white/30'
                  }`}
                >
                  أبحث عن منتجات
                </span>
                {role === 'buyer' && (
                  <motion.div
                    layoutId="role-indicator"
                    className="absolute inset-0 rounded-2xl ring-2 ring-[#7fb069]/50"
                  />
                )}
              </motion.button>

              {/* Seller */}
              <motion.button
                type="button"
                onClick={() => setRole('seller')}
                whileTap={{ scale: 0.97 }}
                className={`relative flex flex-col items-center gap-2 py-4 px-3 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  role === 'seller'
                    ? 'bg-[#2d5016]/50 border-[#7fb069]/60 shadow-lg shadow-[#2d5016]/20'
                    : 'bg-white/5 border-white/15 hover:bg-white/10 hover:border-white/25'
                }`}
              >
                <Store
                  className={`w-6 h-6 transition-colors duration-200 ${
                    role === 'seller' ? 'text-[#7fb069]' : 'text-white/40'
                  }`}
                />
                <span
                  className={`text-sm font-semibold transition-colors duration-200 ${
                    role === 'seller' ? 'text-white' : 'text-white/50'
                  }`}
                >
                  بائع
                </span>
                <span
                  className={`text-xs text-center transition-colors duration-200 ${
                    role === 'seller' ? 'text-white/60' : 'text-white/30'
                  }`}
                >
                  أبيع منتجاتي
                </span>
                {role === 'seller' && (
                  <motion.div
                    layoutId="role-indicator"
                    className="absolute inset-0 rounded-2xl ring-2 ring-[#7fb069]/50"
                  />
                )}
              </motion.button>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-white/60 text-xs mb-1.5 font-medium">الاسم الكامل</label>
            <div className="relative">
              <User className="absolute top-1/2 -translate-y-1/2 right-3.5 w-4 h-4 text-white/40 pointer-events-none" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="أدخل اسمك الكامل"
                required
                className={`${inputBase} pr-10`}
              />
            </div>
          </div>

          {/* Email */}
          <div>
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
          <div>
            <label className="block text-white/60 text-xs mb-1.5 font-medium">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute top-1/2 -translate-y-1/2 right-3.5 w-4 h-4 text-white/40 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8 أحرف على الأقل"
                required
                minLength={8}
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
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-l from-[#2d5016] to-[#7fb069] hover:from-[#3a6b1e] hover:to-[#8fc47a] text-white font-semibold rounded-2xl px-4 py-3.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-[#2d5016]/30 mt-1"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <UserPlus className="w-5 h-5" />
            )}
            <span>{isLoading ? 'جارٍ إنشاء الحساب...' : 'إنشاء حساب'}</span>
          </motion.button>
        </form>

        {/* Login link */}
        <p className="text-center text-white/45 text-sm mt-6">
          لديك حساب بالفعل؟{' '}
          <Link
            href="/auth/login"
            className="text-[#7fb069] hover:text-[#a0d485] font-medium transition-colors"
          >
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </motion.div>
  )
}
