-- Diving Ecology Education Frosta
-- Migration 0001: Create roles table
-- Project slug: frosta-staging
--
-- Authoritative role list (Phase 1):
--   guest           - Unauthenticated or unverified visitor
--   member          - Approved member of Diving Ecology Education Frosta
--   volunteer       - Active volunteer of Diving Ecology Education Frosta
--   board_member    - Board member of Diving Ecology Education Frosta
--   administrator   - System administrator of Diving Ecology Education Frosta

CREATE TABLE IF NOT EXISTS public.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.roles IS 'Roles for Diving Ecology Education Frosta members';

-- Insert Phase 1 roles (idempotent)
INSERT INTO public.roles (name, description) VALUES
  ('guest',         'Unauthenticated or unverified visitor of Diving Ecology Education Frosta'),
  ('member',        'Approved member of Diving Ecology Education Frosta'),
  ('volunteer',     'Active volunteer of Diving Ecology Education Frosta'),
  ('board_member',  'Board member of Diving Ecology Education Frosta'),
  ('administrator', 'System administrator of Diving Ecology Education Frosta')
ON CONFLICT (name) DO NOTHING;
