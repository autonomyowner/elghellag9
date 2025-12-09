
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
          <div className="md:hidden flex items-center space-x-3 space-x-reverse">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className={`p-2 transition-colors duration-300 ${
                isScrolled 
                  ? 'text-green-700 hover:text-green-800' 
                  : 'text-white/90 hover:text-white drop-shadow-md'
              }`}
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <UnifiedSearch variant="header" />
        </div>

        {/* Mobile Menu - Full Screen Drawer */}
        <div
          className={`md:hidden fixed inset-0 z-50 transition-all duration-500 ${
            showMobileMenu ? 'visible' : 'invisible pointer-events-none'
          }`}
        >
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-gradient-to-l from-black/60 via-black/40 to-transparent backdrop-blur-sm transition-opacity duration-500 ${
              showMobileMenu ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={() => setShowMobileMenu(false)}
          />

          {/* Drawer Panel */}
          <div
            className={`absolute top-0 right-0 h-full w-[85%] max-w-[320px] bg-gradient-to-b from-[#f5f3f0] via-white to-[#f5f3f0] shadow-2xl transition-transform duration-500 ease-out ${
              showMobileMenu ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            {/* Golden Accent Line */}
            <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-[#d4af37] via-[#ffd700] to-[#d4af37]" />

            {/* Header */}
            <div className="relative px-6 pt-6 pb-4 bg-gradient-to-l from-[#2d5016] to-[#1a3d0f]">
              <button
                onClick={() => setShowMobileMenu(false)}
                className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm text-white/90 hover:bg-white/20 transition-all duration-300"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mt-2">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-[#d4af37]/50 shadow-lg">
                  <img src="/assets/logo o.jpg" alt="الغلة" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">الغلة</h2>
                  <p className="text-sm text-white/70">منصة المزارعين</p>
                </div>
              </div>
            </div>

            {/* Navigation Content */}
            <nav className="px-4 py-6 overflow-y-auto h-[calc(100%-180px)]">
              {/* Main Navigation */}
              <div className="space-y-1">
                {navigationItems.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    className={`flex items-center gap-4 px-4 py-4 rounded-xl text-[#2d5016] hover:bg-[#2d5016]/5 active:bg-[#2d5016]/10 transition-all duration-300 ${
                      showMobileMenu ? 'animate-[slideIn_0.4s_ease-out_forwards]' : ''
                    }`}
                    style={{
                      animationDelay: `${index * 0.08}s`,
                      opacity: showMobileMenu ? undefined : 0
                    }}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <span className="text-lg font-semibold">{item.label}</span>
                  </Link>
                ))}
              </div>

              {/* Divider */}
              <div className="my-5 h-px bg-gradient-to-l from-transparent via-[#d4af37]/30 to-transparent" />

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-3 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : user ? (
                <div className="space-y-1">
                  {/* User Info Card */}
                  <div
                    className={`px-4 py-4 mb-4 bg-gradient-to-l from-[#2d5016]/5 to-transparent rounded-xl border border-[#2d5016]/10 ${
                      showMobileMenu ? 'animate-[slideIn_0.4s_ease-out_forwards]' : ''
                    }`}
                    style={{ animationDelay: '0.32s', opacity: showMobileMenu ? undefined : 0 }}
                  >
                    <p className="text-base font-bold text-[#2d5016]">{user?.fullName || user?.firstName || 'المستخدم'}</p>
                    <p className="text-sm text-[#2d5016]/60 mt-0.5">{user?.primaryEmailAddress?.emailAddress}</p>
                  </div>

                  <Link
                    href="/dashboard"
                    className={`flex items-center gap-4 px-4 py-4 rounded-xl text-[#2d5016] hover:bg-[#2d5016]/5 active:bg-[#2d5016]/10 transition-all duration-300 ${
                      showMobileMenu ? 'animate-[slideIn_0.4s_ease-out_forwards]' : ''
                    }`}
                    style={{ animationDelay: '0.40s', opacity: showMobileMenu ? undefined : 0 }}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <span className="text-lg font-semibold">لوحة التحكم</span>
                  </Link>

                  <Link
                    href="/profile"
                    className={`flex items-center gap-4 px-4 py-4 rounded-xl text-[#2d5016] hover:bg-[#2d5016]/5 active:bg-[#2d5016]/10 transition-all duration-300 ${
                      showMobileMenu ? 'animate-[slideIn_0.4s_ease-out_forwards]' : ''
                    }`}
                    style={{ animationDelay: '0.48s', opacity: showMobileMenu ? undefined : 0 }}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <span className="text-lg font-semibold">الملف الشخصي</span>
                  </Link>

                  {/* Marketplace CTA */}
                  <Link
                    href="/marketplace"
                    className={`flex items-center justify-center gap-3 px-4 py-4 mt-4 bg-gradient-to-l from-[#2d5016] to-[#1a3d0f] text-white rounded-xl shadow-lg shadow-[#2d5016]/20 hover:shadow-xl hover:shadow-[#2d5016]/30 active:scale-[0.98] transition-all duration-300 ${
                      showMobileMenu ? 'animate-[slideIn_0.4s_ease-out_forwards]' : ''
                    }`}
                    style={{ animationDelay: '0.56s', opacity: showMobileMenu ? undefined : 0 }}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <span className="text-lg font-bold">السوق</span>
                  </Link>

                  {/* Logout */}
                  <button
                    onClick={openLogoutConfirmation}
                    className={`w-full flex items-center gap-4 px-4 py-4 mt-4 rounded-xl text-red-600 hover:bg-red-50 active:bg-red-100 transition-all duration-300 ${
                      showMobileMenu ? 'animate-[slideIn_0.4s_ease-out_forwards]' : ''
                    }`}
                    style={{ animationDelay: '0.64s', opacity: showMobileMenu ? undefined : 0 }}
                  >
                    <span className="text-lg font-semibold">تسجيل الخروج</span>
                  </button>
                </div>
              ) : (
                <div
                  className={`space-y-3 ${showMobileMenu ? 'animate-[slideIn_0.4s_ease-out_forwards]' : ''}`}
                  style={{ animationDelay: '0.32s', opacity: showMobileMenu ? undefined : 0 }}
                >
                  <Link
                    href="/sign-in"
                    className="block w-full text-center px-4 py-4 text-[#2d5016] font-bold text-lg border-2 border-[#2d5016]/20 rounded-xl hover:border-[#2d5016]/40 hover:bg-[#2d5016]/5 active:bg-[#2d5016]/10 transition-all duration-300"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    دخول
                  </Link>
                  <Link
                    href="/sign-up"
                    className="block w-full text-center px-4 py-4 bg-gradient-to-l from-[#2d5016] to-[#1a3d0f] text-white font-bold text-lg rounded-xl shadow-lg shadow-[#2d5016]/20 hover:shadow-xl hover:shadow-[#2d5016]/30 active:scale-[0.98] transition-all duration-300"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    تسجيل
                  </Link>
                </div>
              )}
            </nav>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 px-6 py-4 bg-gradient-to-t from-[#f5f3f0] to-transparent">
              <div className="h-px bg-gradient-to-l from-transparent via-[#d4af37]/20 to-transparent mb-4" />
              <p className="text-center text-sm text-[#2d5016]/40 font-medium">
                © {new Date().getFullYear()} الغلة
              </p>
            </div>
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
    </header>
  );
};

export default Header;
