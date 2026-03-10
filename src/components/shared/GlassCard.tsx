'use client';

import React, { ElementType } from 'react';
import Link from 'next/link';
import { motion, MotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

type AsType = 'div' | 'button' | 'a';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  as?: AsType;
  href?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  glow?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  onClick,
  as = 'div',
  href,
  disabled,
  type = 'button',
  glow = false,
}) => {
  const baseClasses = cn(
    'bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl',
    'transition-all duration-300',
    glow && 'shadow-lg shadow-green-500/10',
    disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
    className
  );

  const motionProps: MotionProps = {
    whileHover: disabled ? {} : { scale: 1.02, boxShadow: '0 8px 32px rgba(127, 176, 105, 0.15)' },
    whileTap: disabled ? {} : { scale: 0.98 },
    transition: { type: 'spring', stiffness: 400, damping: 25 },
  };

  if (href) {
    return (
      <motion.div {...motionProps} className="contents">
        <Link href={href} className={baseClasses} onClick={onClick}>
          {children}
        </Link>
      </motion.div>
    );
  }

  if (as === 'button') {
    return (
      <motion.button
        {...(motionProps as MotionProps)}
        type={type}
        className={baseClasses}
        onClick={onClick}
        disabled={disabled}
      >
        {children}
      </motion.button>
    );
  }

  return (
    <motion.div {...motionProps} className={baseClasses} onClick={onClick}>
      {children}
    </motion.div>
  );
};

export default GlassCard;
