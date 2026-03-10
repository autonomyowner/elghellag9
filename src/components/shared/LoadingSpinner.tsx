'use client';

import React from 'react';
import { motion } from 'framer-motion';

type SpinnerSize = 'sm' | 'md' | 'lg';

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  fullScreen?: boolean;
  label?: string;
}

const sizeMap: Record<SpinnerSize, { outer: string; inner: string; label: string }> = {
  sm: { outer: 'w-6 h-6', inner: 'w-4 h-4', label: 'text-xs' },
  md: { outer: 'w-12 h-12', inner: 'w-8 h-8', label: 'text-sm' },
  lg: { outer: 'w-20 h-20', inner: 'w-14 h-14', label: 'text-base' },
};

const Spinner: React.FC<{ size: SpinnerSize }> = ({ size }) => {
  const { outer, inner } = sizeMap[size];

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer ring */}
      <motion.div
        className={`${outer} rounded-full border-2 border-green-500/20`}
        style={{ position: 'absolute' }}
      />
      {/* Spinning gradient ring */}
      <motion.div
        className={`${outer} rounded-full`}
        style={{
          background: 'conic-gradient(from 0deg, transparent 60%, #7fb069 100%)',
          position: 'absolute',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      {/* Inner mask circle */}
      <div
        className={`${inner} rounded-full bg-green-950/80`}
        style={{ position: 'absolute' }}
      />
      {/* Center leaf dot */}
      <div className="w-1.5 h-1.5 rounded-full bg-green-400" style={{ position: 'relative' }} />
    </div>
  );
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  fullScreen = false,
  label,
}) => {
  if (fullScreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-green-950/80 backdrop-blur-xl"
      >
        <Spinner size="lg" />
        {label && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-5 text-sm text-white/60 font-medium"
          >
            {label}
          </motion.p>
        )}
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <Spinner size={size} />
      {label && (
        <p className={`${sizeMap[size].label} text-white/50 font-medium`}>{label}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
