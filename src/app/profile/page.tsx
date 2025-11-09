'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/supabase/supabaseClient';
import { Equipment, LandListing } from '@/types/database.types';
import AuthGuard from '@/components/AuthGuard';

const ProfilePage: React.FC = () => {
  const { user, profile, updateProfile } = useSupabaseAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userListings, setUserListings] = useState<{
    equipment: Equipment[];
    land: LandListing[];
    animals: any[];
  }>({ equipment: [], land: [], animals: [] });

  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    phone: '',
    location: '',
    website: ''
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        phone: profile.phone || '',
        location: profile.location || '',
        website: profile.website || ''
      });
    }
  }, [profile]);

  useEffect(() => {
    if (user) {
      fetchUserListings();
    }
  }, [user]);

  const fetchUserListings = async () => {
    if (!user) return;
    try {
      // Fetch equipment listings
      const { data: equipmentData, error: equipmentError } = await supabase
        .from('equipment')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (equipmentError) {
        console.error('Error fetching equipment:', equipmentError);
      }

      // Fetch land listings
      const { data: landData, error: landError } = await supabase
        .from('land_listings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (landError) {
        console.error('Error fetching land listings:', landError);
      }

      // Fetch animals listings
      const { data: animalsData, error: animalsError } = await supabase
        .from('animals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (animalsError) {
        console.error('Error fetching animals:', animalsError);
      }

      setUserListings({
        equipment: equipmentData || [],
        land: landData || [],
        animals: animalsData || []
      });
    } catch (error) {
      console.error('Error fetching user listings:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError('');

    try {
      const { error } = await updateProfile(formData);
      if (error) {
        setFormError(error.message || 'حدث خطأ أثناء تحديث الملف الشخصي');
      } else {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setFormError('حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteListing = async (type: 'equipment' | 'land' | 'animals', id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإعلان؟')) return;

    try {
      const tableName = type === 'equipment' ? 'equipment' : type === 'land' ? 'land_listings' : 'animals';
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting ${type}:`, error);
        alert('حدث خطأ أثناء حذف الإعلان');
      } else {
        // Refresh listings
        fetchUserListings();
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      alert('حدث خطأ غير متوقع');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('ar-SA').format(price) + ' ' + currency;
  };



  return (
    <AuthGuard>
      <main className="min-h-screen gradient-bg-primary pt-20" aria-label="صفحة الملف الشخصي">
        <section className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <header className="text-center mb-8" aria-label="معلومات الملف الشخصي">
              <h1 className="text-4xl font-bold text-white mb-4">الملف الشخصي</h1>
              <p className="text-xl text-green-200">إدارة معلوماتك الشخصية وإعلاناتك</p>
            </header>

          {/* Profile Information */}
          <section className="card-responsive glass mb-8" aria-label="المعلومات الشخصية">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">المعلومات الشخصية</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-gradient-to-r from-brand-primary to-brand-accent text-white rounded-lg hover:shadow-lg transition-all duration-300"
                aria-label={isEditing ? 'إلغاء التعديل' : 'تعديل المعلومات الشخصية'}
              >
                {isEditing ? 'إلغاء' : 'تعديل'}
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6" aria-label="نموذج تعديل الملف الشخصي">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="full_name" className="block text-sm font-medium text-green-200 mb-2">
                      الاسم الكامل
                    </label>
                    <input
                      type="text"
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-400"
                      placeholder="أدخل اسمك الكامل"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-green-200 mb-2">
                      رقم الهاتف
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-400"
                      placeholder="أدخل رقم الهاتف"
                    />
                  </div>
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-green-200 mb-2">
                      الموقع
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-400"
                      placeholder="أدخل موقعك"
                    />
                  </div>
                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-green-200 mb-2">
                      الموقع الإلكتروني
                    </label>
                    <input
                      type="url"
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-400"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-green-200 mb-2">
                    نبذة شخصية
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
                    placeholder="اكتب نبذة عن نفسك..."
                  />
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-300"
                    aria-label="إلغاء التعديل"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-brand-primary to-brand-accent text-white rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                    aria-busy={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2"><svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="4" stroke="currentColor" strokeOpacity="0.2" /><path d="M12 2a10 10 0 0 1 10 10" strokeWidth="4" stroke="currentColor" /></svg> جاري الحفظ...</span>
                    ) : 'حفظ التغييرات'}
                  </button>
                </div>
                {/* Error message for profile update */}
                {formError && (
                  <div className="mt-4 p-3 rounded bg-red-500/20 border border-red-500/30 text-red-200 text-sm" role="alert">
                    {formError}
                  </div>
                )}
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-green-200">الاسم الكامل</span>
                    <p className="text-white font-medium">{profile?.full_name || 'غير محدد'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-green-200">رقم الهاتف</span>
                    <p className="text-white font-medium">{profile?.phone || 'غير محدد'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-green-200">الموقع</span>
                    <p className="text-white font-medium">{profile?.location || 'غير محدد'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-green-200">الموقع الإلكتروني</span>
                    <p className="text-white font-medium">{profile?.website || 'غير محدد'}</p>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-green-200">نبذة شخصية</span>
                  <p className="text-white font-medium">{profile?.bio || 'لا توجد نبذة شخصية'}</p>
                </div>
              </div>
            )}
          </section>

          {/* User Listings */}
          <section className="card-responsive glass" aria-label="إعلانات المستخدم">
            <h2 className="text-2xl font-bold text-white mb-6">إعلاناتي</h2>

            {/* Equipment Listings */}
            {userListings.equipment.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-4">المعدات الزراعية</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userListings.equipment.map((equipment) => (
                    <div key={equipment.id} className="bg-white/10 rounded-lg p-4 border border-white/20">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-white font-medium">{equipment.title}</h4>
                        <button
                          onClick={() => handleDeleteListing('equipment', equipment.id)}
                          className="text-red-400 hover:text-red-300 text-sm"
                          aria-label="حذف الإعلان"
                        >
                          حذف
                        </button>
                      </div>
                      <p className="text-green-200 text-sm mb-2">{equipment.description}</p>
                      <p className="text-white font-bold">{formatPrice(equipment.price, equipment.currency)}</p>
                      <p className="text-white/70 text-xs">{formatDate(equipment.created_at)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Land Listings */}
            {userListings.land.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-4">الأراضي الزراعية</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userListings.land.map((land) => (
                    <div key={land.id} className="bg-white/10 rounded-lg p-4 border border-white/20">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-white font-medium">{land.title}</h4>
                        <button
                          onClick={() => handleDeleteListing('land', land.id)}
                          className="text-red-400 hover:text-red-300 text-sm"
                          aria-label="حذف الإعلان"
                        >
                          حذف
                        </button>
                      </div>
                      <p className="text-green-200 text-sm mb-2">{land.description}</p>
                      <p className="text-white font-bold">{formatPrice(land.price, land.currency)}</p>
                      <p className="text-white/70 text-xs">{formatDate(land.created_at)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Animals Listings */}
            {userListings.animals.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-4">الحيوانات</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userListings.animals.map((animal) => (
                    <div key={animal.id} className="bg-white/10 rounded-lg p-4 border border-white/20">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-white font-medium">{animal.title}</h4>
                        <button
                          onClick={() => handleDeleteListing('animals', animal.id)}
                          className="text-red-400 hover:text-red-300 text-sm"
                          aria-label="حذف الإعلان"
                        >
                          حذف
                        </button>
                      </div>
                      <p className="text-green-200 text-sm mb-2">{animal.description}</p>
                      <p className="text-white font-bold">{formatPrice(animal.price, animal.currency)}</p>
                      <p className="text-white/70 text-xs">{formatDate(animal.created_at)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {userListings.equipment.length === 0 && userListings.land.length === 0 && userListings.animals.length === 0 && (
              <div className="text-center py-8">
                <p className="text-white/70 mb-4">لا توجد إعلانات حتى الآن</p>
                <div className="flex gap-4 justify-center">
                  <Link
                    href="/equipment/new"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    إضافة معدات
                  </Link>
                  <Link
                    href="/land/new"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    إضافة أرض
                  </Link>
                  <Link
                    href="/animals/new"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    إضافة حيوانات
                  </Link>
                </div>
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
    </AuthGuard>
  );
};

export default ProfilePage;
