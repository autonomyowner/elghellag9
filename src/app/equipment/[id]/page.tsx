'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useSupabaseData } from '@/hooks/useSupabase';
import { fetchSellerInfo, Profile } from '@/lib/sellerUtils';
import SellerInfo from '@/components/SellerInfo';

interface Equipment {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  condition: 'new' | 'excellent' | 'good' | 'fair' | 'poor';
  location: string;
  brand: string | null;
  model: string | null;
  year: number | null;
  hours_used: number | null;
  images: string[];
  category_id: string;
  is_available: boolean;
  is_featured: boolean;
  view_count: number;
}



const EquipmentDetailPage: React.FC = () => {
  const params = useParams();
  const equipmentId = params.id as string;
  const { getEquipment, isOnline, isWithinLimits } = useSupabaseData();
  
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [seller, setSeller] = useState<Profile | null>(null);
  const [relatedEquipment, setRelatedEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (equipmentId) {
      fetchEquipmentDetails();
    }
  }, [equipmentId]);

  const fetchEquipmentDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use our hybrid hook to get equipment data
      const data = await getEquipment();
      
      // Find the specific equipment by ID
      const equipmentData = data.find(item => item.id === equipmentId);
      
      if (!equipmentData) {
        setError('لم يتم العثور على الإعلان');
        return;
      }

      // Use the equipment data directly since it's already in the correct format
      setEquipment(equipmentData);

      // Fetch real seller data using utility function
      const sellerData = await fetchSellerInfo(equipmentData.user_id, equipmentData.location);
      setSeller(sellerData);

      // Get related equipment (same category)
      const relatedData = data
        .filter(item => 
          item.id !== equipmentId && 
          item.category_id === equipmentData.category_id &&
          item.is_available !== false
        )
        .slice(0, 4);

      setRelatedEquipment(relatedData);

    } catch (err: any) {
      console.error('Error fetching equipment details:', err);
      setError('حدث خطأ في تحميل تفاصيل الإعلان');
    } finally {
      setLoading(false);
    }
  };

  const handleImageNavigation = (direction: 'next' | 'prev') => {
    if (!equipment || !equipment.images) return;

    if (direction === 'next') {
      setCurrentImageIndex((prev) => 
        prev === equipment.images.length - 1 ? 0 : prev + 1
      );
    } else {
      setCurrentImageIndex((prev) => 
        prev === 0 ? equipment.images.length - 1 : prev - 1
      );
    }
  };

  const getConditionLabel = (condition: string) => {
    const conditions = {
      new: 'جديد',
      excellent: 'ممتاز',
      good: 'جيد',
      fair: 'مقبول',
      poor: 'يحتاج صيانة'
    };
    return conditions[condition as keyof typeof conditions] || condition;
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('ar-DZ', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (!equipment) {
    return <div className="text-center py-8">لم يتم العثور على الإعلان.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Image gallery */}
        <div className="lg:col-span-2">
          <div className="bg-black/50 backdrop-blur-lg border border-green-500/30 rounded-xl overflow-hidden">
            {equipment.images && equipment.images.length > 0 ? (
              <div className="relative w-full h-96 bg-neutral-900 flex items-center justify-center">
                <Image
                  src={equipment.images[currentImageIndex]}
                  alt={equipment.title}
                  width={800}
                  height={400}
                  className="w-full h-full object-cover"
                  priority
                  onError={(e) => {
                    console.error('Failed to load image:', equipment.images[currentImageIndex]);
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling;
                    if (fallback) fallback.classList.remove('hidden');
                  }}
                />
                <span className="text-6xl hidden absolute">🚜</span>

                {equipment.images.length > 1 && (
                  <>
                    <button
                      onClick={() => handleImageNavigation('prev')}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-70 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleImageNavigation('next')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-70 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="aspect-video bg-neutral-900 flex items-center justify-center">
                <span className="text-neutral-600 text-6xl">🚜</span>
              </div>
            )}

            {/* Image Thumbnails */}
            {equipment.images && equipment.images.length > 1 && (
              <div className="p-4 flex gap-2 overflow-x-auto">
                {equipment.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                      index === currentImageIndex ? 'border-emerald-500' : 'border-gray-200'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${equipment.title} - صورة ${index + 1}`}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 bg-black/50 backdrop-blur-lg border border-green-500/30 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">وصف المعدات</h2>
            <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
              {equipment.description}
            </p>
          </div>

          {/* Related Equipment */}
          {relatedEquipment.length > 0 && (
            <div className="mt-8 bg-black/50 backdrop-blur-lg border border-green-500/30 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">معدات مشابهة</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {relatedEquipment.map((relatedItem) => (
                  <Link
                    key={relatedItem.id}
                    href={`/equipment/${relatedItem.id}`}
                    className="block bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                  >
                    <div className="h-32 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                      {relatedItem.images && relatedItem.images.length > 0 && relatedItem.images[0] ? (
                        <Image
                          src={relatedItem.images[0]}
                          alt={relatedItem.title}
                          width={200}
                          height={128}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to emoji if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <span className={`text-4xl ${relatedItem.images && relatedItem.images.length > 0 && relatedItem.images[0] ? 'hidden' : ''}`}>
                        🚜
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-1 line-clamp-1">{relatedItem.title}</h4>
                    <p className="text-emerald-600 font-bold">{formatPrice(relatedItem.price, relatedItem.currency)}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Equipment details */}
        <div className="space-y-6">
          <div className="bg-black/50 backdrop-blur-lg border border-green-500/30 rounded-xl p-6">
            <h1 className="text-2xl font-bold text-white mb-3">{equipment.title}</h1>
            <div className="text-3xl font-bold text-green-500 mb-6">{formatPrice(equipment.price, equipment.currency)}</div>

            <div className="space-y-4 border-t border-gray-700 pt-6">
              <div className="flex justify-between">
                <span className="text-gray-400">الحالة</span>
                <span className="text-white font-medium">
                  {getConditionLabel(equipment.condition)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">الموقع</span>
                <span className="text-white">{equipment.location}</span>
              </div>

              {equipment.brand && (
                <div className="flex justify-between">
                  <span className="text-gray-400">الماركة</span>
                  <span className="text-white">{equipment.brand}</span>
                </div>
              )}

              {equipment.model && (
                <div className="flex justify-between">
                  <span className="text-gray-400">الموديل</span>
                  <span className="text-white">{equipment.model}</span>
                </div>
              )}

              {equipment.year && (
                <div className="flex justify-between">
                  <span className="text-gray-400">سنة الصنع</span>
                  <span className="text-white">{equipment.year}</span>
                </div>
              )}

              {equipment.hours_used && (
                <div className="flex justify-between">
                  <span className="text-gray-400">ساعات الاستخدام</span>
                  <span className="text-white">{equipment.hours_used.toLocaleString('en-US')} ساعة</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-gray-400">تاريخ النشر</span>
                <span className="text-white">
                  {new Date(equipment.created_at).toLocaleDateString('ar-SA')}
                </span>
              </div>
            </div>
          </div>

          {/* Seller information */}
          {seller && <SellerInfo seller={seller} />}

          <div className="flex justify-center">
            <Link
              href="/equipment"
              className="text-green-400 hover:text-green-300 transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              العودة إلى قائمة المعدات
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentDetailPage;
