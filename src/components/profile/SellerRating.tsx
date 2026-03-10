'use client';

import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { Star } from 'lucide-react';

interface SellerRatingProps {
  sellerId: Id<'users'>;
  size?: 'sm' | 'md' | 'lg';
}

export function SellerRating({ sellerId, size = 'md' }: SellerRatingProps) {
  const ratingData = useQuery(api.reviews.getAverageRating, { sellerId });

  if (!ratingData) {
    return (
      <div className="flex items-center gap-1 animate-pulse">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-4 h-4 bg-white/20 rounded" />
        ))}
      </div>
    );
  }

  const { average, count } = ratingData;

  const starSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className="flex items-center gap-2" dir="rtl">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`${starSizes[size]} transition-all duration-200 ${
              i < Math.round(average)
                ? 'fill-white text-white'
                : 'fill-transparent text-white/30'
            }`}
            strokeWidth={1.5}
          />
        ))}
      </div>
      {count > 0 ? (
        <div className={`flex items-center gap-1 ${textSizes[size]}`}>
          <span className="text-white font-semibold">{average}</span>
          <span className="text-white/50">({count})</span>
        </div>
      ) : (
        <span className={`text-white/40 ${textSizes[size]}`}>لا توجد تقييمات</span>
      )}
    </div>
  );
}
