'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useUser, useAuth, useClerk } from '@clerk/nextjs';
import { apiClient } from '@/lib/api/client';

interface Profile {
  id: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  avatarUrl: string | null;
  userType: 'farmer' | 'buyer' | 'both';
  isVerified: boolean;
  bio: string | null;
  website: string | null;
  socialLinks: Record<string, string> | null;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: ReturnType<typeof useUser>['user'];
  profile: Profile | null;
  isLoading: boolean;
  isSignedIn: boolean;
  getToken: () => Promise<string | null>;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<Profile>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function ClerkAuthProvider({ children }: { children: ReactNode }) {
  const { user, isLoaded: userLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const { signOut: clerkSignOut } = useClerk();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!isSignedIn) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        setProfile(null);
        setIsLoading(false);
        return;
      }

      const profileData = await apiClient.getProfile(token) as Profile;
      setProfile(profileData);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, getToken]);

  useEffect(() => {
    if (userLoaded) {
      fetchProfile();
    }
  }, [userLoaded, isSignedIn, fetchProfile]);

  const refreshProfile = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(async (data: Partial<Profile>): Promise<Profile> => {
    const token = await getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const updatedProfile = await apiClient.updateProfile(token, data) as Profile;
    setProfile(updatedProfile);
    return updatedProfile;
  }, [getToken]);

  const signOut = useCallback(async () => {
    await clerkSignOut();
    setProfile(null);
  }, [clerkSignOut]);

  const getTokenWrapper = useCallback(async (): Promise<string | null> => {
    return getToken();
  }, [getToken]);

  const value: AuthContextType = {
    user: user ?? null,
    profile,
    isLoading: !userLoaded || isLoading,
    isSignedIn: isSignedIn ?? false,
    getToken: getTokenWrapper,
    refreshProfile,
    updateProfile,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within a ClerkAuthProvider');
  }
  return context;
}

export default AuthContext;
