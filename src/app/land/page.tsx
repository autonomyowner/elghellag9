'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { apiClient } from '@/lib/api/client';
import Link from 'next/link';
import { useDebounce, PerformanceMonitor } from '@/lib/performance';
import {
  Search,
  Filter,
  Grid,
  List,
  MapPin,
  Calendar,
  Star,
  Heart,
  Share2,
  Plus,
  ArrowRight,
  TrendingUp,
  Shield,
  Clock
} from 'lucide-react';
import Image from 'next/image';

interface LandListing {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  listing_type: 'sale' | 'rent';
  area_size: number;
  area_unit: 'hectare' | 'acre' | 'dunum';
  location: string;
  images: string[];
  is_available: boolean;
  created_at: string;
  contact_phone?: string;
}

const LandListingsPage: React.FC = () => {
  const { user } = useUser();
  const [listings, setListings] = useState<LandListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high' | 'area_large' | 'area_small'>('newest');
  const [filterType, setFilterType] = useState<'all' | 'sale' | 'rent'>('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minArea, setMinArea] = useState('');
  const [maxArea, setMaxArea] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isHydrated, setIsHydrated] = useState(false);

  const ITEMS_PER_PAGE = 12;

  // Performance monitoring
  useEffect(() => {
    setIsHydrated(true);
    PerformanceMonitor.startTimer('land-page-load');
  }, []);

  useEffect(() => {
    PerformanceMonitor.endTimer('land-page-load');
  }, []);

  // Debounce search term
  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    setDebouncedSearchTerm(debouncedSearch);
    setCurrentPage(1); // Reset to first page when searching
  }, [debouncedSearch]);

  // Memoized fetch function using new API
  const fetchListings = useCallback(async (page = 1, reset = false) => {
    try {
      setError(null);
      if (reset) {
        setLoading(true);
        setCurrentPage(1);
      }

      // Build query params for API
      const params: Record<string, string> = {};
      if (filterType !== 'all') params.listingType = filterType;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (debouncedSearchTerm) params.search = debouncedSearchTerm;

      const data = await apiClient.getLand(params);
      let landData = Array.isArray(data) ? data : [];
      console.log('Fetched land data:', landData.length, 'items');

      // Apply additional client-side filters
      landData = landData.filter((listing: any) => {
        if (listing.isAvailable === false) return false;

        // Area filters
        if (minArea && listing.areaSize < parseFloat(minArea)) return false;
        if (maxArea && listing.areaSize > parseFloat(maxArea)) return false;

        return true;
      });

      // Map API response to expected format
      landData = landData.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        price: item.price,
        currency: item.currency || 'دج',
        listing_type: item.listingType || 'sale',
        area_size: item.areaSize || 0,
        area_unit: item.areaUnit || 'hectare',
        location: item.location,
        images: item.images || [],
        is_available: item.isAvailable !== false,
        created_at: item.createdAt,
        contact_phone: item.contactPhone
      }));

      // Apply sorting
      landData.sort((a: LandListing, b: LandListing) => {
        switch (sortBy) {
          case 'newest':
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          case 'price_low':
            return a.price - b.price;
          case 'price_high':
            return b.price - a.price;
          case 'area_large':
            return b.area_size - a.area_size;
          case 'area_small':
            return a.area_size - b.area_size;
          default:
            return 0;
        }
      });

      if (reset) {
        setListings(landData || []);
      } else {
        setListings(prev => page === 1 ? (landData || []) : [...prev, ...(landData || [])]);
      }

      setHasMore((landData?.length || 0) === ITEMS_PER_PAGE);
      setCurrentPage(page);
    } catch (error: any) {
      console.error('Error fetching land listings:', error);
      setError('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  }, [filterType, debouncedSearchTerm, minPrice, maxPrice, minArea, maxArea, sortBy]);

  // Initial load
  useEffect(() => {
    fetchListings(1, true);
  }, [fetchListings]);

  // Memoized filtered listings
  const filteredListings = useMemo(() => {
    return listings;
  }, [listings]);

  // Load more function
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchListings(currentPage + 1, false);
    }
  }, [loading, hasMore, currentPage, fetchListings]);

  // Reset filters
  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setMinPrice('');
    setMaxPrice('');
    setMinArea('');
    setMaxArea('');
    setFilterType('all');
    setSortBy('newest');
  }, []);

  const formatPrice = (price: number, currency: string, listingType: 'sale' | 'rent') => {
    const formattedPrice = new Intl.NumberFormat('ar-DZ').format(price);
    const suffix = listingType === 'rent' ? ' / سنة' : '';
    return `${formattedPrice} ${currency}${suffix}`;
  };

  const formatArea = (area: number, unit: 'hectare' | 'acre' | 'dunum') => {
    const unitNames = {
      hectare: 'هكتار',
      acre: 'فدان',
      dunum: 'دونم'
    };
    return `${area.toLocaleString('en-US')} ${unitNames[unit]}`;
  };

  // Categories for filtering
  const categories = [
    { id: "all", label: "جميع الأراضي", icon: "🌾", count: listings.length },
    { id: "sale", label: "للبيع", icon: "💰", count: listings.filter(l => l.listing_type === 'sale').length },
    { id: "rent", label: "للإيجار", icon: "📋", count: listings.filter(l => l.listing_type === 'rent').length },
    { id: "large", label: "أراضي كبيرة", icon: "🏞️", count: listings.filter(l => l.area_size > 10).length },
    { id: "small", label: "أراضي صغيرة", icon: "🌱", count: listings.filter(l => l.area_size <= 10).length },
  ];

  // Sort options
  const sortOptions = [
    { value: "newest", label: "الأحدث" },
    { value: "price_low", label: "السعر: من الأقل" },
    { value: "price_high", label: "السعر: من الأعلى" },
    { value: "area_large", label: "المساحة: من الأكبر" },
    { value: "area_small", label: "المساحة: من الأصغر" },
  ];

  // Stats
  const stats = [
    { number: `${listings.length}+`, label: "أرض متاحة", icon: "🌾" },
    { number: `${listings.filter(l => l.listing_type === 'sale').length}+`, label: "للبيع", icon: "💰" },
    { number: `${listings.filter(l => l.listing_type === 'rent').length}+`, label: "للإيجار", icon: "📋" },
    { number: "24/7", label: "دعم متواصل", icon: "🛡️" }
  ];

  // Prevent hydration mismatch
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-emerald-300 font-semibold">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-800 text-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-teal-500/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-emerald-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-20 h-20 bg-teal-400/25 rounded-full blur-xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          {/* Main Icon Animation */}
          <div className="text-8xl mb-8 drop-shadow-2xl animate-bounce" style={{ animationDuration: '3s' }}>
            🌾
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-black mb-8 bg-gradient-to-r from-emerald-300 via-teal-300 to-emerald-400 bg-clip-text text-transparent drop-shadow-lg">
            الأراضي الزراعية
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-4xl mx-auto leading-relaxed">
            اكتشف أفضل الأراضي الزراعية للبيع والإيجار في جميع أنحاء الجزائر
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
              <input
                type="text"
                placeholder="ابحث عن الأراضي الزراعية..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full text-white placeholder-white/60 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50 transition-all duration-300 text-lg"
              />
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all duration-300 hover:scale-105"
              >
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold text-emerald-300 mb-1">{stat.number}</div>
                <div className="text-sm text-white/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          {/* Filters and Controls */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
              >
                <Filter className="w-4 h-4 mr-2" />
                فلاتر
              </button>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-white/10 backdrop-blur-lg rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-emerald-600' : 'hover:bg-white/10'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-emerald-600' : 'hover:bg-white/10'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg text-white focus:outline-none focus:border-emerald-400"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* Add Land Button */}
              <Link
                href="/land/new"
                className="flex items-center px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
              >
                <Plus className="w-4 h-4 mr-2" />
                إضافة أرض
              </Link>
            </div>

            {/* Category Chips */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-3">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setFilterType(category.id as any)}
                    className={`flex items-center px-4 py-2 rounded-full transition-all duration-200 ${
                      filterType === category.id
                        ? 'bg-emerald-500 text-white shadow-lg'
                        : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/20'
                    }`}
                  >
                    <span className="ml-2 text-lg">{category.icon}</span>
                    {category.label}
                    <span className="mr-2 text-xs bg-white/20 px-2 py-1 rounded-full">
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">السعر من</label>
                    <input
                      type="number"
                      placeholder="السعر الأدنى"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">السعر إلى</label>
                    <input
                      type="number"
                      placeholder="السعر الأعلى"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  {/* Area Range */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">المساحة من</label>
                    <input
                      type="number"
                      placeholder="المساحة الأدنى"
                      value={minArea}
                      onChange={(e) => setMinArea(e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">المساحة إلى</label>
                    <input
                      type="number"
                      placeholder="المساحة الأعلى"
                      value={maxArea}
                      onChange={(e) => setMaxArea(e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>

                {/* Clear Filters */}
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    مسح الفلاتر
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300">
              {error}
            </div>
          )}

          {/* Land Listings Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg p-6 animate-pulse">
                  <div className="h-48 bg-white/10 rounded-lg mb-4"></div>
                  <div className="h-4 bg-white/10 rounded mb-2"></div>
                  <div className="h-4 bg-white/10 rounded w-2/3 mb-2"></div>
                  <div className="h-4 bg-white/10 rounded w-1/2 mb-4"></div>
                  <div className="flex justify-between">
                    <div className="h-6 bg-white/10 rounded w-1/3"></div>
                    <div className="h-6 bg-white/10 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredListings.length > 0 ? (
            <>
              <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' : 'space-y-4'}`}>
                {filteredListings.map((listing, index) => (
                  <div
                    key={listing.id}
                    className={`bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg overflow-hidden hover:bg-white/10 hover:border-emerald-400/30 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${viewMode === 'list' ? 'flex gap-4' : ''}`}
                  >
                    {/* Land Image */}
                    <div className={`${viewMode === 'list' ? 'w-32 h-24 flex-shrink-0' : 'h-48'} bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center overflow-hidden relative`}>
                      {listing.images && listing.images.length > 0 && listing.images[0] ? (
                        <Image
                          src={listing.images[0]}
                          alt={listing.title}
                          width={viewMode === 'list' ? 128 : 400}
                          height={viewMode === 'list' ? 96 : 200}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <span className={`text-${viewMode === 'list' ? '2xl' : '6xl'} ${listing.images && listing.images.length > 0 && listing.images[0] ? 'hidden' : ''}`}>
                        🌾
                      </span>
                      
                      {/* Badges */}
                      <div className="absolute top-2 right-2 space-y-1">
                        {listing.is_available && (
                          <div className="bg-emerald-500 text-white px-2 py-1 rounded-full text-xs">
                            متاح
                          </div>
                        )}
                        {listing.listing_type === 'rent' && (
                          <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
                            للإيجار
                          </div>
                        )}
                        {listing.listing_type === 'sale' && (
                          <div className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs">
                            للبيع
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Land Details */}
                    <div className={`p-6 ${viewMode === 'list' ? 'flex-1 flex flex-col justify-between' : ''}`}>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">{listing.title}</h3>
                        <p className="text-white/70 mb-4 line-clamp-2">{listing.description}</p>
                        
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-2xl font-bold text-emerald-300">
                            {formatPrice(listing.price, listing.currency, listing.listing_type)}
                          </span>
                          <span className="text-sm text-white/60">
                            {formatArea(listing.area_size, listing.area_unit)}
                          </span>
                        </div>

                        <div className="flex items-center text-white/60 text-sm mb-2">
                          <MapPin className="w-4 h-4 mr-1" />
                          {listing.location}
                        </div>
                        {listing.contact_phone && (
                          <div className="flex items-center text-white/60 text-sm mb-4">
                            <span className="mr-1">📞</span>
                            {listing.contact_phone}
                          </div>
                        )}
                      </div>

                      <Link
                        href={`/land/${listing.id}`}
                        className={`block w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg transition-colors duration-300 ${viewMode === 'list' ? 'mt-auto' : ''}`}
                      >
                        عرض التفاصيل
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center mt-8">
                  <button
                    onClick={loadMore}
                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-semibold transition-colors"
                  >
                    تحميل المزيد
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🌾</div>
              <h3 className="text-2xl font-bold mb-2 text-white">لا توجد أراضي متاحة</h3>
              <p className="text-white/60 mb-6">جرب تغيير الفلاتر أو إضافة أراضي جديدة</p>
              <Link
                href="/land/new"
                className="inline-flex items-center px-6 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-semibold transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                إضافة أرض
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default LandListingsPage;
