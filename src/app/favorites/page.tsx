'use client';

import { useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Heart, ShoppingBag, Trash2, MapPin, Tag } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { formatPrice } from '@/lib/formatters';
import { CATEGORIES } from '@/lib/constants';

export default function FavoritesPage() {
  const { isAuthenticated, isLoading: authLoading } = useCurrentUser();
  const favorites = useQuery(api.favorites.listForUser);
  const toggleFavorite = useMutation(api.favorites.toggle);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = '/auth/sign-in';
    }
  }, [authLoading, isAuthenticated]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2d5016] via-[#1a3a0a] to-[#0d1f05] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const getCategoryEmoji = (category: string) => {
    return CATEGORIES.find((c) => c.value === category)?.emoji ?? '📦';
  };

  const handleRemove = async (e: React.MouseEvent, listingId: Id<'listings'>) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleFavorite({ listingId });
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#2d5016] via-[#1a3a0a] to-[#0d1f05] pt-20 pb-16 px-4"
      dir="rtl"
    >
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-green-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-80 h-80 bg-emerald-400/6 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-white fill-white" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-bold text-white">المفضلة</h1>
          </div>
          {favorites && (
            <p className="text-white/50 text-sm pr-13">
              {favorites.length} {favorites.length === 1 ? 'منتج محفوظ' : 'منتجات محفوظة'}
            </p>
          )}
        </motion.div>

        {/* Content */}
        {!favorites ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white/8 backdrop-blur-xl border border-white/12 rounded-3xl h-56 animate-pulse"
              />
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-20 h-20 bg-white/8 backdrop-blur-sm border border-white/15 rounded-full flex items-center justify-center mb-5">
              <Heart className="w-9 h-9 text-white/30" strokeWidth={1.5} />
            </div>
            <h2 className="text-white font-bold text-xl mb-2">لا توجد منتجات مفضلة</h2>
            <p className="text-white/50 text-sm mb-6 max-w-xs leading-relaxed">
              لم تقم بحفظ أي منتجات بعد. تصفح السوق وأضف المنتجات التي تعجبك!
            </p>
            <Link
              href="/marketplace"
              className="flex items-center gap-2 px-6 py-3 bg-white/12 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-2xl text-white font-semibold text-sm transition-all duration-200"
            >
              <ShoppingBag className="w-4 h-4" />
              تصفح السوق
            </Link>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <AnimatePresence>
              {favorites.map((listing, index) => {
                if (!listing) return null;
                const typedListing = listing as {
                  _id: Id<'listings'>;
                  favoriteId: string;
                  title: string;
                  price: number;
                  category: string;
                  wilaya?: string;
                  location?: string;
                  images: string[];
                  isOrganic?: boolean;
                };
                return (
                  <motion.div
                    key={typedListing._id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Link href={`/marketplace/${typedListing._id}`}>
                      <div className="group relative bg-white/8 backdrop-blur-xl border border-white/12 hover:border-white/25 rounded-3xl overflow-hidden transition-all duration-300 hover:bg-white/12 hover:shadow-xl hover:shadow-black/20 cursor-pointer">
                        {/* Image Area */}
                        <div className="relative h-40 bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center overflow-hidden">
                          {typedListing.images && typedListing.images.length > 0 ? (
                            <img
                              src={typedListing.images[0]}
                              alt={typedListing.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <span className="text-5xl opacity-60">
                              {getCategoryEmoji(typedListing.category)}
                            </span>
                          )}

                          {/* Remove Button */}
                          <motion.button
                            onClick={(e) => handleRemove(e, typedListing._id)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.85 }}
                            className="absolute top-2 left-2 w-8 h-8 bg-black/40 hover:bg-red-500/60 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center transition-all duration-200"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-white" strokeWidth={1.5} />
                          </motion.button>

                          {/* Organic badge */}
                          {typedListing.isOrganic && (
                            <div className="absolute top-2 right-2 px-2 py-0.5 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full text-xs text-white font-medium">
                              عضوي
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-2">
                          <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2">
                            {typedListing.title}
                          </h3>

                          <div className="flex items-center justify-between">
                            <span className="text-white font-bold text-base">
                              {formatPrice(typedListing.price)}
                            </span>
                            <div className="flex items-center gap-1 text-white/40 text-xs">
                              <Tag className="w-3 h-3" />
                              <span>
                                {CATEGORIES.find((c) => c.value === typedListing.category)?.label ?? typedListing.category}
                              </span>
                            </div>
                          </div>

                          {(typedListing.wilaya || typedListing.location) && (
                            <div className="flex items-center gap-1 text-white/40 text-xs">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">
                                {typedListing.wilaya ?? typedListing.location}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
