import { supabase, isDemoMode } from '../lib/supabase';
import { Member, MemberType, MemberStatus, PaymentStatus } from '../types';

type DatabaseMemberType = 'regular' | 'family' | 'junior' | 'honorary' | 'supporting';
type DatabaseMemberStatus = 'active' | 'inactive' | 'suspended' | 'pending';

function toUiMemberType(value: DatabaseMemberType | null): MemberType {
  if (value === 'family') return 'family';
  if (value === 'junior') return 'youth';
  if (value === 'supporting' || value === 'honorary') return 'supporting';
  return 'individual';
}

function toDatabaseMemberType(value: MemberType | undefined): DatabaseMemberType {
  if (value === 'family') return 'family';
  if (value === 'youth') return 'junior';
  if (value === 'supporting') return 'supporting';
  return 'regular';
}

function toUiMemberStatus(value: DatabaseMemberStatus | null): MemberStatus {
  if (value === 'active') return 'active';
  if (value === 'inactive' || value === 'suspended') return 'inactive';
  return 'waiting_approval';
}

function toDatabaseMemberStatus(value: MemberStatus | undefined): DatabaseMemberStatus {
  if (value === 'active' || value === 'board' || value === 'volunteer' || value === 'supporting') {
    return 'active';
  }
  if (value === 'inactive' || value === 'former') return 'inactive';
  return 'pending';
}

function mapMember(row: any): Member {
  return {
    id: row.id,
    fullName: row.full_name || '',
    email: row.email || '',
    phone: row.phone || '',
    preferredLanguage: row.preferred_language || 'no',
    address: row.address || '',
    memberType: toUiMemberType(row.member_type),
    status: toUiMemberStatus(row.member_status),
    dateJoined: row.join_date || row.created_at,
    paymentStatus: 'unpaid' as PaymentStatus,
    lastPaymentDate: undefined,
    notes: row.notes || '',
    consentPrivacy: row.consent_privacy || false,
    consentPhoto: row.consent_photo || false,
    emergencyContactName: row.emergency_contact_name || '',
    emergencyContactPhone: row.emergency_contact_phone || '',
    activityHistory: [],
  };
}

export const membersService = {
  async getAll(): Promise<{ data: Member[] | null, error: string | null }> {
    if (isDemoMode() || !supabase) return { data: null, error: 'DEMO_MODE' };

    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('member_number', { ascending: true });
      if (error) return { data: null, error: error.message };
      return { data: (data || []).map(mapMember), error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  async getById(id: string): Promise<{ data: Member | null, error: string | null }> {
    if (isDemoMode() || !supabase) return { data: null, error: 'DEMO_MODE' };
    const { data, error } = await supabase.from('members').select('*').eq('id', id).single();
    if (error) return { data: null, error: error.message };
    return { data: data ? mapMember(data) : null, error: null };
  },

  async create(payload: Partial<Member>) {
    if (isDemoMode() || !supabase) return { data: null, error: 'DEMO_MODE' };

    const { data: memberNumber, error: numberError } = await supabase.rpc('next_member_number');
    if (numberError || !memberNumber) {
      return { data: null, error: numberError?.message || 'Could not generate member number' };
    }

    const dbPayload = {
      member_number: memberNumber,
      full_name: payload.fullName,
      email: payload.email,
      phone: payload.phone || null,
      address: payload.address || null,
      preferred_language: payload.preferredLanguage || 'no',
      member_type: toDatabaseMemberType(payload.memberType),
      member_status: toDatabaseMemberStatus(payload.status),
      join_date: payload.dateJoined || new Date().toISOString().split('T')[0],
      consent_privacy: payload.consentPrivacy || false,
      consent_photo: payload.consentPhoto || false,
      emergency_contact_name: payload.emergencyContactName || null,
      emergency_contact_phone: payload.emergencyContactPhone || null,
      notes: payload.notes || null,
    };

    const { data, error } = await supabase.from('members').insert(dbPayload).select().single();
    if (error) return { data: null, error: error.message };
    return { data: mapMember(data), error: null };
  },

  async update(id: string, payload: Partial<Member>) {
    if (isDemoMode() || !supabase) return { data: null, error: 'DEMO_MODE' };

    const dbPayload: Record<string, unknown> = {};
    if (payload.fullName !== undefined) dbPayload.full_name = payload.fullName;
    if (payload.email !== undefined) dbPayload.email = payload.email;
    if (payload.phone !== undefined) dbPayload.phone = payload.phone;
    if (payload.address !== undefined) dbPayload.address = payload.address;
    if (payload.preferredLanguage !== undefined) dbPayload.preferred_language = payload.preferredLanguage;
    if (payload.memberType !== undefined) dbPayload.member_type = toDatabaseMemberType(payload.memberType);
    if (payload.status !== undefined) dbPayload.member_status = toDatabaseMemberStatus(payload.status);
    if (payload.consentPrivacy !== undefined) dbPayload.consent_privacy = payload.consentPrivacy;
    if (payload.consentPhoto !== undefined) dbPayload.consent_photo = payload.consentPhoto;
    if (payload.emergencyContactName !== undefined) {
      dbPayload.emergency_contact_name = payload.emergencyContactName;
    }
    if (payload.emergencyContactPhone !== undefined) {
      dbPayload.emergency_contact_phone = payload.emergencyContactPhone;
    }
    if (payload.notes !== undefined) dbPayload.notes = payload.notes;

    const { data, error } = await supabase
      .from('members')
      .update(dbPayload)
      .eq('id', id)
      .select()
      .single();
    if (error) return { data: null, error: error.message };
    return { data: mapMember(data), error: null };
  },

  async delete(id: string) {
    if (isDemoMode() || !supabase) return { data: null, error: 'DEMO_MODE' };
    return supabase.from('members').delete().eq('id', id);
  },
};
