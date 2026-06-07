// Diving Ecology Education Frosta
// Hook: useUserRoles
// Fetches roles assigned to a user in Diving Ecology Education Frosta.
// Returns empty array in demo mode (VITE_DEMO_MODE=true).

import { useState, useEffect } from 'react';
import { supabase, isDemoMode } from '../lib/supabase';

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  granted_at: string;
  granted_by: string | null;
  role: {
    id: string;
    name: string;
    description: string | null;
  };
}

interface UseUserRolesResult {
  roles: UserRole[];
  roleNames: string[];
  hasRole: (roleName: string) => boolean;
  loading: boolean;
  error: string | null;
}

/**
 * useUserRoles — fetches roles for a Diving Ecology Education Frosta member.
 *
 * In demo mode (VITE_DEMO_MODE=true): returns empty roles array.
 * In live mode: fetches from Supabase user_roles table with role join.
 */
export function useUserRoles(userId: string | null): UseUserRolesResult {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Demo mode: skip Supabase entirely
    if (isDemoMode()) {
      setRoles([]);
      setLoading(false);
      setError(null);
      return;
    }

    if (!userId || !supabase) {
      setRoles([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    supabase
      .from('user_roles')
      .select('*, role:roles(*)')
      .eq('user_id', userId)
      .then(({ data, error: err }) => {
        if (err) {
          setError(err.message);
          setRoles([]);
        } else {
          setRoles((data as UserRole[]) || []);
        }
        setLoading(false);
      });
  }, [userId]);

  const roleNames = roles.map(r => r.role?.name).filter(Boolean);
  const hasRole = (roleName: string) => roleNames.includes(roleName);

  return { roles, roleNames, hasRole, loading, error };
}
