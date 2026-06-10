-- Read-only Supabase audit for Diving Ecology Education Frosta.
-- Safe to run in SQL Editor before any migration.

SELECT current_database() AS database_name, now() AS checked_at;

SELECT
  c.table_schema,
  c.table_name,
  c.column_name,
  c.data_type,
  c.is_nullable,
  c.column_default
FROM information_schema.columns c
WHERE c.table_schema IN ('public', 'storage')
ORDER BY c.table_schema, c.table_name, c.ordinal_position;

SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

SELECT
  schemaname,
  tablename,
  policyname,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname IN ('public', 'storage')
ORDER BY schemaname, tablename, policyname;

SELECT
  n.nspname AS schema_name,
  p.proname AS function_name,
  pg_get_function_identity_arguments(p.oid) AS arguments,
  p.prosecdef AS security_definer
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
ORDER BY p.proname;

SELECT
  event_object_schema,
  event_object_table,
  trigger_name,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE event_object_schema IN ('public', 'auth')
ORDER BY event_object_schema, event_object_table, trigger_name;

SELECT
  table_schema,
  table_name,
  view_definition
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;

SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
ORDER BY id;

SELECT name, description
FROM public.roles
ORDER BY name;

SELECT
  COUNT(*) AS auth_user_count,
  COUNT(*) FILTER (WHERE email_confirmed_at IS NOT NULL) AS confirmed_user_count
FROM auth.users;
