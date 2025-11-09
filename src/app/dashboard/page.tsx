'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic';
import AuthGuard from '@/components/AuthGuard'

const MotionDiv = dynamic(() => import('framer-motion').then(mod => mod.motion.div), { ssr: false, loading: () => <div /> });
const MotionButton = dynamic(() => import('framer-motion').then(mod => mod.motion.button), { ssr: false, loading: () => <button /> });
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext'
import { useSupabaseData } from '@/hooks/useSupabase'
import { 
  User, Settings, Plus, Package, BarChart3, MessageCircle, 
  Heart, Star, Tractor, ArrowLeft, Edit3, Trash2, Eye,
  MapPin, Calendar, DollarSign, Phone, Mail, Globe
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, signOut } = useSupabaseAuth()
  const { getEquipment, isOnline, isWithinLimits } = useSupabaseData()
  const [equipment, setEquipment] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [profile] = useState<any>({ full_name: 'مستخدم' })
  const [activeTab, setActiveTab] = useState('overview')

  const handleSignOut = async () => {
    await signOut()
  }

  const handleDeleteEquipment = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا العنصر؟')) {
      // TODO: Implement delete functionality
      console.log('Delete equipment:', id)
    }
  }

  const tabs = [
    { id: 'overview', name: 'نظرة عامة', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'equipment', name: 'معداتي', icon: <Package className="w-5 h-5" /> },
    { id: 'messages', name: 'الرسائل', icon: <MessageCircle className="w-5 h-5" /> },
    { id: 'favorites', name: 'المفضلة', icon: <Heart className="w-5 h-5" /> },
    { id: 'profile', name: 'الملف الشخصي', icon: <User className="w-5 h-5" /> },
    { id: 'settings', name: 'الإعدادات', icon: <Settings className="w-5 h-5" /> },
  ]

  return (
    <AuthGuard>
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]" dir="rtl">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-lg border-b border-green-500/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-white hover:text-green-400 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>العودة للرئيسية</span>
              </Link>
              <div className="flex items-center gap-2">
                <Tractor className="w-8 h-8 text-green-400" />
                <span className="text-2xl font-bold text-white">لوحة التحكم</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-white text-sm">
                مرحباً، {profile?.full_name || user!.email}
              </div>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass p-6 rounded-2xl border border-green-500/30 sticky top-8">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeTab === tab.id
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'overview' && (
              <MotionDiv
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h1 className="text-3xl font-bold text-white mb-8">نظرة عامة</h1>
                
                {/* Stats Cards */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="glass p-6 rounded-xl border border-green-500/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/70 text-sm">معداتي</p>
                        <p className="text-2xl font-bold text-white">{equipment?.length || 0}</p>
                      </div>
                      <Package className="w-8 h-8 text-green-400" />
                    </div>
                  </div>
                  <div className="glass p-6 rounded-xl border border-green-500/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/70 text-sm">المشاهدات</p>
                                                 <p className="text-2xl font-bold text-white">
                           {equipment?.reduce((total, item) => total + ((item as any).view_count || 0), 0) || 0}
                         </p>
                      </div>
                      <Eye className="w-8 h-8 text-blue-400" />
                    </div>
                  </div>
                  <div className="glass p-6 rounded-xl border border-green-500/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/70 text-sm">التقييم</p>
                                                 <p className="text-2xl font-bold text-white">
                           {((profile as any)?.rating)?.toFixed(1) || '0.0'}
                         </p>
                      </div>
                      <Star className="w-8 h-8 text-yellow-400" />
                    </div>
                  </div>
                </div>

                {/* Recent Equipment */}
                <div className="glass p-6 rounded-xl border border-green-500/30">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">المعدات الحديثة</h2>
                    <Link
                      href="/dashboard?tab=equipment"
                      className="text-green-400 hover:text-green-300 text-sm"
                    >
                      عرض الكل
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {equipment?.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-4 bg-black/30 rounded-lg">
                        <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-green-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-medium">{item.title}</h3>
                          <p className="text-white/70 text-sm">{item.location}</p>
                        </div>
                        <div className="text-left">
                          <p className="text-green-400 font-bold">{item.price?.toLocaleString('en-US')} د.ج</p>
                                                     <p className="text-white/70 text-sm">{(item as any).view_count || 0} مشاهدة</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </MotionDiv>
            )}

            {activeTab === 'equipment' && (
              <MotionDiv
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold text-white">معداتي</h1>
                  <button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                    <Plus className="w-5 h-5" />
                    إضافة معدة جديدة
                  </button>
                </div>

                                  {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {equipment?.map((item) => (
                      <div key={item.id} className="glass p-6 rounded-xl border border-green-500/30">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
                            <p className="text-white/70 text-sm mb-2">{item.description}</p>
                            <div className="flex items-center gap-4 text-sm text-white/70">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {item.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {item.year}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteEquipment(item.id)}
                              className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-white/10">
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4 text-green-400" />
                            <span className="text-green-400 font-bold">{item.price?.toLocaleString('en-US')} د.ج</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-white/70">
                                                         <span className="flex items-center gap-1">
                               <Eye className="w-4 h-4" />
                               {(item as any).view_count || 0}
                             </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              item.is_available 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {item.is_available ? 'متاح' : 'غير متاح'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </MotionDiv>
            )}

            {activeTab === 'profile' && (
              <MotionDiv
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h1 className="text-3xl font-bold text-white">الملف الشخصي</h1>
                
                <div className="glass p-8 rounded-xl border border-green-500/30">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                          <User className="w-10 h-10 text-green-400" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white">{profile?.full_name || 'اسم المستخدم'}</h2>
                          <p className="text-green-400">{profile?.user_type === 'farmer' ? 'مزارع' : profile?.user_type === 'buyer' ? 'مشتري' : 'مزارع وتاجر'}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Star className="w-4 h-4 text-yellow-400" />
                                                         <span className="text-white/70">{((profile as any)?.rating)?.toFixed(1) || '0.0'} ({(profile as any)?.total_ratings || 0} تقييم)</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-green-300 mb-2">الاسم الكامل</label>
                            <input
                              type="text"
                              value={profile?.full_name || ''}
                              className="w-full p-3 bg-black/50 text-white rounded-lg border border-white/20 focus:border-green-400 focus:outline-none"
                              placeholder="أدخل اسمك الكامل"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-green-300 mb-2">رقم الهاتف</label>
                            <input
                              type="tel"
                              value={profile?.phone || ''}
                              className="w-full p-3 bg-black/50 text-white rounded-lg border border-white/20 focus:border-green-400 focus:outline-none"
                              placeholder="07xxxxxxxx"
                            />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-green-300 mb-2">الموقع</label>
                            <input
                              type="text"
                              value={profile?.location || ''}
                              className="w-full p-3 bg-black/50 text-white rounded-lg border border-white/20 focus:border-green-400 focus:outline-none"
                              placeholder="المدينة، الولاية"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-green-300 mb-2">نوع الحساب</label>
                            <select
                              value={profile?.user_type || 'farmer'}
                              className="w-full p-3 bg-black/50 text-white rounded-lg border border-white/20 focus:border-green-400 focus:outline-none"
                            >
                              <option value="farmer">مزارع</option>
                              <option value="buyer">مشتري</option>
                              <option value="both">مزارع وتاجر</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <button className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium">
                        حفظ التغييرات
                      </button>
                    </div>
                  )}
                </div>
              </MotionDiv>
            )}

            {/* Placeholder for other tabs */}
            {activeTab === 'messages' && (
              <div className="glass p-8 rounded-xl border border-green-500/30 text-center">
                <MessageCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">الرسائل</h2>
                <p className="text-white/70">سيتم إضافة نظام الرسائل قريباً</p>
              </div>
            )}

            {activeTab === 'favorites' && (
              <div className="glass p-8 rounded-xl border border-green-500/30 text-center">
                <Heart className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">المفضلة</h2>
                <p className="text-white/70">سيتم إضافة نظام المفضلة قريباً</p>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="glass p-8 rounded-xl border border-green-500/30 text-center">
                <Settings className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">الإعدادات</h2>
                <p className="text-white/70">سيتم إضافة الإعدادات قريباً</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </AuthGuard>
  )
}
