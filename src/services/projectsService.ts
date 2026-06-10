import { supabase, isDemoMode } from '../lib/supabase';
import type { Project } from '../types';

function mapProject(row: any): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    status: row.status,
    responsiblePerson: row.responsible_person,
    budget: Number(row.budget_nok || 0),
    fundingSource: row.funding_source || '',
    sponsors: row.sponsors || [],
    documents: row.document_ids || [],
    tasks: row.tasks || [],
    deadlines: row.deadlines || [],
    volunteerList: row.volunteer_list || [],
    progressNotes: row.progress_notes || '',
    finalReport: row.final_report || undefined,
  };
}

function toDatabaseProject(payload: Partial<Project>) {
  const dbPayload: Record<string, unknown> = {};
  if (payload.name !== undefined) dbPayload.name = payload.name;
  if (payload.description !== undefined) dbPayload.description = payload.description;
  if (payload.status !== undefined) dbPayload.status = payload.status;
  if (payload.responsiblePerson !== undefined) dbPayload.responsible_person = payload.responsiblePerson;
  if (payload.budget !== undefined) dbPayload.budget_nok = payload.budget;
  if (payload.fundingSource !== undefined) dbPayload.funding_source = payload.fundingSource;
  if (payload.sponsors !== undefined) dbPayload.sponsors = payload.sponsors;
  if (payload.documents !== undefined) dbPayload.document_ids = payload.documents;
  if (payload.tasks !== undefined) dbPayload.tasks = payload.tasks;
  if (payload.deadlines !== undefined) dbPayload.deadlines = payload.deadlines;
  if (payload.volunteerList !== undefined) dbPayload.volunteer_list = payload.volunteerList;
  if (payload.progressNotes !== undefined) dbPayload.progress_notes = payload.progressNotes;
  if (payload.finalReport !== undefined) dbPayload.final_report = payload.finalReport;
  return dbPayload;
}

export const projectsService = {
  async getAll() {
    if (isDemoMode() || !supabase) return { data: null, error: 'DEMO_MODE' };
    const { data, error } = await supabase.from('projects').select('*').order('created_at');
    return { data: data?.map(mapProject) || null, error };
  },

  async getById(id: string) {
    if (isDemoMode() || !supabase) return { data: null, error: 'DEMO_MODE' };
    const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();
    return { data: data ? mapProject(data) : null, error };
  },

  async create(payload: Partial<Project>) {
    if (isDemoMode() || !supabase) return { data: null, error: 'DEMO_MODE' };
    const { data, error } = await supabase
      .from('projects')
      .insert(toDatabaseProject(payload))
      .select()
      .single();
    return { data: data ? mapProject(data) : null, error };
  },

  async update(id: string, payload: Partial<Project>) {
    if (isDemoMode() || !supabase) return { data: null, error: 'DEMO_MODE' };
    const { data, error } = await supabase
      .from('projects')
      .update(toDatabaseProject(payload))
      .eq('id', id)
      .select()
      .single();
    return { data: data ? mapProject(data) : null, error };
  },

  async delete(id: string) {
    if (isDemoMode() || !supabase) return { data: null, error: 'DEMO_MODE' };
    return supabase.from('projects').delete().eq('id', id);
  },
};
