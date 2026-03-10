"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Heart, Leaf, Clock } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useFavorite } from "@/hooks/useFavorite";
import { formatPrice, formatRelativeTime } from "@/lib/formatters";
import { CATEGORIES } from "@/lib/constants";

interface Listing {
  _id: Id<"listings">;
  title: string;
  price: number;
  images: string[];
  category: string;
  wilaya?: string;
  isOrganic?: boolean;
  _creationTime: number;
  condition?: string;
  quantity?: number;
  unit?: string;
  status: string;
}

interface ListingCardProps {
  listing: Listing;
}

function ListingImage({ storageId, categoryEmoji }: { storageId: string; categoryEmoji: string }) {
  const url = useQuery(api.storage.getUrl, { storageId: storageId as Id<"_storage"> });

  if (url === undefined) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-green-800/40 to-emerald-900/40 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-400/40 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (url) {
    return (
      <img
        src={url}
        alt="listing"
        className="w-full h-full object-cover"
      />
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-green-800/40 to-emerald-900/40 flex items-center justify-center">
      <span className="text-5xl">{categoryEmoji}</span>
    </div>
  );
}

export default function ListingCard({ listing }: ListingCardProps) {
  const { isFavorited, toggle } = useFavorite(listing._id);
  const categoryInfo = CATEGORIES.find((c) => c.value === listing.category);
  const categoryEmoji = categoryInfo?.emoji ?? "🌾";

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle();
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative group"
    >
      <Link href={`/marketplace/${listing._id}`} className="block">
        <div
          className="rounded-3xl overflow-hidden border border-white/15 bg-white/8 backdrop-blur-xl"
          style={{
            boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
            background: "rgba(255,255,255,0.06)",
          }}
        >
          {/* Image */}
          <div className="relative h-48 overflow-hidden">
            {listing.images.length > 0 ? (
              <ListingImage
                storageId={listing.images[0]}
                categoryEmoji={categoryEmoji}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-green-800/50 to-emerald-900/50 flex items-center justify-center">
                <span className="text-5xl">{categoryEmoji}</span>
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Favorite button */}
            <button
              onClick={handleFavoriteClick}
              className="absolute top-3 left-3 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-200 hover:bg-black/60 hover:scale-110"
            >
              <Heart
                className={`w-4 h-4 transition-all duration-200 ${
                  isFavorited
                    ? "fill-white text-white scale-110"
                    : "text-white/80"
                }`}
              />
            </button>

            {/* Organic badge */}
            {listing.isOrganic && (
              <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500/30 backdrop-blur-sm border border-green-400/30">
                <Leaf className="w-3 h-3 text-green-300" />
                <span className="text-xs text-green-200 font-medium">عضوي</span>
              </div>
            )}

            {/* Price badge */}
            <div className="absolute bottom-3 right-3">
              <div
                className="px-3 py-1.5 rounded-2xl backdrop-blur-sm border border-white/20"
                style={{ background: "rgba(45,80,22,0.75)" }}
              >
                <span className="text-white font-bold text-sm">
                  {formatPrice(listing.price)}
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Category + Title */}
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-base">{categoryEmoji}</span>
              <span className="text-xs text-green-300/70 font-medium">
                {categoryInfo?.label}
              </span>
            </div>
            <h3 className="text-white font-bold text-base leading-snug mb-2 line-clamp-2 group-hover:text-green-200 transition-colors">
              {listing.title}
            </h3>

            {/* Location + Time */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-white/50 text-xs">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate max-w-[100px]">
                  {listing.wilaya ?? "غير محدد"}
                </span>
              </div>
              <div className="flex items-center gap-1 text-white/40 text-xs">
                <Clock className="w-3 h-3" />
                <span>{formatRelativeTime(listing._creationTime)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hover glow */}
        <div
          className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300"
          style={{
            boxShadow: "0 0 30px rgba(45,80,22,0.3), 0 0 60px rgba(127,176,105,0.1)",
          }}
        />
      </Link>
    </motion.div>
  );
}
