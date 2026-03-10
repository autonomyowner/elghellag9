'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import {
  MapPin,
  X,
  ChevronLeft,
  Tag,
} from 'lucide-react';
import { formatPrice } from '@/lib/formatters';
import { CATEGORIES } from '@/lib/constants';

export default function HomePage() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const recentListings = useQuery(api.listings.getRecent, { limit: 6 });

  const getCategoryEmoji = (category: string) =>
    CATEGORIES.find((c) => c.value === category)?.emoji ?? '📦';

  const getCategoryLabel = (category: string) =>
    CATEGORIES.find((c) => c.value === category)?.label ?? category;

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Show welcome modal after page fully loads
  useEffect(() => {
    if (isHydrated) {
      const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');
      if (!hasSeenWelcome) {
        const timer = setTimeout(() => {
          setShowWelcomeModal(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [isHydrated]);

  const closeWelcomeModal = () => {
    setShowWelcomeModal(false);
    sessionStorage.setItem('hasSeenWelcome', 'true');
  };

  // Optimized loading state
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 to-gray-900">
        <div className="pt-20 pb-16">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <div className="text-8xl mb-8">🚜</div>
              <div className="text-5xl lg:text-7xl font-black mb-8 bg-gradient-to-r from-green-300 via-teal-300 to-green-400 bg-clip-text text-transparent">
                الغلة
              </div>
              <div className="text-xl lg:text-2xl mb-12 opacity-90 max-w-4xl mx-auto leading-relaxed text-white">
                منتجات طبيعية خدمات زراعية و استشارية
              </div>
              <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-green-300 font-semibold">جاري التحميل...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-w-[320px] mx-auto bg-gradient-to-br from-green-900 to-gray-900 text-white">
      {/* Welcome Modal - Fixed Center */}
      {showWelcomeModal && (
        <div
          className="fixed top-0 left-0 right-0 bottom-0 w-screen h-screen z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          style={{ position: 'fixed', margin: 0, padding: 0 }}
        >
          <div className="relative bg-gradient-to-br from-green-900 via-emerald-900 to-green-800 rounded-2xl p-6 md:p-10 mx-4 max-w-md w-full border border-green-500/30 shadow-2xl animate-fadeIn">
            {/* Close Button */}
            <button
              onClick={closeWelcomeModal}
              className="absolute top-3 left-3 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 group"
            >
              <X className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
            </button>

            {/* Logo */}
            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden border-4 border-green-400/50 shadow-lg">
                <img src="/assets/logo o.jpg" alt="الغلة" className="w-full h-full object-cover" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-green-300">الغلة</h2>
            </div>

            {/* Welcome Message */}
            <div className="text-center mb-6" dir="rtl">
              <p className="text-xl md:text-2xl text-white leading-relaxed font-medium">
                مرحبا بكم
              </p>
              <p className="text-base md:text-lg text-green-200 leading-relaxed mt-3">
                ان شاء الله منصة الغلة ستكون جاهزة قريبا
              </p>
            </div>

            {/* Decorative Elements */}
            <div className="flex justify-center gap-2 mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
            </div>

            {/* Skip Button */}
            <div className="text-center">
              <button
                onClick={closeWelcomeModal}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
              >
                متابعة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section with Optimized Video Background */}
      <div id="hero" className="relative h-screen w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden max-w-none">
        <video
          autoPlay
          loop
          playsInline
          muted
          preload="metadata"
          className="object-cover w-screen h-full absolute top-0 left-0 z-0 min-w-full min-h-full"
        >
          <source src="/assets/Videoplayback1.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Dark overlay for better text readability */}
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center z-10 bg-black/40">
          <div className="text-center">
            {/* 3D Logo */}
            <div className="mx-auto mb-6 flex items-center justify-center">
              <div className="relative group">
                {/* 3D Text Effect */}
                <div className="relative transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-2">
                  {/* Shadow layers for 3D effect */}
                  <div className="absolute inset-0 transform translate-x-1 translate-y-1 text-3xl md:text-4xl font-black text-black/30 blur-sm">
                    الغلة
                  </div>
                  <div className="absolute inset-0 transform translate-x-0.5 translate-y-0.5 text-3xl md:text-4xl font-black text-black/50">
                    الغلة
                  </div>
                  <div className="absolute inset-0 transform translate-x-0.25 translate-y-0.25 text-3xl md:text-4xl font-black text-black/70">
                    الغلة
                  </div>

                  {/* Main text with gradient */}
                  <div className="relative text-3xl md:text-4xl font-black bg-gradient-to-br from-green-300 via-emerald-300 to-green-400 bg-clip-text text-transparent drop-shadow-lg">
                    الغلة
                  </div>

                  {/* Glow effect */}
                  <div className="absolute inset-0 text-3xl md:text-4xl font-black bg-gradient-to-br from-green-400 via-emerald-400 to-green-500 bg-clip-text text-transparent blur-sm opacity-50">
                    الغلة
                  </div>
                </div>

                {/* Floating particles effect */}
                <div className="absolute -top-2 -right-2 w-2 h-2 bg-green-400 rounded-full animate-pulse opacity-70"></div>
                <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse opacity-60" style={{animationDelay: '0.5s'}}></div>
                <div className="absolute top-1/2 -right-3 w-1 h-1 bg-green-300 rounded-full animate-pulse opacity-50" style={{animationDelay: '1s'}}></div>
              </div>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl font-bold mb-4 text-white font-NeoSansArabicBlack">
              منتجات طبيعية خدمات زراعية و استشارية
            </h1>

            {/* Subtitle */}
            <p className="text-2xl text-white font-NeoSansArabicMedium">
              أستكشف موقعنا الغلة
            </p>
          </div>
        </div>

        {/* Social Media Bubbles - Right Side */}
        <div className="absolute top-1/2 right-8 transform -translate-y-1/2 z-20 flex flex-col gap-4">
          {/* Facebook */}
          <a
            href="https://www.facebook.com/profile.php?id=61578467404013"
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 bg-blue-600/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-blue-500 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
          >
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </a>

          {/* Instagram */}
          <a
            href="https://www.instagram.com/el_ghella_/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:from-purple-500 hover:to-pink-500 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
          >
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>

          {/* TikTok */}
          <a
            href="https://www.tiktok.com/@elghella10"
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-gray-800 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
          >
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
            </svg>
          </a>
        </div>
      </div>

      {/* Service Bubbles Section */}
      <div className="py-16 px-4">
        <div className="w-full max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-['NeoSansArabicBold']">
              خدماتنا المتكاملة
            </h2>
            <p className="text-lg text-gray-300 font-['NeoSansArabicLight']">
              اكتشف جميع خدماتنا الزراعية في مكان واحد
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 gap-6 md:gap-8">
            {/* Bubble 1 - شراء وبيع المنتجات الطازجة */}
            <Link href="/VAR/marketplace?category=vegetables" className="group">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-green-500/30 to-green-600/30 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-110 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/25 border border-green-500/40 mx-auto mb-3">
                  <span className="text-4xl">🥦</span>
                </div>
                <h3 className="text-sm font-bold text-green-200 group-hover:text-green-100 transition-colors">
                  شراء وبيع المنتجات الطازجة
                </h3>
              </div>
            </Link>

            {/* Bubble 2 - كراء المعدات الفلاحية */}
            <Link href="/VAR/marketplace?category=equipment" className="group">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500/30 to-blue-600/30 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-110 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/25 border border-blue-500/40 mx-auto mb-3">
                  <span className="text-4xl">🚜</span>
                </div>
                <h3 className="text-sm font-bold text-blue-200 group-hover:text-blue-100 transition-colors">
                  بيع و كراء المعدات
                </h3>
              </div>
            </Link>

            {/* Bubble 3 - كراء الأراضي الفلاحية */}
            <Link href="/VAR/marketplace?category=land" className="group">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-500/30 to-yellow-600/30 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-110 transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-500/25 border border-yellow-500/40 mx-auto mb-3">
                  <span className="text-4xl">🌾</span>
                </div>
                <h3 className="text-sm font-bold text-yellow-200 group-hover:text-yellow-100 transition-colors">
                  بيع و كراء الاراضي
                </h3>
              </div>
            </Link>

            {/* Bubble 4 - اليد العاملة */}
            <Link href="/labor" className="group">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500/30 to-purple-600/30 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-110 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/25 border border-purple-500/40 mx-auto mb-3">
                  <span className="text-4xl">🧑‍🌾</span>
                </div>
                <h3 className="text-sm font-bold text-purple-200 group-hover:text-purple-100 transition-colors">
                  اليد العاملة
                </h3>
              </div>
            </Link>

            {/* Bubble 5 - المشاتل */}
            <Link href="/nurseries" className="group">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-500/30 to-emerald-600/30 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-110 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/25 border border-emerald-500/40 mx-auto mb-3">
                  <span className="text-4xl">🌱</span>
                </div>
                <h3 className="text-sm font-bold text-emerald-200 group-hover:text-emerald-100 transition-colors">
                  المشاتل
                </h3>
              </div>
            </Link>

            {/* Bubble 6 - خدمات التحليل والدراسات */}
            <Link href="/analysis" className="group">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500/30 to-indigo-600/30 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-110 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/25 border border-indigo-500/40 mx-auto mb-3">
                  <span className="text-4xl">🛰️</span>
                </div>
                <h3 className="text-sm font-bold text-indigo-200 group-hover:text-indigo-100 transition-colors">
                  خدمات التحليل والدراسات
                </h3>
              </div>
            </Link>

            {/* Bubble 7 - خدمات التصدير */}
            <Link href="/exports" className="group">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-teal-500/30 to-teal-600/30 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-110 transition-all duration-300 hover:shadow-2xl hover:shadow-teal-500/25 border border-teal-500/40 mx-auto mb-3">
                  <span className="text-4xl">🌍</span>
                </div>
                <h3 className="text-sm font-bold text-teal-200 group-hover:text-teal-100 transition-colors">
                  خدمات التصدير
                </h3>
              </div>
            </Link>

            {/* Bubble 8 - التوصيل */}
            <Link href="/delivery" className="group">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-500/30 to-orange-600/30 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-110 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/25 border border-orange-500/40 mx-auto mb-3">
                  <span className="text-4xl">🚚</span>
                </div>
                <h3 className="text-sm font-bold text-orange-200 group-hover:text-orange-100 transition-colors">
                  التوصيل
                </h3>
              </div>
            </Link>

            {/* Bubble 9 - عروض خاصة */}
            <Link href="/services" className="group">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-pink-500/30 to-pink-600/30 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-110 transition-all duration-300 hover:shadow-2xl hover:shadow-pink-500/25 border border-pink-500/40 mx-auto mb-3">
                  <span className="text-4xl">🎁</span>
                </div>
                <h3 className="text-sm font-bold text-pink-200 group-hover:text-pink-100 transition-colors">
                  عروض خاصة
                </h3>
              </div>
            </Link>

            {/* Bubble 10 - سوق المواشي */}
            <Link href="/VAR/marketplace?category=livestock" className="group">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-red-500/30 to-red-600/30 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-110 transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/25 border border-red-500/40 mx-auto mb-3">
                  <span className="text-4xl">🐄</span>
                </div>
                <h3 className="text-sm font-bold text-red-200 group-hover:text-red-100 transition-colors">
                  سوق المواشي
                </h3>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div id="our-story" className="py-16 md:py-20 font-NeoSansArabicLight">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center space-y-8 lg:space-y-0 lg:space-x-12">
            <div className="lg:w-1/2 flex justify-center space-x-4 md:space-x-8">
              <div className="w-1/2 transform transition-all duration-300 hover:-translate-y-2 hover:scale-105 shadow-lg hover:shadow-xl rounded-xl overflow-hidden">
                <img
                  src="/assets/land002.jpg"
                  alt="Story Image 2"
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="w-1/2 transform transition-all duration-300 hover:-translate-y-2 hover:scale-105 shadow-lg hover:shadow-xl rounded-xl overflow-hidden">
                <img
                  src="/assets/land01.jpg"
                  alt="Story Image 1"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
            <div className="lg:w-1/2 text-center lg:text-right space-y-6">
              <h2 className="text-4xl md:text-5xl font-extrabold text-green-200 mb-4 leading-tight font-NeoSansArabicBlack">
                قصتنا
              </h2>
              <div className="space-y-4">
                <p className="text-base md:text-lg text-gray-300 rtl leading-relaxed font-NeoSansArabicRegular">
                  وُلدت فكرتنا من شغفنا العميق بالزراعة والإيمان بأهميتها في بناء مستقبل مستدام. لاحظنا الحاجة إلى حلول مبتكرة ومتكاملة تخدم المزارعين وتدعم محبي الزراعة لتحقيق أفضل النتائج.
                </p>
                <p className="text-base md:text-lg text-gray-300 rtl leading-relaxed font-NeoSansArabicRegular">
                  بدأنا كشركة ناشئة، الأولى من نوعها، لتقديم خدمات زراعية واستشارات متخصصة تجمع بين الخبرة التقنية والابتكار. نحن هنا لنكون شريكك الموثوق، نقدم الدعم اللازم لتحويل رؤيتك الزراعية إلى واقع، سواء كنت مزارعًا خبيرًا أو مبتدئًا في هذا المجال. في رحلتنا، نطمح لبناء مجتمع زراعي مستدام ومتقدم، ونؤمن بأن المستقبل الأفضل يبدأ بزراعة أفضل.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About Company Section */}
      <div className="py-16 md:py-20 font-['NeoSansArabicRegular']">
        <div className="container mx-auto px-4 max-w-6xl" dir="rtl">
          <div className="flex flex-col-reverse sm:flex-row items-center justify-between space-y-8 sm:space-y-0 sm:space-x-12">
            <div className="sm:w-1/2 text-right space-y-6">
              <h2 className="text-4xl md:text-5xl font-extrabold font-['NeoSansArabicBold'] text-green-200 mb-6 leading-tight">
                عن شركتنا
              </h2>
              <div className="space-y-4">
                <p className="text-base md:text-lg text-gray-300 leading-relaxed font-['NeoSansArabicLight']">
                  نحن شركة ناشئة متخصصة في الزراعة والخدمات الزراعية والاستشارات، نسعى لتمكين المزارعين والأفراد المهتمين بالزراعة من تحقيق إنتاجية أعلى ونتائج مستدامة.
                </p>
                <p className="text-base md:text-lg text-gray-300 leading-relaxed font-['NeoSansArabicLight']">
                  تأسست شركتنا على أساس رؤية واضحة: تقديم حلول مبتكرة وشاملة تعزز من جودة الإنتاج الزراعي وتدعم مجتمع المزارعين. نحن نؤمن بأن الزراعة ليست مجرد مهنة، بل هي رسالة لبناء مستقبل أكثر خضرة واستدامة.
                </p>
                <p className="text-base md:text-lg text-gray-300 leading-relaxed font-['NeoSansArabicLight']">
                  فريقنا يضم مجموعة من الخبراء في المجال الزراعي، الذين يجمعون بين المعرفة العملية والرؤية المستقبلية لتقديم خدمات واستشارات مصممة خصيصًا لتلبية احتياجاتك.
                </p>
                <p className="text-base md:text-lg text-gray-300 leading-relaxed font-['NeoSansArabicLight']">
                  معنا، الزراعة ليست فقط عملًا، بل أسلوب حياة نطمح إلى تحسينه باستمرار.
                </p>
              </div>
            </div>
            <div className="sm:w-1/2 flex justify-center mb-8 sm:mb-0">
              <div className="w-full max-w-md transform transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-xl overflow-hidden">
                <img
                  src="/assets/pexels-tomfisk-1595104.jpg"
                  alt="About Us"
                  className="w-full h-auto object-contain"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Products Section */}
      <div className="py-16 px-4" dir="rtl">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                المنتجات الحديثة
              </h2>
              <p className="text-gray-300 text-sm">
                أحدث ما أضافه المزارعون في السوق
              </p>
            </div>
            <Link
              href="/VAR/marketplace"
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-2xl text-white text-sm font-medium transition-all duration-200 flex-shrink-0"
            >
              عرض الكل
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>

          {/* Cards */}
          {!recentListings ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white/8 backdrop-blur-xl border border-white/12 rounded-3xl h-52 animate-pulse"
                />
              ))}
            </div>
          ) : recentListings.length === 0 ? (
            <div className="bg-white/8 backdrop-blur-xl border border-white/12 rounded-3xl p-12 text-center">
              <span className="text-5xl mb-4 block">🌱</span>
              <p className="text-white/50">لا توجد منتجات بعد. كن أول من يضيف!</p>
              <Link
                href="/VAR/marketplace/new"
                className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-white text-sm font-medium transition-all duration-200"
              >
                أضف منتجك
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {recentListings.map((listing) => (
                <Link key={listing._id} href={`/VAR/marketplace/${listing._id}`}>
                  <div className="group bg-white/8 backdrop-blur-xl border border-white/12 hover:border-white/25 rounded-3xl overflow-hidden transition-all duration-300 hover:bg-white/12 hover:shadow-xl hover:shadow-black/20 cursor-pointer h-full">
                    {/* Image / Emoji */}
                    <div className="h-28 bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center overflow-hidden relative">
                      {listing.images && listing.images.length > 0 ? (
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <span className="text-4xl opacity-70 group-hover:scale-110 transition-transform duration-300">
                          {getCategoryEmoji(listing.category)}
                        </span>
                      )}
                      {listing.isOrganic && (
                        <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full text-white text-xs">
                          عضوي
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-3 space-y-1.5">
                      <p className="text-white font-medium text-xs leading-snug line-clamp-2">
                        {listing.title}
                      </p>
                      <p className="text-white font-bold text-sm">
                        {formatPrice(listing.price)}
                      </p>
                      <div className="flex items-center gap-1 text-white/40 text-xs">
                        <Tag className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{getCategoryLabel(listing.category)}</span>
                      </div>
                      {listing.wilaya && (
                        <div className="flex items-center gap-1 text-white/35 text-xs">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{listing.wilaya}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-lg border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 space-x-reverse mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg overflow-hidden border-2 border-white/20">
                  <img src="/assets/logo o.jpg" alt="الغلة" className="w-full h-full object-cover" />
                </div>
                <h3 className="text-xl font-bold text-white">الغلة</h3>
              </div>
              <p className="text-white/70">منصة المزارعين الأولى في الجزائر</p>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-green-300">السوق</h4>
              <ul className="space-y-2 text-white/70">
                <li><Link href="/land" className="hover:text-green-300 transition-colors">الأراضي</Link></li>
                <li><Link href="/marketplace" className="hover:text-green-300 transition-colors">المنتجات</Link></li>
                <li><Link href="/equipment" className="hover:text-green-300 transition-colors">المعدات</Link></li>
                <li><Link href="/nurseries" className="hover:text-green-300 transition-colors">المشاتل</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-green-300">الخدمات</h4>
              <ul className="space-y-2 text-white/70">
                <li><Link href="/delivery" className="hover:text-green-300 transition-colors">التوصيل</Link></li>
                <li><Link href="/exports" className="hover:text-green-300 transition-colors">التصدير</Link></li>
                <li><Link href="/analysis" className="hover:text-green-300 transition-colors">التحليل</Link></li>
                <li><Link href="/experts" className="hover:text-green-300 transition-colors">الاستشارات</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-green-300">تواصل معنا</h4>
              <ul className="space-y-2 text-white/70 mb-4">
                <li><Link href="/about" className="hover:text-green-300 transition-colors">من نحن</Link></li>
                <li><Link href="/contact" className="hover:text-green-300 transition-colors">اتصل بنا</Link></li>
                <li><Link href="/help" className="hover:text-green-300 transition-colors">المساعدة</Link></li>
              </ul>

              {/* Social Media Text */}
              <div className="mb-3">
                <p className="text-orange-400 text-xs font-medium mb-1">الغلة علا صفحات السوشيال ميديا</p>
              </div>

              {/* Newsletter Subscription */}
              <div className="mb-4">
                <h5 className="font-semibold mb-2 text-green-200 text-sm">اشترك في القائمة البريدية</h5>
                <div className="flex">
                  <input
                    type="email"
                    placeholder="البريد الإلكتروني"
                    className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-r-lg text-white placeholder-white/50 text-sm focus:outline-none focus:border-green-400"
                  />
                  <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-l-lg text-sm transition-colors">
                    اشتراك
                  </button>
                </div>
              </div>

              {/* Social Media Boxes */}
              <div className="flex space-x-2 space-x-reverse">
                <a
                  href="https://www.facebook.com/profile.php?id=61578467404013"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/el_ghella_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a
                  href="https://www.tiktok.com/@elghella10"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-black hover:bg-gray-800 rounded-lg flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 mt-8 pt-8 text-center text-white/60">
            <p>&copy; 2024 منصة الغلة. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
