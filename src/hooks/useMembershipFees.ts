import { useState, useEffect } from 'react';
import { supabase, isDemoMode } from '../lib/supabase';

export interface MembershipFee {
  id: string;
  member_id: string;
  year: number;
  /** Amount in NOK. Standard 2026 = 350.00 */
  amount_nok: number;
  currency: 'NOK';
  payment_status: 'unpaid' | 'pending_confirmation' | 'confirmed' | 'waived';
  payment_date: string | null;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface UseMembershipFeesResult {
  fees: MembershipFee[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useMembershipFees(memberId?: string): UseMembershipFeesResult {
  const [fees, setFees] = useState<MembershipFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFees = async () => {
    if (isDemoMode()) {
      setFees([]);
      setLoading(false);
      return;
    }

    if (!memberId) {
      setFees([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('membership_fees')
        .select('*')
        .eq('member_id', memberId)
        .order('year', { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
        setFees([]);
      } else {
        setFees((data as MembershipFee[]) ?? []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setFees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberId]);

  return { fees, loading, error, refetch: fetchFees };
}

export interface UseAllMembershipFeesResult {
  fees: MembershipFee[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAllMembershipFees(year?: number): UseAllMembershipFeesResult {
  const [fees, setFees] = useState<MembershipFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFees = async () => {
    if (isDemoMode()) {
      setFees([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let query = supabase.from('membership_fees').select('*').order('year', { ascending: false });

      if (year !== undefined) {
        query = query.eq('year', year);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        setError(fetchError.message);
        setFees([]);
      } else {
        setFees((data as MembershipFee[]) ?? []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setFees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  return { fees, loading, error, refetch: fetchFees };
}
