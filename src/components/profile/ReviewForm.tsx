'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { Star, Send, Loader2 } from 'lucide-react';

interface ReviewFormProps {
  sellerId: Id<'users'>;
  onSuccess?: () => void;
}

export function ReviewForm({ sellerId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const createReview = useMutation(api.reviews.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('يرجى اختيار تقييم');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createReview({
        sellerId,
        rating,
        comment: comment.trim() || undefined,
      });
      setSuccess(true);
      setRating(0);
      setComment('');
      onSuccess?.();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ. يرجى المحاولة مجدداً.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/8 backdrop-blur-xl border border-white/15 rounded-2xl p-6 text-center"
        dir="rtl"
      >
        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
          <Star className="w-6 h-6 fill-white text-white" />
        </div>
        <p className="text-white font-semibold text-base">شكراً على تقييمك!</p>
        <p className="text-white/50 text-sm mt-1">تم إرسال تقييمك بنجاح</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/8 backdrop-blur-xl border border-white/15 rounded-2xl p-5 space-y-4"
      dir="rtl"
    >
      <h3 className="text-white font-bold text-base">أضف تقييمك</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star Rating Selector */}
        <div className="space-y-2">
          <label className="text-white/60 text-sm">التقييم</label>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => {
              const starValue = i + 1;
              return (
                <motion.button
                  key={i}
                  type="button"
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setRating(starValue)}
                  onMouseEnter={() => setHoverRating(starValue)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-0.5 focus:outline-none"
                >
                  <Star
                    className={`w-7 h-7 transition-all duration-150 ${
                      starValue <= (hoverRating || rating)
                        ? 'fill-white text-white'
                        : 'fill-transparent text-white/30'
                    }`}
                    strokeWidth={1.5}
                  />
                </motion.button>
              );
            })}
            {rating > 0 && (
              <span className="text-white/60 text-sm mr-2">
                {['', 'سيئ', 'مقبول', 'جيد', 'جيد جداً', 'ممتاز'][rating]}
              </span>
            )}
          </div>
        </div>

        {/* Comment */}
        <div className="space-y-2">
          <label className="text-white/60 text-sm">التعليق (اختياري)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="شاركنا تجربتك مع هذا البائع..."
            rows={3}
            className="w-full bg-white/8 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-white/30 text-sm resize-none focus:outline-none focus:border-white/40 focus:bg-white/12 transition-all duration-200"
          />
        </div>

        {/* Error */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2"
          >
            {error}
          </motion.p>
        )}

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={isSubmitting || rating === 0}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-white/15 hover:bg-white/25 disabled:bg-white/5 disabled:opacity-50 backdrop-blur-sm border border-white/20 rounded-2xl text-white font-semibold text-sm transition-all duration-200"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {isSubmitting ? 'جاري الإرسال...' : 'إرسال التقييم'}
        </motion.button>
      </form>
    </motion.div>
  );
}
