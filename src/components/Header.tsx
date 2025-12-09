
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useUser, useClerk } from '@clerk/nextjs';
import LogoutConfirmation from './LogoutConfirmation';
import UnifiedSearch from './UnifiedSearch';
import {
  Leaf,
  Menu,
  X,
  User,
  LogOut,
  Plus,
  MapPin,
  Wrench,
  ShoppingCart,
  Settings,
  ChevronDown,
  LayoutDashboard,
  Store
} from 'lucide-react';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const loading = !isLoaded;
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Scroll handling
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 20;
      if (scrolled !== isScrolled) {
        setIsScrolled(scrolled);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScrolled]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (showMobileMenu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showMobileMenu]);

  const handleSignOut = async () => {
    setLogoutLoading(true);
    try {
      await signOut({ redirectUrl: '/' });
      setShowMobileMenu(false);
      setShowUserDropdown(false);
      setShowLogoutConfirmation(false);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLogoutLoading(false);
    }
  };

  const openLogoutConfirmation = () => {
    setShowLogoutConfirmation(true);
    setShowUserDropdown(false);
  };

  const navigationItems = [
    { href: "/", label: "الرئيسية", icon: LayoutDashboard },
    { href: "/services", label: "الخدمات", icon: Wrench },
    { href: "/VAR", label: "البيانات الفضائية", icon: User },
    { href: "/about", label: "من نحن", icon: Leaf }
  ];

  return (
    <>
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-white/20'
          : 'bg-transparent backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 space-x-reverse">
            <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg overflow-hidden border-2 border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-110">
              <img src="/assets/logo o.jpg" alt="الغلة" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold transition-colors duration-300 ${
                isScrolled ? 'text-green-800' : 'text-white drop-shadow-lg'
              }`}>الغلة</h1>
              <p className={`text-sm transition-colors duration-300 ${
                isScrolled ? 'text-green-600' : 'text-white/90 drop-shadow-md'
              }`}>منصة المزارعين</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-12 space-x-reverse">
            <Link href="/" className={`font-medium transition-colors duration-300 hover:scale-105 ${
              isScrolled ? 'text-green-700 hover:text-green-800' : 'text-white/90 hover:text-white drop-shadow-md'
            }`}>
              الرئيسية
            </Link>
            <Link href="/services" className={`font-medium transition-colors duration-300 hover:scale-105 ${
              isScrolled ? 'text-green-700 hover:text-green-800' : 'text-white/90 hover:text-white drop-shadow-md'
            }`}>
              الخدمات
            </Link>
            <Link href="/VAR" className={`font-medium transition-colors duration-300 hover:scale-105 ${
              isScrolled ? 'text-green-700 hover:text-green-800' : 'text-white/90 hover:text-white drop-shadow-md'
            }`}>
              البيانات الفضائية
            </Link>
            <Link href="/about" className={`font-medium transition-colors duration-300 hover:scale-105 mr-8 ${
              isScrolled ? 'text-green-700 hover:text-green-800' : 'text-white/90 hover:text-white drop-shadow-md'
            }`}>
              من نحن
            </Link>
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex">
            <UnifiedSearch variant="header" />
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4 space-x-reverse">
            {loading ? (
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className={`w-4 h-4 border-2 border-t-transparent rounded-full animate-spin transition-colors duration-300 ${
                  isScrolled ? 'border-green-500' : 'border-white'
                }`}></div>
                <span className={`text-xs ${isScrolled ? 'text-gray-600' : 'text-white/80'}`}>جاري التحميل...</span>
              </div>
            ) : user ? (
              <div className="flex items-center space-x-3 space-x-reverse">
                <Link 
                  href="/marketplace"
                  className={`p-3 rounded-lg font-medium flex items-center transition-all duration-300 hover:scale-105 ${
                    isScrolled 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30'
                  }`}
                >
                  <Store className="w-5 h-5" />
                </Link>
                
                {/* User Dropdown */}
                <div className="relative" ref={userDropdownRef}>
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className={`px-4 py-2 font-medium flex items-center transition-colors duration-300 hover:scale-105 ${
                      isScrolled 
                        ? 'text-green-700 hover:text-green-800' 
                        : 'text-white/90 hover:text-white drop-shadow-md'
                    }`}
                  >
                    <User className="w-4 h-4 mr-2" />
                    {user?.fullName || user?.firstName || 'حسابي'}
                    <ChevronDown className={`w-4 h-4 mr-2 transition-transform duration-200 ${showUserDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {showUserDropdown && (
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user?.fullName || user?.firstName || 'المستخدم'}</p>
                        <p className="text-xs text-gray-500">{user?.primaryEmailAddress?.emailAddress}</p>
                      </div>
                      
                      <Link
                        href="/dashboard"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <LayoutDashboard className="w-4 h-4 mr-3" />
                        لوحة التحكم
                      </Link>
                      
                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <User className="w-4 h-4 mr-3" />
                        الملف الشخصي
                      </Link>
                      
                      <Link
                        href="/marketplace"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <Store className="w-4 h-4 mr-3" />
                        السوق
                      </Link>
                      
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={openLogoutConfirmation}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          تسجيل الخروج
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3 space-x-reverse">
                <Link
                  href="/sign-in"
                  className={`px-4 py-2 font-medium transition-colors duration-300 hover:scale-105 ${
                    isScrolled
                      ? 'text-green-700 hover:text-green-800'
                      : 'text-white/90 hover:text-white drop-shadow-md'
                  }`}
                >
                  دخول
                </Link>
                <Link
                  href="/sign-up"
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 ${
                    isScrolled
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30'
                  }`}
                >
                  تسجيل
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className={`p-2 transition-colors duration-300 ${
                isScrolled
                  ? 'text-green-700 hover:text-green-800'
                  : 'text-white/90 hover:text-white drop-shadow-md'
              }`}
              aria-label="فتح القائمة"
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
    </header>

      {/* Mobile Menu - Full Screen Drawer */}
      <div
        className={`md:hidden fixed inset-0 z-[9999] ${
          showMobileMenu ? '' : 'pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ease-out ${
            showMobileMenu ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setShowMobileMenu(false)}
        />

        {/* Drawer Panel - slides in from right for RTL */}
        <div
          className={`absolute top-0 right-0 h-full w-[85vw] max-w-[320px] bg-white shadow-2xl flex flex-col transition-transform duration-200 ease-out ${
            showMobileMenu ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Golden Accent Line */}
          <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-[#d4af37] via-[#ffd700] to-[#d4af37]" />

          {/* Header */}
          <div className="flex-shrink-0 px-5 py-4 bg-gradient-to-l from-[#2d5016] to-[#1a3d0f]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-[#d4af37]/60 shadow-lg">
                  <img src="/assets/logo o.jpg" alt="الغلة" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">الغلة</h2>
                  <p className="text-xs text-white/80">منصة المزارعين</p>
                </div>
              </div>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="w-11 h-11 flex items-center justify-center rounded-full bg-white/15 text-white active:bg-white/25 transition-colors"
                aria-label="إغلاق القائمة"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Navigation Content - Scrollable */}
          <nav className="flex-1 overflow-y-auto px-4 py-5 overscroll-contain">
            {/* Main Navigation */}
            <div className="space-y-1.5">
              {navigationItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className="flex items-center px-4 py-4 rounded-xl text-[#2d5016] text-base font-semibold hover:bg-[#2d5016]/5 active:bg-[#2d5016]/10 transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Divider */}
            <div className="my-5 h-px bg-gradient-to-l from-[#d4af37]/40 to-transparent" />

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-7 h-7 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : user ? (
              <div className="space-y-1.5">
                {/* User Info */}
                <div className="px-4 py-4 mb-4 bg-gradient-to-l from-gray-50 to-white rounded-xl border border-gray-100">
                  <p className="text-sm font-bold text-[#2d5016] truncate">{user?.fullName || user?.firstName || 'المستخدم'}</p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{user?.primaryEmailAddress?.emailAddress}</p>
                </div>

                <Link
                  href="/dashboard"
                  className="flex items-center px-4 py-4 rounded-xl text-[#2d5016] text-base font-semibold hover:bg-[#2d5016]/5 active:bg-[#2d5016]/10 transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  لوحة التحكم
                </Link>

                <Link
                  href="/profile"
                  className="flex items-center px-4 py-4 rounded-xl text-[#2d5016] text-base font-semibold hover:bg-[#2d5016]/5 active:bg-[#2d5016]/10 transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  الملف الشخصي
                </Link>

                {/* Marketplace CTA */}
                <Link
                  href="/marketplace"
                  className="flex items-center justify-center px-4 py-4 mt-4 bg-gradient-to-l from-[#2d5016] to-[#1a3d0f] text-white text-base font-bold rounded-xl active:opacity-90 transition-all shadow-md"
                  onClick={() => setShowMobileMenu(false)}
                >
                  السوق
                </Link>

                {/* Logout */}
                <button
                  onClick={openLogoutConfirmation}
                  className="w-full flex items-center justify-center px-4 py-4 mt-2 rounded-xl text-red-600 text-base font-semibold border border-red-100 hover:bg-red-50 active:bg-red-100 transition-colors"
                >
                  تسجيل الخروج
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Link
                  href="/sign-in"
                  className="flex items-center justify-center w-full px-4 py-4 text-[#2d5016] font-bold text-base border-2 border-[#2d5016]/20 rounded-xl hover:border-[#2d5016]/40 active:bg-gray-50 transition-all"
                  onClick={() => setShowMobileMenu(false)}
                >
                  دخول
                </Link>
                <Link
                  href="/sign-up"
                  className="flex items-center justify-center w-full px-4 py-4 bg-gradient-to-l from-[#2d5016] to-[#1a3d0f] text-white font-bold text-base rounded-xl active:opacity-90 transition-all shadow-md"
                  onClick={() => setShowMobileMenu(false)}
                >
                  تسجيل
                </Link>
              </div>
            )}
          </nav>

          {/* Footer */}
          <div className="flex-shrink-0 px-5 py-4 border-t border-gray-100 bg-gray-50/80">
            <p className="text-center text-xs text-gray-400">
              © {new Date().getFullYear()} الغلة
            </p>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmation
        isOpen={showLogoutConfirmation}
        onClose={() => setShowLogoutConfirmation(false)}
        onConfirm={handleSignOut}
        loading={logoutLoading}
      />
    </>
  );
};

export default Header;
