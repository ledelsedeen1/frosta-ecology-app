import { supabase, isDemoMode } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import { normalizeRole } from '../roleUtils';

const ANDROID_PASSWORD_RECOVERY_REDIRECT_URL =
  'no.divingecologyfrosta.app://auth/reset-password';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const env = (import.meta as any).env ?? {};

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
  return normalizeRole(roleNames?.[0]);
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

function passwordResetRedirectUrl(): string {
  const configuredUrl = String(env.VITE_PASSWORD_RESET_REDIRECT_URL || '').trim();
  if (configuredUrl) return configuredUrl;

  if (typeof window !== 'undefined') {
    return new URL('/reset-password', window.location.origin).toString();
  }

  return ANDROID_PASSWORD_RECOVERY_REDIRECT_URL;
}

function recoveryParameters(urlValue: string): URLSearchParams {
  const url = new URL(urlValue);
  const parameters = new URLSearchParams(url.search);
  const hashParameters = new URLSearchParams(url.hash.replace(/^#/, ''));

  hashParameters.forEach((value, key) => {
    if (!parameters.has(key)) parameters.set(key, value);
  });

  return parameters;
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
  },

  getPasswordResetRedirectUrl(): string {
    return passwordResetRedirectUrl();
  },

  isPasswordRecoveryUrl(urlValue: string): boolean {
    try {
      const url = new URL(urlValue);
      const parameters = recoveryParameters(urlValue);
      return parameters.get('type') === 'recovery'
        || parameters.get('passwordRecovery') === '1'
        || url.pathname === '/reset-password'
        || (
          url.protocol === 'no.divingecologyfrosta.app:'
          && url.hostname === 'auth'
          && url.pathname === '/reset-password'
        );
    } catch {
      return false;
    }
  },

  async requestPasswordReset(email: string): Promise<{ error: string | null }> {
    if (isDemoMode() || !supabase) return { error: 'PASSWORD_RESET_UNAVAILABLE' };

    const normalizedEmail = email.trim();
    const redirectTo = passwordResetRedirectUrl();
    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo,
    });

    if (error) {
      console.error('[auth] password reset request failed', {
        email: normalizedEmail,
        redirectTo,
        message: error.message,
        status: error.status,
        name: error.name,
      });
    }

    return { error: error ? 'PASSWORD_RESET_REQUEST_FAILED' : null };
  },

  async consumePasswordRecoveryUrl(
    urlValue: string,
  ): Promise<{ recovered: boolean; error: string | null }> {
    if (isDemoMode() || !supabase) {
      return { recovered: false, error: 'PASSWORD_RESET_UNAVAILABLE' };
    }
    if (!this.isPasswordRecoveryUrl(urlValue)) {
      return { recovered: false, error: null };
    }

    try {
      const parameters = recoveryParameters(urlValue);
      const code = parameters.get('code');
      const accessToken = parameters.get('access_token');
      const refreshToken = parameters.get('refresh_token');

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        return {
          recovered: !error,
          error: error ? 'PASSWORD_RECOVERY_LINK_INVALID' : null,
        };
      }

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        return {
          recovered: !error,
          error: error ? 'PASSWORD_RECOVERY_LINK_INVALID' : null,
        };
      }

      const { data } = await supabase.auth.getSession();
      return {
        recovered: Boolean(data.session),
        error: data.session ? null : 'PASSWORD_RECOVERY_LINK_INVALID',
      };
    } catch {
      return { recovered: false, error: 'PASSWORD_RECOVERY_LINK_INVALID' };
    }
  },

  async updatePassword(password: string): Promise<{ error: string | null }> {
    if (isDemoMode() || !supabase) return { error: 'PASSWORD_RESET_UNAVAILABLE' };

    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { error: 'PASSWORD_UPDATE_FAILED' };

    const { error: signOutError } = await supabase.auth.signOut({ scope: 'local' });
    return { error: signOutError ? 'PASSWORD_UPDATE_SIGNOUT_FAILED' : null };
  },
};
