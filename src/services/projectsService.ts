import { supabase, isDemoMode } from '../lib/supabaseClient';

export const projectsService = {
  async getAll() {
    if (isDemoMode || !supabase) return { data: null, error: 'DEMO_MODE' };
    return supabase.from('projects').select('*');
  },
  
  async getById(id: string) {
    if (isDemoMode || !supabase) return { data: null, error: 'DEMO_MODE' };
    return supabase.from('projects').select('*').eq('id', id).single();
  },

  async create(payload: any) {
    if (isDemoMode || !supabase) return { data: null, error: 'DEMO_MODE' };
    return supabase.from('projects').insert(payload);
  },

  async update(id: string, payload: any) {
    if (isDemoMode || !supabase) return { data: null, error: 'DEMO_MODE' };
    return supabase.from('projects').update(payload).eq('id', id);
  },

  async delete(id: string) {
    if (isDemoMode || !supabase) return { data: null, error: 'DEMO_MODE' };
    return supabase.from('projects').delete().eq('id', id);
  }
};
