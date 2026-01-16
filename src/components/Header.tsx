'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Leaf,
  Menu,
  X,
  User,
  LayoutDashboard
} from 'lucide-react';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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

  const navigationItems = [
    { href: "/", label: "الرئيسية", icon: LayoutDashboard },
    { href: "/VAR", label: "البيانات الفضائية", icon: Leaf },
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

          {/* Desktop Actions - Coming Soon Buttons */}
          <div className="hidden md:flex items-center space-x-3 space-x-reverse">
            <Link
              href="/auth/login"
              className={`px-4 py-2 font-medium transition-colors duration-300 hover:scale-105 ${
                isScrolled
                  ? 'text-green-700 hover:text-green-800'
                  : 'text-white/90 hover:text-white drop-shadow-md'
              }`}
            >
              دخول
            </Link>
            <Link
              href="/auth/signup"
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 ${
                isScrolled
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30'
              }`}
            >
              تسجيل
            </Link>
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

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden pb-6">
            <div className="bg-white border border-green-200 rounded-lg p-4 mt-4">
              <nav className="space-y-3">
                {navigationItems.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    className="flex items-center space-x-3 space-x-reverse px-4 py-3 text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}

                <div className="border-t border-green-200 pt-3 space-y-3">
                  <Link
                    href="/auth/login"
                    className="block w-full text-center px-4 py-3 text-green-700 hover:bg-green-50 rounded-lg transition-colors font-medium"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    دخول
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block w-full text-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    تسجيل
                  </Link>
                </div>
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
