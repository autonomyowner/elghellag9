"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
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
  harvest_date: string;
}

// Same mockup data
const mockVegetables: VegetableListing[] = [
  {
    id: '1',
    title: 'طماطم طازجة عضوية',
    description: 'طماطم طازجة من المزرعة مباشرة، عضوية 100%، مثالية للسلطات والطبخ. تم حصادها بعناية فائقة للحفاظ على جودتها ونضارتها. مزروعة بدون أي مبيدات حشرية أو أسمدة كيميائية.',
    price: 150,
    currency: 'دج',
    vegetable_type: 'tomatoes',
    quantity: 100,
    unit: 'kg',
    freshness: 'excellent',
    organic: true,
    location: 'الجزائر العاصمة',
    contact_phone: '0555123456',
    harvest_date: '2024-01-10'
  },
  {
    id: '2',
    title: 'بطاطس محلية ممتازة',
    description: 'بطاطس محلية طازجة، مناسبة للقلي والطبخ، من أجود المزارع. حجم متوسط إلى كبير، خالية من العيوب. مثالية للمطاعم والفنادق.',
    price: 80,
    currency: 'دج',
    vegetable_type: 'potatoes',
    quantity: 500,
    unit: 'kg',
    freshness: 'excellent',
    organic: false,
    location: 'البليدة',
    contact_phone: '0666789012',
    harvest_date: '2024-01-08'
  },
  {
    id: '3',
    title: 'بصل أحمر طازج',
    description: 'بصل أحمر طازج ولذيذ، مثالي للسلطات والطبخ. نكهة قوية ومميزة، حجم موحد.',
    price: 60,
    currency: 'دج',
    vegetable_type: 'onions',
    quantity: 200,
    unit: 'kg',
    freshness: 'good',
    organic: false,
    location: 'وهران',
    contact_phone: '0777345678',
    harvest_date: '2024-01-05'
  },
  {
    id: '4',
    title: 'جزر عضوي طازج',
    description: 'جزر عضوي طازج من المزرعة، غني بالفيتامينات. لون برتقالي زاهي، طعم حلو طبيعي. مثالي للعصائر والسلطات.',
    price: 120,
    currency: 'دج',
    vegetable_type: 'carrots',
    quantity: 150,
    unit: 'kg',
    freshness: 'excellent',
    organic: true,
    location: 'قسنطينة',
    contact_phone: '0558901234',
    harvest_date: '2024-01-12'
  },
  {
    id: '5',
    title: 'خيار طازج للسلطة',
    description: 'خيار طازج ومقرمش، مثالي للسلطات والمقبلات. حجم متوسط، لون أخضر داكن، بدون بذور كثيرة.',
    price: 90,
    currency: 'دج',
    vegetable_type: 'cucumbers',
    quantity: 80,
    unit: 'kg',
    freshness: 'excellent',
    organic: false,
    location: 'تيزي وزو',
    contact_phone: '0669567890',
    harvest_date: '2024-01-11'
  },
  {
    id: '6',
    title: 'فلفل حلو ملون',
    description: 'فلفل حلو بألوان متعددة (أحمر، أصفر، أخضر)، طازج ولذيذ. مثالي للسلطات والطبخ والشوي.',
    price: 200,
    currency: 'دج',
    vegetable_type: 'peppers',
    quantity: 60,
    unit: 'kg',
    freshness: 'good',
    organic: true,
    location: 'عنابة',
    contact_phone: '0770123456',
    harvest_date: '2024-01-09'
  }
];

const VegetableDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const vegetableId = params.id as string;

  const vegetable = mockVegetables.find(v => v.id === vegetableId);

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

  if (!vegetable) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-6xl mb-4">🥬</div>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">الخضار غير موجودة</h2>
              <p className="text-gray-600 mb-6">الخضار المطلوبة غير متوفرة</p>
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
                <Link href="/" className="hover:text-green-600 transition-colors">
                  الرئيسية
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/VAR/marketplace" className="hover:text-green-600 transition-colors">
                  سوق الخضار
                </Link>
              </li>
              <li>/</li>
              <li className="text-gray-800 font-medium">{vegetable.title}</li>
            </ol>
          </nav>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Image */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="h-96 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-9xl">
                  {getVegetableEmoji(vegetable.vegetable_type)}
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{vegetable.title}</h1>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-green-600">
                    {vegetable.price} {vegetable.currency} / {getUnitLabel(vegetable.unit)}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">الوصف</h3>
                <p className="text-gray-600 leading-relaxed">{vegetable.description}</p>
              </div>

              {/* Key Details */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <span className="text-sm text-gray-500">نوع الخضار</span>
                  <p className="font-medium">{getVegetableTypeLabel(vegetable.vegetable_type)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">الكمية المتوفرة</span>
                  <p className="font-medium">{vegetable.quantity} {getUnitLabel(vegetable.unit)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">الطزاجة</span>
                  <p className={`font-medium ${
                    vegetable.freshness === 'excellent' ? 'text-green-600' :
                    vegetable.freshness === 'good' ? 'text-blue-600' : 'text-yellow-600'
                  }`}>
                    {getFreshnessLabel(vegetable.freshness)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">تاريخ الحصاد</span>
                  <p className="font-medium">{vegetable.harvest_date}</p>
                </div>
              </div>

              {/* Additional Details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <span className="text-gray-600">{vegetable.location}</span>
                </div>

                {vegetable.organic && (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-green-600 font-medium">منتج عضوي</span>
                  </div>
                )}

                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-600">{vegetable.contact_phone}</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="space-y-3">
                <a
                  href={`tel:${vegetable.contact_phone}`}
                  className="block w-full text-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                >
                  تواصل مع البائع
                </a>
                <Link
                  href="/VAR/marketplace"
                  className="block w-full text-center px-6 py-3 border border-green-600 text-green-600 hover:bg-green-50 rounded-lg font-semibold transition-colors"
                >
                  العودة إلى السوق
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VegetableDetailPage;
