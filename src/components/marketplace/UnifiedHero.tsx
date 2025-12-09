'use client';

import React, { useState, useCallback } from 'react';

interface UnifiedHeroProps {
  title: string;
  subtitle?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  onSearch?: (term: string) => void;
}

const UnifiedHero: React.FC<UnifiedHeroProps> = ({
  title,
  subtitle,
  showSearch = false,
  searchPlaceholder = 'ابحث...',
  onSearch,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchTerm);
  }, [searchTerm, onSearch]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    // Debounced search on type
    if (onSearch) {
      const timeoutId = setTimeout(() => onSearch(value), 300);
      return () => clearTimeout(timeoutId);
    }
  }, [onSearch]);

  return (
    <section className="hero-unified py-16 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-4xl mx-auto text-center">
        {/* Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}

        {/* Search Bar */}
        {showSearch && (
          <form onSubmit={handleSearch} className="max-w-xl mx-auto">
            <input
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              placeholder={searchPlaceholder}
              className="search-unified"
              dir="rtl"
            />
          </form>
        )}
      </div>
    </section>
  );
};

export default UnifiedHero;
