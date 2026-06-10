import { supabase, isDemoMode } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export interface UserSession {
  id: string;
  email: string;
  role: string;
  fullName: string;
}

function mapDatabaseRoles(roleNames: string[] | null): string {
  if (roleNames?.includes('administrator')) return 'admin';
  if (roleNames?.includes('board_member')) return 'board';
  if (roleNames?.includes('volunteer')) return 'volunteer';
  if (roleNames?.includes('member')) return 'member';
  return 'guest';
}

async function loadUserSession(user: User): Promise<UserSession> {
  const [{ data: profile }, { data: roleNames }] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single(),
    supabase.rpc('current_user_roles'),
  ]);

  return {
    id: user.id,
    email: user.email || '',
    role: mapDatabaseRoles(roleNames as string[] | null),
    fullName: profile?.full_name || user.user_metadata?.full_name || 'User',
  };
}

export const authService = {
  async login(email: string, password: string):Promise<{user: UserSession | null, error: string | null}> {
    if (isDemoMode()) {
      if (email === 'admin@frostadiving.no') {
        const user = { id: 'mem_admin', email, role: 'admin', fullName: 'Demo Admin' };
        localStorage.setItem('demo_user', JSON.stringify(user));
        return { user, error: null };
      }
      return { user: null, error: 'Demo mode: use admin@frostadiving.no' };
    }

    if (!supabase) return { user: null, error: 'Supabase unavailable' };

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { user: null, error: error.message };

    return { user: await loadUserSession(data.user), error: null };
  },

  async logout():Promise<void> {
    if (isDemoMode()) {
      localStorage.removeItem('demo_user');
      return;
    }
    if (supabase) await supabase.auth.signOut();
  },

  async getCurrentUser():Promise<UserSession | null> {
    if (isDemoMode()) {
      const stored = localStorage.getItem('demo_user');
      if (stored) {
        return JSON.parse(stored);
      }
      return null;
    }

    if (!supabase) return null;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    return loadUserSession(session.user);
  }
};
