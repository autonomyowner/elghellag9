"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useFavorite } from "@/hooks/useFavorite";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { formatPrice, formatRelativeTime } from "@/lib/formatters";
import { CATEGORIES, CONDITIONS, UNITS } from "@/lib/constants";
import {
  ArrowLeft,
  Heart,
  Share2,
  MapPin,
  Package,
  Leaf,
  MessageCircle,
  Eye,
  ChevronRight,
  ChevronLeft,
  Loader2,
  User,
  BadgeCheck,
  Tag,
  Calendar,
} from "lucide-react";

function ImageGallery({ storageIds }: { storageIds: string[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  // We fetch URLs for all images
  const url0 = useQuery(api.storage.getUrl, storageIds[0] ? { storageId: storageIds[0] as Id<"_storage"> } : "skip");
  const url1 = useQuery(api.storage.getUrl, storageIds[1] ? { storageId: storageIds[1] as Id<"_storage"> } : "skip");
  const url2 = useQuery(api.storage.getUrl, storageIds[2] ? { storageId: storageIds[2] as Id<"_storage"> } : "skip");
  const url3 = useQuery(api.storage.getUrl, storageIds[3] ? { storageId: storageIds[3] as Id<"_storage"> } : "skip");
  const url4 = useQuery(api.storage.getUrl, storageIds[4] ? { storageId: storageIds[4] as Id<"_storage"> } : "skip");

  const urls = [url0, url1, url2, url3, url4].filter((_, i) => i < storageIds.length);
  const activeUrl = urls[activeIndex];

  const prev = () => setActiveIndex((i) => (i === 0 ? storageIds.length - 1 : i - 1));
  const next = () => setActiveIndex((i) => (i === storageIds.length - 1 ? 0 : i + 1));

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div
        className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden border border-white/10"
        style={{ background: "rgba(255,255,255,0.05)" }}
      >
        <AnimatePresence mode="wait">
          {activeUrl ? (
            <motion.img
              key={activeIndex}
              src={activeUrl}
              alt="product"
              className="w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white/30 animate-spin" />
            </div>
          )}
        </AnimatePresence>

        {storageIds.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={next}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {storageIds.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className="rounded-full transition-all duration-200"
                  style={{
                    width: i === activeIndex ? "20px" : "6px",
                    height: "6px",
                    background: i === activeIndex ? "#7fb069" : "rgba(255,255,255,0.4)",
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {storageIds.length > 1 && (
        <div className="flex gap-2">
          {urls.map((url, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className="w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all duration-200 flex-shrink-0"
              style={{
                borderColor: i === activeIndex ? "#7fb069" : "rgba(255,255,255,0.15)",
              }}
            >
              {url ? (
                <img src={url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-white/10" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryPlaceholder({ category }: { category: string }) {
  const cat = CATEGORIES.find((c) => c.value === category);
  return (
    <div
      className="w-full aspect-[4/3] rounded-3xl flex items-center justify-center border border-white/10"
      style={{ background: "rgba(45,80,22,0.3)" }}
    >
      <span className="text-8xl">{cat?.emoji ?? "🌾"}</span>
    </div>
  );
}

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params.id as string;
  const { user, isAuthenticated } = useCurrentUser();

  const listing = useQuery(api.listings.getById, {
    listingId: listingId as Id<"listings">,
  });
  const seller = useQuery(
    api.users.getById,
    listing?.sellerId ? { userId: listing.sellerId } : "skip"
  );

  const incrementViews = useMutation(api.listings.incrementViews);
  const getOrCreateConversation = useMutation(api.conversations.getOrCreate);

  const { isFavorited, toggle } = useFavorite(listingId as Id<"listings">);
  const [contactLoading, setContactLoading] = useState(false);

  // Increment view count once on mount
  useEffect(() => {
    if (listing) {
      incrementViews({ listingId: listingId as Id<"listings"> });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listing?._id]);

  const handleContact = async () => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    if (!listing) return;
    setContactLoading(true);
    try {
      const convId = await getOrCreateConversation({
        sellerId: listing.sellerId,
        listingId: listingId as Id<"listings">,
      });
      router.push(`/messages/${convId}`);
    } catch {
      // ignore
    } finally {
      setContactLoading(false);
    }
  };

  const handleShare = async () => {
    if (!listing) return;
    const shareData = {
      title: listing.title,
      text: `${listing.title} - ${formatPrice(listing.price)}`,
      url: window.location.href,
    };
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  const categoryInfo = CATEGORIES.find((c) => c.value === listing?.category);
  const conditionLabel = CONDITIONS.find((c) => c.value === listing?.condition)?.label;
  const unitLabel = UNITS.find((u) => u.value === listing?.unit)?.label;

  if (listing === undefined) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #0d1f07 0%, #1a2e0a 40%, #0f1a07 100%)" }}
      >
        <Loader2 className="w-10 h-10 text-green-400 animate-spin" />
      </div>
    );
  }

  if (listing === null) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        dir="rtl"
        style={{ background: "linear-gradient(135deg, #0d1f07 0%, #1a2e0a 40%, #0f1a07 100%)" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-sm w-full rounded-3xl p-8 border border-white/10"
          style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(20px)" }}
        >
          <div className="text-5xl mb-5">🌾</div>
          <h2 className="text-white font-bold text-xl mb-2">المنتج غير موجود</h2>
          <p className="text-white/50 text-sm mb-6">لم يتم العثور على هذا الإعلان</p>
          <Link
            href="/marketplace"
            className="block w-full py-3 rounded-2xl text-white font-bold text-sm text-center"
            style={{ background: "linear-gradient(135deg, #2d5016, #7fb069)" }}
          >
            العودة للسوق
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pb-32 text-white"
      dir="rtl"
      style={{ background: "linear-gradient(135deg, #0d1f07 0%, #1a2e0a 40%, #0f1a07 100%)" }}
    >
      {/* Background orbs */}
      <div
        className="fixed top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(45,80,22,0.3) 0%, transparent 70%)" }}
      />

      {/* Top navigation bar */}
      <div
        className="sticky top-0 z-30 px-4 pt-4 pb-3"
        style={{ backdropFilter: "blur(20px)", background: "rgba(13,31,7,0.6)" }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm">
            <Link href="/" className="text-white/40 hover:text-white/70 transition-colors">الرئيسية</Link>
            <span className="text-white/20">/</span>
            <Link href="/marketplace" className="text-white/40 hover:text-white/70 transition-colors">السوق</Link>
            <span className="text-white/20">/</span>
            <span className="text-white/60 truncate max-w-[120px]">{listing.title}</span>
          </div>

          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="px-4 pt-4">
        <div className="max-w-4xl mx-auto">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 space-y-5 lg:space-y-0">
            {/* Left: Images */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {listing.images.length > 0 ? (
                <ImageGallery storageIds={listing.images} />
              ) : (
                <CategoryPlaceholder category={listing.category} />
              )}
            </motion.div>

            {/* Right: Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-4"
            >
              {/* Category + badges */}
              <div className="flex flex-wrap items-center gap-2">
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{ background: "rgba(45,80,22,0.4)", color: "#7fb069", border: "1px solid rgba(127,176,105,0.2)" }}
                >
                  <span>{categoryInfo?.emoji}</span>
                  <span>{categoryInfo?.label}</span>
                </div>
                {listing.isOrganic && (
                  <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                    style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.2)" }}
                  >
                    <Leaf className="w-3 h-3" />
                    <span>عضوي</span>
                  </div>
                )}
                {conditionLabel && (
                  <div
                    className="px-3 py-1.5 rounded-full text-xs font-medium"
                    style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.12)" }}
                  >
                    {conditionLabel}
                  </div>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {listing.title}
              </h1>

              {/* Price */}
              <div
                className="inline-block px-5 py-3 rounded-2xl"
                style={{ background: "rgba(45,80,22,0.4)", border: "1px solid rgba(127,176,105,0.2)" }}
              >
                <span
                  className="text-2xl font-black"
                  style={{ color: "#d4af37" }}
                >
                  {formatPrice(listing.price)}
                </span>
                {unitLabel && (
                  <span className="text-white/50 text-sm mr-2">/ {unitLabel}</span>
                )}
              </div>

              {/* Meta info */}
              <div className="space-y-2.5">
                {listing.wilaya && (
                  <div className="flex items-center gap-2.5 text-white/60 text-sm">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span>{listing.wilaya}{listing.location ? ` - ${listing.location}` : ""}</span>
                  </div>
                )}
                {listing.quantity !== undefined && listing.quantity !== null && (
                  <div className="flex items-center gap-2.5 text-white/60 text-sm">
                    <Package className="w-4 h-4 flex-shrink-0" />
                    <span>الكمية المتوفرة: {listing.quantity} {unitLabel ?? ""}</span>
                  </div>
                )}
                <div className="flex items-center gap-2.5 text-white/50 text-xs">
                  <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{formatRelativeTime(listing._creationTime)}</span>
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <Eye className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{listing.viewCount ?? 0} مشاهدة</span>
                </div>
              </div>

              {/* Description */}
              <div
                className="rounded-2xl p-4"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <h3 className="text-white font-semibold text-sm mb-2">الوصف</h3>
                <p className="text-white/60 text-sm leading-relaxed">{listing.description}</p>
              </div>

              {/* Seller info */}
              {seller && (
                <div
                  className="rounded-2xl p-4 flex items-center gap-3"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(127,176,105,0.15)" }}
                  >
                    {seller.avatarUrl ? (
                      <img src={seller.avatarUrl} alt={seller.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-green-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-white font-semibold text-sm truncate">{seller.name}</p>
                      {seller.isVerifiedSeller && (
                        <BadgeCheck className="w-4 h-4 text-green-400 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-white/40 text-xs">{seller.wilaya ?? "بائع معتمد"}</p>
                  </div>
                  <Tag className="w-4 h-4 text-white/30" />
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                {/* Contact seller */}
                {user?._id !== listing.sellerId && (
                  <button
                    onClick={handleContact}
                    disabled={contactLoading}
                    className="flex-1 flex items-center justify-center gap-2.5 py-4 rounded-2xl text-white font-bold text-sm transition-all duration-200 disabled:opacity-60"
                    style={{
                      background: "linear-gradient(135deg, #2d5016, #7fb069)",
                      boxShadow: "0 4px 20px rgba(45,80,22,0.4)",
                    }}
                  >
                    {contactLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <MessageCircle className="w-5 h-5" />
                        <span>تواصل مع البائع</span>
                      </>
                    )}
                  </button>
                )}

                {/* Favorite */}
                <button
                  onClick={toggle}
                  className="w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-200 hover:scale-105"
                  style={{
                    background: isFavorited ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.07)",
                    borderColor: isFavorited ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.12)",
                  }}
                >
                  <Heart
                    className={`w-5 h-5 transition-all duration-200 ${isFavorited ? "fill-white text-white" : "text-white/50"}`}
                  />
                </button>

                {/* Share */}
                <button
                  onClick={handleShare}
                  className="w-14 h-14 rounded-2xl flex items-center justify-center border border-white/12 transition-all duration-200 hover:scale-105"
                  style={{ background: "rgba(255,255,255,0.07)" }}
                >
                  <Share2 className="w-5 h-5 text-white/50" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
