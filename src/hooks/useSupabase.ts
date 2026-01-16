'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext'
import { Equipment, LandListing, Category, Profile } from '@/types/database.types'
import { supabase } from '@/lib/supabase/supabaseClient'
import { withInsertTimeout, createProgressTracker } from '@/lib/supabase/timeoutWrapper'

// MAINTENANCE MODE - Set to true to use mock data instead of Supabase
const MAINTENANCE_MODE = true;

// Mock data for maintenance mode
const mockEquipment: Equipment[] = [
  {
    id: 'mock-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: 'mock-user',
    title: 'جرار زراعي حديث',
    description: 'جرار زراعي بحالة ممتازة، قوة 85 حصان، مناسب لجميع الأعمال الزراعية',
    price: 2500000,
    category_id: 'tractors',
    condition: 'excellent',
    location: 'الجزائر العاصمة',
    brand: 'John Deere',
    model: '5085M',
    year: 2022,
    images: [],
    is_available: true,
    view_count: 45,
  } as Equipment,
  {
    id: 'mock-2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: 'mock-user',
    title: 'حصادة قمح متطورة',
    description: 'حصادة قمح بتقنية حديثة، عرض القطع 6 متر',
    price: 8500000,
    category_id: 'harvesters',
    condition: 'good',
    location: 'سطيف',
    brand: 'CLAAS',
    model: 'LEXION 750',
    year: 2021,
    images: [],
    is_available: true,
    view_count: 32,
  } as Equipment,
  {
    id: 'mock-3',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: 'mock-user',
    title: 'محراث قلاب',
    description: 'محراث قلاب 4 أسلحة، مناسب للتربة الصلبة',
    price: 350000,
    category_id: 'plows',
    condition: 'excellent',
    location: 'تيارت',
    brand: 'Lemken',
    model: 'EurOpal 7',
    year: 2023,
    images: [],
    is_available: true,
    view_count: 18,
  } as Equipment,
];

const mockLandListings: LandListing[] = [
  {
    id: 'land-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: 'mock-user',
    title: 'أرض زراعية خصبة',
    description: 'أرض زراعية 10 هكتار، مسقية، صالحة لجميع الزراعات',
    price: 15000000,
    location: 'البليدة',
    area: 10,
    soil_type: 'طينية خصبة',
    water_source: 'بئر ارتوازي',
    images: [],
    is_available: true,
    view_count: 67,
  } as unknown as LandListing,
];

// Hook for user profile management
export function useProfile() {
  const { user, profile, updateProfile } = useSupabaseAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateUserProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: { message: 'No user logged in' } }
    
    setLoading(true)
    setError(null)
    
    try {
      const result = await updateProfile(updates as any)
      if (result.error) {
        setError(result.error.message)
      }
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      return { error: { message: errorMessage } }
    } finally {
      setLoading(false)
    }
  }

  return { 
    profile, 
    loading: loading || !user, 
    error, 
    updateUserProfile 
  }
}

// Hook for equipment management with Supabase
export function useEquipment() {
  const { user } = useSupabaseAuth();
  const [equipment, setEquipment] = useState<Equipment[]>(MAINTENANCE_MODE ? mockEquipment : []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchParams, setLastFetchParams] = useState<string>('');
  const [hasInitialized, setHasInitialized] = useState(MAINTENANCE_MODE);

  const fetchEquipment = useCallback(async (filters?: {
    category?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    condition?: string;
    search?: string;
  }) => {
    // MAINTENANCE MODE - Return mock data
    if (MAINTENANCE_MODE) {
      console.log('🔧 Maintenance mode - returning mock equipment data');
      setEquipment(mockEquipment);
      return mockEquipment;
    }

    try {
      // Create a cache key for the current filters
      const cacheKey = JSON.stringify(filters || {});

      console.log('🔄 fetchEquipment called with:', {
        loading,
        currentEquipmentCount: equipment.length,
        filters: filters || 'none',
        user: user?.id,
        hasInitialized
      });

      // Skip if we're already loading (but allow manual refresh)
      if (loading) {
        console.log('⏳ Skipping fetch - already loading');
        return equipment;
      }

      // For manual calls, always fetch fresh data
      const isManualCall = !filters || Object.keys(filters).length === 0;
      if (isManualCall) {
        console.log('🔄 Manual call detected - fetching fresh data');
      }

      // Allow fetching equipment even without user (public equipment)
      console.log('📡 Fetching equipment data from Supabase...');
      
      setLoading(true);
      setError(null);
      setLastFetchParams(cacheKey);

      let query = supabase
        .from('equipment')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20); // Reduced limit for better performance

      // Apply filters
      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category_id', filters.category);
      }
      if (filters?.location && filters.location !== 'جميع الولايات') {
        query = query.eq('location', filters.location);
      }
      if (filters?.minPrice) {
        query = query.gte('price', filters.minPrice);
      }
      if (filters?.maxPrice) {
        query = query.lte('price', filters.maxPrice);
      }
      if (filters?.condition) {
        query = query.eq('condition', filters.condition);
      }

      const { data, error: supabaseError } = await query;

      if (supabaseError) {
        console.error('❌ Supabase query error:', supabaseError);
        throw supabaseError;
      }

      console.log('✅ Supabase query successful:', { 
        dataCount: data?.length || 0, 
        user: user?.id,
        hasData: !!data 
      });

      let filteredData = data || [];

      // Apply search filter client-side for better performance
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter(item => 
          (item.title && item.title.toLowerCase().includes(searchLower)) ||
          (item.brand && item.brand.toLowerCase().includes(searchLower)) ||
          (item.model && item.model.toLowerCase().includes(searchLower)) ||
          (item.description && item.description.toLowerCase().includes(searchLower))
        );
      }

      console.log('📊 Final filtered data:', filteredData.length, 'items');
      setEquipment(filteredData);
      return filteredData;
    } catch (err) {
      console.error('❌ Error fetching equipment:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, [equipment.length, loading, user?.id, hasInitialized]);

  // Initialize data on mount
  useEffect(() => {
    const initializeData = async () => {
      console.log('🚀 Initializing equipment data...');
      setHasInitialized(true);
      
      // Try to fetch data with retry logic
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          const data = await fetchEquipment();
          if (data && data.length >= 0) {
            console.log('✅ Equipment data initialized successfully');
            break;
          }
          retryCount++;
        } catch (err) {
          console.error(`❌ Equipment initialization attempt ${retryCount + 1} failed:`, err);
          retryCount++;
          
          if (retryCount >= maxRetries) {
            console.error('❌ Failed to initialize equipment data after multiple attempts');
            setError('Failed to load equipment data after multiple attempts');
          } else {
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }
        }
      }
    };

    if (!hasInitialized) {
      initializeData();
    }
  }, [hasInitialized]); // Remove fetchEquipment from dependencies

  const addEquipment = async (equipmentData: Partial<Equipment>) => {
    if (!user) {
      throw new Error('User must be logged in to add equipment');
    }

    try {
      console.log('➕ Adding equipment:', equipmentData);
      
      const newEquipment = {
        ...equipmentData,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error: supabaseError } = await supabase
        .from('equipment')
        .insert([newEquipment])
        .select()
        .single();

      if (supabaseError) {
        console.error('❌ Error adding equipment:', supabaseError);
        throw supabaseError;
      }

      console.log('✅ Equipment added successfully:', data);

      // Force refresh by clearing the cache and refetching
      setLastFetchParams('');
      setEquipment([]); // Clear current data
      await fetchEquipment(); // Refetch fresh data
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error adding equipment';
      console.error('❌ Error in addEquipment:', err);
      setError(errorMessage);
      throw err;
    }
  };

  const updateEquipment = async (id: string, updates: Partial<Equipment>) => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('equipment')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (supabaseError) {
        throw supabaseError;
      }

      // Refresh the equipment list
      await fetchEquipment();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating equipment';
      setError(errorMessage);
      throw err;
    }
  };

  const deleteEquipment = async (id: string) => {
    try {
      const { error: supabaseError } = await supabase
        .from('equipment')
        .delete()
        .eq('id', id);

      if (supabaseError) {
        throw supabaseError;
      }

      // Refresh the equipment list
      await fetchEquipment();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error deleting equipment';
      setError(errorMessage);
      throw err;
    }
  };

  return {
    equipment,
    loading,
    error,
    fetchEquipment,
    addEquipment,
    updateEquipment,
    deleteEquipment,
  };
};

// Hook for user equipment management (for user's own equipment)
export function useUserEquipment() {
  const { user } = useSupabaseAuth();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserEquipment = async () => {
    if (!user) {
      setEquipment([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('equipment')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (supabaseError) {
        throw supabaseError;
      }

      setEquipment(data || []);
    } catch (err) {
      setError('Error loading user equipment');
      console.error('Error fetching user equipment:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteEquipment = async (id: string) => {
    try {
      const { error: supabaseError } = await supabase
        .from('equipment')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (supabaseError) {
        throw supabaseError;
      }

      await fetchUserEquipment();
      return { success: true };
    } catch (err) {
      setError('Error deleting equipment');
      throw err;
    }
  };

  const updateEquipment = async (id: string, updates: Partial<Equipment>) => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('equipment')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (supabaseError) {
        throw supabaseError;
      }

      await fetchUserEquipment();
      return data;
    } catch (err) {
      setError('Error updating equipment');
      throw err;
    }
  };

  useEffect(() => {
    fetchUserEquipment();
  }, [user]);

  return {
    equipment,
    loading,
    error,
    fetchUserEquipment,
    deleteEquipment,
    updateEquipment,
  };
}

// Hook for categories
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true)
        const categoriesRef = supabase.from('categories');
        const q = supabase.from('categories').select('*').order('sort_order', { ascending: true });
        const querySnapshot = await q.select();

        const data = querySnapshot.data as Category[];

        setCategories(data);
      } catch (err) {
        setError('حدث خطأ في تحميل الفئات')
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return { categories, loading, error }
}

// Hook for user statistics
export function useUserStats() {
  const { user } = useSupabaseAuth()
  const [stats, setStats] = useState({
    totalEquipment: 0,
    totalViews: 0,
    totalFavorites: 0,
    monthlyViews: 0,
    monthlyRevenue: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Get equipment count and views
        const equipmentRef = supabase.from('equipment');
        const q = supabase.from('equipment').select('*').eq('user_id', user.id);
        const querySnapshot = await q.select();

                 const equipmentData = querySnapshot.data || [];
         const totalViews = equipmentData.reduce((sum: any, item: any) => sum + (item.view_count || 0), 0);

        setStats({
          totalEquipment: equipmentData.length,
          totalViews,
          totalFavorites: 0, // TODO: Implement favorites system
          monthlyViews: 0, // TODO: Implement monthly tracking
          monthlyRevenue: 0 // TODO: Implement revenue tracking
        })
      } catch (err) {
        setError('حدث خطأ في تحميل الإحصائيات')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [user])

  return { stats, loading, error }
}

// Hook for user land listings
export function useUserLandListings() {
  const { user } = useSupabaseAuth()
  const [landListings, setLandListings] = useState<LandListing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUserLandListings = async () => {
    if (!user) {
      setLandListings([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const landRef = supabase.from('land_listings');
      const q = supabase.from('land_listings').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      const querySnapshot = await q.select();

      const data = querySnapshot.data as LandListing[];

      setLandListings(data);
    } catch (err) {
      setError('حدث خطأ في تحميل الأراضي')
    } finally {
      setLoading(false)
    }
  }

  const deleteLandListing = async (id: string) => {
    try {
      const landDoc = supabase.from('land_listings').delete().eq('id', id);
      const { error: supabaseError } = await landDoc;

      if (supabaseError) {
        throw supabaseError;
      }

      setLandListings(prev => prev.filter(item => item.id !== id))
      return { success: true }
    } catch (err) {
      setError('حدث خطأ في حذف الأرض')
      return { success: false }
    }
  }

  useEffect(() => {
    fetchUserLandListings()
  }, [user])

  return { 
    landListings, 
    loading, 
    error, 
    deleteLandListing, 
    refetch: fetchUserLandListings 
  }
}

// Comprehensive data management hook to replace useFirebase
export function useSupabaseData() {
  const { user } = useSupabaseAuth();
  const [isOnline, setIsOnline] = useState(true);

  // Check online status
  useEffect(() => {
    const checkOnline = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', checkOnline);
    window.addEventListener('offline', checkOnline);
    checkOnline();

    return () => {
      window.removeEventListener('online', checkOnline);
      window.removeEventListener('offline', checkOnline);
    };
  }, []);

  // Generic CRUD operations
  const createRecord = useCallback(async (table: string, data: any) => {
    // MAINTENANCE MODE - Return error
    if (MAINTENANCE_MODE) {
      throw new Error('الخدمة قيد الصيانة - Service under maintenance');
    }
    if (!user) throw new Error('User must be logged in');
    
    const progressTracker = createProgressTracker(`Creating ${table} record`);
    
    try {
      const recordData = {
        ...data,
        // Only add user_id if it's not already present
        user_id: data.user_id || user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log(`Starting ${table} insert...`);
      progressTracker.checkProgress();

      const { data: resultData, error } = await supabase
        .from(table)
        .insert([recordData])
        .select()
        .single();

      const elapsed = progressTracker.getElapsed();
      console.log(`${table} insert completed in ${elapsed}ms`);

      if (error) {
        console.error(`Supabase error creating ${table} record:`, error);
        console.error(`Error details:`, {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw new Error(`Failed to create ${table}: ${error.message || error.details || 'Unknown error'}`);
      }
      
      return resultData;
    } catch (error) {
      const elapsed = progressTracker.getElapsed();
      console.error(`Error creating ${table} record after ${elapsed}ms:`, error);
      console.error(`Full error object:`, JSON.stringify(error, null, 2));
      
      if (error instanceof Error) {
        throw new Error(`Error creating ${table} record: ${error.message}`);
      } else if (typeof error === 'object' && error !== null) {
        // Handle Supabase error objects
        const errorObj = error as any;
        const errorMessage = errorObj.message || errorObj.details || errorObj.hint || 'Unknown database error';
        throw new Error(`Error creating ${table} record: ${errorMessage}`);
      } else {
        throw new Error(`Error creating ${table} record: Unknown error`);
      }
    }
  }, [user]);

  const updateRecord = useCallback(async (table: string, id: string, updates: any) => {
    // MAINTENANCE MODE - Return error
    if (MAINTENANCE_MODE) {
      throw new Error('الخدمة قيد الصيانة - Service under maintenance');
    }
    if (!user) throw new Error('User must be logged in');
    
    try {
      console.log(`Updating ${table} record ${id} with:`, updates);
      
      const { data, error } = await supabase
        .from(table)
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Supabase error updating ${table} record:`, error);
        throw new Error(`Failed to update ${table}: ${error.message || 'Unknown error'}`);
      }
      
      console.log(`Successfully updated ${table} record:`, data);
      return data;
    } catch (error) {
      console.error(`Error updating ${table} record:`, error);
      if (error instanceof Error) {
        throw new Error(`Error updating ${table} record: ${error.message}`);
      } else {
        throw new Error(`Error updating ${table} record: Unknown error`);
      }
    }
  }, [user]);

  const deleteRecord = useCallback(async (table: string, id: string) => {
    // MAINTENANCE MODE - Return error
    if (MAINTENANCE_MODE) {
      throw new Error('الخدمة قيد الصيانة - Service under maintenance');
    }
    if (!user) throw new Error('User must be logged in');
    
    try {
      console.log(`Deleting ${table} record ${id}...`);
      
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Supabase error deleting ${table} record:`, error);
        throw new Error(`Failed to delete ${table}: ${error.message || 'Unknown error'}`);
      }
      
      console.log(`Successfully deleted ${table} record ${id}`);
      return { success: true };
    } catch (error) {
      console.error(`Error deleting ${table} record:`, error);
      if (error instanceof Error) {
        throw new Error(`Error deleting ${table} record: ${error.message}`);
      } else {
        throw new Error(`Error deleting ${table} record: Unknown error`);
      }
    }
  }, [user]);

  const fetchRecords = useCallback(async (table: string, filters?: any) => {
    // MAINTENANCE MODE - Return empty array
    if (MAINTENANCE_MODE) {
      console.log(`🔧 Maintenance mode - returning empty data for ${table}`);
      return [];
    }

    try {
      let query = supabase
        .from(table)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      // Apply filters
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== 'all') {
            if (key === 'minPrice') {
              query = query.gte('price', value as number);
            } else if (key === 'maxPrice') {
              query = query.lte('price', value as number);
            } else if (key === 'minArea') {
              query = query.gte('area_size', value as number);
            } else if (key === 'maxArea') {
              query = query.lte('area_size', value as number);
            } else {
              query = query.eq(key, value);
            }
          }
        });
      }

      const { data, error } = await query;
      if (error) throw error;

      let filteredData = data || [];

      // Apply search filter client-side
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter((item: any) => 
          (item.title && item.title.toLowerCase().includes(searchLower)) ||
          (item.description && item.description.toLowerCase().includes(searchLower)) ||
          (item.location && item.location.toLowerCase().includes(searchLower))
        );
      }

      return filteredData;
    } catch (error) {
      console.error(`Error fetching ${table} records:`, error);
      return [];
    }
  }, []);

  // Equipment operations
  const getEquipment = useCallback(async (filters?: any) => {
    return fetchRecords('equipment', filters);
  }, [fetchRecords]);

  const addEquipment = useCallback(async (equipmentData: any) => {
    return createRecord('equipment', equipmentData);
  }, [createRecord]);

  const updateEquipment = useCallback(async (id: string, updates: any) => {
    return updateRecord('equipment', id, updates);
  }, [updateRecord]);

  const deleteEquipment = useCallback(async (id: string) => {
    return deleteRecord('equipment', id);
  }, [deleteRecord]);

  // Animal operations
  const getAnimals = useCallback(async (filters?: any) => {
    return fetchRecords('animal_listings', filters);
  }, [fetchRecords]);

  const addAnimal = useCallback(async (animalData: any) => {
    return createRecord('animal_listings', animalData);
  }, [createRecord]);

  const updateAnimal = useCallback(async (id: string, updates: any) => {
    return updateRecord('animal_listings', id, updates);
  }, [updateRecord]);

  const deleteAnimal = useCallback(async (id: string) => {
    return deleteRecord('animal_listings', id);
  }, [deleteRecord]);

  // Land operations
  const getLand = useCallback(async (filters?: any) => {
    return fetchRecords('land_listings', filters);
  }, [fetchRecords]);

  const addLand = useCallback(async (landData: any) => {
    return createRecord('land_listings', landData);
  }, [createRecord]);

  const updateLand = useCallback(async (id: string, updates: any) => {
    return updateRecord('land_listings', id, updates);
  }, [updateRecord]);

  const deleteLand = useCallback(async (id: string) => {
    return deleteRecord('land_listings', id);
  }, [deleteRecord]);

  // Nurseries operations
  const getNurseries = useCallback(async (filters?: any) => {
    return fetchRecords('nurseries', filters);
  }, [fetchRecords]);

  const addNursery = useCallback(async (nurseryData: any) => {
    return createRecord('nurseries', nurseryData);
  }, [createRecord]);

  const updateNursery = useCallback(async (id: string, updates: any) => {
    return updateRecord('nurseries', id, updates);
  }, [updateRecord]);

  const deleteNursery = useCallback(async (id: string) => {
    return deleteRecord('nurseries', id);
  }, [deleteRecord]);

  // Vegetables operations
  const getVegetables = useCallback(async (filters?: any) => {
    return fetchRecords('vegetables', filters);
  }, [fetchRecords]);

  const addVegetable = useCallback(async (vegetableData: any) => {
    return createRecord('vegetables', vegetableData);
  }, [createRecord]);

  const updateVegetable = useCallback(async (id: string, updates: any) => {
    return updateRecord('vegetables', id, updates);
  }, [updateRecord]);

  const deleteVegetable = useCallback(async (id: string) => {
    return deleteRecord('vegetables', id);
  }, [deleteRecord]);

  // Labor operations
  const getLabor = useCallback(async (filters?: any) => {
    return fetchRecords('labor', filters);
  }, [fetchRecords]);

  const addLabor = useCallback(async (laborData: any) => {
    return createRecord('labor', laborData);
  }, [createRecord]);

  const updateLabor = useCallback(async (id: string, updates: any) => {
    return updateRecord('labor', id, updates);
  }, [updateRecord]);

  const deleteLabor = useCallback(async (id: string) => {
    return deleteRecord('labor', id);
  }, [deleteRecord]);

  // Analysis operations
  const getAnalysis = useCallback(async (filters?: any) => {
    return fetchRecords('analysis', filters);
  }, [fetchRecords]);

  const addAnalysis = useCallback(async (analysisData: any) => {
    return createRecord('analysis', analysisData);
  }, [createRecord]);

  const updateAnalysis = useCallback(async (id: string, updates: any) => {
    return updateRecord('analysis', id, updates);
  }, [updateRecord]);

  const deleteAnalysis = useCallback(async (id: string) => {
    return deleteRecord('analysis', id);
  }, [deleteRecord]);

  // Delivery operations
  const getDelivery = useCallback(async (filters?: any) => {
    return fetchRecords('delivery', filters);
  }, [fetchRecords]);

  const addDelivery = useCallback(async (deliveryData: any) => {
    return createRecord('delivery', deliveryData);
  }, [createRecord]);

  const updateDelivery = useCallback(async (id: string, updates: any) => {
    return updateRecord('delivery', id, updates);
  }, [updateRecord]);

  const deleteDelivery = useCallback(async (id: string) => {
    return deleteRecord('delivery', id);
  }, [deleteRecord]);

  // Profile operations
  const getProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }, []);

  const updateProfile = useCallback(async (userId: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }, []);

  // File upload
  const uploadFile = useCallback(async (file: File, path: string) => {
    try {
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size too large. Maximum 5MB allowed.');
      }

      const { data, error } = await supabase.storage
        .from('uploads')
        .upload(path, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(path);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }, []);

  // Search functionality
  const searchEquipment = useCallback(async (searchQuery: string) => {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        .limit(20);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching equipment:', error);
      return [];
    }
  }, []);

  // Categories
  const getCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }, []);

  // Messages
  const getMessages = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }, []);

  const sendMessage = useCallback(async (messageData: any) => {
    if (!user) throw new Error('User must be logged in');
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          ...messageData,
          sender_id: user.id,
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }, [user]);

  // Favorites (stored in localStorage for now)
  const getFavorites = useCallback(async (userId: string) => {
    try {
      const favorites = localStorage.getItem(`favorites_${userId}`);
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  }, []);

  const addFavorite = useCallback(async (userId: string, itemId: string, itemType: string) => {
    try {
      const favorites = await getFavorites(userId);
      const newFavorite = { id: itemId, type: itemType, added_at: new Date().toISOString() };
      favorites.push(newFavorite);
      localStorage.setItem(`favorites_${userId}`, JSON.stringify(favorites));
      return { success: true };
    } catch (error) {
      console.error('Error adding favorite:', error);
      throw error;
    }
  }, [getFavorites]);

  const removeFavorite = useCallback(async (userId: string, itemId: string) => {
    try {
      const favorites = await getFavorites(userId);
      const filteredFavorites = favorites.filter((fav: any) => fav.id !== itemId);
      localStorage.setItem(`favorites_${userId}`, JSON.stringify(filteredFavorites));
      return { success: true };
    } catch (error) {
      console.error('Error removing favorite:', error);
      throw error;
    }
  }, [getFavorites]);

  // Statistics
  const getStats = useCallback(async () => {
    try {
      const [equipment, animals, land, nurseries] = await Promise.all([
        getEquipment(),
        getAnimals(),
        getLand(),
        getNurseries(),
      ]);

      return {
        totalEquipment: equipment.length,
        totalAnimals: animals.length,
        totalLand: land.length,
        totalNurseries: nurseries.length,
        onlineStatus: isOnline,
        readCount: 0, // Not tracking in Supabase
        writeCount: 0, // Not tracking in Supabase
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return {
        totalEquipment: 0,
        totalAnimals: 0,
        totalLand: 0,
        totalNurseries: 0,
        onlineStatus: isOnline,
        readCount: 0,
        writeCount: 0,
      };
    }
  }, [getEquipment, getAnimals, getLand, getNurseries, isOnline]);

  return {
    // Equipment
    getEquipment,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    searchEquipment,
    
    // Animal
    getAnimals,
    addAnimal,
    updateAnimal,
    deleteAnimal,
    
    // Land
    getLand,
    addLand,
    updateLand,
    deleteLand,
    
    // Nurseries
    getNurseries,
    addNursery,
    updateNursery,
    deleteNursery,
    
    // Vegetables
    getVegetables,
    addVegetable,
    updateVegetable,
    deleteVegetable,
    
    // Labor
    getLabor,
    addLabor,
    updateLabor,
    deleteLabor,
    
    // Analysis
    getAnalysis,
    addAnalysis,
    updateAnalysis,
    deleteAnalysis,
    
    // Delivery
    getDelivery,
    addDelivery,
    updateDelivery,
    deleteDelivery,
    
    // Profiles
    getProfile,
    updateProfile,
    
    // Files
    uploadFile,
    
    // Categories
    getCategories,
    
    // Messages
    getMessages,
    sendMessage,
    
    // Favorites
    getFavorites,
    addFavorite,
    removeFavorite,
    
    // Stats
    getStats,
    
    // Status
    isOnline,
    isWithinLimits: true, // Supabase doesn't have the same limits as Firebase free plan
  };
}