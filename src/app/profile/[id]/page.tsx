'use client';

import { use, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  MapPin,
  MessageCircle,
  ShieldCheck,
  Package,
  User,
  Phone,
  Star,
} from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { SellerRating } from '@/components/profile/SellerRating';
import { ReviewCard } from '@/components/profile/ReviewCard';
import { ReviewForm } from '@/components/profile/ReviewForm';
import { formatPrice, formatRelativeTime } from '@/lib/formatters';
import { CATEGORIES } from '@/lib/constants';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PublicProfilePage({ params }: PageProps) {
  const { id } = use(params);
  const { user: currentUser, isAuthenticated } = useCurrentUser();

  const profileUser = useQuery(api.users.getById, {
    userId: id as Id<'users'>,
  });

  const listings = useQuery(
    api.listings.getByUser,
    profileUser ? { userId: profileUser._id } : 'skip'
  );

  const reviews = useQuery(
    api.reviews.listForSeller,
    profileUser ? { sellerId: profileUser._id } : 'skip'
  );

  if (profileUser === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2d5016] via-[#1a3a0a] to-[#0d1f05] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-[#2d5016] via-[#1a3a0a] to-[#0d1f05] flex items-center justify-center"
        dir="rtl"
      >
        <div className="text-center">
          <User className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h2 className="text-white font-bold text-xl mb-2">المستخدم غير موجود</h2>
          <Link href="/" className="text-white/50 text-sm hover:text-white transition-colors">
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  const avatarLetter = (profileUser.name ?? profileUser.email ?? 'U')[0]?.toUpperCase();
  const isSeller = profileUser.role === 'seller';
  const isOwnProfile = currentUser?._id === profileUser._id;
  const canReview = isAuthenticated && !isOwnProfile && isSeller;

  const getCategoryEmoji = (category: string) =>
    CATEGORIES.find((c) => c.value === category)?.emoji ?? '📦';

  const whatsappNumber = profileUser.whatsapp ?? profileUser.phone;
  const whatsappLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, '')}`
    : null;

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#2d5016] via-[#1a3a0a] to-[#0d1f05] pt-20 pb-16 px-4"
      dir="rtl"
    >
      {/* Ambient glows */}
      <div className="fixed top-0 left-1/3 w-96 h-96 bg-green-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-72 h-72 bg-emerald-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white/8 backdrop-blur-xl border border-white/15 rounded-3xl p-6"
        >
          <div className="flex flex-col sm:flex-row items-start gap-5">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {profileUser.avatarUrl ? (
                <img
                  src={profileUser.avatarUrl}
                  alt={profileUser.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-white/20"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-white/12 border-2 border-white/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{avatarLetter}</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-white">{profileUser.name}</h1>
                <span className="px-2.5 py-0.5 bg-white/12 border border-white/15 rounded-full text-xs text-white/70 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  {isSeller ? 'بائع' : 'مشتري'}
                </span>
                {profileUser.isVerifiedSeller && (
                  <span className="px-2.5 py-0.5 bg-white/12 border border-white/15 rounded-full text-xs text-white/70">
                    موثق
                  </span>
                )}
              </div>

              {/* Rating (sellers only) */}
              {isSeller && (
                <div className="mb-2">
                  <SellerRating sellerId={profileUser._id} size="sm" />
                </div>
              )}

              {/* Bio */}
              {profileUser.bio && (
                <p className="text-white/60 text-sm leading-relaxed mb-3 max-w-md">
                  {profileUser.bio}
                </p>
              )}

              {/* Location */}
              {(profileUser.wilaya || profileUser.location) && (
                <div className="flex items-center gap-1.5 text-white/50 text-xs mb-3">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>
                    {[profileUser.wilaya, profileUser.location]
                      .filter(Boolean)
                      .join(' - ')}
                  </span>
                </div>
              )}

              {/* Contact */}
              {isSeller && !isOwnProfile && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {whatsappLink && (
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-2xl text-white text-sm font-medium transition-all duration-200"
                    >
                      <Phone className="w-4 h-4" />
                      تواصل مع البائع
                    </a>
                  )}
                  {profileUser.phone && !whatsappLink && (
                    <a
                      href={`tel:${profileUser.phone}`}
                      className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-2xl text-white text-sm font-medium transition-all duration-200"
                    >
                      <Phone className="w-4 h-4" />
                      اتصل
                    </a>
                  )}
                </div>
              )}

              {isOwnProfile && (
                <Link
                  href="/profile"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-2xl text-white text-sm font-medium transition-all duration-200 mt-2"
                >
                  تعديل الملف الشخصي
                </Link>
              )}
            </div>
          </div>
        </motion.div>

        {/* Listings (seller only) */}
        {isSeller && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold text-base flex items-center gap-2">
                <Package className="w-4 h-4 text-white/60" />
                منتجات البائع
                {listings && (
                  <span className="text-white/40 text-sm font-normal">({listings.length})</span>
                )}
              </h2>
            </div>

            {!listings ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white/8 backdrop-blur-xl border border-white/12 rounded-3xl h-44 animate-pulse"
                  />
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="bg-white/8 backdrop-blur-xl border border-white/12 rounded-3xl p-8 text-center">
                <Package className="w-10 h-10 text-white/20 mx-auto mb-3" />
                <p className="text-white/50 text-sm">لا توجد منتجات بعد</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {listings.map((listing, index) => (
                  <motion.div
                    key={listing._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link href={`/VAR/marketplace/${listing._id}`}>
                      <div className="group bg-white/8 backdrop-blur-xl border border-white/12 hover:border-white/25 rounded-3xl overflow-hidden transition-all duration-300 hover:bg-white/12 cursor-pointer">
                        <div className="h-28 bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center overflow-hidden">
                          {listing.images && listing.images.length > 0 ? (
                            <img
                              src={listing.images[0]}
                              alt={listing.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <span className="text-3xl opacity-60">
                              {getCategoryEmoji(listing.category)}
                            </span>
                          )}
                        </div>
                        <div className="p-3 space-y-1">
                          <p className="text-white text-xs font-medium line-clamp-2 leading-snug">
                            {listing.title}
                          </p>
                          <p className="text-white font-bold text-sm">
                            {formatPrice(listing.price)}
                          </p>
                          <p className="text-white/40 text-xs">
                            {formatRelativeTime(listing._creationTime)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Reviews Section (sellers only) */}
        {isSeller && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="space-y-4"
          >
            <h2 className="text-white font-bold text-base flex items-center gap-2">
              <Star className="w-4 h-4 text-white/60" />
              التقييمات
              {reviews && (
                <span className="text-white/40 text-sm font-normal">({reviews.length})</span>
              )}
            </h2>

            {/* Reviews list */}
            {!reviews ? (
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white/8 backdrop-blur-xl border border-white/12 rounded-2xl h-24 animate-pulse"
                  />
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <div className="bg-white/8 backdrop-blur-xl border border-white/12 rounded-2xl p-6 text-center">
                <Star className="w-8 h-8 text-white/20 mx-auto mb-2" />
                <p className="text-white/50 text-sm">لا توجد تقييمات بعد</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((review, index) => (
                  <ReviewCard key={review._id} review={review} index={index} />
                ))}
              </div>
            )}

            {/* Add review form */}
            {canReview && (
              <div className="mt-6">
                <ReviewForm sellerId={profileUser._id} />
              </div>
            )}

            {!isAuthenticated && isSeller && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                <p className="text-white/50 text-sm mb-3">
                  قم بتسجيل الدخول لإضافة تقييم
                </p>
                <Link
                  href="/auth/sign-in"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-white text-sm font-medium transition-all duration-200"
                >
                  تسجيل الدخول
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
