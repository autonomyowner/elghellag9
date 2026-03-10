'use client';

import { motion } from 'framer-motion';
import { Star, User } from 'lucide-react';
import { formatRelativeTime } from '@/lib/formatters';

interface ReviewCardProps {
  review: {
    _id: string;
    rating: number;
    comment?: string;
    reviewerName: string;
    _creationTime: number;
  };
  index?: number;
}

export function ReviewCard({ review, index = 0 }: ReviewCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className="bg-white/8 backdrop-blur-xl border border-white/15 rounded-2xl p-4 space-y-3"
      dir="rtl"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-white/60" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">
              {review.reviewerName}
            </p>
            <p className="text-white/40 text-xs mt-0.5">
              {formatRelativeTime(review._creationTime)}
            </p>
          </div>
        </div>

        {/* Stars */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 ${
                i < review.rating
                  ? 'fill-white text-white'
                  : 'fill-transparent text-white/25'
              }`}
              strokeWidth={1.5}
            />
          ))}
        </div>
      </div>

      {/* Comment */}
      {review.comment && (
        <p className="text-white/70 text-sm leading-relaxed pr-11">
          {review.comment}
        </p>
      )}
    </motion.div>
  );
}
