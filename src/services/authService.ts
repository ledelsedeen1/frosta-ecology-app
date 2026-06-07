import { supabase, isDemoMode } from '../lib/supabaseClient';

export interface UserSession {
  id: string;
  email: string;
  role: string;
  fullName: string;
}

export const authService = {
  async login(email: string, password: string):Promise<{user: UserSession | null, error: string | null}> {
    if (isDemoMode) {
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

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', data.user.id)
      .single();

    return {
      user: {
        id: data.user.id,
        email: data.user.email || '',
        role: profile?.role || 'guest',
        fullName: profile?.full_name || 'User'
      },
      error: null
    };
  },

  async logout():Promise<void> {
    if (isDemoMode) {
      localStorage.removeItem('demo_user');
      return;
    }
    if (supabase) await supabase.auth.signOut();
  },

  async getCurrentUser():Promise<UserSession | null> {
    if (isDemoMode) {
      const stored = localStorage.getItem('demo_user');
      if (stored) {
        return JSON.parse(stored);
      }
      return null;
    }

    if (!supabase) return null;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', session.user.id)
      .single();

    return {
      id: session.user.id,
      email: session.user.email || '',
      role: profile?.role || 'guest',
      fullName: profile?.full_name || 'User'
    };
  }
};
