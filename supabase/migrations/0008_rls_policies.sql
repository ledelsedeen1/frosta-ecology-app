-- Diving Ecology Education Frosta
-- Migration 0008: Row Level Security (RLS) policies
-- Project slug: frosta-staging
--
-- Phase 1 roles used in policies:
--   guest, member, volunteer, board_member, administrator
--
-- Helper functions used:
--   public.is_admin()          -> role = 'administrator'
--   public.is_board_or_admin() -> role IN ('board_member', 'administrator')
--   public.has_role(name)      -> generic role check

-- ========================
-- Enable RLS on all tables
-- ========================
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- ========================
-- roles table
-- Any authenticated user can read the roles list
-- ========================
CREATE POLICY "roles_read_authenticated"
  ON public.roles FOR SELECT
  TO authenticated
  USING (true);

-- ========================
-- profiles table
-- ========================

-- Members can read and update their own profile
CREATE POLICY "profiles_read_own"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- Board members and administrators can read all profiles
CREATE POLICY "profiles_read_board_or_admin"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.is_board_or_admin());

-- ========================
-- user_roles table
-- ========================

-- Users can read their own role assignments
CREATE POLICY "user_roles_read_own"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Only administrators can manage role assignments
CREATE POLICY "user_roles_manage_administrator"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.is_admin());

-- ========================
-- members table
-- ========================

-- Members can read their own member record
CREATE POLICY "members_read_own"
  ON public.members FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Board members and administrators can read all member records
CREATE POLICY "members_read_board_or_admin"
  ON public.members FOR SELECT
  TO authenticated
  USING (public.is_board_or_admin());

-- Board members and administrators can insert new member records
CREATE POLICY "members_insert_board_or_admin"
  ON public.members FOR INSERT
  TO authenticated
  WITH CHECK (public.is_board_or_admin());

-- Board members and administrators can update member records
CREATE POLICY "members_update_board_or_admin"
  ON public.members FOR UPDATE
  TO authenticated
  USING (public.is_board_or_admin());

-- Only administrators can delete member records
CREATE POLICY "members_delete_administrator"
  ON public.members FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ========================
-- membership_fees table
-- Payment statuses: unpaid, pending_confirmation, confirmed, waived
-- ========================

-- Members can read their own fees
CREATE POLICY "membership_fees_read_own"
  ON public.membership_fees FOR SELECT
  TO authenticated
  USING (
    member_id IN (
      SELECT id FROM public.members WHERE user_id = auth.uid()
    )
  );

-- Board members and administrators can read all fees
CREATE POLICY "membership_fees_read_board_or_admin"
  ON public.membership_fees FOR SELECT
  TO authenticated
  USING (public.is_board_or_admin());

-- Board members and administrators can manage (insert/update/delete) fees
CREATE POLICY "membership_fees_manage_board_or_admin"
  ON public.membership_fees FOR ALL
  TO authenticated
  USING (public.is_board_or_admin());

-- ========================
-- activity_logs table
-- ========================

-- Any authenticated user can insert their own activity log entries
CREATE POLICY "activity_logs_insert_authenticated"
  ON public.activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Only board members and administrators can read activity logs
CREATE POLICY "activity_logs_read_board_or_admin"
  ON public.activity_logs FOR SELECT
  TO authenticated
  USING (public.is_board_or_admin());
