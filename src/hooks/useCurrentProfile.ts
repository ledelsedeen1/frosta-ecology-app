// Diving Ecology Education Frosta
// Hook: useCurrentProfile
// Fetches the current authenticated user's profile from Supabase.
// Returns null in demo mode (VITE_DEMO_MODE=true).

import { useState, useEffect } from 'react';
import { supabase, isDemoMode } from '../lib/supabase';

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  preferred_language: 'no' | 'en' | 'pl' | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface UseCurrentProfileResult {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * useCurrentProfile — fetches authenticated user profile for Diving Ecology Education Frosta.
 *
 * In demo mode (VITE_DEMO_MODE=true): returns { profile: null, loading: false, error: null }.
 * In live mode: fetches from Supabase profiles table.
 */
export function useCurrentProfile(userId: string | null): UseCurrentProfileResult {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = () => setRefreshKey(k => k + 1);

  useEffect(() => {
    // Demo mode: skip Supabase entirely
    if (isDemoMode()) {
      setProfile(null);
      setLoading(false);
      setError(null);
      return;
    }

    if (!userId || !supabase) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
      .then(({ data, error: err }) => {
        if (err) {
          setError(err.message);
          setProfile(null);
        } else {
          setProfile(data as Profile);
        }
        setLoading(false);
      });
  }, [userId, refreshKey]);

  return { profile, loading, error, refetch };
}
