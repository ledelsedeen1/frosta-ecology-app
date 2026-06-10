import { supabase, isDemoMode } from '../lib/supabase';

export interface MembershipFee {
  id: string;
  memberId: string;
  year: number;
  amount: number;
  paidAmount: number;
  status: 'paid' | 'unpaid' | 'partially_paid' | 'exempt';
  paidAt: string | null;
  paymentMethod: string | null;
  adminComment: string | null;
  createdAt: string;
  updatedAt: string;
}

type DatabasePaymentStatus = 'unpaid' | 'pending_confirmation' | 'confirmed' | 'waived';

function toUiStatus(status: DatabasePaymentStatus): MembershipFee['status'] {
  if (status === 'confirmed') return 'paid';
  if (status === 'waived') return 'exempt';
  if (status === 'pending_confirmation') return 'partially_paid';
  return 'unpaid';
}

function toDatabaseStatus(status: MembershipFee['status'] | undefined): DatabasePaymentStatus {
  if (status === 'paid') return 'confirmed';
  if (status === 'exempt') return 'waived';
  if (status === 'partially_paid') return 'pending_confirmation';
  return 'unpaid';
}

function mapFee(row: any): MembershipFee {
  const amount = Number(row.amount_nok || 0);
  return {
    id: row.id,
    memberId: row.member_id,
    year: Number(row.year),
    amount,
    paidAmount: row.payment_status === 'confirmed' ? amount : 0,
    status: toUiStatus(row.payment_status),
    paidAt: row.payment_date,
    paymentMethod: row.payment_method,
    adminComment: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const feesService = {
  async getAll(): Promise<{ data: MembershipFee[] | null, error: string | null }> {
    if (isDemoMode() || !supabase) return { data: null, error: 'DEMO_MODE' };
    const { data, error } = await supabase
      .from('membership_fees')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return { data: null, error: error.message };
    return { data: (data || []).map(mapFee), error: null };
  },

  async getById(id: string): Promise<{ data: MembershipFee | null, error: string | null }> {
    if (isDemoMode() || !supabase) return { data: null, error: 'DEMO_MODE' };
    const { data, error } = await supabase.from('membership_fees').select('*').eq('id', id).single();
    if (error) return { data: null, error: error.message };
    return { data: data ? mapFee(data) : null, error: null };
  },

  async getByMemberId(memberId: string): Promise<{ data: MembershipFee[] | null, error: string | null }> {
    if (isDemoMode() || !supabase) return { data: null, error: 'DEMO_MODE' };
    const { data, error } = await supabase
      .from('membership_fees')
      .select('*')
      .eq('member_id', memberId)
      .order('year', { ascending: false });
    if (error) return { data: null, error: error.message };
    return { data: (data || []).map(mapFee), error: null };
  },

  async create(payload: Partial<MembershipFee>): Promise<{ data: MembershipFee | null, error: string | null }> {
    if (isDemoMode() || !supabase) return { data: null, error: 'DEMO_MODE' };
    const dbPayload = {
      member_id: payload.memberId,
      year: payload.year,
      amount_nok: payload.amount ?? 350,
      currency: 'NOK',
      payment_status: toDatabaseStatus(payload.status),
      payment_date: payload.paidAt || null,
      payment_method: payload.paymentMethod || null,
      notes: payload.adminComment || null,
    };
    const { data, error } = await supabase.from('membership_fees').insert(dbPayload).select().single();
    if (error) return { data: null, error: error.message };
    return { data: mapFee(data), error: null };
  },

  async update(id: string, payload: Partial<MembershipFee>): Promise<{ data: MembershipFee | null, error: string | null }> {
    if (isDemoMode() || !supabase) return { data: null, error: 'DEMO_MODE' };
    const dbPayload: Record<string, unknown> = {};
    if (payload.amount !== undefined) dbPayload.amount_nok = payload.amount;
    if (payload.status !== undefined) dbPayload.payment_status = toDatabaseStatus(payload.status);
    if (payload.paidAt !== undefined) dbPayload.payment_date = payload.paidAt;
    if (payload.paymentMethod !== undefined) dbPayload.payment_method = payload.paymentMethod;
    if (payload.adminComment !== undefined) dbPayload.notes = payload.adminComment;

    if (payload.status === 'paid' && payload.paidAt === undefined) {
      dbPayload.payment_date = new Date().toISOString().split('T')[0];
    }

    const { data, error } = await supabase
      .from('membership_fees')
      .update(dbPayload)
      .eq('id', id)
      .select()
      .single();
    if (error) return { data: null, error: error.message };
    return { data: mapFee(data), error: null };
  },

  async delete(id: string): Promise<{ data: any, error: string | null }> {
    if (isDemoMode() || !supabase) return { data: null, error: 'DEMO_MODE' };
    const { data, error } = await supabase.from('membership_fees').delete().eq('id', id);
    return { data, error: error?.message || null };
  },
};
