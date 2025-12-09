'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { apiClient } from '@/lib/api/client'
import Link from 'next/link'
import UnifiedHero from '@/components/marketplace/UnifiedHero'
import UnifiedFilterBar from '@/components/marketplace/UnifiedFilterBar'
import QuickScanCard, { QuickScanCardSkeleton } from '@/components/marketplace/QuickScanCard'

const categories = [
  { id: 'all', label: 'جميع الآلات' },
  { id: 'tractor', label: 'جرارات' },
  { id: 'harvester', label: 'حصادات' },
  { id: 'plow', label: 'محاريث' },
  { id: 'seeder', label: 'آلات البذر' },
  { id: 'sprayer', label: 'رشاشات' },
  { id: 'irrigation', label: 'أنظمة الري' },
  { id: 'tools', label: 'أدوات زراعية' },
]

const sortOptions = [
  { value: 'latest', label: 'الأحدث' },
  { value: 'oldest', label: 'الأقدم' },
  { value: 'price-low', label: 'السعر: من الأقل' },
  { value: 'price-high', label: 'السعر: من الأعلى' },
]

export default function EquipmentPage() {
  const { user } = useUser()
  const [equipment, setEquipment] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('latest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  const fetchEquipment = useCallback(async (params?: Record<string, string>) => {
    try {
      const data = await apiClient.getEquipment(params)
      return Array.isArray(data) ? data : []
    } catch (err) {
      console.error('Error fetching equipment:', err)
      throw err
    }
  }, [])

  useEffect(() => {
    const loadData = async () => {
      if (!isHydrated) return

      setLoading(true)
      try {
        const params: Record<string, string> = {}
        if (selectedCategory !== 'all') params.category = selectedCategory
        if (searchTerm) params.search = searchTerm

        const data = await fetchEquipment(params)
        setEquipment(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل البيانات')
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(loadData, 300)
    return () => clearTimeout(timer)
  }, [isHydrated, selectedCategory, searchTerm, fetchEquipment])

  const getItemImage = (item: any) => {
    if (item.images && item.images.length > 0) {
      return item.images[0]
    }
    return '/assets/machin01.jpg'
  }

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-[#f5f3f0] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#2d5016] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f3f0]">
      {/* Hero Section */}
      <UnifiedHero
        title="المعدات الزراعية"
        subtitle="اكتشف أحدث المعدات الزراعية من جرارات وحصادات وأنظمة ري"
        showSearch
        searchPlaceholder="ابحث عن الجرارات، الحصادات، المحاريث..."
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
              <span className="font-bold">{equipment.length}</span> معدات متاحة
            </div>
            {user ? (
              <Link
                href="/equipment/new"
                className="px-6 py-2 bg-[#2d5016] text-white rounded-full hover:bg-[#1a3d0f] transition-colors font-semibold"
              >
                إضافة معدات
              </Link>
            ) : (
              <Link
                href="/sign-in"
                className="px-6 py-2 bg-[#d4af37] text-white rounded-full hover:bg-[#b8941f] transition-colors font-semibold"
              >
                تسجيل الدخول لإضافة معدات
              </Link>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Equipment Grid */}
          {loading ? (
            <div className="marketplace-grid-quickscan">
              {[...Array(8)].map((_, i) => (
                <QuickScanCardSkeleton key={i} />
              ))}
            </div>
          ) : equipment.length > 0 ? (
            <div className="marketplace-grid-quickscan">
              {equipment.map((item, index) => (
                <QuickScanCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  price={item.price}
                  currency={item.currency || 'دج'}
                  location={item.location}
                  image={getItemImage(item)}
                  href={`/equipment/${item.id}`}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state-unified">
              <h3>لا توجد معدات متاحة</h3>
              <p>جرب تغيير الفلاتر أو البحث بكلمات مختلفة</p>
              <button
                onClick={() => {
                  setSelectedCategory('all')
                  setSearchTerm('')
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
  )
}
