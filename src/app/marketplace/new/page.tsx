"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import ListingForm, { ListingFormData } from "@/components/marketplace/ListingForm";
import { ArrowLeft, ShieldAlert, Loader2 } from "lucide-react";

type CategoryValue = "vegetables" | "fruits" | "grains" | "livestock" | "equipment" | "land" | "seeds" | "fertilizers";
type ConditionValue = "new" | "excellent" | "good" | "fair";

export default function NewListingPage() {
  const router = useRouter();
  const { user, isLoading } = useCurrentUser();
  const createListing = useMutation(api.listings.create);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (data: ListingFormData) => {
    setSubmitError(null);
    try {
      await createListing({
        title: data.title,
        description: data.description,
        price: data.price,
        category: data.category as CategoryValue,
        images: data.images,
        location: data.location || undefined,
        wilaya: data.wilaya || undefined,
        condition: (data.condition as ConditionValue) || undefined,
        quantity: data.quantity !== "" ? (data.quantity as number) : undefined,
        unit: data.unit || undefined,
        isOrganic: data.isOrganic,
      });
      router.push("/marketplace");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "حدث خطأ غير متوقع";
      setSubmitError(message);
    }
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #0d1f07 0%, #1a2e0a 40%, #0f1a07 100%)" }}
      >
        <Loader2 className="w-10 h-10 text-green-400 animate-spin" />
      </div>
    );
  }

  if (!user) {
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
          <h2 className="text-white font-bold text-xl mb-2">يجب تسجيل الدخول</h2>
          <p className="text-white/50 text-sm mb-6">سجل الدخول أولاً لإضافة منتجات</p>
          <Link
            href="/auth/login"
            className="block w-full py-3 rounded-2xl text-white font-bold text-sm text-center"
            style={{ background: "linear-gradient(135deg, #2d5016, #7fb069)" }}
          >
            تسجيل الدخول
          </Link>
        </motion.div>
      </div>
    );
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
          <div className="text-5xl mb-5">🌾</div>
          <h2 className="text-white font-bold text-xl mb-2">يجب أن تكون بائعاً</h2>
          <p className="text-white/50 text-sm mb-6">
            حسابك الحالي مسجل كمشترٍ. يجب التسجيل كبائع لإضافة منتجات للسوق.
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

  return (
    <div
      className="min-h-screen pb-16"
      dir="rtl"
      style={{ background: "linear-gradient(135deg, #0d1f07 0%, #1a2e0a 40%, #0f1a07 100%)" }}
    >
      {/* Background orbs */}
      <div
        className="fixed top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(45,80,22,0.35) 0%, transparent 70%)" }}
      />

      {/* Header */}
      <div className="sticky top-0 z-30 px-4 pt-4 pb-3" style={{ backdropFilter: "blur(20px)" }}>
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link
            href="/marketplace"
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>السوق</span>
          </Link>
          <h1 className="text-white font-bold text-lg">إضافة منتج جديد</h1>
          <div className="w-16" />
        </div>
      </div>

      <div className="px-4 pt-4">
        <div className="max-w-2xl mx-auto">
          {/* Error banner */}
          {submitError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 px-4 py-3 rounded-2xl border border-red-500/25 text-red-300 text-sm flex items-center gap-2"
              style={{ background: "rgba(248,113,113,0.12)" }}
            >
              <span>{submitError}</span>
            </motion.div>
          )}

          <ListingForm onSubmit={handleSubmit} submitLabel="نشر الإعلان في السوق" />
        </div>
      </div>
    </div>
  );
}
