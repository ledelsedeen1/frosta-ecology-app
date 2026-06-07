import { supabase, isDemoMode } from '../lib/supabaseClient';

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

export const feesService = {
  async getAll(): Promise<{ data: MembershipFee[] | null, error: string | null }> {
    if (isDemoMode || !supabase) return { data: null, error: 'DEMO_MODE' };
    try {
      const { data, error } = await supabase.from('membership_fees').select('*').order('created_at', { ascending: false });
      if (error) return { data: null, error: error.message };
      if (!data) return { data: [], error: null };
      
      const fees: MembershipFee[] = data.map((row: any) => ({
        id: row.id,
        memberId: row.member_id,
        year: row.year,
        amount: row.amount,
        paidAmount: row.paid_amount,
        status: row.status,
        paidAt: row.paid_at,
        paymentMethod: row.payment_method,
        adminComment: row.admin_comment,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
      return { data: fees, error: null };
    } catch (e: any) {
      return { data: null, error: e.message };
    }
  },
  
  async getById(id: string): Promise<{ data: MembershipFee | null, error: string | null }> {
    if (isDemoMode || !supabase) return { data: null, error: 'DEMO_MODE' };
    try {
      const { data, error } = await supabase.from('membership_fees').select('*').eq('id', id).single();
      if (error) return { data: null, error: error.message };
      if (!data) return { data: null, error: null };
      return { data: {
        id: data.id, memberId: data.member_id, year: data.year, amount: data.amount,
        paidAmount: data.paid_amount, status: data.status, paidAt: data.paid_at,
        paymentMethod: data.payment_method, adminComment: data.admin_comment,
        createdAt: data.created_at, updatedAt: data.updated_at
      }, error: null };
    } catch (e: any) {
      return { data: null, error: e.message };
    }
  },

  async getByMemberId(memberId: string): Promise<{ data: MembershipFee[] | null, error: string | null }> {
    if (isDemoMode || !supabase) return { data: null, error: 'DEMO_MODE' };
    try {
      const { data, error } = await supabase.from('membership_fees').select('*').eq('member_id', memberId).order('year', { ascending: false });
      if (error) return { data: null, error: error.message };
      if (!data) return { data: [], error: null };
      const fees = data.map((row: any) => ({
        id: row.id, memberId: row.member_id, year: row.year, amount: row.amount,
        paidAmount: row.paid_amount, status: row.status, paidAt: row.paid_at,
        paymentMethod: row.payment_method, adminComment: row.admin_comment,
        createdAt: row.created_at, updatedAt: row.updated_at
      }));
      return { data: fees, error: null };
    } catch (e: any) {
      return { data: null, error: e.message };
    }
  },

  async create(payload: Partial<MembershipFee>): Promise<{ data: any, error: string | null }> {
    if (isDemoMode || !supabase) return { data: null, error: 'DEMO_MODE' };
    const dbPayload = {
      member_id: payload.memberId,
      year: payload.year,
      amount: payload.amount,
      paid_amount: payload.paidAmount || 0,
      status: payload.status || 'unpaid',
      paid_at: payload.paidAt || null,
      payment_method: payload.paymentMethod || null,
      admin_comment: payload.adminComment || null,
      updated_at: new Date().toISOString()
    };
    try {
      const { data, error } = await supabase.from('membership_fees').insert(dbPayload).select().single();
      if (error) return { data: null, error: error.message };
      return { data, error: null };
    } catch (e: any) {
      return { data: null, error: e.message };
    }
  },

  async update(id: string, payload: Partial<MembershipFee>): Promise<{ data: any, error: string | null }> {
    if (isDemoMode || !supabase) return { data: null, error: 'DEMO_MODE' };
    const dbPayload: any = { updated_at: new Date().toISOString() };
    if (payload.amount !== undefined) dbPayload.amount = payload.amount;
    if (payload.paidAmount !== undefined) dbPayload.paid_amount = payload.paidAmount;
    if (payload.status !== undefined) dbPayload.status = payload.status;
    if (payload.paidAt !== undefined) dbPayload.paid_at = payload.paidAt;
    if (payload.paymentMethod !== undefined) dbPayload.payment_method = payload.paymentMethod;
    if (payload.adminComment !== undefined) dbPayload.admin_comment = payload.adminComment;
    
    try {
      const { data, error } = await supabase.from('membership_fees').update(dbPayload).eq('id', id).select().single();
      if (error) return { data: null, error: error.message };
      return { data, error: null };
    } catch (e: any) {
      return { data: null, error: e.message };
    }
  },

  async delete(id: string): Promise<{ data: any, error: string | null }> {
    // Or deactivate/cancel if safer. Let's stick with delete for now.
    if (isDemoMode || !supabase) return { data: null, error: 'DEMO_MODE' };
    try {
      const { data, error } = await supabase.from('membership_fees').delete().eq('id', id);
      if (error) return { data: null, error: error.message };
      return { data, error: null };
    } catch (e: any) {
      return { data: null, error: e.message };
    }
  }
};

