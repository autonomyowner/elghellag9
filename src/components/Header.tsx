'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Leaf,
  Menu,
  X,
  LayoutDashboard,
  ShoppingBag,
  MessageCircle,
  Heart,
  User,
  LogOut,
  ChevronDown,
  LayoutGrid,
} from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useUnreadCount } from '@/hooks/useUnreadCount';
import { authClient } from '@/lib/auth-client';

// ─── Navigation items (always visible) ─────────────────────────────────────
const navigationItems = [
  { href: '/', label: 'الرئيسية', icon: LayoutDashboard },
  { href: '/marketplace', label: 'السوق', icon: ShoppingBag },
  { href: '/VAR', label: 'البيانات الفضائية', icon: Leaf },
];

// ─── Authenticated user dropdown items ──────────────────────────────────────
interface DropdownItem {
  href: string;
  label: string;
  icon: React.ElementType;
  sellerOnly?: boolean;
  badge?: number;
}

// ─── Avatar ─────────────────────────────────────────────────────────────────
const UserAvatar: React.FC<{ name?: string | null; size?: 'sm' | 'md' }> = ({
  name,
  size = 'md',
}) => {
  const initials = name
    ? name
        .trim()
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '؟';

  const sizeClass = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm';

  return (
    <div
      className={`${sizeClass} rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center font-bold text-white border-2 border-green-400/30 shadow-md shadow-green-900/30 flex-shrink-0`}
    >
      {initials}
    </div>
  );
};

// ─── User Dropdown ───────────────────────────────────────────────────────────
interface UserDropdownProps {
  user: { name?: string | null; role?: string } | null | undefined;
  unreadCount: number;
  onClose: () => void;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ user, unreadCount, onClose }) => {
  const isSeller = user?.role === 'seller' || user?.role === 'admin';

  const dropdownItems: DropdownItem[] = [
    { href: '/marketplace', label: 'السوق', icon: ShoppingBag },
    ...(isSeller ? [{ href: '/dashboard', label: 'لوحة التحكم', icon: LayoutGrid, sellerOnly: true }] : []),
    { href: '/messages', label: 'رسائلي', icon: MessageCircle, badge: unreadCount },
    { href: '/favorites', label: 'المفضلة', icon: Heart },
    { href: '/profile', label: 'الملف الشخصي', icon: User },
  ];

  const handleLogout = async () => {
    onClose();
    await authClient.signOut();
    window.location.href = '/';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="absolute top-full left-0 mt-2 w-56 z-50"
      dir="rtl"
    >
      <div className="bg-green-950/90 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl shadow-green-900/50 overflow-hidden">
        {/* User info header */}
        <div className="px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <UserAvatar name={user?.name} size="md" />
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">
                {user?.name ?? 'مستخدم'}
              </p>
              {isSeller && (
                <span className="text-[10px] text-green-400 font-medium">بائع موثوق</span>
              )}
            </div>
          </div>
        </div>

        {/* Menu items */}
        <div className="py-1.5">
          {dropdownItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-2.5 text-white/70 hover:text-white hover:bg-white/8 transition-all duration-200 group relative"
              >
                <Icon className="w-4 h-4 text-white/50 group-hover:text-white/80 flex-shrink-0 transition-colors" strokeWidth={1.8} />
                <span className="text-sm font-medium">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="mr-auto min-w-[20px] h-5 px-1.5 rounded-full bg-red-500/90 text-white text-[10px] font-bold flex items-center justify-center">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Logout */}
        <div className="py-1.5 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 group"
          >
            <LogOut className="w-4 h-4 flex-shrink-0 transition-colors" strokeWidth={1.8} />
            <span className="text-sm font-medium">تسجيل الخروج</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Main Header ─────────────────────────────────────────────────────────────
const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { user, isLoading, isAuthenticated } = useCurrentUser();
  const unreadCount = useUnreadCount();

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 20;
      if (scrolled !== isScrolled) setIsScrolled(scrolled);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScrolled]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    setShowMobileMenu(false);
    await authClient.signOut();
    window.location.href = '/';
  };

  const isSeller = (user as { role?: string } | null | undefined)?.role === 'seller' ||
                   (user as { role?: string } | null | undefined)?.role === 'admin';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-green-900/80 backdrop-blur-xl shadow-lg shadow-green-900/30 border-b border-green-500/20'
          : 'bg-transparent backdrop-blur-sm'
      }`}
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg overflow-hidden border-2 border-green-500/30 hover:border-green-400/60 transition-all duration-300 hover:scale-110 hover:shadow-green-500/20">
              <img src="/assets/logo o.jpg" alt="الغلة" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white drop-shadow-lg transition-colors duration-300">الغلة</h1>
              <p className="text-sm text-green-300/90 drop-shadow-md transition-colors duration-300">منصة المزارعين</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navigationItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="font-medium text-white/80 hover:text-green-300 transition-all duration-300 hover:scale-105 drop-shadow-md"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isLoading ? (
              /* Skeleton */
              <div className="w-24 h-9 rounded-xl bg-white/10 animate-pulse" />
            ) : isAuthenticated ? (
              /* Authenticated: avatar + dropdown */
              <div className="relative" ref={dropdownRef}>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowDropdown((v) => !v)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300"
                >
                  <UserAvatar name={(user as { name?: string | null } | null | undefined)?.name} size="sm" />
                  <span className="text-white text-sm font-medium max-w-[100px] truncate">
                    {(user as { name?: string | null } | null | undefined)?.name ?? 'مستخدم'}
                  </span>
                  {unreadCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                  )}
                  <motion.div
                    animate={{ rotate: showDropdown ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4 text-white/60" strokeWidth={2} />
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {showDropdown && (
                    <UserDropdown
                      user={user as { name?: string | null; role?: string } | null | undefined}
                      unreadCount={unreadCount}
                      onClose={() => setShowDropdown(false)}
                    />
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* Not authenticated */
              <>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 font-medium text-white/80 hover:text-green-300 transition-all duration-300 hover:scale-105 drop-shadow-md"
                >
                  دخول
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-5 py-2 rounded-2xl font-medium transition-all duration-300 hover:scale-105 bg-green-500/20 backdrop-blur-sm text-green-300 border border-green-500/30 hover:bg-green-500/30 hover:border-green-400/50 hover:shadow-lg hover:shadow-green-500/10"
                >
                  تسجيل
                </Link>
              </>
            )}
          </div>

          {/* Mobile: messages badge + menu button */}
          <div className="md:hidden flex items-center gap-2">
            {isAuthenticated && unreadCount > 0 && (
              <Link href="/messages" className="relative p-2">
                <MessageCircle className="w-5 h-5 text-white/70" strokeWidth={1.8} />
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              </Link>
            )}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 text-white/80 hover:text-green-300 transition-colors duration-300"
            >
              {showMobileMenu ? (
                <motion.div initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} transition={{ duration: 0.15 }}>
                  <X className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} transition={{ duration: 0.15 }}>
                  <Menu className="w-6 h-6" />
                </motion.div>
              )}
            </button>
          </div>

        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 35 }}
              className="md:hidden overflow-hidden pb-6"
            >
              <div className="bg-green-900/80 backdrop-blur-xl border border-green-500/20 rounded-2xl p-4 mt-4 shadow-xl shadow-green-900/30">
                <nav className="space-y-1">
                  {/* Nav links */}
                  {navigationItems.map((item, index) => (
                    <Link
                      key={index}
                      href={item.href}
                      className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-green-300 hover:bg-white/5 rounded-xl transition-all duration-200"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <item.icon className="w-5 h-5 text-white/50" strokeWidth={1.8} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  ))}

                  <div className="border-t border-green-500/20 pt-3 mt-2 space-y-1">
                    {isAuthenticated ? (
                      <>
                        {/* User info row */}
                        <div className="flex items-center gap-3 px-4 py-3">
                          <UserAvatar name={(user as { name?: string | null } | null | undefined)?.name} size="md" />
                          <div>
                            <p className="text-white font-semibold text-sm">
                              {(user as { name?: string | null } | null | undefined)?.name ?? 'مستخدم'}
                            </p>
                            {isSeller && <span className="text-[10px] text-green-400">بائع موثوق</span>}
                          </div>
                        </div>

                        {/* Dashboard - sellers only */}
                        {isSeller && (
                          <Link
                            href="/dashboard"
                            className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-green-300 hover:bg-white/5 rounded-xl transition-all duration-200"
                            onClick={() => setShowMobileMenu(false)}
                          >
                            <LayoutGrid className="w-5 h-5 text-white/50" strokeWidth={1.8} />
                            <span className="font-medium">لوحة التحكم</span>
                          </Link>
                        )}

                        {/* Messages */}
                        <Link
                          href="/messages"
                          className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-green-300 hover:bg-white/5 rounded-xl transition-all duration-200"
                          onClick={() => setShowMobileMenu(false)}
                        >
                          <MessageCircle className="w-5 h-5 text-white/50" strokeWidth={1.8} />
                          <span className="font-medium">رسائلي</span>
                          {unreadCount > 0 && (
                            <span className="mr-auto min-w-[22px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                          )}
                        </Link>

                        {/* Favorites */}
                        <Link
                          href="/favorites"
                          className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-green-300 hover:bg-white/5 rounded-xl transition-all duration-200"
                          onClick={() => setShowMobileMenu(false)}
                        >
                          <Heart className="w-5 h-5 text-white/50" strokeWidth={1.8} />
                          <span className="font-medium">المفضلة</span>
                        </Link>

                        {/* Profile */}
                        <Link
                          href="/profile"
                          className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-green-300 hover:bg-white/5 rounded-xl transition-all duration-200"
                          onClick={() => setShowMobileMenu(false)}
                        >
                          <User className="w-5 h-5 text-white/50" strokeWidth={1.8} />
                          <span className="font-medium">الملف الشخصي</span>
                        </Link>

                        {/* Logout */}
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-3 text-red-400/80 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200"
                        >
                          <LogOut className="w-5 h-5 flex-shrink-0" strokeWidth={1.8} />
                          <span className="font-medium">تسجيل الخروج</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/auth/login"
                          className="block w-full text-center px-4 py-3 text-white/80 hover:text-green-300 hover:bg-white/5 rounded-xl transition-all duration-200 font-medium"
                          onClick={() => setShowMobileMenu(false)}
                        >
                          دخول
                        </Link>
                        <Link
                          href="/auth/signup"
                          className="block w-full text-center px-4 py-3 bg-green-500/20 text-green-300 border border-green-500/30 rounded-2xl hover:bg-green-500/30 transition-all duration-200 font-medium"
                          onClick={() => setShowMobileMenu(false)}
                        >
                          تسجيل
                        </Link>
                      </>
                    )}
                  </div>
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;
