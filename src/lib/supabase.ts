// Diving Ecology Education Frosta
// Supabase client configuration
// Project slug: frosta-staging (production: frosta-production)
// IMPORTANT: Only use VITE_SUPABASE_ANON_KEY here — never service_role key in frontend

import { createClient } from '@supabase/supabase-js';

// Type-safe access to Vite environment variables
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _env = (import.meta as any).env ?? {};

const supabaseUrl: string = _env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey: string = _env.VITE_SUPABASE_ANON_KEY ?? '';

/**
 * Returns true if the app is running in demo mode.
 * When VITE_DEMO_MODE=true, all hooks return early with demo data
 * and no Supabase requests are made.
 */
export function isDemoMode(): boolean {
  const val: string | undefined = String(_env.VITE_DEMO_MODE ?? '');
  // Default to demo mode if env var is not set
  if (!val || val === 'undefined') return true;
  return val === 'true';
}

/**
 * Supabase client for Diving Ecology Education Frosta.
 * Uses anon key only — never service_role key in frontend.
 * Only instantiate when NOT in demo mode.
 */
export const supabase = (() => {
  if (isDemoMode()) return null as unknown as ReturnType<typeof createClient>;
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      'Diving Ecology Education Frosta: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set. ' +
      'Set VITE_DEMO_MODE=true to use demo data.'
    );
    return null as unknown as ReturnType<typeof createClient>;
  }
  return createClient(supabaseUrl, supabaseAnonKey);
})();

export type { User, Session } from '@supabase/supabase-js';
