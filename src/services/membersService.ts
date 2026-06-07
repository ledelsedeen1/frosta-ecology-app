import { supabase, isDemoMode } from '../lib/supabaseClient';
import { Member, MemberType, MemberStatus, PaymentStatus } from '../types';

export const membersService = {
  async getAll(): Promise<{ data: Member[] | null, error: string | null }> {
    if (isDemoMode || !supabase) return { data: null, error: 'DEMO_MODE' };
    
    try {
      const { data, error } = await supabase.from('members').select('*').order('created_at', { ascending: false });
      if (error) return { data: null, error: error.message };
      if (!data) return { data: [], error: null };

      // Map Supabase fields to the frontend expected Member interface
      const members: Member[] = data.map((row: any) => {
        let mappedStatus: MemberStatus = 'waiting_approval';
        if (row.membership_status === 'active') mappedStatus = 'active';
        if (row.membership_status === 'suspended') mappedStatus = 'inactive';
        if (row.membership_status === 'removed') mappedStatus = 'former';
        
        return {
          id: row.id,
          fullName: row.full_name || '',
          email: row.email || '',
          phone: row.phone || '',
          preferredLanguage: 'no', // Default
          address: row.address || '',
          memberType: (row.organization_role as MemberType) || 'individual',
          status: mappedStatus,
          dateJoined: row.joined_at || row.created_at,
          paymentStatus: 'unpaid' as PaymentStatus, // Will be linked to fees table later
          lastPaymentDate: undefined,
          notes: row.notes || '',
          consentPrivacy: row.gdpr_consent || false,
          consentPhoto: false, // Default mapping
          emergencyContactName: '', // Default until updated
          emergencyContactPhone: '', // Default until updated
          activityHistory: [] // Default until linked to activities/events
        };
      });

      return { data: members, error: null };
    } catch (e: any) {
      return { data: null, error: e.message };
    }
  },
  
  async getById(id: string) {
    if (isDemoMode || !supabase) return { data: null, error: 'DEMO_MODE' };
    return supabase.from('members').select('*').eq('id', id).single();
  },

  async create(payload: Partial<Member>) {
    if (isDemoMode || !supabase) return { data: null, error: 'DEMO_MODE' };
    
    let mappedDbStatus = 'pending';
    if (payload.status === 'active') mappedDbStatus = 'active';
    else if (payload.status === 'inactive') mappedDbStatus = 'suspended';
    else if (payload.status === 'former') mappedDbStatus = 'removed';
    
    const dbPayload = {
      full_name: payload.fullName,
      email: payload.email,
      phone: payload.phone || null,
      address: payload.address || null,
      membership_status: mappedDbStatus,
      organization_role: payload.memberType || 'individual',
      joined_at: payload.dateJoined || new Date().toISOString().split('T')[0],
      gdpr_consent: payload.consentPrivacy || false,
      notes: payload.notes || null,
      updated_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase.from('members').insert(dbPayload).select().single();
      if (error) return { data: null, error: error.message };
      return { data, error: null };
    } catch (e: any) {
      return { data: null, error: e.message };
    }
  },

  async update(id: string, payload: Partial<Member>) {
    if (isDemoMode || !supabase) return { data: null, error: 'DEMO_MODE' };
    
    const dbPayload: any = {
      updated_at: new Date().toISOString()
    };
    
    if (payload.fullName !== undefined) dbPayload.full_name = payload.fullName;
    if (payload.email !== undefined) dbPayload.email = payload.email;
    if (payload.phone !== undefined) dbPayload.phone = payload.phone;
    if (payload.address !== undefined) dbPayload.address = payload.address;
    if (payload.status !== undefined) {
      if (payload.status === 'active') dbPayload.membership_status = 'active';
      else if (payload.status === 'inactive') dbPayload.membership_status = 'suspended';
      else if (payload.status === 'former') dbPayload.membership_status = 'removed';
      else dbPayload.membership_status = 'pending';
    }
    if (payload.memberType !== undefined) dbPayload.organization_role = payload.memberType;
    if (payload.consentPrivacy !== undefined) dbPayload.gdpr_consent = payload.consentPrivacy;
    if (payload.notes !== undefined) dbPayload.notes = payload.notes;

    try {
      const { data, error } = await supabase.from('members').update(dbPayload).eq('id', id).select().single();
      if (error) return { data: null, error: error.message };
      return { data, error: null };
    } catch (e: any) {
      return { data: null, error: e.message };
    }
  },

  async delete(id: string) {
    if (isDemoMode || !supabase) return { data: null, error: 'DEMO_MODE' };
    return supabase.from('members').delete().eq('id', id);
  }
};
