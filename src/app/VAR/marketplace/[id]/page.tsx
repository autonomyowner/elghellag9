"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { apiClient } from '@/lib/api/client';
import { useUser, useAuth } from '@clerk/nextjs';

interface VegetableListing {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  vegetable_type: 'tomatoes' | 'potatoes' | 'onions' | 'carrots' | 'cucumbers' | 'peppers' | 'lettuce' | 'cabbage' | 'broccoli' | 'cauliflower' | 'spinach' | 'kale' | 'other';
  variety: string | null;
  quantity: number;
  unit: 'kg' | 'ton' | 'piece' | 'bundle' | 'box';
  freshness: 'excellent' | 'good' | 'fair' | 'poor';
  organic: boolean;
  location: string;
  coordinates?: { lat: number; lng: number } | null;
  images: string[];
  is_available: boolean;
  is_featured: boolean;
  view_count: number;
  harvest_date: string | null;
  expiry_date: string | null;
  certification: string | null;
  packaging: 'loose' | 'packaged' | 'bulk';
  user?: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    phone: string | null;
    isVerified: boolean;
    location: string | null;
  };
}

const VegetableDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const { getToken } = useAuth();

  const [vegetable, setVegetable] = useState<VegetableListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const vegetableId = params.id as string;

  useEffect(() => {
    const fetchVegetable = async () => {
      try {
        setLoading(true);
        // Use the new API client to get vegetable by ID
        const vegetableData = await apiClient.getVegetableById(vegetableId) as VegetableListing;

        if (vegetableData) {
          setVegetable(vegetableData);
        } else {
          setError('الخضار غير موجودة');
        }
      } catch (error: unknown) {
        console.error('Error fetching vegetable:', error);
        setError('حدث خطأ في تحميل بيانات الخضار');
      } finally {
        setLoading(false);
      }
    };

    if (vegetableId) {
      fetchVegetable();
    }
  }, [vegetableId]);

  const handleDelete = async () => {
    try {
      const token = await getToken();
      if (!token) {
        router.push('/sign-in');
        return;
      }
      await apiClient.deleteVegetable(token, vegetableId);
      router.push('/VAR/marketplace');
    } catch (error: unknown) {
      console.error('Error deleting vegetable:', error);
      setError('حدث خطأ في حذف الخضار');
    }
  };

  const getVegetableTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      tomatoes: 'طماطم',
      potatoes: 'بطاطس',
      onions: 'بصل',
      carrots: 'جزر',
      cucumbers: 'خيار',
      peppers: 'فلفل',
      lettuce: 'خس',
      cabbage: 'ملفوف',
      broccoli: 'بروكلي',
      cauliflower: 'قرنبيط',
      spinach: 'سبانخ',
      kale: 'كرنب',
      other: 'أخرى'
    };
    return labels[type] || type;
  };

  const getFreshnessLabel = (freshness: string) => {
    const labels: { [key: string]: string } = {
      excellent: 'ممتازة',
      good: 'جيدة',
      fair: 'متوسطة',
      poor: 'ضعيفة'
    };
    return labels[freshness] || freshness;
  };

  const getUnitLabel = (unit: string) => {
    const labels: { [key: string]: string } = {
      kg: 'كيلوغرام',
      ton: 'طن',
      piece: 'قطعة',
      bundle: 'حزمة',
      box: 'صندوق'
    };
    return labels[unit] || unit;
  };

  const getPackagingLabel = (packaging: string) => {
    const labels: { [key: string]: string } = {
      loose: 'سائب',
      packaged: 'معبأ',
      bulk: 'كميات كبيرة'
    };
    return labels[packaging] || packaging;
  };

  const formatPrice = (price: number, currency: string, unit: string) => {
    const formattedPrice = new Intl.NumberFormat('en-US').format(price);
    return `${formattedPrice} ${currency} / ${getUnitLabel(unit)}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'غير محدد';
    return new Date(dateString).toLocaleDateString('ar-SA');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 animate-pulse">
              <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !vegetable) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-6xl mb-4">🥬</div>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">الخضار غير موجودة</h2>
              <p className="text-gray-600 mb-6">{error || 'الخضار المطلوبة غير متوفرة'}</p>
              <button
                onClick={() => router.push('/VAR/marketplace')}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors text-white"
              >
                العودة إلى السوق
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = user && user.id === vegetable.user_id;

  // Get seller info from embedded user object
  const seller = vegetable.user;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* Breadcrumb */}
          <nav className="mb-6">
            <ol className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600">
              <li>
                <button
                  onClick={() => router.push('/marketplace')}
                  className="hover:text-green-600 transition-colors"
                >
                  السوق
                </button>
              </li>
              <li>/</li>
              <li>
                <button
                  onClick={() => router.push('/VAR/marketplace')}
                  className="hover:text-green-600 transition-colors"
                >
                  الخضار
                </button>
              </li>
              <li>/</li>
              <li className="text-gray-800 font-medium">{vegetable.title}</li>
            </ol>
          </nav>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              {vegetable.images && vegetable.images.length > 0 ? (
                <div>
                  {/* Main Image */}
                  <div className="relative h-96 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg overflow-hidden mb-4">
                    <Image
                      src={vegetable.images[currentImageIndex]}
                      alt={vegetable.title}
                      width={600}
                      height={400}
                      className="w-full h-full object-cover"
                      priority
                    />
                  </div>
                  
                  {/* Thumbnail Images */}
                  {vegetable.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {vegetable.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`relative h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg overflow-hidden ${
                            currentImageIndex === index ? 'ring-2 ring-green-500' : ''
                          }`}
                        >
                          <Image
                            src={image}
                            alt={`${vegetable.title} ${index + 1}`}
                            width={100}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-96 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                  <span className="text-8xl">
                    {vegetable.vegetable_type === 'tomatoes' ? '🍅' :
                     vegetable.vegetable_type === 'potatoes' ? '🥔' :
                     vegetable.vegetable_type === 'onions' ? '🧅' :
                     vegetable.vegetable_type === 'carrots' ? '🥕' :
                     vegetable.vegetable_type === 'cucumbers' ? '🥒' :
                     vegetable.vegetable_type === 'peppers' ? '🫑' :
                     vegetable.vegetable_type === 'lettuce' ? '🥬' :
                     vegetable.vegetable_type === 'cabbage' ? '🥬' :
                     vegetable.vegetable_type === 'broccoli' ? '🥦' :
                     vegetable.vegetable_type === 'cauliflower' ? '🥦' :
                     vegetable.vegetable_type === 'spinach' ? '🥬' :
                     vegetable.vegetable_type === 'kale' ? '🥬' : '🥬'}
                  </span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{vegetable.title}</h1>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-green-600">
                    {formatPrice(vegetable.price, vegetable.currency, vegetable.unit)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {vegetable.view_count || 0} مشاهدة
                  </span>
                </div>
              </div>

              {/* Description */}
              {vegetable.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">الوصف</h3>
                  <p className="text-gray-600 leading-relaxed">{vegetable.description}</p>
                </div>
              )}

              {/* Key Details */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <span className="text-sm text-gray-500">نوع الخضار</span>
                  <p className="font-medium">{getVegetableTypeLabel(vegetable.vegetable_type)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">الكمية</span>
                  <p className="font-medium">{vegetable.quantity} {getUnitLabel(vegetable.unit)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">الطزاجة</span>
                  <p className={`font-medium ${
                    vegetable.freshness === 'excellent' ? 'text-green-600' :
                    vegetable.freshness === 'good' ? 'text-blue-600' :
                    vegetable.freshness === 'fair' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {getFreshnessLabel(vegetable.freshness)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">التعبئة</span>
                  <p className="font-medium">{getPackagingLabel(vegetable.packaging)}</p>
                </div>
              </div>

              {/* Additional Details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-600">{vegetable.location}</span>
                </div>
                
                {vegetable.variety && (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span className="text-gray-600">النوع: {vegetable.variety}</span>
                  </div>
                )}

                {vegetable.organic && (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-green-600 font-medium">عضوي</span>
                  </div>
                )}

                {vegetable.harvest_date && (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-600">تاريخ الحصاد: {formatDate(vegetable.harvest_date)}</span>
                  </div>
                )}

                {vegetable.expiry_date && (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-600">تاريخ انتهاء الصلاحية: {formatDate(vegetable.expiry_date)}</span>
                  </div>
                )}

                {vegetable.certification && (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-600">الشهادات: {vegetable.certification}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {isOwner ? (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => router.push(`/VAR/marketplace/${vegetableId}/edit`)}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                    >
                      حذف
                    </button>
                  </div>
                ) : (
                  <button className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors">
                    تواصل مع البائع
                  </button>
                )}
              </div>

              {/* Created Date */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  تم النشر في {formatDate(vegetable.created_at)}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">تأكيد الحذف</h3>
            <p className="text-gray-600 mb-6">هل أنت متأكد من حذف هذه الخضار؟ لا يمكن التراجع عن هذا الإجراء.</p>
            <div className="flex justify-end space-x-3 space-x-reverse">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VegetableDetailPage; 