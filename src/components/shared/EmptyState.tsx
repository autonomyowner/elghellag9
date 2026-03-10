'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`flex flex-col items-center justify-center text-center py-20 px-6 ${className}`}
    >
      {/* Icon Container */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 20 }}
        className="mb-6"
      >
        <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-lg border border-white/20 flex items-center justify-center shadow-lg shadow-green-900/20 mx-auto">
          <Icon className="w-12 h-12 text-green-400/70" strokeWidth={1.5} />
        </div>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="text-xl font-bold text-white mb-2"
      >
        {title}
      </motion.div>

      {/* Description */}
      {description && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-white/50 text-sm max-w-xs leading-relaxed mb-8"
        >
          {description}
        </motion.div>
      )}

      {/* CTA Button */}
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          <Link
            href={action.href}
            className="inline-flex items-center px-6 py-3 rounded-2xl font-semibold text-sm bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg shadow-green-900/30 hover:shadow-green-500/30 border border-green-400/30 transition-all duration-300"
          >
            {action.label}
          </Link>
        </motion.div>
      )}
    </motion.div>
  );
};

export default EmptyState;
