import { supabase, isDemoMode } from '../lib/supabaseClient';

export interface UserSession {
  id: string;
  email: string;
  role: string;
  fullName: string;
}

async function getUserSessionFromSupabaseUser(user: any): Promise<UserSession> {
  let fullName = 'User';
  let role = 'guest';

  // 1. Pobierz profil użytkownika
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .maybeSingle();

  if (!profileError && profile?.full_name) {
    fullName = profile.full_name;
  }

  // 2. Pobierz role użytkownika z user_roles + roles
  const { data: roleRows, error: roleError } = await supabase
    .from('user_roles')
    .select('roles(name)')
    .eq('user_id', user.id);

  if (!roleError && roleRows && roleRows.length > 0) {
    const roleNames = roleRows
      .map((row: any) => row.roles?.name)
      .filter(Boolean);

    if (roleNames.includes('administrator')) {
      role = 'administrator';
    } else if (roleNames.includes('board_member')) {
      role = 'board_member';
    } else if (roleNames.includes('member')) {
      role = 'member';
    } else if (roleNames.includes('volunteer')) {
      role = 'volunteer';
    } else if (roleNames.length > 0) {
      role = roleNames[0];
    }
  }

  return {
    id: user.id,
    email: user.email || profile?.email || '',
    role,
    fullName
  };
}

export const authService = {
  async login(email: string, password: string): Promise<{ user: UserSession | null; error: string | null }> {
    if (isDemoMode) {
      if (email === 'admin@frostadiving.no') {
        const user = {
          id: 'mem_admin',
          email,
          role: 'administrator',
          fullName: 'Demo Admin'
        };
        localStorage.setItem('demo_user', JSON.stringify(user));
        return { user, error: null };
      }

      return { user: null, error: 'Demo mode: use admin@frostadiving.no' };
    }

    if (!supabase) {
      return { user: null, error: 'Supabase unavailable' };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (!data.user) {
      return { user: null, error: 'No user returned from Supabase' };
    }

    const userSession = await getUserSessionFromSupabaseUser(data.user);

    return {
      user: userSession,
      error: null
    };
  },

  async logout(): Promise<void> {
    if (isDemoMode) {
      localStorage.removeItem('demo_user');
      return;
    }

    if (supabase) {
      await supabase.auth.signOut();
    }
  },

  async getCurrentUser(): Promise<UserSession | null> {
    if (isDemoMode) {
      const stored = localStorage.getItem('demo_user');
      if (stored) {
        return JSON.parse(stored);
      }
      return null;
    }

    if (!supabase) {
      return null;
    }

    const {
      data: { session },
      error
    } = await supabase.auth.getSession();

    if (error || !session?.user) {
      return null;
    }

    return getUserSessionFromSupabaseUser(session.user);
  }
};
