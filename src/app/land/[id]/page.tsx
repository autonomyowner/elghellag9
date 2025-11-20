'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSupabaseData } from '@/hooks/useSupabase';
import { LandListing } from '@/types/database.types';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { fetchSellerInfo, Profile } from '@/lib/sellerUtils';
import SellerInfo from '@/components/SellerInfo';

const LandDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useSupabaseAuth();
  const { getLand, isOnline, isWithinLimits } = useSupabaseData();
  const [listing, setListing] = useState<LandListing | null>(null);
  const [seller, setSeller] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (params.id && typeof params.id === 'string') {
      fetchListing(params.id);
    }
  }, [params.id]);

  const fetchListing = async (id: string) => {
    try {
      setLoading(true);
      
      // Use our hybrid hook to get land data
      const data = await getLand();
      
      // Find the specific land by ID
      const landData = data.find(item => item.id === id);
      
      if (!landData) {
        console.error('Land listing not found');
        router.push('/land');
        return;
      }

      setListing(landData as any);

      // Fetch real seller data using utility function
      const sellerData = await fetchSellerInfo(landData.user_id, landData.location);
      setSeller(sellerData);
    } catch (error) {
      console.error('Error fetching land listing:', error);
      router.push('/land');
    } finally {
      setLoading(false);
    }
  };

  const handleImageNavigation = (direction: 'next' | 'prev') => {
    if (!listing || !listing.images) return;

    if (direction === 'next') {
      setCurrentImageIndex((prev) => 
        prev === listing.images.length - 1 ? 0 : prev + 1
      );
    } else {
      setCurrentImageIndex((prev) => 
        prev === 0 ? listing.images.length - 1 : prev - 1
      );
    }
  };

  const formatPrice = (price: number, currency: string, listingType: 'sale' | 'rent') => {
    const formattedPrice = new Intl.NumberFormat('ar-SA').format(price);
    const suffix = listingType === 'rent' ? ' / سنة' : '';
    return `${formattedPrice} ${currency}${suffix}`;
  };

  const formatArea = (area: number, unit: 'hectare' | 'acre' | 'dunum') => {
    const unitNames = {
      hectare: 'هكتار',
      acre: 'فدان',
      dunum: 'دونم'
    };
    return `${area} ${unitNames[unit]}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleContactClick = () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    setShowContactInfo(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 pt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-white/20 rounded mb-4 w-1/3"></div>
            <div className="h-64 bg-white/20 rounded mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-6 bg-white/20 rounded mb-4"></div>
                <div className="h-4 bg-white/20 rounded mb-2"></div>
                <div className="h-4 bg-white/20 rounded mb-2"></div>
                <div className="h-4 bg-white/20 rounded mb-2"></div>
              </div>
              <div>
                <div className="h-64 bg-white/20 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 pt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-green-800 mb-4">الأرض غير موجودة</h1>
            <Link href="/land" className="text-green-600 hover:underline">
              العودة إلى قائمة الأراضي
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 pt-20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-green-600 mb-6">
          <Link href="/" className="hover:text-green-800 transition-colors">الرئيسية</Link>
          <span>/</span>
          <Link href="/land" className="hover:text-green-800 transition-colors">الأراضي</Link>
          <span>/</span>
          <span className="text-green-800">{listing.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Images */}
            <div className="mb-8">
              {listing.images && listing.images.length > 0 ? (
                <div className="relative h-96 rounded-lg overflow-hidden">
                  <Image
                    src={listing.images[currentImageIndex]}
                    alt={listing.title}
                    width={800}
                    height={400}
                    className="w-full h-full object-cover"
                    priority
                  />
                  
                  {listing.images.length > 1 && (
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
                <div className="h-96 bg-gradient-to-br from-green-200 to-green-400 rounded-lg flex items-center justify-center">
                  <i className="fas fa-map-marked-alt text-8xl text-green-600"></i>
                </div>
              )}

              {/* Image Thumbnails */}
              {listing.images && listing.images.length > 1 && (
                <div className="mt-4 flex gap-2 overflow-x-auto">
                  {listing.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                        index === currentImageIndex ? 'border-green-500' : 'border-gray-200'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${listing.title} - صورة ${index + 1}`}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title and Basic Info */}
            <div className="glass-arabic p-8 mb-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-green-800 mb-2">{listing.title}</h1>
                  <div className="flex items-center gap-4 text-green-600">
                    <div className="flex items-center gap-2">
                      <i className="fas fa-map-marker-alt text-green-600"></i>
                      <span>{listing.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <i className="fas fa-calendar text-green-600"></i>
                      <span>{formatDate(listing.created_at)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-left">
                  <div className="price-tag text-2xl mb-2">
                    {formatPrice(listing.price, listing.currency, listing.listing_type)}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    listing.listing_type === 'sale' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-yellow-500 text-white'
                  }`}>
                    {listing.listing_type === 'sale' ? 'للبيع' : 'للإيجار'}
                  </span>
                </div>
              </div>
            </div>

            {/* Land Details */}
            <div className="glass-arabic p-8 mb-8">
              <h2 className="text-2xl font-bold text-green-800 mb-6">تفاصيل الأرض</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <i className="fas fa-ruler-combined text-green-600 text-xl"></i>
                    <div>
                      <p className="text-green-600 text-sm">المساحة</p>
                      <p className="text-green-800 font-medium">{formatArea(listing.area_size, listing.area_unit)}</p>
                    </div>
                  </div>

                  {listing.contact_phone && (
                    <div className="flex items-center gap-3">
                      <i className="fas fa-phone text-green-600 text-xl"></i>
                      <div>
                        <p className="text-green-600 text-sm">رقم الهاتف</p>
                        <p className="text-green-800 font-medium">{listing.contact_phone}</p>
                      </div>
                    </div>
                  )}

                  {listing.water_source && (
                    <div className="flex items-center gap-3">
                      <i className="fas fa-tint text-green-600 text-xl"></i>
                      <div>
                        <p className="text-green-600 text-sm">مصدر المياه</p>
                        <p className="text-green-800 font-medium">{listing.water_source}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <i className="fas fa-tag text-green-600 text-xl"></i>
                    <div>
                      <p className="text-green-600 text-sm">نوع الإعلان</p>
                      <p className="text-green-800 font-medium">
                        {listing.listing_type === 'sale' ? 'للبيع' : 'للإيجار'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <i className="fas fa-calendar-alt text-green-600 text-xl"></i>
                    <div>
                      <p className="text-green-600 text-sm">تاريخ النشر</p>
                      <p className="text-green-800 font-medium">{formatDate(listing.created_at)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <i className="fas fa-check-circle text-green-600 text-xl"></i>
                    <div>
                      <p className="text-green-600 text-sm">الحالة</p>
                      <p className="text-green-800 font-medium">
                        {listing.is_available ? 'متاح' : 'غير متاح'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {listing.description && (
              <div className="glass-arabic p-8 mb-8">
                <h2 className="text-2xl font-bold text-green-800 mb-4">الوصف</h2>
                <p className="text-green-700 leading-relaxed">{listing.description}</p>
              </div>
            )}

            {/* Seller Information */}
            {seller && <SellerInfo seller={seller} />}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Contact Card */}
            <div className="glass-arabic p-6 mb-6 sticky top-24">
              <h3 className="text-xl font-bold text-green-800 mb-4">معلومات الاتصال</h3>
              
              {showContactInfo ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <i className="fas fa-user text-green-600"></i>
                    <span className="text-green-700">المالك</span>
                  </div>
                  {listing.contact_phone && (
                    <div className="flex items-center gap-3">
                      <i className="fas fa-phone text-green-600"></i>
                      <span className="text-green-700">{listing.contact_phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <i className="fas fa-map-marker-alt text-green-600"></i>
                    <span className="text-green-700">{listing.location}</span>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleContactClick}
                  className="btn-primary-arabic w-full"
                >
                  <i className="fas fa-phone ml-2"></i>
                  {user ? 'عرض معلومات الاتصال' : 'تسجيل الدخول للتواصل'}
                </button>
              )}
            </div>

            {/* Quick Actions */}
            <div className="glass-arabic p-6">
              <h3 className="text-xl font-bold text-green-800 mb-4">إجراءات سريعة</h3>
              <div className="space-y-3">
                <button className="btn-secondary-arabic w-full">
                  <i className="fas fa-heart ml-2"></i>
                  إضافة للمفضلة
                </button>
                <button className="btn-secondary-arabic w-full">
                  <i className="fas fa-share ml-2"></i>
                  مشاركة
                </button>
                <button className="btn-secondary-arabic w-full">
                  <i className="fas fa-flag ml-2"></i>
                  الإبلاغ عن مشكلة
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandDetailPage;
