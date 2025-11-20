"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useSupabaseData } from '@/hooks/useSupabase';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

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
  contact_phone: string | null;
}

const VegetablesMarketplacePage: React.FC = () => {
  const { getVegetables, isOnline, isWithinLimits } = useSupabaseData();
  const [listings, setListings] = useState<VegetableListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high' | 'oldest'>('newest');
  const [filterType, setFilterType] = useState<'all' | 'tomatoes' | 'potatoes' | 'onions' | 'carrots' | 'cucumbers' | 'peppers' | 'lettuce' | 'cabbage' | 'broccoli' | 'cauliflower' | 'spinach' | 'kale' | 'other'>('all');
  const [filterFreshness, setFilterFreshness] = useState<'all' | 'excellent' | 'good' | 'fair' | 'poor'>('all');
  const [filterOrganic, setFilterOrganic] = useState<'all' | 'organic' | 'conventional'>('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { user } = useSupabaseAuth();

  const ITEMS_PER_PAGE = 12;

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch function
  const fetchListings = useCallback(async (page = 1, reset = false) => {
    try {
      setError(null);
      if (reset) {
        setLoading(true);
        setCurrentPage(1);
      }

      // Use our hybrid hook to get vegetable data
      const filters = {
        vegetable_type: filterType === 'all' ? undefined : filterType,
        location: undefined,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        freshness: filterFreshness === 'all' ? undefined : filterFreshness,
        organic: filterOrganic === 'all' ? undefined : filterOrganic === 'organic'
      };
      
      const data = await getVegetables(filters);
      
      let vegetableData = data || [];
      
      console.log('Fetched vegetable data:', vegetableData);
      console.log('Number of vegetables:', vegetableData.length);

      // Apply search filter after fetch
      if (debouncedSearchTerm) {
        const term = debouncedSearchTerm.toLowerCase();
        vegetableData = vegetableData.filter(vegetable =>
          (vegetable.title && vegetable.title.toLowerCase().includes(term)) ||
          (vegetable.description && vegetable.description.toLowerCase().includes(term)) ||
          (vegetable.location && vegetable.location.toLowerCase().includes(term)) ||
          (vegetable.variety && vegetable.variety.toLowerCase().includes(term))
        );
      }

      // Apply all filters on client side
      vegetableData = vegetableData.filter(vegetable => {
        // Availability filter
        if (vegetable.is_available === false) return false;
        
        // Vegetable type filter
        if (filterType !== 'all' && vegetable.vegetable_type !== filterType) return false;
        
        // Freshness filter
        if (filterFreshness !== 'all' && vegetable.freshness !== filterFreshness) return false;
        
        // Organic filter
        if (filterOrganic === 'organic' && !vegetable.organic) return false;
        if (filterOrganic === 'conventional' && vegetable.organic) return false;
        
        // Price filters
        if (minPrice && vegetable.price < parseFloat(minPrice)) return false;
        if (maxPrice && vegetable.price > parseFloat(maxPrice)) return false;
        
        return true;
      });

      // Apply sorting
      vegetableData.sort((a, b) => {
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

      if (page === 1 || reset) {
        setListings(vegetableData || []);
      } else {
        setListings(prev => [...prev, ...(vegetableData || [])]);
      }

      setHasMore((vegetableData?.length || 0) === ITEMS_PER_PAGE);
      setCurrentPage(page);
    } catch (err: unknown) {
      console.error('Error fetching vegetable listings:', err);
      setError('حدث خطأ في تحميل الإعلانات');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, sortBy, filterType, filterFreshness, filterOrganic, minPrice, maxPrice, getVegetables]);

  // Initial fetch and refetch on dependencies change
  useEffect(() => {
    fetchListings(1, true);
  }, [fetchListings]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchListings(currentPage + 1);
    }
  };

  // Vegetable type labels in Arabic
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

  // Freshness labels in Arabic
  const getFreshnessLabel = (freshness: string) => {
    const labels: { [key: string]: string } = {
      excellent: 'ممتازة',
      good: 'جيدة',
      fair: 'متوسطة',
      poor: 'ضعيفة'
    };
    return labels[freshness] || freshness;
  };

  // Unit labels in Arabic
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

  const formatPrice = (price: number, currency: string, unit: string) => {
    const formattedPrice = new Intl.NumberFormat('en-US').format(price);
    return `${formattedPrice} ${currency} / ${getUnitLabel(unit)}`;
  };

  const resetFilters = () => {
    setSearchTerm('');
    setMinPrice('');
    setMaxPrice('');
    setFilterType('all');
    setFilterFreshness('all');
    setFilterOrganic('all');
    setSortBy('newest');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 pt-20">
      {/* Premium Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        {/* Animated Background Elements */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        >
          <div className="absolute top-20 left-10 w-32 h-32 bg-green-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-teal-600/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </motion.div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            {/* Icon Animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="text-8xl mb-8 drop-shadow-2xl"
            >
              <span>🥬</span>
            </motion.div>

            {/* Main Title */}
            <motion.div
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-8 bg-gradient-to-r from-green-300 via-emerald-300 to-teal-400 bg-clip-text text-transparent drop-shadow-lg"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <h1>سوق الخضار الطازجة</h1>
            </motion.div>

            {/* Subtitle */}
            <motion.div
              className="text-base sm:text-lg md:text-xl lg:text-2xl mb-12 opacity-90 max-w-4xl mx-auto leading-relaxed px-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              <p>اكتشف أفضل الخضار الطازجة والعضوية من المزارعين المحليين في جميع أنحاء الجزائر</p>
            </motion.div>

            {/* Status Indicator */}
            {(!isOnline || !isWithinLimits) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-full text-yellow-300 text-sm mb-8"
              >
                <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></div>
                <span>{!isOnline ? 'وضع عدم الاتصال' : 'استخدام التخزين المحلي'}</span>
              </motion.div>
            )}

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="max-w-2xl mx-auto"
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="ابحث عن الخضار الطازجة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-6 py-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full text-white placeholder-white/60 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/50 transition-all duration-300"
                />
                <svg className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-gradient-to-br from-slate-900 via-green-900 to-slate-900">
        <div className="container mx-auto px-4">
          {/* Filters and Controls */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-white"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                فلاتر
              </button>

              {/* View Toggle */}
              <div className="flex items-center bg-white/10 backdrop-blur-lg rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-green-600' : 'hover:bg-white/10'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
                    <rect width="18" height="18" x="3" y="3" rx="2"></rect>
                    <path d="M3 9h18"></path>
                    <path d="M3 15h18"></path>
                    <path d="M9 3v18"></path>
                    <path d="M15 3v18"></path>
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-green-600' : 'hover:bg-white/10'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
                    <path d="M3 12h.01"></path>
                    <path d="M3 18h.01"></path>
                    <path d="M3 6h.01"></path>
                    <path d="M8 12h13"></path>
                    <path d="M8 18h13"></path>
                    <path d="M8 6h13"></path>
                  </svg>
                </button>
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-400"
              >
                <option value="newest">الأحدث</option>
                <option value="oldest">الأقدم</option>
                <option value="price_low">السعر: من الأقل</option>
                <option value="price_high">السعر: من الأعلى</option>
              </select>

              {/* Add Vegetable Button */}
              <Link
                href="/VAR/marketplace/new"
                className="flex items-center px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-lg font-semibold transition-all duration-300 hover:scale-105 text-white"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                إضافة خضار
              </Link>
            </div>

            {/* Advanced Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg p-6 mb-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Vegetable Type Filter */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-white">نوع الخضار</label>
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-400"
                      >
                        <option value="all">جميع الأنواع</option>
                        <option value="tomatoes">طماطم</option>
                        <option value="potatoes">بطاطس</option>
                        <option value="onions">بصل</option>
                        <option value="carrots">جزر</option>
                        <option value="cucumbers">خيار</option>
                        <option value="peppers">فلفل</option>
                        <option value="lettuce">خس</option>
                        <option value="cabbage">ملفوف</option>
                        <option value="broccoli">بروكلي</option>
                        <option value="cauliflower">قرنبيط</option>
                        <option value="spinach">سبانخ</option>
                        <option value="kale">كرنب</option>
                        <option value="other">أخرى</option>
                      </select>
                    </div>

                    {/* Freshness Filter */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-white">الطزاجة</label>
                      <select
                        value={filterFreshness}
                        onChange={(e) => setFilterFreshness(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-400"
                      >
                        <option value="all">جميع المستويات</option>
                        <option value="excellent">ممتازة</option>
                        <option value="good">جيدة</option>
                        <option value="fair">متوسطة</option>
                        <option value="poor">ضعيفة</option>
                      </select>
                    </div>

                    {/* Organic Filter */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-white">النوع</label>
                      <select
                        value={filterOrganic}
                        onChange={(e) => setFilterOrganic(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-400"
                      >
                        <option value="all">جميع الأنواع</option>
                        <option value="organic">عضوي</option>
                        <option value="conventional">تقليدي</option>
                      </select>
                    </div>

                    {/* Price Range */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-white">السعر من</label>
                      <input
                        type="number"
                        placeholder="السعر الأدنى"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-green-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-white">السعر إلى</label>
                      <input
                        type="number"
                        placeholder="السعر الأعلى"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-green-400"
                      />
                    </div>
                  </div>

                  {/* Clear Filters */}
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={resetFilters}
                      className="px-4 py-2 text-green-400 hover:text-green-300 transition-colors"
                    >
                      مسح الفلاتر
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300">
              {error}
            </div>
          )}
          
          {/* Vegetable Listings Grid */}
          {loading ? (
            <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8' : 'space-y-4'}`}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className={`bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg shadow-lg p-6 animate-pulse ${viewMode === 'list' ? 'flex gap-4' : ''}`}>
                  <div className={`${viewMode === 'list' ? 'w-32 h-24' : 'h-48'} bg-gray-600/50 rounded-lg ${viewMode === 'list' ? 'flex-shrink-0' : 'mb-4'}`}></div>
                  <div className={`${viewMode === 'list' ? 'flex-1' : ''}`}>
                    <div className="h-4 bg-gray-600/50 rounded mb-2"></div>
                    <div className="h-4 bg-gray-600/50 rounded w-2/3 mb-2"></div>
                    <div className="h-4 bg-gray-600/50 rounded w-1/2 mb-4"></div>
                    <div className="flex justify-between">
                      <div className="h-6 bg-gray-600/50 rounded w-1/3"></div>
                      <div className="h-6 bg-gray-600/50 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : listings.length > 0 ? (
            <>
              <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8' : 'space-y-4'}`}>
                {listings.map((vegetable, index) => (
                  <motion.div
                      key={vegetable.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className={`bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 ${viewMode === 'list' ? 'flex gap-4' : ''}`}
                    >
                      {/* Vegetable Image */}
                      <div className={`${viewMode === 'list' ? 'w-32 h-24 flex-shrink-0' : 'h-48'} bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center overflow-hidden`}>
                        {vegetable.images && vegetable.images.length > 0 && vegetable.images[0] ? (
                          <Image
                            src={vegetable.images[0]}
                            alt={vegetable.title}
                            width={viewMode === 'list' ? 128 : 400}
                            height={viewMode === 'list' ? 96 : 200}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to emoji if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <span className={`text-${viewMode === 'list' ? '2xl' : '6xl'} ${vegetable.images && vegetable.images.length > 0 && vegetable.images[0] ? 'hidden' : ''}`}>
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
                      
                      {/* Vegetable Details */}
                      <div className={`p-6 ${viewMode === 'list' ? 'flex-1 flex flex-col justify-between' : ''}`}>
                        <div>
                          <h3 className="text-xl font-bold text-white mb-2">{vegetable.title}</h3>
                          <p className="text-gray-300 mb-4 line-clamp-2">{vegetable.description}</p>
                          
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-2xl font-bold text-green-400">
                              {formatPrice(vegetable.price, vegetable.currency, vegetable.unit)}
                            </span>
                            <span className="text-sm text-gray-300">
                              {getVegetableTypeLabel(vegetable.vegetable_type)}
                            </span>
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex items-center text-gray-300 text-sm">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {vegetable.location}
                            </div>
                            <div className="flex items-center text-gray-300 text-sm">
                              <span className="mr-2">الطزاجة:</span>
                              <span className={`font-medium ${
                                vegetable.freshness === 'excellent' ? 'text-green-400' :
                                vegetable.freshness === 'good' ? 'text-blue-400' :
                                vegetable.freshness === 'fair' ? 'text-yellow-400' : 'text-red-400'
                              }`}>
                                {getFreshnessLabel(vegetable.freshness)}
                              </span>
                            </div>
                            {vegetable.organic && (
                              <div className="flex items-center text-green-400 text-sm">
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                عضوي
                              </div>
                            )}
                            {vegetable.variety && (
                              <div className="flex items-center text-gray-300 text-sm">
                                <span className="mr-2">النوع:</span>
                                {vegetable.variety}
                              </div>
                            )}
                            {vegetable.contact_phone && (
                              <div className="flex items-center text-gray-300 text-sm">
                                <span className="mr-1">📞</span>
                                {vegetable.contact_phone}
                              </div>
                            )}
                          </div>
                        </div>

                        <Link
                          href={`/VAR/marketplace/${vegetable.id}`}
                          className={`block w-full text-center bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors duration-300 ${viewMode === 'list' ? 'mt-auto' : ''}`}
                        >
                          عرض التفاصيل
                        </Link>
                      </div>
                    </motion.div>
                  ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center mt-8">
                  <button
                    onClick={handleLoadMore}
                    className="px-8 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors text-white"
                  >
                    تحميل المزيد
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🥬</div>
              <h3 className="text-2xl font-bold mb-2 text-white">لا توجد خضار متاحة</h3>
              <p className="text-gray-300 mb-6">جرب تغيير الفلاتر أو إضافة خضار جديدة</p>
              <Link
                href="/VAR/marketplace/new"
                className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors text-white"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                إضافة خضار
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default VegetablesMarketplacePage; 