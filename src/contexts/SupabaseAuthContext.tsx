'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/supabaseClient'
import { User, Session } from '@supabase/supabase-js'

export interface Profile {
  id: string
  created_at: string
  updated_at: string
  full_name: string | null
  phone: string | null
  location: string | null
  avatar_url: string | null
  user_type: 'farmer' | 'buyer' | 'both' | 'admin'
  is_verified: boolean
  bio: string | null
  website: string | null
  social_links: Record<string, any>
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (
    email: string,
    password: string,
    userData?: { full_name?: string; phone?: string; user_type?: string }
  ) => Promise<{ error: any; data?: { user?: User | null; session?: Session | null } }>
  signInWithGoogle: () => Promise<{ error: any }>
  signInWithFacebook: () => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>
  uploadAvatar: (file: File) => Promise<{ error: any; url?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch user profile with timeout and retry logic
  const fetchProfile = async (userId: string, retries = 3): Promise<boolean> => {
    try {
      console.log('Fetching profile for user:', userId)

      // Create a timeout promise (5 seconds)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      })

      // Race between fetch and timeout
      const { data, error } = await Promise.race([
        supabase
          .from('profiles')
          .select('id, created_at, updated_at, full_name, phone, location, avatar_url, user_type, is_verified, bio, website, social_links')
          .eq('id', userId)
          .single(),
        timeoutPromise
      ]) as any

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('Profile not found. The handle_new_user trigger should create it automatically.')

          // Wait a bit and retry (the trigger might be creating it)
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000))
            return fetchProfile(userId, retries - 1)
          }

          console.error('Profile still not found after retries. Please check database triggers.')
          return false
        } else {
          console.error('Error fetching profile:', error)
          return false
        }
      }

      if (data) {
        console.log('Profile fetched successfully:', data)
        setProfile(data)
        return true
      }

      return false
    } catch (error) {
      if (error instanceof Error && error.message === 'Profile fetch timeout') {
        console.error('Profile fetch timed out after 5 seconds')
      } else {
        console.error('Error in fetchProfile:', error)
      }
      return false
    }
  }

  // Initialize auth state
  useEffect(() => {
    // Get initial session with timeout
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          // Fetch profile with built-in timeout
          await fetchProfile(session.user.id)
          setLoading(false)
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error('Session fetch error:', error)
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Sign in
  const signIn = async (email: string, password: string) => {
    try {
      console.log('SupabaseAuthContext: Attempting sign in for email:', email)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      console.log('SupabaseAuthContext: Sign in response:', { data, error })
      
      if (error) {
        console.error('SupabaseAuthContext: Sign in error:', error)
        return { error }
      }
      
      if (data.user) {
        console.log('SupabaseAuthContext: User signed in successfully:', data.user.id)
        // Fetch profile after successful sign in
        await fetchProfile(data.user.id)
      }
      
      return { error: null }
    } catch (error) {
      console.error('SupabaseAuthContext: Unexpected error during sign in:', error)
      return { error }
    }
  }

  // Sign up
  const signUp = async (
    email: string,
    password: string,
    userData?: { full_name?: string; phone?: string; user_type?: string }
  ) => {
    try {
      console.log('Starting signup process...', { email, userData })
      
      // Create the user and pass profile metadata for DB trigger
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Send initial profile data to user metadata so a DB trigger can create the profile row
          data: {
            full_name: userData?.full_name || null,
            phone: userData?.phone || null,
            user_type: userData?.user_type || 'farmer',
          },
          // Redirect back to app after email confirmation if confirmations are enabled
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
        },
      })

      console.log('Signup response:', { data, error })

      if (error) {
        console.error('Supabase auth error:', error)
        return { error }
      }

      // If there is no session returned (email confirmations enabled),
      // skip client-side profile creation to avoid 401/RLS. A DB trigger
      // (handle_new_user) should create the profile after confirmation.
      if (!error && data?.user) {
        if (data.session) {
          // We are authenticated now; ensure profile exists
          console.log('Authenticated after sign up; ensuring profile exists for:', data.user.id)
          await fetchProfile(data.user.id)
        } else {
          console.log('No session after sign up (likely email confirmation enabled). Skipping client profile insert.')
        }
      }

      return { error: null, data }
    } catch (error) {
      console.error('Error in signUp:', error)
      return { error }
    }
  }

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      console.log('SupabaseAuthContext: Attempting Google sign in')
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      console.log('SupabaseAuthContext: Google sign in response:', { data, error })
      
      if (error) {
        console.error('SupabaseAuthContext: Google sign in error:', error)
        return { error }
      }
      
      return { error: null }
    } catch (error) {
      console.error('SupabaseAuthContext: Unexpected error during Google sign in:', error)
      return { error }
    }
  }

  // Sign in with Facebook
  const signInWithFacebook = async () => {
    try {
      console.log('SupabaseAuthContext: Attempting Facebook sign in')
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      console.log('SupabaseAuthContext: Facebook sign in response:', { data, error })
      
      if (error) {
        console.error('SupabaseAuthContext: Facebook sign in error:', error)
        return { error }
      }
      
      return { error: null }
    } catch (error) {
      console.error('SupabaseAuthContext: Unexpected error during Facebook sign in:', error)
      return { error }
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setProfile(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Update profile
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      return { error: { message: 'No user logged in' } }
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        return { error }
      }

      setProfile(data)
      return { error: null }
    } catch (error) {
      console.error('Error updating profile:', error)
      return { error }
    }
  }

  // Upload avatar
  const uploadAvatar = async (file: File) => {
    if (!user) {
      return { error: { message: 'No user logged in' } }
    }

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${user.id}-${Date.now()}.${fileExt}`

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          upsert: true
        })

      if (error) {
        return { error }
      }

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      // Update profile with new avatar URL
      await updateProfile({ avatar_url: urlData.publicUrl })

      return { error: null, url: urlData.publicUrl }
    } catch (error) {
      console.error('Error uploading avatar:', error)
      return { error }
    }
  }

  const value = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithFacebook,
    signOut,
    updateProfile,
    uploadAvatar
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useSupabaseAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider')
  }
  return context
}

export default AuthContext 
