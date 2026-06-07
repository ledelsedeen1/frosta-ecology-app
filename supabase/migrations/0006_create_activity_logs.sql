-- Diving Ecology Education Frosta
-- Migration 0006: Create activity_logs table
-- Project slug: frosta-staging

CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  module text NOT NULL,
  action text NOT NULL,
  entity_id uuid,
  details jsonb,
  ip_address inet,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.activity_logs IS 'Activity audit log for Diving Ecology Education Frosta';

CREATE INDEX IF NOT EXISTS activity_logs_user_id_idx ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS activity_logs_module_idx ON public.activity_logs(module);
CREATE INDEX IF NOT EXISTS activity_logs_created_at_idx ON public.activity_logs(created_at DESC);
