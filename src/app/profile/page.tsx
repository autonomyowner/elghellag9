'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { WILAYAS } from '@/lib/constants';
import {
  User,
  Phone,
  MessageSquare,
  MapPin,
  FileText,
  Save,
  Loader2,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, isLoading: authLoading, isAuthenticated } = useCurrentUser();
  const updateProfile = useMutation(api.users.updateProfile);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    wilaya: '',
    location: '',
    bio: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = '/auth/login';
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    if (user && !initialized) {
      setForm({
        name: user.name ?? '',
        phone: user.phone ?? '',
        whatsapp: user.whatsapp ?? '',
        wilaya: user.wilaya ?? '',
        location: user.location ?? '',
        bio: user.bio ?? '',
      });
      setInitialized(true);
    }
  }, [user, initialized]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        name: form.name.trim() || undefined,
        phone: form.phone.trim() || undefined,
        whatsapp: form.whatsapp.trim() || undefined,
        wilaya: form.wilaya || undefined,
        location: form.location.trim() || undefined,
        bio: form.bio.trim() || undefined,
      });
      toast.success('تم حفظ الملف الشخصي بنجاح');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'حدث خطأ';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2d5016] via-[#1a3a0a] to-[#0d1f05] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const avatarLetter = (user?.name ?? user?.email ?? 'U')[0]?.toUpperCase();
  const roleLabel = user?.role === 'seller' ? 'بائع' : 'مشتري';

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-green-900 to-gray-900 pt-20 pb-16 px-4"
      dir="rtl"
    >
      {/* Ambient glows */}
      <div className="fixed top-0 right-1/3 w-96 h-96 bg-green-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/3 left-1/4 w-72 h-72 bg-emerald-400/6 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl mx-auto">
        {/* Avatar + Role */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="relative mb-4">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover border-2 border-white/20 shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-white/12 backdrop-blur-sm border-2 border-white/20 flex items-center justify-center shadow-lg shadow-black/20">
                <span className="text-3xl font-bold text-white">{avatarLetter}</span>
              </div>
            )}
            <div className="absolute -bottom-1 -left-1 px-2.5 py-0.5 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full text-xs text-white font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              {roleLabel}
            </div>
          </div>
          <h1 className="text-xl font-bold text-white">{user?.name}</h1>
          <p className="text-white/50 text-sm">{user?.email}</p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          onSubmit={handleSubmit}
          className="bg-white/8 backdrop-blur-xl border border-white/15 rounded-3xl p-6 space-y-5"
        >
          <h2 className="text-white font-bold text-base mb-1">تعديل الملف الشخصي</h2>

          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-white/60 text-sm flex items-center gap-2">
              <User className="w-3.5 h-3.5" />
              الاسم الكامل
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="أدخل اسمك الكامل"
              className="w-full bg-white/8 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/40 focus:bg-white/12 transition-all duration-200"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-white/60 text-sm flex items-center gap-2">
              <Phone className="w-3.5 h-3.5" />
              رقم الهاتف
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="05xxxxxxxx"
              dir="ltr"
              className="w-full bg-white/8 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/40 focus:bg-white/12 transition-all duration-200 text-right"
            />
          </div>

          {/* WhatsApp */}
          <div className="space-y-1.5">
            <label className="text-white/60 text-sm flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5" />
              واتساب
            </label>
            <input
              type="tel"
              name="whatsapp"
              value={form.whatsapp}
              onChange={handleChange}
              placeholder="05xxxxxxxx"
              dir="ltr"
              className="w-full bg-white/8 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/40 focus:bg-white/12 transition-all duration-200 text-right"
            />
          </div>

          {/* Wilaya */}
          <div className="space-y-1.5">
            <label className="text-white/60 text-sm flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" />
              الولاية
            </label>
            <div className="relative">
              <select
                name="wilaya"
                value={form.wilaya}
                onChange={handleChange}
                className="w-full bg-white/8 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/40 focus:bg-white/12 transition-all duration-200 appearance-none cursor-pointer"
              >
                <option value="" className="bg-[#1a3a0a] text-white/60">
                  اختر الولاية
                </option>
                {WILAYAS.map((w) => (
                  <option key={w} value={w} className="bg-[#1a3a0a] text-white">
                    {w}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
            </div>
          </div>

          {/* Location detail */}
          <div className="space-y-1.5">
            <label className="text-white/60 text-sm flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" />
              العنوان التفصيلي
            </label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="الحي، البلدية..."
              className="w-full bg-white/8 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/40 focus:bg-white/12 transition-all duration-200"
            />
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <label className="text-white/60 text-sm flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" />
              نبذة عنك
            </label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              placeholder="اكتب نبذة قصيرة عن نفسك..."
              rows={3}
              className="w-full bg-white/8 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-white/30 text-sm resize-none focus:outline-none focus:border-white/40 focus:bg-white/12 transition-all duration-200"
            />
          </div>

          {/* Save Button */}
          <motion.button
            type="submit"
            disabled={isSaving}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-white/15 hover:bg-white/25 disabled:bg-white/5 disabled:opacity-50 backdrop-blur-sm border border-white/20 rounded-2xl text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-black/10"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </motion.button>
        </motion.form>
      </div>
    </div>
  );
}
