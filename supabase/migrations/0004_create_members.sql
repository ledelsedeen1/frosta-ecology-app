-- Diving Ecology Education Frosta
-- Migration 0004: Create members table
-- Member number format: YYYY-NNN (e.g. 2024-001)
-- Formal display: Diving Ecology Education Frosta YYYY-NNN
-- Project slug: frosta-staging

CREATE TABLE IF NOT EXISTS public.members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  member_number text NOT NULL UNIQUE,
  full_name text NOT NULL,
  email text,
  phone text,
  address text,
  member_type text NOT NULL DEFAULT 'regular'
    CHECK (member_type IN ('regular', 'family', 'junior', 'honorary', 'supporting')),
  member_status text NOT NULL DEFAULT 'active'
    CHECK (member_status IN ('active', 'inactive', 'suspended', 'pending')),
  join_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT member_number_format CHECK (member_number ~ '^[0-9]{4}-[0-9]{3}$')
);

COMMENT ON TABLE public.members IS 'Members of Diving Ecology Education Frosta. Number format: YYYY-NNN';
COMMENT ON COLUMN public.members.member_number IS 'Format: YYYY-NNN. Formal: Diving Ecology Education Frosta YYYY-NNN';

CREATE INDEX IF NOT EXISTS members_user_id_idx ON public.members(user_id);
CREATE INDEX IF NOT EXISTS members_member_number_idx ON public.members(member_number);
CREATE INDEX IF NOT EXISTS members_member_status_idx ON public.members(member_status);

CREATE TRIGGER members_updated_at
  BEFORE UPDATE ON public.members
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
