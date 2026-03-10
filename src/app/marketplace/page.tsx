"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Plus, SlidersHorizontal, ChevronDown, Sprout } from "lucide-react";
import ListingCard from "@/components/marketplace/ListingCard";
import CategoryFilter from "@/components/marketplace/CategoryFilter";
import SearchBar from "@/components/marketplace/SearchBar";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { CATEGORIES, WILAYAS } from "@/lib/constants";

type CategoryValue = "vegetables" | "fruits" | "grains" | "livestock" | "equipment" | "land" | "seeds" | "fertilizers";

function SkeletonCard() {
  return (
    <div
      className="rounded-3xl overflow-hidden border border-white/10 animate-pulse"
      style={{ background: "rgba(255,255,255,0.05)" }}
    >
      <div className="h-48 bg-white/10" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-white/10 rounded-xl w-1/3" />
        <div className="h-5 bg-white/10 rounded-xl w-3/4" />
        <div className="h-5 bg-white/10 rounded-xl w-1/2" />
        <div className="flex justify-between">
          <div className="h-3 bg-white/10 rounded-xl w-1/4" />
          <div className="h-3 bg-white/10 rounded-xl w-1/4" />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-span-full flex flex-col items-center justify-center py-24 text-center"
    >
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
        style={{ background: "rgba(127,176,105,0.1)" }}
      >
        <Sprout className="w-10 h-10 text-green-400/60" />
      </div>
      <h3 className="text-white font-bold text-xl mb-2">
        {hasSearch ? "لا توجد نتائج للبحث" : "لا توجد منتجات"}
      </h3>
      <p className="text-white/40 text-sm max-w-xs">
        {hasSearch
          ? "جرب كلمات بحث مختلفة أو تصفح الفئات"
          : "لم يتم نشر أي منتج في هذه الفئة بعد"}
      </p>
    </motion.div>
  );
}

export default function MarketplacePage() {
  const { user } = useCurrentUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryValue | null>(null);
  const [selectedWilaya, setSelectedWilaya] = useState("");
  const [showWilayaFilter, setShowWilayaFilter] = useState(false);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  // Use search or list query based on whether there's a search term
  const listResults = useQuery(
    api.listings.list,
    searchTerm
      ? "skip"
      : {
          category: selectedCategory ?? undefined,
          wilaya: selectedWilaya || undefined,
        }
  );

  const searchResults = useQuery(
    api.listings.search,
    searchTerm
      ? {
          searchTerm,
          category: selectedCategory ?? undefined,
        }
      : "skip"
  );

  const rawListings = searchTerm ? searchResults : listResults;
  const isLoading = rawListings === undefined;

  // Client-side wilaya filter for search results (search API doesn't support wilaya filter)
  const listings = rawListings
    ? searchTerm && selectedWilaya
      ? rawListings.filter((l) => l.wilaya === selectedWilaya)
      : rawListings
    : [];

  const isSeller = user?.role === "seller";

  return (
    <div
      className="min-h-screen text-white"
      dir="rtl"
      style={{
        background: "linear-gradient(135deg, #14532d 0%, #111827 100%)",
      }}
    >
      {/* Hero */}
      <section className="relative pt-28 pb-12 px-4 overflow-hidden">
        {/* Background orbs */}
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(45,80,22,0.4) 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(127,176,105,0.15) 0%, transparent 70%)" }}
        />

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 border border-green-500/20"
              style={{ background: "rgba(45,80,22,0.4)" }}>
              <span className="text-sm text-green-300 font-medium">السوق الزراعي الجزائري</span>
            </div>
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4 leading-tight"
              style={{
                background: "linear-gradient(135deg, #7fb069, #d4af37, #7fb069)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              السوق الزراعي
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed">
              اكتشف آلاف المنتجات الزراعية الطازجة من المزارعين الجزائريين مباشرة
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="max-w-2xl mx-auto"
          >
            <SearchBar onSearch={handleSearch} placeholder="ابحث عن منتجات، معدات، أراضي..." />
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="px-4 pb-6">
        <div className="max-w-6xl mx-auto space-y-4">
          {/* Category pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <CategoryFilter
              selected={selectedCategory}
              onSelect={(v) => setSelectedCategory(v as CategoryValue | null)}
            />
          </motion.div>

          {/* Wilaya filter toggle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-3"
          >
            <button
              onClick={() => setShowWilayaFilter(!showWilayaFilter)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all border"
              style={{
                background: showWilayaFilter ? "rgba(127,176,105,0.15)" : "rgba(255,255,255,0.07)",
                borderColor: showWilayaFilter ? "rgba(127,176,105,0.35)" : "rgba(255,255,255,0.12)",
                color: showWilayaFilter ? "#7fb069" : "rgba(255,255,255,0.65)",
              }}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>فلترة بالولاية</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${showWilayaFilter ? "rotate-180" : ""}`}
              />
            </button>

            {selectedWilaya && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-2xl border text-sm"
                style={{ background: "rgba(45,80,22,0.4)", borderColor: "rgba(127,176,105,0.3)", color: "#7fb069" }}>
                <span>{selectedWilaya}</span>
                <button
                  onClick={() => setSelectedWilaya("")}
                  className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 text-white text-xs leading-none"
                >
                  ×
                </button>
              </div>
            )}
          </motion.div>

          <AnimatePresence>
            {showWilayaFilter && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <select
                  value={selectedWilaya}
                  onChange={(e) => {
                    setSelectedWilaya(e.target.value);
                    setShowWilayaFilter(false);
                  }}
                  className="w-full sm:w-64 py-3 px-4 rounded-2xl text-white text-sm outline-none"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.14)",
                  }}
                >
                  <option value="" style={{ background: "#14532d" }}>كل الولايات</option>
                  {WILAYAS.map((w) => (
                    <option key={w} value={w} style={{ background: "#14532d" }}>
                      {w}
                    </option>
                  ))}
                </select>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Listings grid */}
      <section className="px-4 pb-24">
        <div className="max-w-6xl mx-auto">
          {/* Results count */}
          {!isLoading && (
            <div className="mb-4 text-white/40 text-sm">
              {listings.length > 0
                ? `${listings.length} منتج متاح`
                : null}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            ) : listings.length === 0 ? (
              <EmptyState hasSearch={!!searchTerm} />
            ) : (
              <AnimatePresence>
                {listings.map((listing, i) => (
                  <motion.div
                    key={listing._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.35, delay: i * 0.05 }}
                  >
                    <ListingCard listing={listing} />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </section>

      {/* Floating add button - only for sellers */}
      {isSeller && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="fixed bottom-8 left-6 z-50"
        >
          <Link href="/marketplace/new">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2.5 px-5 py-3.5 rounded-2xl text-white font-bold text-sm shadow-2xl"
              style={{
                background: "linear-gradient(135deg, #2d5016, #7fb069)",
                boxShadow: "0 8px 32px rgba(45,80,22,0.5), 0 0 0 1px rgba(127,176,105,0.3)",
              }}
            >
              <Plus className="w-5 h-5" />
              <span>إضافة منتج</span>
            </motion.button>
          </Link>
        </motion.div>
      )}
    </div>
  );
}
