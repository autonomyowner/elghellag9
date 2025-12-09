import { supabase } from './supabase/supabaseClient'
import { Equipment, LandListing, Category, Profile, Message, Favorite, Review } from '@/types/database.types'

// Equipment Service
export const equipmentService = {
  // Get all equipment with optional filters
  async getAll(filters?: {
    category_id?: string
    condition?: string
    location?: string
    minPrice?: number
    maxPrice?: number
    brand?: string
    year?: number
  }) {
    let query = supabase
      .from('equipment')
      .select('*, profiles(full_name, avatar_url)')
      .eq('is_available', true)
      .order('created_at', { ascending: false })

    if (filters?.category_id) {
      query = query.eq('category_id', filters.category_id)
    }
    if (filters?.condition) {
      query = query.eq('condition', filters.condition)
    }
    if (filters?.location) {
      query = query.ilike('location', `%${filters.location}%`)
    }
    if (filters?.minPrice) {
      query = query.gte('price', filters.minPrice)
    }
    if (filters?.maxPrice) {
      query = query.lte('price', filters.maxPrice)
    }
    if (filters?.brand) {
      query = query.ilike('brand', `%${filters.brand}%`)
    }
    if (filters?.year) {
      query = query.eq('year', filters.year)
    }

    const { data, error } = await query
    return { data, error }
  },

  // Get equipment by ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('equipment')
      .select('*, profiles(full_name, avatar_url, phone)')
      .eq('id', id)
      .single()
    return { data, error }
  },

  // Get user's equipment
  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Add new equipment
  async add(equipment: Omit<Equipment, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('equipment')
      .insert([equipment])
      .select()
      .single()
    return { data, error }
  },

  // Update equipment
  async update(id: string, updates: Partial<Equipment>) {
    const { data, error } = await supabase
      .from('equipment')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  // Delete equipment
  async delete(id: string) {
    const { error } = await supabase
      .from('equipment')
      .delete()
      .eq('id', id)
    return { error }
  },

  // Search equipment
  async search(searchTerm: string) {
    const { data, error } = await supabase
      .from('equipment')
      .select('*, profiles(full_name, avatar_url)')
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%`)
      .eq('is_available', true)
      .order('created_at', { ascending: false })
    return { data, error }
  }
}

// Land Listings Service
export const landService = {
  // Get all land listings with optional filters
  async getAll(filters?: {
    listing_type?: string
    location?: string
    minArea?: number
    maxArea?: number
    minPrice?: number
    maxPrice?: number
    soil_type?: string
  }) {
    let query = supabase
      .from('land_listings')
      .select('*, profiles(full_name, avatar_url)')
      .eq('is_available', true)
      .order('created_at', { ascending: false })

    if (filters?.listing_type) {
      query = query.eq('listing_type', filters.listing_type)
    }
    if (filters?.location) {
      query = query.ilike('location', `%${filters.location}%`)
    }
    if (filters?.minArea) {
      query = query.gte('area_size', filters.minArea)
    }
    if (filters?.maxArea) {
      query = query.lte('area_size', filters.maxArea)
    }
    if (filters?.minPrice) {
      query = query.gte('price', filters.minPrice)
    }
    if (filters?.maxPrice) {
      query = query.lte('price', filters.maxPrice)
    }
    if (filters?.soil_type) {
      query = query.eq('soil_type', filters.soil_type)
    }

    const { data, error } = await query
    return { data, error }
  },

  // Get land listing by ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('land_listings')
      .select('*, profiles(full_name, avatar_url, phone)')
      .eq('id', id)
      .single()
    return { data, error }
  },

  // Get user's land listings
  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from('land_listings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Add new land listing
  async add(land: Omit<LandListing, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('land_listings')
      .insert([land])
      .select()
      .single()
    return { data, error }
  },

  // Update land listing
  async update(id: string, updates: Partial<LandListing>) {
    const { data, error } = await supabase
      .from('land_listings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  // Delete land listing
  async delete(id: string) {
    const { error } = await supabase
      .from('land_listings')
      .delete()
      .eq('id', id)
    return { error }
  },

  // Search land listings
  async search(searchTerm: string) {
    const { data, error } = await supabase
      .from('land_listings')
      .select('*, profiles(full_name, avatar_url)')
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`)
      .eq('is_available', true)
      .order('created_at', { ascending: false })
    return { data, error }
  }
}

// Categories Service
export const categoryService = {
  // Get all categories
  async getAll() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })
    return { data, error }
  },

  // Get category by ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  }
}

// Messages Service
export const messageService = {
  // Get conversations for a user
  async getConversations(userId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*, profiles!messages_sender_id_fkey(full_name, avatar_url)')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Get messages between two users
  async getMessages(userId1: string, userId2: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*, profiles!messages_sender_id_fkey(full_name, avatar_url)')
      .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`)
      .order('created_at', { ascending: true })
    return { data, error }
  },

  // Send a message
  async send(message: Omit<Message, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('messages')
      .insert([message])
      .select()
      .single()
    return { data, error }
  }
}

// Favorites Service
export const favoriteService = {
  // Get user's favorites
  async getUserFavorites(userId: string) {
    const { data, error } = await supabase
      .from('favorites')
      .select('*, equipment(*, profiles(full_name, avatar_url)), land_listings(*, profiles(full_name, avatar_url))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Add to favorites
  async add(favorite: Omit<Favorite, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('favorites')
      .insert([favorite])
      .select()
      .single()
    return { data, error }
  },

  // Remove from favorites
  async remove(userId: string, itemId: string, itemType: 'equipment' | 'land') {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('item_id', itemId)
      .eq('item_type', itemType)
    return { error }
  },

  // Check if item is favorited
  async isFavorited(userId: string, itemId: string, itemType: 'equipment' | 'land') {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('item_id', itemId)
      .eq('item_type', itemType)
      .single()
    return { isFavorited: !!data, error }
  }
}

// Reviews Service
export const reviewService = {
  // Get reviews for an item
  async getItemReviews(itemId: string, itemType: 'equipment' | 'land') {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, profiles(full_name, avatar_url)')
      .eq('item_id', itemId)
      .eq('item_type', itemType)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Add a review
  async add(review: Omit<Review, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('reviews')
      .insert([review])
      .select()
      .single()
    return { data, error }
  },

  // Update a review
  async update(id: string, updates: Partial<Review>) {
    const { data, error } = await supabase
      .from('reviews')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  // Delete a review
  async delete(id: string) {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id)
    return { error }
  }
}

// File Upload Service
export const fileService = {
  // Upload image to storage
  async uploadImage(file: File, bucket: string, path: string) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file)
    return { data, error }
  },

  // Get public URL for file
  getPublicUrl(bucket: string, path: string) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)
    return data.publicUrl
  },

  // Delete file from storage
  async deleteFile(bucket: string, path: string) {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])
    return { error }
  }
}

// Statistics Service
export const statsService = {
  // Get user statistics - parallelized for performance
  async getUserStats(userId: string) {
    // Run all queries in parallel instead of sequentially
    const [equipmentResult, landResult, favoritesResult] = await Promise.all([
      supabase.from('equipment').select('view_count').eq('user_id', userId),
      supabase.from('land_listings').select('view_count').eq('user_id', userId),
      supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', userId)
    ])

    const equipment = equipmentResult.data
    const landListings = landResult.data
    const favoritesCount = favoritesResult.count

    const totalViews = (equipment || []).reduce((sum, item) => sum + (item.view_count || 0), 0) +
                      (landListings || []).reduce((sum, item) => sum + (item.view_count || 0), 0)

    return {
      totalEquipment: equipment?.length || 0,
      totalLandListings: landListings?.length || 0,
      totalViews,
      totalFavorites: favoritesCount || 0,
      monthlyViews: 0, // TODO: Implement monthly tracking
      monthlyRevenue: 0 // TODO: Implement revenue tracking
    }
  }
}

// Search Service
export const searchService = {
  // Global search across equipment and land
  async globalSearch(searchTerm: string) {
    const [equipmentResults, landResults] = await Promise.all([
      equipmentService.search(searchTerm),
      landService.search(searchTerm)
    ])

    return {
      equipment: equipmentResults.data || [],
      land: landResults.data || [],
      error: equipmentResults.error || landResults.error
    }
  },

  // Get search suggestions
  async getSuggestions(searchTerm: string) {
    const { data, error } = await supabase
      .from('equipment')
      .select('title, brand, location')
      .or(`title.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`)
      .limit(5)
    return { data, error }
  }
} 