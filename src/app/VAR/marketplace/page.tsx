'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { apiClient } from '@/lib/api/client';
import UnifiedHero from '@/components/marketplace/UnifiedHero';
import UnifiedFilterBar from '@/components/marketplace/UnifiedFilterBar';
import QuickScanCard, { QuickScanCardSkeleton } from '@/components/marketplace/QuickScanCard';

interface VegetableListing {
  id: string;
  title: string;
  price: number;
  currency: string;
  vegetable_type: string;
  location: string;
  images: string[];
  is_available: boolean;
  created_at: string;
}

const categories = [
  { id: 'all', label: 'جميع الخضروات' },
  { id: 'tomatoes', label: 'طماطم' },
  { id: 'potatoes', label: 'بطاطس' },
  { id: 'onions', label: 'بصل' },
  { id: 'carrots', label: 'جزر' },
  { id: 'cucumbers', label: 'خيار' },
  { id: 'peppers', label: 'فلفل' },
  { id: 'lettuce', label: 'خس' },
]

const sortOptions = [
  { value: 'newest', label: 'الأحدث' },
  { value: 'oldest', label: 'الأقدم' },
  { value: 'price_low', label: 'السعر: من الأقل' },
  { value: 'price_high', label: 'السعر: من الأعلى' },
]

export default function VegetablesMarketplacePage() {
  const { user } = useUser();
  const [listings, setListings] = useState<VegetableListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const fetchListings = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      const filters: Record<string, string> = {};
      if (selectedCategory !== 'all') {
        filters.vegetable_type = selectedCategory;
      }

      const response = await apiClient.getVegetables(filters) as any;
      let vegData = response?.items || response || [];

      // Apply search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        vegData = vegData.filter((item: any) =>
          item.title?.toLowerCase().includes(term) ||
          item.location?.toLowerCase().includes(term)
        );
      }

      // Apply sorting
      vegData.sort((a: any, b: any) => {
        switch (sortBy) {
          case 'newest':
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          case 'oldest':
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          case 'price_low':
            return a.price - b.price;
          case 'price_high':
            return b.price - a.price;
          default:
            return 0;
        }
      });

      setListings(vegData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchTerm, sortBy]);

  useEffect(() => {
    if (!isHydrated) return;
    const timer = setTimeout(fetchListings, 300);
    return () => clearTimeout(timer);
  }, [isHydrated, fetchListings]);

  const getItemImage = (item: VegetableListing) => {
    if (item.images && item.images.length > 0) {
      return item.images[0];
    }
    return '/assets/tomato 2.jpg';
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-[#f5f3f0] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#2d5016] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f3f0]">
      {/* Hero Section */}
      <UnifiedHero
        title="الخضروات والفواكه"
        subtitle="اكتشف أفضل المنتجات الطازجة من المزارع المحلية"
        showSearch
        searchPlaceholder="ابحث عن خضروات، فواكه..."
        onSearch={setSearchTerm}
      />

      {/* Filter Bar */}
      <UnifiedFilterBar
        categories={categories}
        activeCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        sortOptions={sortOptions}
        activeSort={sortBy}
        onSortChange={setSortBy}
        showViewToggle
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Main Content */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-[#2d5016]">
              <span className="font-bold">{listings.length}</span> منتج متاح
            </div>
            {user ? (
              <Link
                href="/VAR/marketplace/new"
                className="px-6 py-2 bg-[#2d5016] text-white rounded-full hover:bg-[#1a3d0f] transition-colors font-semibold"
              >
                إضافة منتج
              </Link>
            ) : (
              <Link
                href="/sign-in"
                className="px-6 py-2 bg-[#d4af37] text-white rounded-full hover:bg-[#b8941f] transition-colors font-semibold"
              >
                تسجيل الدخول لإضافة منتج
              </Link>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Vegetables Grid */}
          {loading ? (
            <div className="marketplace-grid-quickscan">
              {[...Array(8)].map((_, i) => (
                <QuickScanCardSkeleton key={i} />
              ))}
            </div>
          ) : listings.length > 0 ? (
            <div className="marketplace-grid-quickscan">
              {listings.map((item, index) => (
                <QuickScanCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  price={item.price}
                  currency={item.currency || 'دج'}
                  location={item.location}
                  image={getItemImage(item)}
                  href={`/VAR/marketplace/${item.id}`}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state-unified">
              <h3>لا توجد منتجات متاحة</h3>
              <p>جرب تغيير الفلاتر أو البحث بكلمات مختلفة</p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchTerm('');
                }}
                className="mt-4 px-6 py-2 bg-[#2d5016] text-white rounded-full hover:bg-[#1a3d0f] transition-colors"
              >
                مسح الفلاتر
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
