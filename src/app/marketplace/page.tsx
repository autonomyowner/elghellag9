'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api/client';
import { PerformanceMonitor } from '@/lib/performance';
import UnifiedHero from '@/components/marketplace/UnifiedHero';
import QuickScanCard, { QuickScanCardSkeleton } from '@/components/marketplace/QuickScanCard';

interface MarketplaceItem {
  id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  location: string;
  images: string[];
  is_available: boolean;
  is_featured: boolean;
  view_count: number;
  created_at: string;
  type: 'land' | 'nursery' | 'equipment' | 'animal' | 'vegetable';
}

interface SectionData {
  title: string;
  color: string;
  items: MarketplaceItem[];
  loading: boolean;
  link: string;
  error?: string | null;
}

const defaultImages: Record<string, string> = {
  land: '/assets/land01.jpg',
  nursery: '/assets/seedings01.jpg',
  equipment: '/assets/machin01.jpg',
  animal: '/assets/sheep1.webp',
  vegetable: '/assets/tomato 2.jpg'
};

export default function MarketplacePage() {
  const [sections, setSections] = useState<SectionData[]>([
    {
      title: 'الأراضي الزراعية',
      color: 'bg-emerald-500',
      items: [],
      loading: true,
      link: '/land',
      error: null
    },
    {
      title: 'الشتلات والمشاتل',
      color: 'bg-green-500',
      items: [],
      loading: true,
      link: '/nurseries',
      error: null
    },
    {
      title: 'المعدات الزراعية',
      color: 'bg-blue-500',
      items: [],
      loading: true,
      link: '/equipment',
      error: null
    },
    {
      title: 'الحيوانات',
      color: 'bg-orange-500',
      items: [],
      loading: true,
      link: '/animals',
      error: null
    },
    {
      title: 'الخضروات والفواكه',
      color: 'bg-red-500',
      items: [],
      loading: true,
      link: '/VAR/marketplace',
      error: null
    }
  ]);

  const updateSectionState = useCallback((title: SectionData['title'], updates: Partial<SectionData>) => {
    setSections(prev =>
      prev.map(section =>
        section.title === title
          ? { ...section, ...updates }
          : section
      )
    );
  }, []);

  const loadLandSection = useCallback(async () => {
    const title = 'الأراضي الزراعية';
    try {
      const data = await apiClient.getLand({ limit: '5' });
      updateSectionState(title, {
        items: (Array.isArray(data) ? data : []).map((item: any) => ({ ...item, type: 'land' as const, currency: item.currency || 'دج' })),
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error loading land section:', error);
      const message = error instanceof Error ? error.message : 'unknown';
      updateSectionState(title, {
        loading: false,
        error: `تعذر تحميل إعلانات الأراضي. (${message})`,
        items: []
      });
    }
  }, [updateSectionState]);

  const loadNurserySection = useCallback(async () => {
    const title = 'الشتلات والمشاتل';
    try {
      const data = await apiClient.getNurseries({ limit: '5' });
      updateSectionState(title, {
        items: (Array.isArray(data) ? data : []).map((item: any) => ({ ...item, type: 'nursery' as const, currency: item.currency || 'دج' })),
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error loading nursery section:', error);
      const message = error instanceof Error ? error.message : 'unknown';
      updateSectionState(title, {
        loading: false,
        error: `تعذر تحميل إعلانات المشاتل. (${message})`,
        items: []
      });
    }
  }, [updateSectionState]);

  const loadEquipmentSection = useCallback(async () => {
    const title = 'المعدات الزراعية';
    try {
      const data = await apiClient.getEquipment({ limit: '5' });
      updateSectionState(title, {
        items: (Array.isArray(data) ? data : []).map((item: any) => ({ ...item, type: 'equipment' as const, currency: item.currency || 'دج' })),
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error loading equipment section:', error);
      const message = error instanceof Error ? error.message : 'unknown';
      updateSectionState(title, {
        loading: false,
        error: `تعذر تحميل إعلانات المعدات. (${message})`,
        items: []
      });
    }
  }, [updateSectionState]);

  const loadAnimalSection = useCallback(async () => {
    const title = 'الحيوانات';
    try {
      const data = await apiClient.getAnimals({ limit: '5' });
      updateSectionState(title, {
        items: (Array.isArray(data) ? data : []).map((item: any) => ({ ...item, type: 'animal' as const, currency: item.currency || 'دج' })),
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error loading animal section:', error);
      const message = error instanceof Error ? error.message : 'unknown';
      updateSectionState(title, {
        loading: false,
        error: `تعذر تحميل إعلانات الحيوانات. (${message})`,
        items: []
      });
    }
  }, [updateSectionState]);

  const loadVegetableSection = useCallback(async () => {
    const title = 'الخضروات والفواكه';
    try {
      const data = await apiClient.getVegetables({ limit: '5' });
      updateSectionState(title, {
        items: (Array.isArray(data) ? data : []).map((item: any) => ({ ...item, type: 'vegetable' as const, currency: item.currency || 'دج' })),
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error loading vegetable section:', error);
      const message = error instanceof Error ? error.message : 'unknown';
      updateSectionState(title, {
        loading: false,
        error: `تعذر تحميل إعلانات الخضروات. (${message})`,
        items: []
      });
    }
  }, [updateSectionState]);

  const loadAllSections = useCallback(async () => {
    PerformanceMonitor.startTimer('marketplace-load');
    try {
      await Promise.all([
        loadLandSection(),
        loadNurserySection(),
        loadEquipmentSection(),
        loadAnimalSection(),
        loadVegetableSection()
      ]);
    } finally {
      PerformanceMonitor.endTimer('marketplace-load');
    }
  }, [loadLandSection, loadNurserySection, loadEquipmentSection, loadAnimalSection, loadVegetableSection]);

  useEffect(() => {
    loadAllSections();

    const timeoutId = setTimeout(() => {
      setSections(prev => prev.map(section =>
        section.loading
          ? { ...section, loading: false, error: 'انتهت مهلة التحميل. يرجى تحديث الصفحة.' }
          : section
      ));
    }, 10000);

    return () => clearTimeout(timeoutId);
  }, [loadAllSections]);

  const sectionLoadHandlers: Record<SectionData['title'], () => Promise<void>> = {
    'الأراضي الزراعية': loadLandSection,
    'الشتلات والمشاتل': loadNurserySection,
    'المعدات الزراعية': loadEquipmentSection,
    'الحيوانات': loadAnimalSection,
    'الخضروات والفواكه': loadVegetableSection,
  };

  const getItemImage = (item: MarketplaceItem) => {
    if (item.images && item.images.length > 0) {
      return item.images[0];
    }
    return defaultImages[item.type];
  };

  return (
    <div className="min-h-screen bg-[#f5f3f0]">
      {/* Hero Section */}
      <UnifiedHero
        title="سوق الفلاح"
        subtitle="اكتشف كل ما تحتاجه للزراعة في مكان واحد"
      />

      {/* Marketplace Sections */}
      <div className="pb-16">
        {sections.map((section) => (
          <section key={section.title} className="py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              {/* Section Header */}
              <div className="section-header-unified">
                <h2 className="section-title-unified">{section.title}</h2>
                <Link href={section.link} className="section-link-unified">
                  عرض الكل
                </Link>
              </div>

              {/* Items Grid */}
              {section.loading ? (
                <div className="marketplace-grid-quickscan">
                  {[...Array(5)].map((_, index) => (
                    <QuickScanCardSkeleton key={index} />
                  ))}
                </div>
              ) : section.error ? (
                <div className="empty-state-unified">
                  <h3>{section.error}</h3>
                  <button
                    onClick={() => sectionLoadHandlers[section.title]?.()}
                    className="mt-4 px-6 py-2 bg-[#2d5016] text-white rounded-full hover:bg-[#1a3d0f] transition-colors"
                  >
                    إعادة المحاولة
                  </button>
                </div>
              ) : section.items.length > 0 ? (
                <div className="marketplace-grid-quickscan">
                  {section.items.map((item, index) => (
                    <QuickScanCard
                      key={item.id}
                      id={item.id}
                      title={item.title}
                      price={item.price}
                      currency={item.currency}
                      location={item.location}
                      image={getItemImage(item)}
                      href={`${section.link}/${item.id}`}
                      index={index}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-state-unified">
                  <h3>لا توجد إعلانات</h3>
                  <p>لم يتم العثور على إعلانات في هذه الفئة</p>
                </div>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
