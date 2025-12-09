'use client'

import React, { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic';
const MotionDiv = dynamic(() => import('framer-motion').then(mod => mod.motion.div), { ssr: false, loading: () => <div /> });
import { AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/nextjs'
import { apiClient } from '@/lib/api/client'
import EquipmentCard from '@/components/equipment/EquipmentCard'
import Link from 'next/link'
import Image from 'next/image'
import {
  Search, Filter, MapPin, DollarSign, Calendar,
  Star, Grid, List, SlidersHorizontal, X,
  Tractor, Leaf, Package, TrendingUp, Plus,
  Heart, Share2, CalendarCheck, Shield, Award
} from 'lucide-react'

// Equipment data will be loaded from Supabase

const categories = [
  { id: "all", label: "جميع الآلات", icon: "🚜" },
  { id: "tractor", label: "جرارات", icon: "🚜" },
  { id: "harvester", label: "حصادات", icon: "🌾" },
  { id: "plow", label: "محاريث", icon: "⚔️" },
  { id: "seeder", label: "آلات البذر", icon: "🌱" },
  { id: "sprayer", label: "رشاشات", icon: "💧" },
  { id: "irrigation", label: "أنظمة الري", icon: "🌀" },
  { id: "tools", label: "أدوات زراعية", icon: "🔧" },
  { id: "available", label: "متاح", icon: "✅" },
  { id: "insured", label: "مؤمن", icon: "🛡️" },
  { id: "new", label: "جديد", icon: "🆕" }
]

const locations = [
  "جميع الولايات",
  "الجزائر",
  "وهران",
  "قسنطينة",
  "سطيف",
  "تيارت",
  "البليدة",
  "مستغانم",
  "ورقلة",
  "بسكرة",
  "عنابة",
  "باتنة",
  "بجاية",
  "سكيكدة",
  "تلمسان"
]

const conditions = [
  { value: "", label: "جميع الحالات" },
  { value: "new", label: "جديد" },
  { value: "excellent", label: "ممتاز" },
  { value: "good", label: "جيد" },
  { value: "fair", label: "مقبول" },
  { value: "poor", label: "يحتاج صيانة" },
]

const sortOptions = [
  { value: "latest", label: "الأحدث" },
  { value: "oldest", label: "الأقدم" },
  { value: "price-low", label: "السعر: من الأقل" },
  { value: "price-high", label: "السعر: من الأعلى" },
  { value: "rating", label: "الأعلى تقييماً" },
]

// Enhanced equipment card component for the new design
const EquipmentCardEnhanced = ({ item, viewMode }: { item: any, viewMode: 'grid' | 'list' }) => {
  // Get equipment icon based on category
  const getEquipmentIcon = (categoryId: string) => {
    const iconMap: { [key: string]: string } = {
      'tractor': '🚜',
      'harvester': '🌾',
      'plow': '⚒️',
      'seeder': '🌱',
      'sprayer': '💧',
      'irrigation': '🌀',
      'tools': '🔧'
    };
    return iconMap[categoryId] || '🚜';
  };

  // Get condition text
  const getConditionText = (condition: string) => {
    const conditionMap: { [key: string]: string } = {
      'new': 'جديد',
      'excellent': 'ممتاز',
      'good': 'جيد',
      'fair': 'مقبول',
      'poor': 'يحتاج صيانة'
    };
    return conditionMap[condition] || 'جيد';
  };

  // Get condition color
  const getConditionColor = (condition: string) => {
    const colorMap: { [key: string]: string } = {
      'new': 'bg-green-500',
      'excellent': 'bg-emerald-500',
      'good': 'bg-blue-500',
      'fair': 'bg-yellow-500',
      'poor': 'bg-red-500'
    };
    return colorMap[condition] || 'bg-blue-500';
  };

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg overflow-hidden transition-all duration-300 hover:bg-white/10 hover:border-emerald-400/30 relative ${
        viewMode === 'grid' ? 'p-6' : 'p-6 flex items-center space-x-6 space-x-reverse'
      }`}
    >
      {/* Equipment Image */}
      <div className={`${viewMode === 'grid' ? 'w-full h-48' : 'w-32 h-32'} relative overflow-hidden rounded-lg bg-gradient-to-br from-emerald-200 to-teal-400 flex items-center justify-center`}>
        {item.images && item.images.length > 0 && item.images[0] ? (
          <Image
            src={item.images[0]}
            alt={item.title}
            width={viewMode === 'grid' ? 400 : 128}
            height={viewMode === 'grid' ? 192 : 128}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Failed to load equipment image:', item.images[0]);
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.nextElementSibling;
              if (fallback) fallback.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`text-6xl ${item.images && item.images.length > 0 && item.images[0] ? 'hidden' : ''}`}>
          {getEquipmentIcon(item.category_id)}
        </div>
      </div>
      
      {/* Badges */}
      <div className="absolute top-2 right-2 space-y-1">
        {item.is_available && (
          <div className="bg-emerald-500 text-white px-2 py-1 rounded-full text-xs">
            متاح
          </div>
        )}
        {!item.is_available && (
          <div className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs">
            مؤجر
          </div>
        )}
        <div className={`${getConditionColor(item.condition)} text-white px-2 py-1 rounded-full text-xs`}>
          {getConditionText(item.condition)}
        </div>
      </div>
      
      {/* Equipment Info */}
      <div className="mt-4">
        <div className="text-xl font-bold mb-2">{item.title}</div>
        <div className="text-sm text-emerald-300 mb-2">
          {item.brand} {item.model} • {item.year}
        </div>
        <div className="text-sm text-emerald-400 mb-2">{item.description}</div>
        
        {/* Price */}
        <div className="text-lg font-bold text-emerald-300 mb-2">
          {item.price.toLocaleString()} {item.currency}
        </div>
        
        {/* Location */}
        <div className="text-sm text-white/70 mb-2 flex items-center">
          <MapPin className="w-4 h-4 mr-1" />
          {item.location}
        </div>
        
        {/* Contact Phone */}
        {item.contact_phone && (
          <div className="text-sm text-white/70 mb-2 flex items-center">
            <span className="mr-1">📞</span>
            {item.contact_phone}
          </div>
        )}
        
        <div className="flex gap-2">
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex-1 flex items-center justify-center transition-colors">
            <CalendarCheck className="w-4 h-4 mr-2" />
            احجز الآن
          </button>
          <button className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors">
            <Heart className="w-4 h-4" />
          </button>
          <button className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </MotionDiv>
  );
};

export default function EquipmentPage() {
  const { user } = useUser()
  const [equipment, setEquipment] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [selectedCondition, setSelectedCondition] = useState('')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('جميع الولايات')
  const [sortBy, setSortBy] = useState('latest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isFiltering, setIsFiltering] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const [hasInitialData, setHasInitialData] = useState(false)

  const itemsPerPage = 12

  // Hydration check
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Debounce search term and trigger data fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setCurrentPage(1)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Fetch equipment function using new API
  const fetchEquipment = useCallback(async (params?: Record<string, string>) => {
    try {
      const data = await apiClient.getEquipment(params)
      return Array.isArray(data) ? data : []
    } catch (err) {
      console.error('Error fetching equipment:', err)
      throw err
    }
  }, [])

  // Initial data fetch with retry logic
  useEffect(() => {
    const loadInitialData = async () => {
      console.log('Loading initial equipment data...')
      setLoading(true)
      setIsFiltering(true)

      try {
        const data = await fetchEquipment()
        console.log('Fetched equipment data:', data?.length || 0, 'items')
        setEquipment(data)

        if (data && data.length > 0) {
          setHasInitialData(true)
        }
      } catch (err) {
        console.error('Error loading equipment:', err)
        setError(err instanceof Error ? err.message : 'Failed to load equipment')
      } finally {
        setLoading(false)
        setIsFiltering(false)
      }
    }

    if (isHydrated) {
      loadInitialData()
    }
  }, [isHydrated, fetchEquipment])

  // Fetch equipment when filters change (but not on initial load)
  useEffect(() => {
    if (!hasInitialData) return

    const loadEquipment = async () => {
      setIsFiltering(true)
      try {
        const params: Record<string, string> = {}
        if (selectedCategory !== 'all') params.category = selectedCategory
        if (selectedLocation !== 'جميع الولايات') params.location = selectedLocation
        if (priceRange.min) params.minPrice = priceRange.min
        if (priceRange.max) params.maxPrice = priceRange.max
        if (selectedCondition) params.condition = selectedCondition
        if (debouncedSearchTerm) params.search = debouncedSearchTerm

        const data = await fetchEquipment(params)
        setEquipment(data)
      } catch (err) {
        console.error('Error fetching equipment:', err)
      } finally {
        setIsFiltering(false)
      }
    }

    loadEquipment()
  }, [debouncedSearchTerm, selectedCondition, selectedCategory, selectedLocation, priceRange.min, priceRange.max, sortBy, hasInitialData, fetchEquipment])

  const loadMore = () => {
    setCurrentPage(prev => prev + 1)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCondition('')
    setSelectedCategory('all')
    setSelectedLocation('جميع الولايات')
    setPriceRange({ min: '', max: '' })
    setSortBy('latest')
    setCurrentPage(1)
  }

  // Determine what data to show - only use real data, no fallback
  const displayEquipment = equipment || []
  const isLoading = loading || isFiltering || !isHydrated
  const hasData = displayEquipment && displayEquipment.length > 0

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
      <MotionDiv
        className="absolute top-0 left-0 w-full h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      >
        <div className="absolute top-20 left-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-teal-500/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-emerald-600/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </MotionDiv>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            {/* Icon Animation */}
            <MotionDiv
              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="text-8xl mb-8 drop-shadow-2xl"
            >
              <span>🚜</span>
            </MotionDiv>

            {/* Main Title */}
            <MotionDiv
              className="text-5xl lg:text-7xl font-black mb-8 bg-gradient-to-r from-emerald-300 via-teal-300 to-emerald-400 bg-clip-text text-transparent drop-shadow-lg"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <span>تأجير الآلات الزراعية</span>
            </MotionDiv>

            {/* Subtitle */}
            <MotionDiv
              className="text-xl lg:text-2xl mb-8 opacity-90 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              <span>اكتشف أحدث المعدات الزراعية المتطورة من جرارات وحصادات وأنظمة ري متقدمة</span>
            </MotionDiv>

            {/* Stats Section */}
            <MotionDiv
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              {[
                { number: `${displayEquipment.length}+`, label: "معدات متاحة", icon: "🚜" },
                { number: `${displayEquipment.filter(e => e.condition === 'new').length}+`, label: "جديدة", icon: "🆕" },
                { number: `${displayEquipment.filter(e => e.condition === 'good' || e.condition === 'excellent').length}+`, label: "مستعملة", icon: "✅" },
                { number: "24/7", label: "دعم متواصل", icon: "🛡️" }
              ].map((stat, index) => (
                <div 
                  key={index}
                  className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all duration-300 hover:scale-105"
                >
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-2xl font-bold text-emerald-300 mb-1">{stat.number}</div>
                  <div className="text-sm text-white/70">{stat.label}</div>
                </div>
              ))}
            </MotionDiv>

            {/* Search Bar */}
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="max-w-2xl mx-auto"
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="ابحث عن الجرارات، الحصادات، المحاريث..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-6 py-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full text-white placeholder-white/60 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50 transition-all duration-300"
                />
                {isLoading ? (
                  <div className="absolute left-6 top-1/2 transform -translate-y-1/2">
                    <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                )}
              </div>
            </MotionDiv>
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
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg text-white focus:outline-none focus:border-emerald-400"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* Clear Filters Button */}
              {(searchTerm || selectedCondition || selectedCategory !== 'all' || selectedLocation !== 'جميع الولايات' || priceRange.min || priceRange.max) && (
                <button
                  onClick={clearFilters}
                  className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-white"
                >
                  مسح الفلاتر
                </button>
              )}

              {/* Add Equipment Button */}
              {user ? (
                <Link
                  href="/equipment/new"
                  className="flex items-center px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  إضافة معدات
                </Link>
              ) : (
                <Link
                  href="/sign-in"
                  className="flex items-center px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  تسجيل الدخول لإضافة معدات
                </Link>
              )}
            </div>

            {/* Category Chips */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-3">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center px-4 py-2 rounded-full transition-all duration-200 ${
                      selectedCategory === category.id
                        ? 'bg-emerald-500 text-white shadow-lg'
                        : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/20'
                    }`}
                  >
                    <span className="ml-2 text-lg">{category.icon}</span>
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Filters */}
            <AnimatePresence>
              {showFilters && (
                <MotionDiv
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg p-6 mb-6"
                >
                  {/* Advanced Filters Title */}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-emerald-300 mb-4">فلاتر متقدمة</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Location Filter */}
                    <div>
                      <label className="block text-sm font-medium mb-2">المنطقة</label>
                      <select
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                      >
                        {locations.map((location) => (
                          <option key={location} value={location}>
                            {location}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Condition Filter */}
                    <div>
                      <label className="block text-sm font-medium mb-2">الحالة</label>
                      <select
                        value={selectedCondition}
                        onChange={(e) => setSelectedCondition(e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                      >
                        {conditions.map((condition) => (
                          <option key={condition.value} value={condition.value}>
                            {condition.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Price Range */}
                    <div>
                      <label className="block text-sm font-medium mb-2">السعر الأدنى</label>
                      <input
                        type="number"
                        placeholder="السعر الأدنى"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">السعر الأعلى</label>
                      <input
                        type="number"
                        placeholder="السعر الأعلى"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>

                  {/* Clear Filters */}
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      مسح الفلاتر
                    </button>
                  </div>
                </MotionDiv>
              )}
            </AnimatePresence>
          </div>

          {/* Results Summary */}
          <div className="flex justify-between items-center mb-6">
            <div className="text-emerald-300">
              <span className="font-bold">{displayEquipment.length}</span> معدات متاحة
            </div>
            <div className="text-sm text-white/60">
              {displayEquipment.length > 0 ? `عرض ${displayEquipment.length} من ${displayEquipment.length} معدات` : 'لا توجد معدات متاحة'}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300">
              {error}
            </div>
          )}

          {/* Equipment Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg p-4 animate-pulse">
                  <div className="h-48 bg-white/10 rounded-lg mb-4"></div>
                  <div className="h-4 bg-white/10 rounded mb-2"></div>
                  <div className="h-4 bg-white/10 rounded w-2/3 mb-2"></div>
                  <div className="h-6 bg-white/10 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : hasData ? (
            <>
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1'
              }`}>
                <AnimatePresence>
                  <React.Fragment>
                    {displayEquipment.map((item, index) => (
                      <EquipmentCardEnhanced key={item.id || index} item={item} viewMode={viewMode} />
                    ))}
                  </React.Fragment>
                </AnimatePresence>
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
            <MotionDiv
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="text-8xl mb-6">🚜</div>
              <h3 className="text-3xl font-bold text-white mb-4">لا توجد معدات متاحة</h3>
              <p className="text-white/60 mb-8 text-lg">جرب تغيير الفلاتر أو البحث بكلمات مختلفة</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={clearFilters}
                  className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors font-semibold"
                >
                  مسح الفلاتر
                </button>
                {user && (
                  <Link
                    href="/equipment/new"
                    className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-lg font-semibold transition-all duration-300"
                  >
                    إضافة معدات جديدة
                  </Link>
                )}
              </div>
            </MotionDiv>
          )}
        </div>
      </section>
    </div>
  )
}
