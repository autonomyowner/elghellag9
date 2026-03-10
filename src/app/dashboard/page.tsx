"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { formatPrice, formatRelativeTime } from "@/lib/formatters";
import { CATEGORIES } from "@/lib/constants";
import {
  Plus,
  Eye,
  BarChart3,
  Package,
  CheckCircle,
  Archive,
  Edit3,
  Loader2,
  ChevronDown,
  ShieldAlert,
  Layers,
} from "lucide-react";

type ListingStatus = "active" | "sold" | "draft" | "archived";

const STATUS_CONFIG: Record<ListingStatus, { label: string; color: string; bg: string; border: string }> = {
  active: { label: "نشط", color: "#4ade80", bg: "rgba(34,197,94,0.15)", border: "rgba(34,197,94,0.25)" },
  sold: { label: "مباع", color: "#facc15", bg: "rgba(250,204,21,0.15)", border: "rgba(250,204,21,0.25)" },
  draft: { label: "مسودة", color: "rgba(255,255,255,0.5)", bg: "rgba(255,255,255,0.08)", border: "rgba(255,255,255,0.12)" },
  archived: { label: "مؤرشف", color: "rgba(255,255,255,0.35)", bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.08)" },
};

function StatCard({
  icon: Icon,
  label,
  value,
  delay,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="rounded-3xl p-5 border border-white/10"
      style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(16px)" }}
    >
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3"
        style={{ background: "rgba(127,176,105,0.15)" }}
      >
        <Icon className="w-5 h-5 text-green-300" />
      </div>
      <p className="text-white font-black text-2xl">{value}</p>
      <p className="text-white/45 text-xs mt-1">{label}</p>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: ListingStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.archived;
  return (
    <span
      className="px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      {cfg.label}
    </span>
  );
}

function StatusDropdown({
  listingId,
  currentStatus,
}: {
  listingId: Id<"listings">;
  currentStatus: ListingStatus;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const updateStatus = useMutation(api.listings.updateStatus);

  const options: ListingStatus[] = ["active", "sold", "archived"];

  const handleChange = async (status: ListingStatus) => {
    setOpen(false);
    setLoading(true);
    try {
      await updateStatus({ listingId, status });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all hover:opacity-80 disabled:opacity-50"
        style={{ background: "rgba(255,255,255,0.07)", borderColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.65)" }}
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <>
            <StatusBadge status={currentStatus} />
            <ChevronDown className="w-3 h-3 opacity-50" />
          </>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 top-full mt-1.5 z-20 min-w-[140px] rounded-2xl overflow-hidden border border-white/12 shadow-2xl"
              style={{ background: "rgba(20,40,10,0.95)", backdropFilter: "blur(20px)" }}
            >
              {options.map((status) => (
                <button
                  key={status}
                  onClick={() => handleChange(status)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-xs hover:bg-white/5 transition-colors text-right"
                >
                  <StatusBadge status={status} />
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function ListingRow({ listing }: { listing: { _id: Id<"listings">; title: string; price: number; category: string; status: string; viewCount?: number; _creationTime: number; wilaya?: string } }) {
  const cat = CATEGORIES.find((c) => c.value === listing.category);
  const status = listing.status as ListingStatus;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="flex items-center gap-3 p-4 rounded-2xl border border-white/8 group transition-all hover:border-white/14"
      style={{ background: "rgba(255,255,255,0.04)" }}
    >
      {/* Category emoji */}
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ background: "rgba(45,80,22,0.35)" }}
      >
        {cat?.emoji ?? "🌾"}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-sm truncate">{listing.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-green-300 font-bold text-xs">{formatPrice(listing.price)}</span>
          {listing.wilaya && (
            <span className="text-white/30 text-xs">{listing.wilaya}</span>
          )}
          <span className="text-white/25 text-xs">{formatRelativeTime(listing._creationTime)}</span>
        </div>
      </div>

      {/* Views */}
      <div className="hidden sm:flex items-center gap-1 text-white/35 text-xs">
        <Eye className="w-3.5 h-3.5" />
        <span>{listing.viewCount ?? 0}</span>
      </div>

      {/* Status dropdown */}
      <StatusDropdown listingId={listing._id} currentStatus={status} />

      {/* Edit button */}
      <Link
        href={`/marketplace/${listing._id}/edit`}
        className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/10 bg-white/5 hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
      >
        <Edit3 className="w-4 h-4 text-white/60" />
      </Link>
    </motion.div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useCurrentUser();
  const myListings = useQuery(api.listings.getMyListings);

  if (isLoading || myListings === undefined) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #0d1f07 0%, #1a2e0a 40%, #0f1a07 100%)" }}
      >
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-green-400 animate-spin mx-auto mb-3" />
          <p className="text-white/40 text-sm">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push("/auth/login");
    return null;
  }

  if (user.role !== "seller") {
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
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: "rgba(248,113,113,0.15)" }}
          >
            <ShieldAlert className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-white font-bold text-xl mb-2">لوحة البائعين فقط</h2>
          <p className="text-white/50 text-sm mb-6">
            هذه اللوحة مخصصة للبائعين. حسابك مسجل كمشترٍ.
          </p>
          <Link
            href="/marketplace"
            className="block w-full py-3 rounded-2xl text-white font-bold text-sm text-center"
            style={{ background: "linear-gradient(135deg, #2d5016, #7fb069)" }}
          >
            تصفح السوق
          </Link>
        </motion.div>
      </div>
    );
  }

  // Compute stats
  const totalListings = myListings.length;
  const activeListings = myListings.filter((l) => l.status === "active").length;
  const soldListings = myListings.filter((l) => l.status === "sold").length;
  const totalViews = myListings.reduce((sum, l) => sum + (l.viewCount ?? 0), 0);

  return (
    <div
      className="min-h-screen pb-20 text-white"
      dir="rtl"
      style={{ background: "linear-gradient(135deg, #0d1f07 0%, #1a2e0a 40%, #0f1a07 100%)" }}
    >
      {/* Background orbs */}
      <div
        className="fixed top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(45,80,22,0.35) 0%, transparent 70%)" }}
      />

      {/* Header */}
      <div className="px-4 pt-24 pb-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <p className="text-white/40 text-sm mb-1">مرحباً،</p>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                {user.name}
              </h1>
              <div className="flex items-center gap-2 mt-1.5">
                {user.isVerifiedSeller && (
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{ background: "rgba(127,176,105,0.15)", color: "#7fb069", border: "1px solid rgba(127,176,105,0.2)" }}
                  >
                    <CheckCircle className="w-3 h-3" />
                    <span>بائع موثق</span>
                  </div>
                )}
                <span
                  className="px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}
                >
                  بائع
                </span>
              </div>
            </div>

            {/* Add listing button */}
            <Link href="/marketplace/new">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl text-white font-bold text-sm"
                style={{
                  background: "linear-gradient(135deg, #2d5016, #7fb069)",
                  boxShadow: "0 4px 20px rgba(45,80,22,0.4)",
                }}
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">إضافة منتج جديد</span>
              </motion.button>
            </Link>
          </motion.div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <StatCard icon={Layers} label="إجمالي الإعلانات" value={totalListings} delay={0.05} />
            <StatCard icon={Package} label="إعلانات نشطة" value={activeListings} delay={0.1} />
            <StatCard icon={Archive} label="مُباعة" value={soldListings} delay={0.15} />
            <StatCard icon={Eye} label="إجمالي المشاهدات" value={totalViews.toLocaleString("ar-DZ")} delay={0.2} />
          </div>

          {/* Listings section */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-lg">إعلاناتي</h2>
              <div className="flex items-center gap-1 text-white/35 text-xs">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>{totalListings} إعلان</span>
              </div>
            </div>

            {myListings.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 rounded-3xl border border-white/8"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={{ background: "rgba(127,176,105,0.1)" }}
                >
                  <Package className="w-9 h-9 text-green-400/50" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">لا توجد إعلانات بعد</h3>
                <p className="text-white/40 text-sm mb-6">ابدأ بإضافة منتجك الأول للسوق الزراعي</p>
                <Link
                  href="/marketplace/new"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-bold text-sm"
                  style={{ background: "linear-gradient(135deg, #2d5016, #7fb069)" }}
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة منتج جديد</span>
                </Link>
              </motion.div>
            ) : (
              <div className="space-y-2.5">
                <AnimatePresence>
                  {myListings.map((listing) => (
                    <ListingRow key={listing._id} listing={listing} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
