// Diving Ecology Education Frosta
// Hook: useAuth
// Manages authentication state for Diving Ecology Education Frosta members.
// Returns null values when in demo mode (VITE_DEMO_MODE=true).

import { useState, useEffect } from 'react';
import { supabase, isDemoMode } from '../lib/supabase';
import type { User, Session } from '../lib/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

/**
 * useAuth — authentication hook for Diving Ecology Education Frosta.
 *
 * In demo mode (VITE_DEMO_MODE=true): returns { user: null, session: null, loading: false, error: null }.
 * In live mode (VITE_DEMO_MODE=false): listens to Supabase auth state changes.
 */
export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: !isDemoMode(),
    error: null,
  });

  useEffect(() => {
    // Demo mode: skip Supabase entirely
    if (isDemoMode()) {
      setState({ user: null, session: null, loading: false, error: null });
      return;
    }

    if (!supabase) {
      setState(prev => ({ ...prev, loading: false, error: 'Supabase not configured' }));
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        setState({ user: null, session: null, loading: false, error: error.message });
      } else {
        setState({ user: session?.user ?? null, session, loading: false, error: null });
      }
    });

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ user: session?.user ?? null, session, loading: false, error: null });
    });

    return () => subscription.unsubscribe();
  }, []);

  return state;
}
