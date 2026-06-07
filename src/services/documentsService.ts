import { supabase, isDemoMode } from '../lib/supabaseClient';

export interface SupabaseDocument {
  id: string;
  title: string;
  description: string | null;
  category: 'vedtekter' | 'minutes' | 'board_resolutions' | 'annual_reports' | 'budgets' | 'project_documents' | 'safety_documents' | 'gdpr_personvern' | 'other';
  language: 'nb' | 'pl' | 'en';
  visibility: 'public' | 'members' | 'board';
  fileUrl: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export const documentsService = {
  async getAll(): Promise<{ data: SupabaseDocument[] | null, error: string | null }> {
    if (isDemoMode || !supabase) return { data: null, error: 'DEMO_MODE' };
    try {
      const { data, error } = await supabase.from('documents').select('*').order('created_at', { ascending: false });
      if (error) return { data: null, error: error.message };
      if (!data) return { data: [], error: null };
      
      const docs: SupabaseDocument[] = data.map((row: any) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        category: row.category,
        language: row.language,
        visibility: row.visibility,
        fileUrl: row.file_url,
        createdBy: row.created_by,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
      return { data: docs, error: null };
    } catch (e: any) {
      return { data: null, error: e.message };
    }
  },
  
  async getById(id: string): Promise<{ data: SupabaseDocument | null, error: string | null }> {
    if (isDemoMode || !supabase) return { data: null, error: 'DEMO_MODE' };
    try {
      const { data, error } = await supabase.from('documents').select('*').eq('id', id).single();
      if (error) return { data: null, error: error.message };
      if (!data) return { data: null, error: null };
      
      return { data: {
        id: data.id,
        title: data.title,
        description: data.description,
        category: data.category,
        language: data.language,
        visibility: data.visibility,
        fileUrl: data.file_url,
        createdBy: data.created_by,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }, error: null };
    } catch (e: any) {
      return { data: null, error: e.message };
    }
  },

  async create(payload: Partial<SupabaseDocument>): Promise<{ data: any, error: string | null }> {
    if (isDemoMode || !supabase) return { data: null, error: 'DEMO_MODE' };
    const dbPayload = {
      title: payload.title,
      description: payload.description || null,
      category: payload.category || 'other',
      language: payload.language || 'nb',
      visibility: payload.visibility || 'public',
      file_url: payload.fileUrl || null,
      created_by: payload.createdBy || null,
      updated_at: new Date().toISOString()
    };
    try {
      const { data, error } = await supabase.from('documents').insert(dbPayload).select().single();
      if (error) return { data: null, error: error.message };
      return { data, error: null };
    } catch (e: any) {
      return { data: null, error: e.message };
    }
  },

  async update(id: string, payload: Partial<SupabaseDocument>): Promise<{ data: any, error: string | null }> {
    if (isDemoMode || !supabase) return { data: null, error: 'DEMO_MODE' };
    const dbPayload: any = { updated_at: new Date().toISOString() };
    if (payload.title !== undefined) dbPayload.title = payload.title;
    if (payload.description !== undefined) dbPayload.description = payload.description;
    if (payload.category !== undefined) dbPayload.category = payload.category;
    if (payload.language !== undefined) dbPayload.language = payload.language;
    if (payload.visibility !== undefined) dbPayload.visibility = payload.visibility;
    if (payload.fileUrl !== undefined) dbPayload.file_url = payload.fileUrl;
    
    try {
      const { data, error } = await supabase.from('documents').update(dbPayload).eq('id', id).select().single();
      if (error) return { data: null, error: error.message };
      return { data, error: null };
    } catch (e: any) {
      return { data: null, error: e.message };
    }
  },

  async delete(id: string): Promise<{ data: any, error: string | null }> {
    if (isDemoMode || !supabase) return { data: null, error: 'DEMO_MODE' };
    try {
      // Trying to delete. A safer approach would be archive if there is an `archived` column, but schema.sql might not have it. Let's delete.
      const { data, error } = await supabase.from('documents').delete().eq('id', id);
      if (error) return { data: null, error: error.message };
      return { data, error: null };
    } catch (e: any) {
      return { data: null, error: e.message };
    }
  }
};
