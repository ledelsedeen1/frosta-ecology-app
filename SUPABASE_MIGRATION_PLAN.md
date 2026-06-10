# Safe Supabase migration plan

Target project supplied by the user:

`keyfdbzybbyxnrjqkule`

No SQL has been executed remotely from this workspace. The local project does
not contain a configured Supabase URL or anon key, and the dashboard session was
not available to the execution tools.

## Important

Do not run `supabase/schema.sql`. It is a legacy schema that conflicts with the
authoritative migrations in `supabase/migrations/`.

Do not run the staging seed against production.

## Execution order

1. Open the Supabase project dashboard.
2. Confirm the project name and environment in **Project Settings > General**.
3. Open **SQL Editor** and create a new query.
4. Paste `supabase/preflight_audit.sql` and click **Run**.
5. Export or copy the result before changing anything.
6. Confirm migrations `0001` through `0008` are reflected in the preflight:
   six Phase 1 tables, five role names, seven helper functions and RLS enabled.
7. Create a database backup from **Database > Backups** when the plan supports it.
8. Open a new SQL Editor query.
9. Paste `supabase/migrations/0009_safe_app_alignment.sql`.
10. Review the target project name again, then click **Run**.
11. Re-run `supabase/preflight_audit.sql`.
12. Run the checks below.

## Post-migration checks

```sql
SELECT name FROM public.roles ORDER BY name;

SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'members'
ORDER BY ordinal_position;

SELECT *
FROM public.membership_cards
LIMIT 10;

SELECT id, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id IN ('member-card-photos', 'payment-receipts', 'documents')
ORDER BY id;
```

## What migration 0009 changes

- Adds member language, consent, emergency-contact and photo-path columns.
- Makes member-number generation concurrency-safe.
- Hardens security-definer function search paths and execute privileges.
- Adds documents, events, participants, projects, announcements, chat messages,
  read receipts and payment-claim tables.
- Adds RLS policies without deleting existing rows.
- Adds a security-invoker membership-card view.
- Creates private Storage buckets and scoped Storage policies.

## What it does not do

- It does not delete or rename existing tables, columns or rows.
- It does not create Auth users.
- It does not assign administrator or board roles.
- It does not enable external OAuth providers.
- It does not configure payment-provider secrets.
- It does not migrate the in-memory prototype data from `server.ts`.
