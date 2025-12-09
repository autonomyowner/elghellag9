'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { apiClient } from '@/lib/api/client';
import { useUser, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

interface Nursery {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  plant_type: 'fruit_trees' | 'ornamental' | 'vegetables' | 'herbs' | 'forest' | 'other';
  plant_name: string | null;
  age_months: number | null;
  size: 'seedling' | 'small' | 'medium' | 'large' | 'mature';
  quantity: number;
  health_status: string | null;
  location: string;
  coordinates?: any;
  images: string[];
  is_available: boolean;
  is_featured: boolean;
  view_count: number;
  pot_size: string | null;
  care_instructions: string | null;
  seasonality: 'spring' | 'summer' | 'autumn' | 'winter' | 'all_year';
  contact_phone: string | null;
  user?: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    phone: string | null;
    isVerified: boolean;
    location: string | null;
  };
}

const NurseryDetailPage: React.FC = () => {
  const params = useParams();
  const nurseryId = params.id as string;
  const { user } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();

  const [nursery, setNursery] = useState<Nursery | null>(null);
  const [relatedNurseries, setRelatedNurseries] = useState<Nursery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (nurseryId) {
      fetchNurseryDetails();
    }
  }, [nurseryId]);

  const fetchNurseryDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use the new API client to get nursery by ID
      const nurseryData = await apiClient.getNurseryById(nurseryId) as Nursery;

      if (!nurseryData) {
        setError('لم يتم العثور على الإعلان');
        return;
      }

      setNursery(nurseryData);

      // Get related nurseries (same plant type) from API
      try {
        const response = await apiClient.getNurseries({ limit: '5' }) as any;
        const allNurseries = response.items || response || [];
        const relatedData = allNurseries
          .filter((item: Nursery) =>
            item.id !== nurseryId &&
            item.plant_type === nurseryData.plant_type &&
            item.is_available !== false
          )
          .slice(0, 4);
        setRelatedNurseries(relatedData);
      } catch (relatedErr) {
        console.error('Error fetching related nurseries:', relatedErr);
      }

    } catch (err: any) {
      console.error('Error fetching nursery details:', err);
      setError('حدث خطأ في تحميل تفاصيل الإعلان');
    } finally {
      setLoading(false);
    }
  };

  const handleImageNavigation = (direction: 'next' | 'prev') => {
    if (!nursery || !nursery.images) return;

    if (direction === 'next') {
      setCurrentImageIndex((prev) => 
        prev === nursery.images.length - 1 ? 0 : prev + 1
      );
    } else {
      setCurrentImageIndex((prev) => 
        prev === 0 ? nursery.images.length - 1 : prev - 1
      );
    }
  };

  const getPlantTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      fruit_trees: 'أشجار الفاكهة',
      ornamental: 'نباتات الزينة',
      vegetables: 'الخضروات',
      herbs: 'الأعشاب',
      forest: 'الأشجار الحرجية',
      other: 'أخرى'
    };
    return labels[type] || type;
  };

  const getSizeLabel = (size: string) => {
    const labels: { [key: string]: string } = {
      seedling: 'شتلة صغيرة',
      small: 'صغير',
      medium: 'متوسط',
      large: 'كبير',
      mature: 'ناضج'
    };
    return labels[size] || size;
  };

  const getSeasonLabel = (season: string) => {
    const labels: { [key: string]: string } = {
      spring: 'الربيع',
      summer: 'الصيف',
      autumn: 'الخريف',
      winter: 'الشتاء',
      all_year: 'طوال العام'
    };
    return labels[season] || season;
  };

  const formatPrice = (price: number, currency: string) => {
    return `${price.toLocaleString()} ${currency}`;
  };

  const handleDeleteNursery = async () => {
    if (!nursery || !user) return;

    if (!confirm('هل أنت متأكد من حذف هذا الإعلان؟ لا يمكن التراجع عن هذا الإجراء.')) {
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        router.push('/sign-in');
        return;
      }
      await apiClient.deleteNursery(token, nursery.id);
      alert('تم حذف الإعلان بنجاح');
      router.push('/nurseries');
    } catch (error) {
      console.error('Error deleting nursery:', error);
      alert('حدث خطأ أثناء حذف الإعلان');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white text-lg">جاري التحميل...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !nursery) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🌱</div>
            <h3 className="text-2xl font-bold mb-2 text-white">لم يتم العثور على الإعلان</h3>
            <p className="text-gray-300 mb-6">{error || 'الإعلان غير موجود أو تم حذفه'}</p>
            <Link
              href="/nurseries"
              className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors text-white"
            >
              العودة إلى الشتلات
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-gray-300">
            <li>
              <Link href="/" className="hover:text-white transition-colors">
                الرئيسية
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/nurseries" className="hover:text-white transition-colors">
                الشتلات والمشاتل
              </Link>
            </li>
            <li>/</li>
            <li className="text-white">{nursery.title}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Images */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
              <div className="relative w-full h-96 rounded-xl overflow-hidden mb-4 bg-gray-200 flex items-center justify-center">
                {nursery.images && nursery.images.length > 0 ? (
                  <>
                    <Image
                      src={nursery.images[currentImageIndex]}
                      alt={nursery.title}
                      width={800}
                      height={400}
                      className="w-full h-full object-cover"
                      priority
                      onError={(e) => {
                        console.error('Failed to load nursery image:', nursery.images[currentImageIndex]);
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.parentElement?.querySelector('.fallback-emoji');
                        if (fallback) fallback.classList.remove('hidden');
                      }}
                    />
                    <span className="text-6xl hidden fallback-emoji absolute">🌱</span>
                    {nursery.images.length > 1 && (
                      <>
                        <button
                          onClick={() => handleImageNavigation('prev')}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                        >
                          ←
                        </button>
                        <button
                          onClick={() => handleImageNavigation('next')}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                        >
                          →
                        </button>
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                          {nursery.images.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`w-3 h-3 rounded-full ${
                                index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <span className="text-6xl">🌱</span>
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              {nursery.images && nursery.images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto">
                  {nursery.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden ${
                        index === currentImageIndex ? 'ring-2 ring-green-400' : ''
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${nursery.title} - صورة ${index + 1}`}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
              <h1 className="text-3xl font-bold text-white mb-4">{nursery.title}</h1>
              
              <div className="text-3xl font-bold text-green-400 mb-6">
                {formatPrice(nursery.price, nursery.currency)}
              </div>

              {nursery.description && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white mb-2">الوصف</h3>
                  <p className="text-gray-300 leading-relaxed">{nursery.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center text-gray-300">
                    <span className="font-semibold ml-2">نوع النبات:</span>
                    <span>{getPlantTypeLabel(nursery.plant_type)}</span>
                  </div>
                  
                  {nursery.plant_name && (
                    <div className="flex items-center text-gray-300">
                      <span className="font-semibold ml-2">اسم النبات:</span>
                      <span>{nursery.plant_name}</span>
                    </div>
                  )}

                  <div className="flex items-center text-gray-300">
                    <span className="font-semibold ml-2">الحجم:</span>
                    <span>{getSizeLabel(nursery.size)}</span>
                  </div>

                  <div className="flex items-center text-gray-300">
                    <span className="font-semibold ml-2">الكمية المتاحة:</span>
                    <span>{nursery.quantity}</span>
                  </div>

                  {nursery.age_months && (
                    <div className="flex items-center text-gray-300">
                      <span className="font-semibold ml-2">العمر (بالشهور):</span>
                      <span>{nursery.age_months}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center text-gray-300">
                    <span className="font-semibold ml-2">الموقع:</span>
                    <span>{nursery.location}</span>
                  </div>

                  <div className="flex items-center text-gray-300">
                    <span className="font-semibold ml-2">الموسم:</span>
                    <span>{getSeasonLabel(nursery.seasonality)}</span>
                  </div>

                  {nursery.pot_size && (
                    <div className="flex items-center text-gray-300">
                      <span className="font-semibold ml-2">حجم الإناء:</span>
                      <span>{nursery.pot_size}</span>
                    </div>
                  )}

                  {nursery.health_status && (
                    <div className="flex items-center text-gray-300">
                      <span className="font-semibold ml-2">الحالة الصحية:</span>
                      <span>{nursery.health_status}</span>
                    </div>
                  )}

                  {nursery.contact_phone && (
                    <div className="flex items-center text-gray-300">
                      <span className="font-semibold ml-2">رقم الهاتف:</span>
                      <span>{nursery.contact_phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {nursery.care_instructions && (
                <div className="mt-6">
                  <h3 className="text-xl font-semibold text-white mb-2">تعليمات العناية</h3>
                  <p className="text-gray-300 leading-relaxed">{nursery.care_instructions}</p>
                </div>
              )}
            </div>

            {/* Related Nurseries */}
            {relatedNurseries.length > 0 && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <h3 className="text-2xl font-bold text-white mb-6">شتلات مشابهة</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {relatedNurseries.map((relatedNursery) => (
                    <Link
                      key={relatedNursery.id}
                      href={`/nurseries/${relatedNursery.id}`}
                      className="block bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          {relatedNursery.images && relatedNursery.images.length > 0 ? (
                            <Image
                              src={relatedNursery.images[0]}
                              alt={relatedNursery.title}
                              width={64}
                              height={64}
                              className="object-cover rounded-lg"
                            />
                          ) : (
                            <span className="text-2xl">🌱</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-white mb-1">{relatedNursery.title}</h4>
                          <p className="text-green-400 font-bold">{formatPrice(relatedNursery.price, relatedNursery.currency)}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Seller Info */}
            {nursery.user && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
                <h3 className="text-lg font-bold text-white mb-4">معلومات البائع</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-900/50 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-white">{nursery.user.fullName}</div>
                      {nursery.user.location && (
                        <div className="text-sm text-gray-400">{nursery.user.location}</div>
                      )}
                    </div>
                  </div>
                  {nursery.user.isVerified && (
                    <div className="flex items-center gap-2 text-green-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-semibold">حساب موثق</span>
                    </div>
                  )}
                </div>
              </div>
            )}

                         {/* Contact Actions */}
             <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
               <h3 className="text-xl font-bold text-white mb-4">تواصل مع البائع</h3>
               
               {nursery.contact_phone && (
                 <a
                   href={`tel:${nursery.contact_phone}`}
                   className="block w-full bg-green-600 hover:bg-green-700 text-white text-center py-3 px-4 rounded-lg font-semibold transition-colors mb-3"
                 >
                   📞 اتصل الآن
                 </a>
               )}

               <button className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 px-4 rounded-lg font-semibold transition-colors mb-3">
                 💬 إرسال رسالة
               </button>

               <button className="block w-full bg-yellow-600 hover:bg-yellow-700 text-white text-center py-3 px-4 rounded-lg font-semibold transition-colors mb-3">
                 ⭐ إضافة للمفضلة
               </button>

                               {/* Delete Button for Owner */}
                {user && nursery.user_id === user?.id && (
                  <button 
                    onClick={handleDeleteNursery}
                    className="block w-full bg-red-600 hover:bg-red-700 text-white text-center py-3 px-4 rounded-lg font-semibold transition-colors"
                    aria-label="حذف الإعلان"
                  >
                    🗑️ حذف الإعلان
                  </button>
                )}
             </div>

            {/* Quick Info */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">معلومات سريعة</h3>
              
              <div className="space-y-3 text-gray-300">
                <div className="flex justify-between">
                  <span>تاريخ النشر:</span>
                  <span>{new Date(nursery.created_at).toLocaleDateString('ar-SA')}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>آخر تحديث:</span>
                  <span>{new Date(nursery.updated_at).toLocaleDateString('ar-SA')}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>عدد المشاهدات:</span>
                  <span>{nursery.view_count}</span>
                </div>
                
                {nursery.is_featured && (
                  <div className="flex justify-between">
                    <span>مميز:</span>
                    <span className="text-green-400">✓</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NurseryDetailPage; 