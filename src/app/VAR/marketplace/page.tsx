"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface VegetableListing {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  vegetable_type: string;
  quantity: number;
  unit: string;
  freshness: string;
  organic: boolean;
  location: string;
  contact_phone: string;
}

// Mockup data for vegetables
const mockVegetables: VegetableListing[] = [
  {
    id: '1',
    title: 'طماطم طازجة عضوية',
    description: 'طماطم طازجة من المزرعة مباشرة، عضوية 100%، مثالية للسلطات والطبخ',
    price: 150,
    currency: 'دج',
    vegetable_type: 'tomatoes',
    quantity: 100,
    unit: 'kg',
    freshness: 'excellent',
    organic: true,
    location: 'الجزائر العاصمة',
    contact_phone: '0555123456'
  },
  {
    id: '2',
    title: 'بطاطس محلية ممتازة',
    description: 'بطاطس محلية طازجة، مناسبة للقلي والطبخ، من أجود المزارع',
    price: 80,
    currency: 'دج',
    vegetable_type: 'potatoes',
    quantity: 500,
    unit: 'kg',
    freshness: 'excellent',
    organic: false,
    location: 'البليدة',
    contact_phone: '0666789012'
  },
  {
    id: '3',
    title: 'بصل أحمر طازج',
    description: 'بصل أحمر طازج ولذيذ، مثالي للسلطات والطبخ',
    price: 60,
    currency: 'دج',
    vegetable_type: 'onions',
    quantity: 200,
    unit: 'kg',
    freshness: 'good',
    organic: false,
    location: 'وهران',
    contact_phone: '0777345678'
  },
  {
    id: '4',
    title: 'جزر عضوي طازج',
    description: 'جزر عضوي طازج من المزرعة، غني بالفيتامينات',
    price: 120,
    currency: 'دج',
    vegetable_type: 'carrots',
    quantity: 150,
    unit: 'kg',
    freshness: 'excellent',
    organic: true,
    location: 'قسنطينة',
    contact_phone: '0558901234'
  },
  {
    id: '5',
    title: 'خيار طازج للسلطة',
    description: 'خيار طازج ومقرمش، مثالي للسلطات والمقبلات',
    price: 90,
    currency: 'دج',
    vegetable_type: 'cucumbers',
    quantity: 80,
    unit: 'kg',
    freshness: 'excellent',
    organic: false,
    location: 'تيزي وزو',
    contact_phone: '0669567890'
  },
  {
    id: '6',
    title: 'فلفل حلو ملون',
    description: 'فلفل حلو بألوان متعددة، طازج ولذيذ',
    price: 200,
    currency: 'دج',
    vegetable_type: 'peppers',
    quantity: 60,
    unit: 'kg',
    freshness: 'good',
    organic: true,
    location: 'عنابة',
    contact_phone: '0770123456'
  }
];

const VegetablesMarketplacePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high'>('newest');
  const [filterType, setFilterType] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter and sort listings
  const filteredListings = mockVegetables
    .filter(v => {
      if (filterType !== 'all' && v.vegetable_type !== filterType) return false;
      if (searchTerm && !v.title.includes(searchTerm) && !v.description.includes(searchTerm)) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price_low') return a.price - b.price;
      if (sortBy === 'price_high') return b.price - a.price;
      return 0;
    });

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

  const getVegetableEmoji = (type: string) => {
    const emojis: { [key: string]: string } = {
      tomatoes: '🍅',
      potatoes: '🥔',
      onions: '🧅',
      carrots: '🥕',
      cucumbers: '🥒',
      peppers: '🫑',
      lettuce: '🥬',
      cabbage: '🥬',
      other: '🥬'
    };
    return emojis[type] || '🥬';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 pt-20">
      {/* Hero Section */}
      <section className="relative py-20 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>

        <motion.div
          className="absolute top-0 left-0 w-full h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        >
          <div className="absolute top-20 left-10 w-32 h-32 bg-green-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
        </motion.div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="text-8xl mb-8"
            >
              🥬
            </motion.div>

            <motion.h1
              className="text-5xl lg:text-7xl font-black mb-8 bg-gradient-to-r from-green-300 via-emerald-300 to-teal-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              سوق الخضار الطازجة
            </motion.h1>

            <motion.p
              className="text-xl lg:text-2xl mb-12 opacity-90 max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              اكتشف أفضل الخضار الطازجة والعضوية من المزارعين المحليين
            </motion.p>

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
      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* Controls */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-white"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                فلاتر
              </button>

              <div className="flex items-center bg-white/10 backdrop-blur-lg rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-green-600' : 'hover:bg-white/10'} text-white`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect width="18" height="18" x="3" y="3" rx="2"></rect>
                    <path d="M3 9h18M3 15h18M9 3v18M15 3v18"></path>
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-green-600' : 'hover:bg-white/10'} text-white`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M3 12h.01M3 18h.01M3 6h.01M8 12h13M8 18h13M8 6h13"></path>
                  </svg>
                </button>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-400"
              >
                <option value="newest">الأحدث</option>
                <option value="price_low">السعر: من الأقل</option>
                <option value="price_high">السعر: من الأعلى</option>
              </select>

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

            {/* Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg p-6 mb-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-white">نوع الخضار</label>
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-400"
                      >
                        <option value="all">جميع الأنواع</option>
                        <option value="tomatoes">طماطم</option>
                        <option value="potatoes">بطاطس</option>
                        <option value="onions">بصل</option>
                        <option value="carrots">جزر</option>
                        <option value="cucumbers">خيار</option>
                        <option value="peppers">فلفل</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Listings Grid */}
          <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' : 'space-y-4'}`}>
            {filteredListings.map((vegetable, index) => (
              <motion.div
                key={vegetable.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 ${viewMode === 'list' ? 'flex gap-4' : ''}`}
              >
                {/* Image */}
                <div className={`${viewMode === 'list' ? 'w-32 h-24 flex-shrink-0' : 'h-48'} bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center`}>
                  <span className={`${viewMode === 'list' ? 'text-4xl' : 'text-6xl'}`}>
                    {getVegetableEmoji(vegetable.vegetable_type)}
                  </span>
                </div>

                {/* Details */}
                <div className={`p-6 ${viewMode === 'list' ? 'flex-1 flex flex-col justify-between' : ''}`}>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{vegetable.title}</h3>
                    <p className="text-gray-300 mb-4 line-clamp-2">{vegetable.description}</p>

                    <div className="flex justify-between items-center mb-4">
                      <span className="text-2xl font-bold text-green-400">
                        {vegetable.price} {vegetable.currency} / {getUnitLabel(vegetable.unit)}
                      </span>
                      <span className="text-sm text-gray-300">
                        {getVegetableTypeLabel(vegetable.vegetable_type)}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-300 text-sm">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {vegetable.location}
                      </div>
                      <div className="flex items-center text-gray-300 text-sm">
                        <span className="mr-2">الطزاجة:</span>
                        <span className={`font-medium ${
                          vegetable.freshness === 'excellent' ? 'text-green-400' :
                          vegetable.freshness === 'good' ? 'text-blue-400' : 'text-yellow-400'
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

          {filteredListings.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🥬</div>
              <h3 className="text-2xl font-bold mb-2 text-white">لا توجد خضار متاحة</h3>
              <p className="text-gray-300 mb-6">جرب تغيير الفلاتر أو إضافة خضار جديدة</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default VegetablesMarketplacePage;
