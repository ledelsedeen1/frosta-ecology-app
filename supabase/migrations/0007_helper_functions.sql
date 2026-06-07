-- Diving Ecology Education Frosta
-- Migration 0007: Helper functions
-- Project slug: frosta-staging
--
-- Member number format: YYYY-NNN (e.g. 2026-001)
-- Formal display: Diving Ecology Education Frosta YYYY-NNN
--
-- Role helper functions use exact Phase 1 role names:
--   guest, member, volunteer, board_member, administrator

-- ================================================
-- Generate next member number for a given year
-- Returns format: YYYY-NNN (e.g. 2026-001)
-- ================================================
CREATE OR REPLACE FUNCTION public.next_member_number(
  p_year integer DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::integer
)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  v_next_seq integer;
  v_member_number text;
BEGIN
  SELECT COALESCE(
    MAX(CAST(SPLIT_PART(member_number, '-', 2) AS integer)),
    0
  ) + 1
  INTO v_next_seq
  FROM public.members
  WHERE member_number LIKE p_year::text || '-%';

  v_member_number := p_year::text || '-' || LPAD(v_next_seq::text, 3, '0');
  RETURN v_member_number;
END;
$$;

COMMENT ON FUNCTION public.next_member_number IS
  'Returns next available member number in YYYY-NNN format for Diving Ecology Education Frosta';

-- ================================================
-- Return formal member number display
-- Input:  "2026-001"
-- Output: "Diving Ecology Education Frosta 2026-001"
-- ================================================
CREATE OR REPLACE FUNCTION public.formal_member_number(p_member_number text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT 'Diving Ecology Education Frosta ' || p_member_number;
$$;

COMMENT ON FUNCTION public.formal_member_number IS
  'Returns formal member number: Diving Ecology Education Frosta YYYY-NNN';

-- ================================================
-- Validate member number format (YYYY-NNN)
-- ================================================
CREATE OR REPLACE FUNCTION public.is_valid_member_number(p_member_number text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT p_member_number ~ '^[0-9]{4}-[0-9]{3}$';
$$;

COMMENT ON FUNCTION public.is_valid_member_number IS
  'Validates member number format YYYY-NNN for Diving Ecology Education Frosta';

-- ================================================
-- Role helper: check if current user is administrator
-- ================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
      AND r.name = 'administrator'
  );
$$;

COMMENT ON FUNCTION public.is_admin IS
  'Returns true if current user has role administrator in Diving Ecology Education Frosta';

-- ================================================
-- Role helper: check if current user is board_member or administrator
-- ================================================
CREATE OR REPLACE FUNCTION public.is_board_or_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
      AND r.name IN ('board_member', 'administrator')
  );
$$;

COMMENT ON FUNCTION public.is_board_or_admin IS
  'Returns true if current user has role board_member or administrator in Diving Ecology Education Frosta';

-- ================================================
-- Role helper: returns all role names for current user
-- ================================================
CREATE OR REPLACE FUNCTION public.current_user_roles()
RETURNS text[]
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(
    ARRAY_AGG(r.name ORDER BY r.name),
    ARRAY[]::text[]
  )
  FROM public.user_roles ur
  JOIN public.roles r ON r.id = ur.role_id
  WHERE ur.user_id = auth.uid();
$$;

COMMENT ON FUNCTION public.current_user_roles IS
  'Returns array of role names for current user in Diving Ecology Education Frosta. Values: guest, member, volunteer, board_member, administrator';

-- ================================================
-- Legacy compatibility alias: has_role(role_name)
-- Use is_admin() and is_board_or_admin() in new code.
-- Kept for backward compatibility only.
-- ================================================
CREATE OR REPLACE FUNCTION public.has_role(p_role_name text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
      AND r.name = p_role_name
  );
$$;

COMMENT ON FUNCTION public.has_role IS
  'Generic role check for Diving Ecology Education Frosta. Phase 1 valid values: guest, member, volunteer, board_member, administrator';
