-- Diving Ecology Education Frosta
-- Migration 0009: additive application alignment and security hardening
-- Baseline: migrations 0001 through 0008
-- This migration does not drop tables, columns or application data.

BEGIN;

-- Additional member fields used by the application.
ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS preferred_language text NOT NULL DEFAULT 'no',
  ADD COLUMN IF NOT EXISTS consent_privacy boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_photo boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS emergency_contact_name text,
  ADD COLUMN IF NOT EXISTS emergency_contact_phone text,
  ADD COLUMN IF NOT EXISTS photo_path text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.members'::regclass
      AND conname = 'members_preferred_language_check'
  ) THEN
    ALTER TABLE public.members
      ADD CONSTRAINT members_preferred_language_check
      CHECK (preferred_language IN ('no', 'en', 'pl')) NOT VALID;
  END IF;
END;
$$;

-- Prevent duplicate member numbers during concurrent inserts.
CREATE OR REPLACE FUNCTION public.next_member_number(
  p_year integer DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::integer
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_next_seq integer;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('members:' || p_year::text));

  SELECT COALESCE(
    MAX(CAST(SPLIT_PART(member_number, '-', 2) AS integer)),
    0
  ) + 1
  INTO v_next_seq
  FROM public.members
  WHERE member_number LIKE p_year::text || '-%';

  RETURN p_year::text || '-' || LPAD(v_next_seq::text, 3, '0');
END;
$$;

CREATE OR REPLACE FUNCTION public.has_any_role(p_role_names text[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
      AND r.name = ANY (p_role_names)
  );
$$;

ALTER FUNCTION public.is_admin() SET search_path TO public, pg_temp;
ALTER FUNCTION public.is_board_or_admin() SET search_path TO public, pg_temp;
ALTER FUNCTION public.current_user_roles() SET search_path TO public, pg_temp;
ALTER FUNCTION public.has_role(text) SET search_path TO public, pg_temp;

REVOKE ALL ON FUNCTION public.next_member_number(integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.current_user_roles() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_role(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_any_role(text[]) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.next_member_number(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_roles() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_any_role(text[]) TO authenticated;

-- Application modules missing from the Phase 1 schema.
CREATE TABLE IF NOT EXISTS public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'other',
  language text NOT NULL DEFAULT 'no',
  visibility text NOT NULL DEFAULT 'members'
    CHECK (visibility IN ('public', 'members', 'board')),
  file_url text,
  storage_path text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_date date NOT NULL,
  start_time time,
  end_time time,
  location text,
  event_type text NOT NULL DEFAULT 'other',
  visibility text NOT NULL DEFAULT 'members'
    CHECK (visibility IN ('public', 'members', 'board')),
  max_participants integer CHECK (max_participants IS NULL OR max_participants > 0),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.event_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  participant_role text NOT NULL DEFAULT 'member',
  status text NOT NULL DEFAULT 'registered'
    CHECK (status IN ('registered', 'attended', 'absent', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, member_id)
);

CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'planned'
    CHECK (status IN ('planned', 'active', 'completed', 'paused')),
  responsible_person text NOT NULL,
  budget_nok numeric(12, 2) NOT NULL DEFAULT 0,
  funding_source text,
  sponsors text[] NOT NULL DEFAULT ARRAY[]::text[],
  document_ids uuid[] NOT NULL DEFAULT ARRAY[]::uuid[],
  tasks jsonb NOT NULL DEFAULT '[]'::jsonb,
  deadlines date[] NOT NULL DEFAULT ARRAY[]::date[],
  volunteer_list text[] NOT NULL DEFAULT ARRAY[]::text[],
  progress_notes text NOT NULL DEFAULT '',
  final_report text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  language text NOT NULL DEFAULT 'no',
  category text,
  visibility text NOT NULL DEFAULT 'members'
    CHECK (visibility IN ('public', 'members', 'board')),
  published_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module text NOT NULL,
  related_id text,
  message_type text NOT NULL DEFAULT 'normal',
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_name text NOT NULL,
  recipient_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  original_language text NOT NULL DEFAULT 'no',
  original_text text NOT NULL,
  translations jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_auto_translated boolean NOT NULL DEFAULT false,
  visibility text NOT NULL DEFAULT 'members_all'
    CHECK (visibility IN ('members_all', 'board_only', 'direct')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.message_reads (
  message_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (message_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.payment_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid REFERENCES public.members(id) ON DELETE SET NULL,
  submitted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  claim_type text NOT NULL DEFAULT 'membership_fee'
    CHECK (claim_type IN ('membership_fee', 'donation')),
  year integer CHECK (year IS NULL OR year BETWEEN 2000 AND 2100),
  amount_nok numeric(12, 2) NOT NULL CHECK (amount_nok >= 0),
  status text NOT NULL DEFAULT 'pending_confirmation'
    CHECK (status IN (
      'unpaid',
      'pending_confirmation',
      'confirmed',
      'rejected',
      'needs_clarification',
      'waived'
    )),
  payment_method text,
  receipt_path text,
  notes text,
  confirmed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  confirmed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS documents_visibility_idx ON public.documents(visibility);
CREATE INDEX IF NOT EXISTS events_event_date_idx ON public.events(event_date);
CREATE INDEX IF NOT EXISTS event_participants_member_idx ON public.event_participants(member_id);
CREATE INDEX IF NOT EXISTS projects_status_idx ON public.projects(status);
CREATE INDEX IF NOT EXISTS announcements_published_idx ON public.announcements(published_at DESC);
CREATE INDEX IF NOT EXISTS messages_created_idx ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS messages_recipient_idx ON public.messages(recipient_user_id);
CREATE INDEX IF NOT EXISTS payment_claims_member_idx ON public.payment_claims(member_id);
CREATE INDEX IF NOT EXISTS payment_claims_status_idx ON public.payment_claims(status);

CREATE OR REPLACE FUNCTION pg_temp.ensure_updated_at_trigger(
  p_table regclass,
  p_trigger_name text
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgrelid = p_table
      AND tgname = p_trigger_name
      AND NOT tgisinternal
  ) THEN
    EXECUTE format(
      'CREATE TRIGGER %I BEFORE UPDATE ON %s FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at()',
      p_trigger_name,
      p_table
    );
  END IF;
END;
$$;

SELECT pg_temp.ensure_updated_at_trigger('public.documents', 'documents_updated_at');
SELECT pg_temp.ensure_updated_at_trigger('public.events', 'events_updated_at');
SELECT pg_temp.ensure_updated_at_trigger('public.event_participants', 'event_participants_updated_at');
SELECT pg_temp.ensure_updated_at_trigger('public.projects', 'projects_updated_at');
SELECT pg_temp.ensure_updated_at_trigger('public.announcements', 'announcements_updated_at');
SELECT pg_temp.ensure_updated_at_trigger('public.payment_claims', 'payment_claims_updated_at');

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_claims ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION pg_temp.ensure_policy(
  p_schema text,
  p_table text,
  p_policy text,
  p_sql text
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = p_schema
      AND tablename = p_table
      AND policyname = p_policy
  ) THEN
    EXECUTE p_sql;
  END IF;
END;
$$;

SELECT pg_temp.ensure_policy(
  'public', 'documents', 'documents_read_visible',
  $policy$CREATE POLICY documents_read_visible ON public.documents FOR SELECT
    TO anon, authenticated
    USING (
      visibility = 'public'
      OR (
        visibility = 'members'
        AND public.has_any_role(ARRAY['member','volunteer','board_member','administrator'])
      )
      OR (visibility = 'board' AND public.is_board_or_admin())
    )$policy$
);
SELECT pg_temp.ensure_policy(
  'public', 'documents', 'documents_manage_board_or_admin',
  $policy$CREATE POLICY documents_manage_board_or_admin ON public.documents FOR ALL
    TO authenticated USING (public.is_board_or_admin())
    WITH CHECK (public.is_board_or_admin())$policy$
);

SELECT pg_temp.ensure_policy(
  'public', 'events', 'events_read_visible',
  $policy$CREATE POLICY events_read_visible ON public.events FOR SELECT
    TO anon, authenticated
    USING (
      visibility = 'public'
      OR (
        visibility = 'members'
        AND public.has_any_role(ARRAY['member','volunteer','board_member','administrator'])
      )
      OR (visibility = 'board' AND public.is_board_or_admin())
    )$policy$
);
SELECT pg_temp.ensure_policy(
  'public', 'events', 'events_manage_board_or_admin',
  $policy$CREATE POLICY events_manage_board_or_admin ON public.events FOR ALL
    TO authenticated USING (public.is_board_or_admin())
    WITH CHECK (public.is_board_or_admin())$policy$
);

SELECT pg_temp.ensure_policy(
  'public', 'event_participants', 'event_participants_read_own_or_board',
  $policy$CREATE POLICY event_participants_read_own_or_board
    ON public.event_participants FOR SELECT TO authenticated
    USING (
      public.is_board_or_admin()
      OR EXISTS (
        SELECT 1 FROM public.members m
        WHERE m.id = member_id AND m.user_id = auth.uid()
      )
    )$policy$
);
SELECT pg_temp.ensure_policy(
  'public', 'event_participants', 'event_participants_insert_own_or_board',
  $policy$CREATE POLICY event_participants_insert_own_or_board
    ON public.event_participants FOR INSERT TO authenticated
    WITH CHECK (
      public.is_board_or_admin()
      OR EXISTS (
        SELECT 1 FROM public.members m
        WHERE m.id = member_id AND m.user_id = auth.uid()
      )
    )$policy$
);
SELECT pg_temp.ensure_policy(
  'public', 'event_participants', 'event_participants_update_board',
  $policy$CREATE POLICY event_participants_update_board
    ON public.event_participants FOR UPDATE TO authenticated
    USING (public.is_board_or_admin())
    WITH CHECK (public.is_board_or_admin())$policy$
);
SELECT pg_temp.ensure_policy(
  'public', 'event_participants', 'event_participants_delete_own_or_board',
  $policy$CREATE POLICY event_participants_delete_own_or_board
    ON public.event_participants FOR DELETE TO authenticated
    USING (
      public.is_board_or_admin()
      OR EXISTS (
        SELECT 1 FROM public.members m
        WHERE m.id = member_id AND m.user_id = auth.uid()
      )
    )$policy$
);

SELECT pg_temp.ensure_policy(
  'public', 'projects', 'projects_read_members',
  $policy$CREATE POLICY projects_read_members ON public.projects FOR SELECT
    TO authenticated
    USING (public.has_any_role(ARRAY['member','volunteer','board_member','administrator']))$policy$
);
SELECT pg_temp.ensure_policy(
  'public', 'projects', 'projects_manage_board_or_admin',
  $policy$CREATE POLICY projects_manage_board_or_admin ON public.projects FOR ALL
    TO authenticated USING (public.is_board_or_admin())
    WITH CHECK (public.is_board_or_admin())$policy$
);

SELECT pg_temp.ensure_policy(
  'public', 'announcements', 'announcements_read_visible',
  $policy$CREATE POLICY announcements_read_visible ON public.announcements FOR SELECT
    TO anon, authenticated
    USING (
      visibility = 'public'
      OR (
        visibility = 'members'
        AND public.has_any_role(ARRAY['member','volunteer','board_member','administrator'])
      )
      OR (visibility = 'board' AND public.is_board_or_admin())
    )$policy$
);
SELECT pg_temp.ensure_policy(
  'public', 'announcements', 'announcements_manage_board_or_admin',
  $policy$CREATE POLICY announcements_manage_board_or_admin ON public.announcements FOR ALL
    TO authenticated USING (public.is_board_or_admin())
    WITH CHECK (public.is_board_or_admin())$policy$
);

SELECT pg_temp.ensure_policy(
  'public', 'messages', 'messages_read_visible',
  $policy$CREATE POLICY messages_read_visible ON public.messages FOR SELECT
    TO authenticated
    USING (
      sender_id = auth.uid()
      OR (visibility = 'direct' AND recipient_user_id = auth.uid())
      OR (
        visibility = 'members_all'
        AND public.has_any_role(ARRAY['member','volunteer','board_member','administrator'])
      )
      OR (visibility = 'board_only' AND public.is_board_or_admin())
    )$policy$
);
SELECT pg_temp.ensure_policy(
  'public', 'messages', 'messages_insert_authenticated',
  $policy$CREATE POLICY messages_insert_authenticated ON public.messages FOR INSERT
    TO authenticated
    WITH CHECK (
      sender_id = auth.uid()
      AND public.has_any_role(ARRAY['member','volunteer','board_member','administrator'])
      AND (visibility <> 'board_only' OR public.is_board_or_admin())
    )$policy$
);
SELECT pg_temp.ensure_policy(
  'public', 'messages', 'messages_delete_own_or_admin',
  $policy$CREATE POLICY messages_delete_own_or_admin ON public.messages FOR DELETE
    TO authenticated USING (sender_id = auth.uid() OR public.is_admin())$policy$
);

SELECT pg_temp.ensure_policy(
  'public', 'message_reads', 'message_reads_manage_own',
  $policy$CREATE POLICY message_reads_manage_own ON public.message_reads FOR ALL
    TO authenticated USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid())$policy$
);

SELECT pg_temp.ensure_policy(
  'public', 'payment_claims', 'payment_claims_read_own_or_board',
  $policy$CREATE POLICY payment_claims_read_own_or_board
    ON public.payment_claims FOR SELECT TO authenticated
    USING (submitted_by = auth.uid() OR public.is_board_or_admin())$policy$
);
SELECT pg_temp.ensure_policy(
  'public', 'payment_claims', 'payment_claims_insert_own',
  $policy$CREATE POLICY payment_claims_insert_own
    ON public.payment_claims FOR INSERT TO authenticated
    WITH CHECK (submitted_by = auth.uid())$policy$
);
SELECT pg_temp.ensure_policy(
  'public', 'payment_claims', 'payment_claims_manage_board_or_admin',
  $policy$CREATE POLICY payment_claims_manage_board_or_admin
    ON public.payment_claims FOR UPDATE TO authenticated
    USING (public.is_board_or_admin())
    WITH CHECK (public.is_board_or_admin())$policy$
);

GRANT SELECT ON public.documents, public.events, public.announcements TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON
  public.documents,
  public.events,
  public.event_participants,
  public.projects,
  public.announcements,
  public.messages,
  public.message_reads,
  public.payment_claims
TO authenticated;

CREATE OR REPLACE VIEW public.membership_cards
WITH (security_invoker = true)
AS
SELECT
  m.id AS member_id,
  m.user_id,
  m.member_number,
  public.formal_member_number(m.member_number) AS formal_member_number,
  m.full_name,
  m.member_type,
  m.member_status,
  m.photo_path,
  EXTRACT(YEAR FROM CURRENT_DATE)::integer AS membership_year,
  COALESCE(mf.payment_status, 'unpaid') AS payment_status,
  COALESCE(mf.amount_nok, 350.00) AS amount_nok,
  COALESCE(mf.currency, 'NOK') AS currency,
  mf.payment_date,
  (make_date(EXTRACT(YEAR FROM CURRENT_DATE)::integer, 12, 31)) AS valid_until
FROM public.members m
LEFT JOIN public.membership_fees mf
  ON mf.member_id = m.id
 AND mf.year = EXTRACT(YEAR FROM CURRENT_DATE)::integer;

GRANT SELECT ON public.membership_cards TO authenticated;

-- Private storage buckets. Existing bucket settings are left unchanged.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'member-card-photos',
    'member-card-photos',
    false,
    5242880,
    ARRAY['image/jpeg','image/png','image/webp']
  ),
  (
    'payment-receipts',
    'payment-receipts',
    false,
    10485760,
    ARRAY['image/jpeg','image/png','image/webp','application/pdf']
  ),
  (
    'documents',
    'documents',
    false,
    20971520,
    ARRAY[
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
  )
ON CONFLICT (id) DO NOTHING;

SELECT pg_temp.ensure_policy(
  'storage', 'objects', 'member_card_photos_own',
  $policy$CREATE POLICY member_card_photos_own ON storage.objects FOR ALL
    TO authenticated
    USING (
      bucket_id = 'member-card-photos'
      AND (storage.foldername(name))[1] = auth.uid()::text
    )
    WITH CHECK (
      bucket_id = 'member-card-photos'
      AND (storage.foldername(name))[1] = auth.uid()::text
    )$policy$
);
SELECT pg_temp.ensure_policy(
  'storage', 'objects', 'payment_receipts_own_insert',
  $policy$CREATE POLICY payment_receipts_own_insert ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'payment-receipts'
      AND (storage.foldername(name))[1] = auth.uid()::text
    )$policy$
);
SELECT pg_temp.ensure_policy(
  'storage', 'objects', 'payment_receipts_read_own_or_board',
  $policy$CREATE POLICY payment_receipts_read_own_or_board ON storage.objects FOR SELECT
    TO authenticated
    USING (
      bucket_id = 'payment-receipts'
      AND (
        (storage.foldername(name))[1] = auth.uid()::text
        OR public.is_board_or_admin()
      )
    )$policy$
);
SELECT pg_temp.ensure_policy(
  'storage', 'objects', 'documents_read_visible',
  $policy$CREATE POLICY documents_read_visible ON storage.objects FOR SELECT
    TO authenticated
    USING (
      bucket_id = 'documents'
      AND (
        (storage.foldername(name))[1] IN ('public', 'members')
        OR public.is_board_or_admin()
      )
    )$policy$
);
SELECT pg_temp.ensure_policy(
  'storage', 'objects', 'documents_manage_board_or_admin',
  $policy$CREATE POLICY documents_manage_board_or_admin ON storage.objects FOR ALL
    TO authenticated
    USING (bucket_id = 'documents' AND public.is_board_or_admin())
    WITH CHECK (bucket_id = 'documents' AND public.is_board_or_admin())$policy$
);

COMMIT;
