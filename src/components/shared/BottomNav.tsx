'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  ShoppingBag,
  Plus,
  MessageCircle,
  User,
} from 'lucide-react';
import { useUnreadCount } from '@/hooks/useUnreadCount';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  isAdd?: boolean;
}

const navItems: NavItem[] = [
  { href: '/', label: 'الرئيسية', icon: Home },
  { href: '/marketplace', label: 'السوق', icon: ShoppingBag },
  { href: '/marketplace/new', label: 'إضافة', icon: Plus, isAdd: true },
  { href: '/messages', label: 'رسائل', icon: MessageCircle },
  { href: '/profile', label: 'حسابي', icon: User },
];

const BottomNav: React.FC = () => {
  const pathname = usePathname();
  const unreadCount = useUnreadCount();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.2 }}
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
      dir="rtl"
    >
      {/* Gradient fade above nav */}
      <div className="h-6 bg-gradient-to-t from-green-950/60 to-transparent pointer-events-none" />

      <div className="bg-green-950/80 backdrop-blur-xl border-t border-white/10 shadow-2xl shadow-green-900/50">
        <div className="flex items-center justify-around px-2 pb-safe">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            const isMessages = item.href === '/messages';
            const badge = isMessages && unreadCount > 0 ? unreadCount : null;

            if (item.isAdd) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center justify-center py-2 -mt-5"
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.92 }}
                    className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shadow-lg shadow-green-600/40 border-2 border-green-400/30"
                  >
                    <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                  </motion.div>
                  <span className="text-[10px] text-white/40 mt-1 font-medium">{item.label}</span>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center py-3 px-3 min-w-[52px] relative"
              >
                <motion.div
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.9 }}
                  className="relative"
                >
                  {/* Active indicator glow */}
                  {active && (
                    <motion.div
                      layoutId="bottomNavGlow"
                      className="absolute inset-0 rounded-xl bg-green-500/20 blur-sm -z-10"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}

                  <div
                    className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${
                      active ? 'bg-green-500/20' : 'bg-transparent'
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 transition-all duration-300 ${
                        active ? 'text-white' : 'text-white/50'
                      }`}
                      strokeWidth={active ? 2.5 : 1.8}
                    />

                    {/* Unread badge */}
                    <AnimatePresence>
                      {badge !== null && (
                        <motion.div
                          key="badge"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                          className="absolute -top-1 -left-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none shadow-lg"
                        >
                          {badge > 99 ? '99+' : badge}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>

                <span
                  className={`text-[10px] mt-0.5 font-medium transition-all duration-300 ${
                    active ? 'text-white' : 'text-white/40'
                  }`}
                >
                  {item.label}
                </span>

                {/* Active dot */}
                {active && (
                  <motion.div
                    layoutId="bottomNavDot"
                    className="absolute bottom-1 w-1 h-1 rounded-full bg-green-400"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default BottomNav;
