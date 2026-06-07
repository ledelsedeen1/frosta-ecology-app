-- Diving Ecology Education Frosta
-- Migration 0003: Create user_roles join table
-- Project slug: frosta-staging
--
-- Assigns roles from public.roles to auth.users.
-- Phase 1 roles: guest, member, volunteer, board_member, administrator

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  granted_at timestamptz NOT NULL DEFAULT now(),
  granted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE (user_id, role_id)
);

COMMENT ON TABLE public.user_roles IS 'Role assignments for Diving Ecology Education Frosta members';

CREATE INDEX IF NOT EXISTS user_roles_user_id_idx ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS user_roles_role_id_idx ON public.user_roles(role_id);
