"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Tag,
  FileText,
  DollarSign,
  MapPin,
  Package,
  Ruler,
  Leaf,
  Loader2,
  AlertCircle,
} from "lucide-react";
import ImageUploader from "./ImageUploader";
import { CATEGORIES, WILAYAS, UNITS, CONDITIONS } from "@/lib/constants";

type CategoryValue = "vegetables" | "fruits" | "grains" | "livestock" | "equipment" | "land" | "seeds" | "fertilizers";
type ConditionValue = "new" | "excellent" | "good" | "fair";

export interface ListingFormData {
  title: string;
  description: string;
  price: number;
  category: CategoryValue;
  images: string[];
  location: string;
  wilaya: string;
  condition: ConditionValue | "";
  quantity: number | "";
  unit: string;
  isOrganic: boolean;
}

interface ListingFormProps {
  initialData?: Partial<ListingFormData>;
  onSubmit: (data: ListingFormData) => Promise<void>;
  submitLabel?: string;
}

const cardStyle = {
  background: "rgba(255,255,255,0.05)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.1)",
};

const inputStyle = {
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.14)",
  color: "#fff",
  borderRadius: "14px",
  outline: "none",
  width: "100%",
  padding: "12px 16px",
  fontSize: "15px",
  fontFamily: "inherit",
};

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl p-5 space-y-4"
      style={cardStyle}
    >
      <h3 className="text-white font-bold text-base border-b border-white/10 pb-3">
        {title}
      </h3>
      {children}
    </motion.div>
  );
}

function InputField({
  label,
  icon: Icon,
  required,
  children,
}: {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5" dir="rtl">
      <label className="flex items-center gap-2 text-sm font-medium text-white/70">
        {Icon && <Icon className="w-4 h-4" />}
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

export default function ListingForm({
  initialData,
  onSubmit,
  submitLabel = "نشر الإعلان",
}: ListingFormProps) {
  const [form, setForm] = useState<ListingFormData>({
    title: initialData?.title ?? "",
    description: initialData?.description ?? "",
    price: initialData?.price ?? (0 as number),
    category: (initialData?.category as CategoryValue) ?? "vegetables",
    images: initialData?.images ?? [],
    location: initialData?.location ?? "",
    wilaya: initialData?.wilaya ?? "",
    condition: (initialData?.condition as ConditionValue) ?? "",
    quantity: initialData?.quantity ?? "",
    unit: initialData?.unit ?? "",
    isOrganic: initialData?.isOrganic ?? false,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof ListingFormData>(key: K, value: ListingFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) newErrors.title = "العنوان مطلوب";
    else if (form.title.trim().length < 5) newErrors.title = "العنوان يجب أن يكون 5 أحرف على الأقل";
    if (!form.description.trim()) newErrors.description = "الوصف مطلوب";
    else if (form.description.trim().length < 10) newErrors.description = "الوصف يجب أن يكون 10 أحرف على الأقل";
    if (!form.price || form.price <= 0) newErrors.price = "السعر يجب أن يكون أكبر من 0";
    if (!form.category) newErrors.category = "الفئة مطلوبة";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit(form);
    } finally {
      setLoading(false);
    }
  };

  const focusStyle = (field: string) => ({
    ...inputStyle,
    borderColor: errors[field] ? "rgba(248,113,113,0.5)" : "rgba(255,255,255,0.14)",
  });

  return (
    <form onSubmit={handleSubmit} dir="rtl" className="space-y-4">
      {/* Basic Info */}
      <FormSection title="المعلومات الأساسية">
        {/* Title */}
        <InputField label="عنوان الإعلان" icon={Tag} required>
          <input
            type="text"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="مثال: طماطم طازجة عضوية من مزرعتي"
            style={focusStyle("title")}
            className="placeholder-white/30 transition-all duration-200"
          />
          {errors.title && (
            <p className="text-red-400 text-xs flex items-center gap-1 mt-1">
              <AlertCircle className="w-3 h-3" /> {errors.title}
            </p>
          )}
        </InputField>

        {/* Description */}
        <InputField label="وصف المنتج" icon={FileText} required>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="اكتب وصفاً تفصيلياً للمنتج..."
            rows={4}
            style={{ ...focusStyle("description"), resize: "vertical" }}
            className="placeholder-white/30 transition-all duration-200"
          />
          {errors.description && (
            <p className="text-red-400 text-xs flex items-center gap-1 mt-1">
              <AlertCircle className="w-3 h-3" /> {errors.description}
            </p>
          )}
        </InputField>

        {/* Category */}
        <InputField label="الفئة" required>
          <select
            value={form.category}
            onChange={(e) => set("category", e.target.value as CategoryValue)}
            style={focusStyle("category")}
            className="transition-all duration-200"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value} style={{ background: "#14532d" }}>
                {cat.emoji} {cat.label}
              </option>
            ))}
          </select>
        </InputField>
      </FormSection>

      {/* Price & Quantity */}
      <FormSection title="السعر والكمية">
        <div className="grid grid-cols-2 gap-3">
          {/* Price */}
          <InputField label="السعر (د.ج)" icon={DollarSign} required>
            <input
              type="number"
              value={form.price || ""}
              onChange={(e) => set("price", Number(e.target.value))}
              placeholder="0"
              min="0"
              style={focusStyle("price")}
              className="placeholder-white/30 transition-all duration-200"
            />
            {errors.price && (
              <p className="text-red-400 text-xs flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" /> {errors.price}
              </p>
            )}
          </InputField>

          {/* Quantity */}
          <InputField label="الكمية" icon={Package}>
            <input
              type="number"
              value={form.quantity === "" ? "" : form.quantity}
              onChange={(e) =>
                set("quantity", e.target.value === "" ? "" : Number(e.target.value))
              }
              placeholder="اختياري"
              min="0"
              style={inputStyle}
              className="placeholder-white/30 transition-all duration-200"
            />
          </InputField>
        </div>

        {/* Unit */}
        <InputField label="وحدة القياس" icon={Ruler}>
          <select
            value={form.unit}
            onChange={(e) => set("unit", e.target.value)}
            style={inputStyle}
          >
            <option value="" style={{ background: "#14532d" }}>اختر الوحدة (اختياري)</option>
            {UNITS.map((u) => (
              <option key={u.value} value={u.value} style={{ background: "#14532d" }}>
                {u.label}
              </option>
            ))}
          </select>
        </InputField>

        {/* Condition */}
        <InputField label="حالة المنتج">
          <select
            value={form.condition}
            onChange={(e) => set("condition", e.target.value as ConditionValue | "")}
            style={inputStyle}
          >
            <option value="" style={{ background: "#14532d" }}>اختر الحالة (اختياري)</option>
            {CONDITIONS.map((c) => (
              <option key={c.value} value={c.value} style={{ background: "#14532d" }}>
                {c.label}
              </option>
            ))}
          </select>
        </InputField>
      </FormSection>

      {/* Location */}
      <FormSection title="الموقع">
        {/* Wilaya */}
        <InputField label="الولاية" icon={MapPin}>
          <select
            value={form.wilaya}
            onChange={(e) => set("wilaya", e.target.value)}
            style={inputStyle}
          >
            <option value="" style={{ background: "#14532d" }}>اختر الولاية (اختياري)</option>
            {WILAYAS.map((w) => (
              <option key={w} value={w} style={{ background: "#14532d" }}>
                {w}
              </option>
            ))}
          </select>
        </InputField>

        {/* Location text */}
        <InputField label="العنوان التفصيلي">
          <input
            type="text"
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            placeholder="مثال: حي الزيتون، شارع الفلاحة"
            style={inputStyle}
            className="placeholder-white/30 transition-all duration-200"
          />
        </InputField>
      </FormSection>

      {/* Images */}
      <FormSection title="الصور">
        <ImageUploader images={form.images} onChange={(ids) => set("images", ids)} />
      </FormSection>

      {/* Organic Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl p-5"
        style={cardStyle}
      >
        <div className="flex items-center justify-between" dir="rtl">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(127,176,105,0.15)" }}
            >
              <Leaf className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">منتج عضوي</p>
              <p className="text-white/40 text-xs">
                هل هذا المنتج عضوي خالٍ من المبيدات الكيميائية؟
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => set("isOrganic", !form.isOrganic)}
            className="relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0"
            style={{
              background: form.isOrganic
                ? "linear-gradient(135deg, #2d5016, #7fb069)"
                : "rgba(255,255,255,0.15)",
            }}
          >
            <span
              className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300"
              style={{ right: form.isOrganic ? "4px" : "auto", left: form.isOrganic ? "auto" : "4px" }}
            />
          </button>
        </div>
      </motion.div>

      {/* Submit */}
      <motion.button
        type="submit"
        disabled={loading}
        whileTap={{ scale: loading ? 1 : 0.98 }}
        className="w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{
          background: loading
            ? "rgba(127,176,105,0.4)"
            : "linear-gradient(135deg, #2d5016, #7fb069)",
          boxShadow: loading ? "none" : "0 4px 20px rgba(127,176,105,0.3)",
        }}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>جاري النشر...</span>
          </>
        ) : (
          submitLabel
        )}
      </motion.button>
    </form>
  );
}
