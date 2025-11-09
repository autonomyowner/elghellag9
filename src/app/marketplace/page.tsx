'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/supabase/supabaseClient';
import { designSystem, utils, animations } from '@/lib/designSystem';
import { useLazyLoad, PerformanceMonitor } from '@/lib/performance';
import { 
  MapPin, 
  Leaf, 
  Wrench, 
  Truck, 
  Ship, 
  Satellite, 
  Users,
  Heart,
  Share2,
  CalendarCheck,
  Star,
  TrendingUp,
  ArrowRight,
  Eye,
  Clock
} from 'lucide-react';

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
  emoji: string;
  color: string;
  items: MarketplaceItem[];
  loading: boolean;
  link: string;
}

export default function MarketplacePage() {
  const { user } = useSupabaseAuth();
  const [isHydrated, setIsHydrated] = useState(false);
  const [sections, setSections] = useState<SectionData[]>([
    {
      title: 'الأراضي الزراعية',
      emoji: '',
      color: 'bg-emerald-500',
      items: [],
      loading: true,
      link: '/land'
    },
    {
      title: 'الشتلات والمشاتل',
      emoji: '',
      color: 'bg-green-500',
      items: [],
      loading: true,
      link: '/nurseries'
    },
    {
      title: 'المعدات الزراعية',
      emoji: '',
      color: 'bg-blue-500',
      items: [],
      loading: true,
      link: '/equipment'
    },
    {
      title: 'الحيوانات',
      emoji: '',
      color: 'bg-orange-500',
      items: [],
      loading: true,
      link: '/animals'
    },
    {
      title: 'الخضروات والفواكه',
      emoji: '',
      color: 'bg-red-500',
      items: [],
      loading: true,
      link: '/VAR/marketplace'
    }
  ]);

  useEffect(() => {
    setIsHydrated(true);
    PerformanceMonitor.startTimer('marketplace-load');
    loadAllSections();
  }, []);

  useEffect(() => {
    PerformanceMonitor.endTimer('marketplace-load');
  }, []);

  const loadAllSections = async () => {
    await Promise.all([
      loadLandSection(),
      loadNurserySection(),
      loadEquipmentSection(),
      loadAnimalSection(),
      loadVegetableSection()
    ]);
  };

  const loadLandSection = async () => {
    try {
      const { data, error } = await supabase
        .from('land_listings')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!error && data) {
        setSections(prev => prev.map(section => 
          section.title === 'الأراضي الزراعية' 
            ? { ...section, items: data.map(item => ({ ...item, type: 'land' as const })), loading: false }
            : section
        ));
      }
    } catch (error) {
      console.error('Error loading land section:', error);
    }
  };

  const loadNurserySection = async () => {
    try {
      const { data, error } = await supabase
        .from('nurseries')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!error && data) {
        setSections(prev => prev.map(section => 
          section.title === 'الشتلات والمشاتل' 
            ? { ...section, items: data.map(item => ({ ...item, type: 'nursery' as const })), loading: false }
            : section
        ));
      }
    } catch (error) {
      console.error('Error loading nursery section:', error);
    }
  };

  const loadEquipmentSection = async () => {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!error && data) {
        setSections(prev => prev.map(section => 
          section.title === 'المعدات الزراعية' 
            ? { ...section, items: data.map(item => ({ ...item, type: 'equipment' as const })), loading: false }
            : section
        ));
      }
    } catch (error) {
      console.error('Error loading equipment section:', error);
    }
  };

  const loadAnimalSection = async () => {
    try {
      const { data, error } = await supabase
        .from('animal_listings')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!error && data) {
        setSections(prev => prev.map(section => 
          section.title === 'الحيوانات' 
            ? { ...section, items: data.map(item => ({ ...item, type: 'animal' as const })), loading: false }
            : section
        ));
      }
    } catch (error) {
      console.error('Error loading animal section:', error);
    }
  };

  const loadVegetableSection = async () => {
    try {
      const { data, error } = await supabase
        .from('vegetables')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!error && data) {
        setSections(prev => prev.map(section => 
          section.title === 'الخضروات والفواكه' 
            ? { ...section, items: data.map(item => ({ ...item, type: 'vegetable' as const })), loading: false }
            : section
        ));
      }
    } catch (error) {
      console.error('Error loading vegetable section:', error);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return `${price.toLocaleString('en-US')} ${currency}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getItemImage = (item: MarketplaceItem) => {
    if (item.images && item.images.length > 0) {
      return item.images[0];
    }
    
    // Default images based on type
    const defaultImages = {
      land: '/assets/land01.jpg',
      nursery: '/assets/seedings01.jpg',
      equipment: '/assets/machin01.jpg',
      animal: '/assets/sheep1.webp',
      vegetable: '/assets/tomato 2.jpg'
    };
    
    return defaultImages[item.type];
  };

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
    <div className="min-h-screen text-white relative overflow-hidden bg-gradient-to-br from-green-900 to-gray-900">

      {/* Hero Section */}
      <section className="relative z-10 pt-24 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          {/* Main Title */}
          <h1 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-emerald-300 via-teal-300 to-emerald-400 bg-clip-text text-transparent drop-shadow-lg">
            سوق الفلاح
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg md:text-xl text-white/90 mb-6 max-w-3xl mx-auto leading-relaxed">
            اكتشف كل ما تحتاجه للزراعة في مكان واحد
          </p>
        </div>
      </section>

      {/* Marketplace Sections */}
      <div className="relative z-10 pb-20">
        {sections.map((section, sectionIndex) => (
          <section key={section.title} className="py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              {/* Section Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`${section.color} p-3 rounded-full`}>
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-emerald-300">{section.title}</h2>
                    <p className="text-white/70 text-sm">أحدث الإعلانات</p>
                  </div>
                </div>
                <Link
                  href={section.link}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg transition-colors"
                >
                  <span>عرض الكل</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Items Grid */}
              {section.loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  {[...Array(5)].map((_, index) => (
                    <div key={index} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 animate-pulse">
                      <div className="bg-white/20 h-32 rounded-lg mb-3"></div>
                      <div className="bg-white/20 h-4 rounded mb-2"></div>
                      <div className="bg-white/20 h-3 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : section.items.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  {section.items.map((item, index) => (
                    <Link
                      key={item.id}
                      href={`${section.link}/${item.id}`}
                      className="group block bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden hover:from-white/15 hover:to-white/10 hover:border-emerald-400/50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:-translate-y-2 cursor-pointer"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {/* Item Image */}
                      <div className="relative h-32 overflow-hidden">
                        <img
                          src={getItemImage(item)}
                          alt={item.title}
                          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:from-black/70 group-hover:via-black/30 transition-all duration-300"></div>
                        
                        {/* Featured Badge */}
                        {item.is_featured && (
                          <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                            مميز
                          </div>
                        )}
                        
                        {/* View Count */}
                        <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white/80 text-xs">
                          <Eye className="w-3 h-3" />
                          {item.view_count}
                        </div>
                      </div>

                      {/* Item Content */}
                      <div className="p-4">
                        <h3 className="font-bold text-white mb-2 line-clamp-2 group-hover:text-emerald-300 transition-colors">
                          {item.title}
                        </h3>
                        
                        {item.description && (
                          <p className="text-white/70 text-sm mb-3 line-clamp-2">
                            {item.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="text-emerald-300 font-bold">
                            {formatPrice(item.price, item.currency)}
                          </div>
                          <div className="flex items-center gap-1 text-white/60 text-xs">
                            <MapPin className="w-3 h-3" />
                            {item.location}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-white/50 text-xs mt-2">
                          <Clock className="w-3 h-3" />
                          {formatDate(item.created_at)}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-xl font-bold text-white mb-2">لا توجد إعلانات</h3>
                  <p className="text-white/70">لم يتم العثور على إعلانات في هذه الفئة</p>
                </div>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
