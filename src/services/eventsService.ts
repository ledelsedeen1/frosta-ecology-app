import { supabase, isDemoMode } from '../lib/supabaseClient';

export interface SupabaseEvent {
  id: string;
  title: string;
  description: string | null;
  eventDate: string | null;
  startTime: string | null;
  endTime: string | null;
  location: string | null;
  eventType: 'cleanup' | 'training' | 'social' | 'meeting' | 'other';
  visibility: 'public' | 'members' | 'board';
  maxParticipants: number | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export const eventsService = {
  async getAll(): Promise<{ data: SupabaseEvent[] | null, error: string | null }> {
    if (isDemoMode || !supabase) return { data: null, error: 'DEMO_MODE' };
    try {
      const { data, error } = await supabase.from('events').select('*').order('event_date', { ascending: true });
      if (error) return { data: null, error: error.message };
      if (!data) return { data: [], error: null };
      
      const events: SupabaseEvent[] = data.map((row: any) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        eventDate: row.event_date,
        startTime: row.start_time,
        endTime: row.end_time,
        location: row.location,
        eventType: row.event_type,
        visibility: row.visibility,
        maxParticipants: row.max_participants,
        createdBy: row.created_by,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
      return { data: events, error: null };
    } catch (e: any) {
      return { data: null, error: e.message };
    }
  },
  
  async getById(id: string): Promise<{ data: SupabaseEvent | null, error: string | null }> {
    if (isDemoMode || !supabase) return { data: null, error: 'DEMO_MODE' };
    try {
      const { data, error } = await supabase.from('events').select('*').eq('id', id).single();
      if (error) return { data: null, error: error.message };
      if (!data) return { data: null, error: null };
      return { data: {
        id: data.id,
        title: data.title,
        description: data.description,
        eventDate: data.event_date,
        startTime: data.start_time,
        endTime: data.end_time,
        location: data.location,
        eventType: data.event_type,
        visibility: data.visibility,
        maxParticipants: data.max_participants,
        createdBy: data.created_by,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }, error: null };
    } catch (e: any) {
      return { data: null, error: e.message };
    }
  },

  async create(payload: Partial<SupabaseEvent>): Promise<{ data: any, error: string | null }> {
    if (isDemoMode || !supabase) return { data: null, error: 'DEMO_MODE' };
    const dbPayload = {
      title: payload.title,
      description: payload.description || null,
      event_date: payload.eventDate || null,
      start_time: payload.startTime || null,
      end_time: payload.endTime || null,
      location: payload.location || null,
      event_type: payload.eventType || 'other',
      visibility: payload.visibility || 'public',
      max_participants: payload.maxParticipants || null,
      created_by: payload.createdBy || null,
      updated_at: new Date().toISOString()
    };
    try {
      const { data, error } = await supabase.from('events').insert(dbPayload).select().single();
      if (error) return { data: null, error: error.message };
      return { data, error: null };
    } catch (e: any) {
      return { data: null, error: e.message };
    }
  },

  async update(id: string, payload: Partial<SupabaseEvent>): Promise<{ data: any, error: string | null }> {
    if (isDemoMode || !supabase) return { data: null, error: 'DEMO_MODE' };
    const dbPayload: any = { updated_at: new Date().toISOString() };
    if (payload.title !== undefined) dbPayload.title = payload.title;
    if (payload.description !== undefined) dbPayload.description = payload.description;
    if (payload.eventDate !== undefined) dbPayload.event_date = payload.eventDate;
    if (payload.startTime !== undefined) dbPayload.start_time = payload.startTime;
    if (payload.endTime !== undefined) dbPayload.end_time = payload.endTime;
    if (payload.location !== undefined) dbPayload.location = payload.location;
    if (payload.eventType !== undefined) dbPayload.event_type = payload.eventType;
    if (payload.visibility !== undefined) dbPayload.visibility = payload.visibility;
    if (payload.maxParticipants !== undefined) dbPayload.max_participants = payload.maxParticipants;
    
    try {
      const { data, error } = await supabase.from('events').update(dbPayload).eq('id', id).select().single();
      if (error) return { data: null, error: error.message };
      return { data, error: null };
    } catch (e: any) {
      return { data: null, error: e.message };
    }
  },

  async delete(id: string): Promise<{ data: any, error: string | null }> {
    if (isDemoMode || !supabase) return { data: null, error: 'DEMO_MODE' };
    try {
      const { data, error } = await supabase.from('events').delete().eq('id', id);
      if (error) return { data: null, error: error.message };
      return { data, error: null };
    } catch (e: any) {
      return { data: null, error: e.message };
    }
  }
};
