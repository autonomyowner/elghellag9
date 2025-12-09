'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api/client';

export interface SearchResult {
  id: string;
  type: 'equipment' | 'land' | 'product' | 'nursery' | 'vegetable' | 'animal';
  title: string;
  description?: string;
  price?: number;
  currency?: string;
  location?: string;
  image?: string;
  category?: string;
  condition?: string;
  created_at: string;
  url: string;
}

interface SearchContextType {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  search: (query: string) => Promise<void>;
  clearSearch: () => void;
  recentSearches: string[];
  addRecentSearch: (term: string) => void;
  suggestions: string[];
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('elghella-recent-searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading recent searches:', error);
      }
    }
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearches = useCallback((searches: string[]) => {
    localStorage.setItem('elghella-recent-searches', JSON.stringify(searches));
  }, []);

  // Add recent search
  const addRecentSearch = useCallback((term: string) => {
    if (!term.trim()) return;

    const trimmedTerm = term.trim();
    const updated = [trimmedTerm, ...recentSearches.filter(s => s !== trimmedTerm)].slice(0, 10);
    setRecentSearches(updated);
    saveRecentSearches(updated);
  }, [recentSearches, saveRecentSearches]);

  // Generate search suggestions
  const generateSuggestions = useCallback((query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const commonTerms = [
      'جرار زراعي', 'محراث', 'حصادة', 'معدات ري', 'مضخة مياه',
      'أرض زراعية', 'مزرعة', 'حقل', 'بستان', 'حديقة',
      'طماطم', 'بطاطس', 'بصل', 'ثوم', 'خضروات',
      'فواكه', 'تفاح', 'برتقال', 'موز', 'عنب',
      'شتلات', 'أشجار', 'نخيل', 'زيتون', 'ليمون',
      'معدات', 'آلات', 'أدوات', 'مكائن', 'قطع غيار'
    ];

    const filtered = commonTerms.filter(term =>
      term.includes(query) || query.includes(term)
    ).slice(0, 8);

    setSuggestions(filtered);
  }, []);

  // Main search function using apiClient
  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    addRecentSearch(query);

    try {
      const searchResults: SearchResult[] = [];

      // Search in equipment
      try {
        const equipmentResponse = await apiClient.getEquipment({ search: query, limit: '10' }) as any;
        const equipmentData = equipmentResponse?.items || equipmentResponse || [];
        equipmentData.forEach((item: any) => {
          searchResults.push({
            id: item.id,
            type: 'equipment',
            title: item.title,
            description: item.description,
            price: item.price,
            currency: item.currency,
            location: item.location,
            image: item.images?.[0],
            category: item.category_id,
            condition: item.condition,
            created_at: item.created_at,
            url: `/equipment/${item.id}`
          });
        });
      } catch (err) {
        console.error('Equipment search error:', err);
      }

      // Search in land listings
      try {
        const landResponse = await apiClient.getLand({ search: query, limit: '10' }) as any;
        const landData = landResponse?.items || landResponse || [];
        landData.forEach((item: any) => {
          searchResults.push({
            id: item.id,
            type: 'land',
            title: item.title,
            description: item.description,
            price: item.price,
            currency: item.currency,
            location: item.location,
            image: item.images?.[0],
            category: 'أراضي زراعية',
            created_at: item.created_at,
            url: `/land/${item.id}`
          });
        });
      } catch (err) {
        console.error('Land search error:', err);
      }

      // Search in vegetables
      try {
        const vegetablesResponse = await apiClient.getVegetables({ search: query, limit: '10' }) as any;
        const vegetablesData = vegetablesResponse?.items || vegetablesResponse || [];
        vegetablesData.forEach((item: any) => {
          searchResults.push({
            id: item.id,
            type: 'vegetable',
            title: item.title,
            description: item.description,
            price: item.price,
            currency: item.currency,
            location: item.location,
            image: item.images?.[0],
            category: 'خضروات وفواكه',
            created_at: item.created_at,
            url: `/VAR/marketplace/${item.id}`
          });
        });
      } catch (err) {
        console.error('Vegetables search error:', err);
      }

      // Search in animals
      try {
        const animalsResponse = await apiClient.getAnimals({ search: query, limit: '10' }) as any;
        const animalsData = animalsResponse?.items || animalsResponse || [];
        animalsData.forEach((item: any) => {
          searchResults.push({
            id: item.id,
            type: 'animal',
            title: item.title,
            description: item.description,
            price: item.price,
            currency: item.currency,
            location: item.location,
            image: item.images?.[0],
            category: 'حيوانات',
            created_at: item.created_at,
            url: `/animals/${item.id}`
          });
        });
      } catch (err) {
        console.error('Animals search error:', err);
      }

      // Search in nurseries
      try {
        const nurseriesResponse = await apiClient.getNurseries({ search: query, limit: '10' }) as any;
        const nurseriesData = nurseriesResponse?.items || nurseriesResponse || [];
        nurseriesData.forEach((item: any) => {
          searchResults.push({
            id: item.id,
            type: 'nursery',
            title: item.title,
            description: item.description,
            price: item.price,
            currency: item.currency,
            location: item.location,
            image: item.images?.[0],
            category: 'مشاتل',
            created_at: item.created_at,
            url: `/nurseries/${item.id}`
          });
        });
      } catch (err) {
        console.error('Nurseries search error:', err);
      }

      // Sort results by relevance (exact matches first, then partial matches)
      const sortedResults = searchResults.sort((a, b) => {
        const aExact = a.title.toLowerCase().includes(query.toLowerCase()) ||
                      a.description?.toLowerCase().includes(query.toLowerCase());
        const bExact = b.title.toLowerCase().includes(query.toLowerCase()) ||
                      b.description?.toLowerCase().includes(query.toLowerCase());

        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setResults(sortedResults);
    } catch (error) {
      console.error('Search error:', error);
      setError('حدث خطأ أثناء البحث');
    } finally {
      setLoading(false);
    }
  }, [addRecentSearch]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setResults([]);
    setError(null);
    setSuggestions([]);
  }, []);

  // Update suggestions when search term changes
  useEffect(() => {
    generateSuggestions(searchTerm);
  }, [searchTerm, generateSuggestions]);

  const value = {
    searchTerm,
    setSearchTerm,
    results,
    loading,
    error,
    search,
    clearSearch,
    recentSearches,
    addRecentSearch,
    suggestions
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}
