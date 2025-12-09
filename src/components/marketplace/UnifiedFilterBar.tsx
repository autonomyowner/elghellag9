'use client';

import React from 'react';

interface Category {
  id: string;
  label: string;
  count?: number;
}

interface SortOption {
  value: string;
  label: string;
}

interface UnifiedFilterBarProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
  sortOptions?: SortOption[];
  activeSort?: string;
  onSortChange?: (sortValue: string) => void;
  showViewToggle?: boolean;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
}

const UnifiedFilterBar: React.FC<UnifiedFilterBarProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
  sortOptions,
  activeSort,
  onSortChange,
  showViewToggle = false,
  viewMode = 'grid',
  onViewModeChange,
}) => {
  return (
    <div className="filter-bar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Category Pills */}
          <div className="filter-bar-scrollable flex-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`pill-category ${
                  activeCategory === category.id
                    ? 'pill-category-active'
                    : 'pill-category-inactive'
                }`}
              >
                {category.label}
                {category.count !== undefined && (
                  <span className="mr-1 opacity-70">({category.count})</span>
                )}
              </button>
            ))}
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Sort Dropdown */}
            {sortOptions && sortOptions.length > 0 && (
              <select
                value={activeSort}
                onChange={(e) => onSortChange?.(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-[#d4af37] cursor-pointer"
                dir="rtl"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}

            {/* View Toggle */}
            {showViewToggle && (
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => onViewModeChange?.('grid')}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white text-[#2d5016] shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  aria-label="Grid view"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="1" y="1" width="6" height="6" rx="1" />
                    <rect x="9" y="1" width="6" height="6" rx="1" />
                    <rect x="1" y="9" width="6" height="6" rx="1" />
                    <rect x="9" y="9" width="6" height="6" rx="1" />
                  </svg>
                </button>
                <button
                  onClick={() => onViewModeChange?.('list')}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white text-[#2d5016] shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  aria-label="List view"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="1" y="2" width="14" height="3" rx="1" />
                    <rect x="1" y="7" width="14" height="3" rx="1" />
                    <rect x="1" y="12" width="14" height="3" rx="1" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedFilterBar;
