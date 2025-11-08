import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Use environment variables if available, otherwise fallback to new project credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rcckdqrnzcdzbofiguxx.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjY2tkcXJuemNkemJvZmlndXh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MTQxMDQsImV4cCI6MjA3ODE5MDEwNH0.0BodGWKcwy4lI39xWoNHbbWW4YiILKeWjHlu6Vc0lBc';

// Singleton pattern to prevent multiple instances
let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient => {
  if (!supabaseInstance) {
    console.log('Creating new Supabase client instance...');
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        storageKey: 'elghella-auth',
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 5, // Reduced for better performance
        },
      },
      global: {
        headers: {
          'X-Client-Info': 'elghella-web',
        },
      },
      db: {
        schema: 'public',
      },
    });
    
    console.log('Supabase client initialized with URL:', supabaseUrl);
    console.log('Supabase client config:', {
      url: supabaseUrl,
      hasKey: !!supabaseAnonKey,
      keyLength: supabaseAnonKey?.length
    });
  }
  
  return supabaseInstance;
};

// Export the singleton instance
export const supabase = getSupabaseClient();

export default supabase; 