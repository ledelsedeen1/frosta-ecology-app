// Diving Ecology Education Frosta
// Hook: useMembers
// Fetches members of Diving Ecology Education Frosta from Supabase.
// Member number format: YYYY-NNN
// Formal member number display: Diving Ecology Education Frosta YYYY-NNN
// Returns empty array in demo mode (VITE_DEMO_MODE=true).

import { useState, useEffect } from 'react';
import { supabase, isDemoMode } from '../lib/supabase';

export interface SupabaseMember {
  id: string;
  user_id: string | null;
  /** Format: YYYY-NNN (e.g. "2024-001") */
  member_number: string;
  /** Formal display: "Diving Ecology Education Frosta YYYY-NNN" */
  formal_member_number: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  member_type: 'regular' | 'family' | 'junior' | 'honorary' | 'supporting';
  member_status: 'active' | 'inactive' | 'suspended' | 'pending';
  join_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface UseMembers {
  members: SupabaseMember[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Format a member number for formal display.
 * Input: "2024-001"
 * Output: "Diving Ecology Education Frosta 2024-001"
 */
export function formalMemberNumber(memberNumber: string): string {
  return `Diving Ecology Education Frosta ${memberNumber}`;
}

/**
 * Validate member number format (YYYY-NNN).
 */
export function isValidMemberNumber(memberNumber: string): boolean {
  return /^[0-9]{4}-[0-9]{3}$/.test(memberNumber);
}

/**
 * useMembers — fetches all members for Diving Ecology Education Frosta.
 *
 * In demo mode (VITE_DEMO_MODE=true): returns empty array (demo data is handled by existing app).
 * In live mode: fetches from Supabase members table.
 */
export function useMembers(): UseMembers {
  const [members, setMembers] = useState<SupabaseMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = () => setRefreshKey(k => k + 1);

  useEffect(() => {
    // Demo mode: skip Supabase entirely — existing demo data remains in use
    if (isDemoMode()) {
      setMembers([]);
      setLoading(false);
      setError(null);
      return;
    }

    if (!supabase) {
      setLoading(false);
      setError('Supabase not configured for Diving Ecology Education Frosta');
      return;
    }

    setLoading(true);
    setError(null);

    supabase
      .from('members')
      .select('*')
      .order('member_number', { ascending: true })
      .then(({ data, error: err }) => {
        if (err) {
          setError(err.message);
          setMembers([]);
        } else {
          // Add formal_member_number computed field
          const membersWithFormal = (data || []).map(m => ({
            ...m,
            formal_member_number: formalMemberNumber(m.member_number),
          })) as SupabaseMember[];
          setMembers(membersWithFormal);
        }
        setLoading(false);
      });
  }, [refreshKey]);

  return { members, loading, error, refetch };
}
