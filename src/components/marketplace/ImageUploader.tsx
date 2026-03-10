"use client";

import React, { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, ImageIcon, AlertCircle } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

interface ImageUploaderProps {
  images: string[];
  onChange: (storageIds: string[]) => void;
}

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];

function PreviewImage({ storageId, onRemove }: { storageId: string; onRemove: () => void }) {
  const url = useQuery(api.storage.getUrl, { storageId: storageId as Id<"_storage"> });

  return (
    <div className="relative group aspect-square rounded-2xl overflow-hidden border border-white/15 bg-white/5">
      {url ? (
        <img src={url} alt="preview" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-white/30 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <button
        onClick={onRemove}
        type="button"
        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/60"
      >
        <X className="w-3 h-3 text-white" />
      </button>
    </div>
  );
}

export default function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      setError(null);
      const fileArray = Array.from(files);

      // Validate
      const remaining = MAX_IMAGES - images.length;
      if (fileArray.length > remaining) {
        setError(`يمكنك رفع ${remaining} صورة فقط`);
        return;
      }

      for (const file of fileArray) {
        if (!ALLOWED_TYPES.includes(file.type)) {
          setError("نوع الملف غير مدعوم. يرجى رفع صور فقط (JPG, PNG, WEBP)");
          return;
        }
        if (file.size > MAX_FILE_SIZE) {
          setError("حجم الصورة يجب أن يكون أقل من 5 ميغابايت");
          return;
        }
      }

      setUploading(true);
      const newIds: string[] = [];

      try {
        for (const file of fileArray) {
          const uploadUrl = await generateUploadUrl();
          const response = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": file.type },
            body: file,
          });

          if (!response.ok) throw new Error("فشل رفع الصورة");

          const result = await response.json();
          newIds.push(result.storageId as string);
        }

        onChange([...images, ...newIds]);
      } catch (err) {
        setError("حدث خطأ أثناء رفع الصور. حاول مرة أخرى.");
        console.error(err);
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [images, generateUploadUrl, onChange]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  const canUploadMore = images.length < MAX_IMAGES && !uploading;

  return (
    <div className="space-y-3" dir="rtl">
      {/* Previews grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          <AnimatePresence>
            {images.map((id, index) => (
              <motion.div
                key={id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <PreviewImage storageId={id} onRemove={() => removeImage(index)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Drop zone */}
      {canUploadMore && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className="relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 p-8 flex flex-col items-center justify-center gap-3 text-center"
          style={{
            borderColor: isDragging ? "rgba(127,176,105,0.6)" : "rgba(255,255,255,0.2)",
            background: isDragging
              ? "rgba(127,176,105,0.08)"
              : "rgba(255,255,255,0.04)",
          }}
        >
          {uploading ? (
            <>
              <div className="w-10 h-10 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-white/60 text-sm">جاري رفع الصور...</p>
            </>
          ) : (
            <>
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(127,176,105,0.15)" }}
              >
                {isDragging ? (
                  <ImageIcon className="w-6 h-6 text-green-300" />
                ) : (
                  <Upload className="w-6 h-6 text-white/50" />
                )}
              </div>
              <div>
                <p className="text-white/70 text-sm font-medium">
                  {isDragging ? "أفلت الصور هنا" : "اسحب وأفلت الصور هنا"}
                </p>
                <p className="text-white/40 text-xs mt-1">
                  أو انقر للاختيار — حتى {MAX_IMAGES} صور، 5MB لكل صورة
                </p>
              </div>
              <span className="text-xs text-white/30">
                {images.length}/{MAX_IMAGES} صور مرفوعة
              </span>
            </>
          )}
        </div>
      )}

      {images.length >= MAX_IMAGES && (
        <p className="text-center text-sm text-white/40">
          تم الوصول للحد الأقصى ({MAX_IMAGES} صور)
        </p>
      )}

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/15 border border-red-500/25"
          >
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span className="text-red-300 text-sm">{error}</span>
            <button
              type="button"
              onClick={() => setError(null)}
              className="mr-auto"
            >
              <X className="w-3.5 h-3.5 text-red-400 hover:text-red-200" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
