'use client';

import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { Id } from '../../../convex/_generated/dataModel';
import { useFavorite } from '@/hooks/useFavorite';
import { useConvexAuth } from '@/hooks/useCurrentUser';

interface FavoriteButtonProps {
  listingId: Id<'listings'>;
  className?: string;
}

export function FavoriteButton({ listingId, className = '' }: FavoriteButtonProps) {
  const { isAuthenticated } = useConvexAuth();
  const { isFavorited, toggle, isLoading } = useFavorite(listingId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      window.location.href = '/auth/sign-in';
      return;
    }

    await toggle();
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={isLoading}
      whileTap={{ scale: 0.8 }}
      whileHover={{ scale: 1.1 }}
      className={`relative flex items-center justify-center w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-200 hover:bg-white/20 disabled:opacity-50 ${className}`}
      aria-label={isFavorited ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
    >
      <motion.div
        animate={isFavorited ? { scale: [1, 1.3, 1] } : { scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Heart
          className={`w-4 h-4 transition-all duration-200 ${
            isFavorited
              ? 'fill-white text-white'
              : 'text-white fill-transparent'
          }`}
          strokeWidth={2}
        />
      </motion.div>
    </motion.button>
  );
}
