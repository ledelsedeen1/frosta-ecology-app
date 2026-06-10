# Diving Ecology Education Frosta — Supabase Staging Execution Checklist (v2)

Project slug (staging):    frosta-staging
Project slug (production): frosta-production
Association name:          Diving Ecology Education Frosta (never abbreviated)
Member number format:      YYYY-NNN  (e.g. 2026-001)
Formal member number:      Diving Ecology Education Frosta YYYY-NNN
Currency:                  NOK

Phase 1 role names (exact, case-sensitive):
  guest           Unauthenticated or unverified visitor
  member          Approved member of Diving Ecology Education Frosta
  volunteer       Active volunteer of Diving Ecology Education Frosta
  board_member    Board member of Diving Ecology Education Frosta
  administrator   System administrator of Diving Ecology Education Frosta

Phase 1 payment statuses (exact, case-sensitive):
  unpaid               Fee registered, not yet paid
  pending_confirmation Payment received, awaiting confirmation
  confirmed            Payment confirmed and recorded
  waived               Fee waived (honorary, hardship, junior)

Standard membership fee 2026: 350.00 NOK

> Run every step in order.
> Do not skip steps.
> Do not run this against frosta-production.
> The demo UI must remain unchanged throughout.

---

## STEP 1 — Create Supabase project frosta-staging

### Action
1. Go to https://supabase.com/dashboard
2. Click **New project**
3. Set:
   - Name: `frosta-staging`
   - Database password: generate a strong password and save it in your password manager
   - Region: choose an EU Supabase region close to Norway.
     - If using Ireland: Ireland / West Europe
     - If using Frankfurt: Frankfurt / Central Europe
   - Pricing plan: Free tier is sufficient for staging
4. Click **Create new project**
5. Wait for provisioning to complete (approximately 2 minutes)

### Expected result
- Dashboard shows project `frosta-staging` with status **Active**
- URL format: `https://<ref>.supabase.co`

### If this step fails
- If the name `frosta-staging` is already taken, use `frosta-staging-2026`
- If provisioning is stuck beyond 5 minutes, stop and verify the project status.
  Do not delete it without explicit confirmation.
- Do not mix region codes (e.g. eu-west-1) with city names in documentation

---

## STEP 2 — Confirm region

### Action
After creation, verify the region in **Project Settings → General → Region**.

### Expected result
Region shows an EU location close to Norway, either:
- Ireland / West Europe, or
- Frankfurt / Central Europe

### If this step fails
Region cannot be changed after project creation.
Stop the migration. Create a separate correctly located staging project only
after explicit confirmation; do not delete the existing project automatically.

---

## STEP 3 — Copy Supabase URL and anon key

### Action
1. Go to **Project Settings → API**
2. Copy **Project URL** → this is `VITE_SUPABASE_URL`
3. Copy **anon / public** key → this is `VITE_SUPABASE_ANON_KEY`
4. Do NOT copy the **service_role** key — it must never be used in the frontend

### Expected result
- `VITE_SUPABASE_URL` = `https://<ref>.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = `eyJ...` (a long JWT string)

### If this step fails
- If the API page is blank, wait 1 minute and refresh
- If you accidentally copy the service_role key, discard it immediately and do not paste it anywhere in the frontend

---

## STEP 4 — Create .env.staging

### Action
Create `.env.staging` in the project root:

```
# Diving Ecology Education Frosta — Staging environment
# Project slug: frosta-staging
# DO NOT commit this file to version control

VITE_SUPABASE_URL=https://<ref>.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_DEMO_MODE=false
```

Add `.env.staging` to `.gitignore` if not already listed.

### Expected result
- File `.env.staging` exists in the project root
- File is listed in `.gitignore`
- `VITE_DEMO_MODE=false` is set explicitly (a blank value defaults to demo mode)

### If this step fails
- Trailing whitespace in `VITE_DEMO_MODE` will cause the value to not match — use exactly the string `false`

---

## STEP 5 — Run migrations 0001 to 0008 in order

Go to **Supabase Dashboard → SQL Editor** for `frosta-staging`.
Paste and run each file one at a time. Confirm success before the next file.

**5.1 — Run 0001_create_roles.sql**

Expected: Table `public.roles` created with 5 rows.
Verify:
```sql
SELECT name, description FROM public.roles ORDER BY name;
-- Expected 5 rows:
-- administrator, board_member, guest, member, volunteer
```

**5.2 — Run 0002_create_profiles.sql**

Expected: Table `public.profiles` created. Trigger `on_auth_user_created` created on `auth.users`.

**5.3 — Run 0003_create_user_roles.sql**

Expected: Table `public.user_roles` created with two indexes.

**5.4 — Run 0004_create_members.sql**

Expected: Table `public.members` created with constraint `member_number_format` enforcing regex `^[0-9]{4}-[0-9]{3}$`.

**5.5 — Run 0005_create_membership_fees.sql**

Expected: Table `public.membership_fees` created.
- Column `amount_nok` defaults to 350.00
- Column `currency` defaults to NOK
- Column `payment_status` defaults to `unpaid`
- CHECK constraint allows only: `unpaid`, `pending_confirmation`, `confirmed`, `waived`

Verify:
```sql
SELECT column_name, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'membership_fees'
ORDER BY ordinal_position;
```

**5.6 — Run 0006_create_activity_logs.sql**

Expected: Table `public.activity_logs` created with three indexes.

**5.7 — Run 0007_helper_functions.sql**

Expected: Six functions created:
- `public.next_member_number(year)` — returns next YYYY-NNN
- `public.formal_member_number(member_number)` — returns "Diving Ecology Education Frosta YYYY-NNN"
- `public.is_valid_member_number(member_number)` — validates YYYY-NNN format
- `public.is_admin()` — returns true if current user has role `administrator`
- `public.is_board_or_admin()` — returns true if role is `board_member` or `administrator`
- `public.current_user_roles()` — returns array of current user's role names
- `public.has_role(name)` — generic check (legacy compatibility)

Verify:
```sql
SELECT public.formal_member_number('2026-001');
-- Expected: "Diving Ecology Education Frosta 2026-001"

SELECT public.is_valid_member_number('2026-001'); -- true
SELECT public.is_valid_member_number('26-1');     -- false
SELECT public.is_valid_member_number('2026-0001');-- false
```

**5.8 — Run 0008_rls_policies.sql**

Expected: RLS enabled on all 6 tables. 16 policies created using `is_admin()` and `is_board_or_admin()`.
Policy names now use `_board_or_admin` and `_administrator` suffixes — not `_admin` or `_board`.

Verify:
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
-- Expected: rowsecurity = true for all 6 tables
```

### If any migration fails
- If an object already exists, stop and run `supabase/preflight_audit.sql`.
  Do not add broad `DROP` statements.
- "function handle_updated_at does not exist" in 0004–0006 means 0002 must run first
- "invalid input value" on payment_status means the old constraint may exist.
  Preserve the table and data; prepare a targeted constraint/data migration after a backup.
- Never use `DROP TABLE` or `DROP FUNCTION` on `frosta-production`

---

## STEP 6 — Create test users in Supabase Auth

### Action
Go to **Authentication → Users → Add user → Create new user**.
Create the following five test users:

| Email | Purpose | Role to assign |
|---|---|---|
| test.admin@staging.local | System administrator of Diving Ecology Education Frosta | administrator |
| test.board@staging.local | Board member of Diving Ecology Education Frosta | board_member |
| test.member@staging.local | Approved member of Diving Ecology Education Frosta | member |
| test.volunteer@staging.local | Active volunteer of Diving Ecology Education Frosta | volunteer |
| test.applicant@staging.local | Unverified applicant — no approved role yet | (none) |

Use a strong password for each user.

### Expected result
- 5 users in `auth.users`
- 5 rows auto-created in `public.profiles` via the `on_auth_user_created` trigger

Verify:
```sql
SELECT id, email FROM public.profiles ORDER BY email;
-- Expected: 5 rows
```

### If this step fails
If profile rows are missing, the trigger did not fire. Re-run 0002 and insert profiles manually:
```sql
INSERT INTO public.profiles (id, email)
SELECT id, email FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);
```

---

## STEP 7 — Assign roles and update seed UUIDs

### Action
In the SQL Editor, replace each UUID placeholder with the real UUID from **Authentication → Users**:

```sql
-- Assign administrator role
INSERT INTO public.user_roles (user_id, role_id)
SELECT '<uuid-of-test.admin@staging.local>', id
FROM public.roles WHERE name = 'administrator';

-- Assign board_member role
INSERT INTO public.user_roles (user_id, role_id)
SELECT '<uuid-of-test.board@staging.local>', id
FROM public.roles WHERE name = 'board_member';

-- Assign member role
INSERT INTO public.user_roles (user_id, role_id)
SELECT '<uuid-of-test.member@staging.local>', id
FROM public.roles WHERE name = 'member';

-- Assign volunteer role
INSERT INTO public.user_roles (user_id, role_id)
SELECT '<uuid-of-test.volunteer@staging.local>', id
FROM public.roles WHERE name = 'volunteer';

-- test.applicant@staging.local intentionally has no role assigned
```

### Expected result
```sql
SELECT u.email, r.name AS role
FROM public.user_roles ur
JOIN auth.users u ON u.id = ur.user_id
JOIN public.roles r ON r.id = ur.role_id
ORDER BY u.email;
-- Expected: 4 rows (applicant has no role)
```

### If this step fails
- "duplicate key" is safe to ignore
- "role not found" means 0001_create_roles.sql was not run or used wrong role names — re-run 0001

---

## STEP 8 — Run seed.sql

### Action
Paste and run the full content of `supabase/seed.sql` in the SQL Editor.

This inserts:
- 7 demo members with member numbers 2025-001 through 2026-005
- 5 membership fee records for year 2026 at 350.00 NOK
- Payment statuses: confirmed (1), pending_confirmation (1), unpaid (2), waived (1)

### Expected result
```sql
SELECT member_number, full_name, member_status
FROM public.members
ORDER BY member_number;
-- Expected: 7 rows

SELECT m.member_number, mf.year, mf.amount_nok, mf.currency, mf.payment_status
FROM public.membership_fees mf
JOIN public.members m ON m.id = mf.member_id
ORDER BY m.member_number;
-- Expected: 5 rows, year = 2026, amount_nok = 350.00 (except waived = 0.00), currency = NOK

SELECT public.formal_member_number(member_number) AS formal_number
FROM public.members ORDER BY member_number;
-- Expected: each row shows "Diving Ecology Education Frosta YYYY-NNN"
```

### If this step fails
- "ON CONFLICT" notices are safe — seed is idempotent
- "violates check constraint member_number_format" — check that member numbers match YYYY-NNN exactly
- "invalid input value for payment_status" — run the preflight audit and use a
  targeted additive migration. Re-running 0005 does not alter an existing table.

---

## STEP 9 — Verify tables, roles, and functions

```sql
-- 9.1 All 6 tables with RLS enabled
SELECT tablename, rowsecurity
FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
-- Expected: activity_logs, members, membership_fees, profiles, roles, user_roles — all rowsecurity = true

-- 9.2 Correct roles (5 rows, exact names)
SELECT name FROM public.roles ORDER BY name;
-- Expected: administrator, board_member, guest, member, volunteer

-- 9.3 Role assignments (4 rows — applicant has none)
SELECT u.email, r.name AS role
FROM public.user_roles ur
JOIN auth.users u ON u.id = ur.user_id
JOIN public.roles r ON r.id = ur.role_id
ORDER BY u.email;

-- 9.4 Helper functions exist
SELECT proname FROM pg_proc
WHERE proname IN (
  'next_member_number','formal_member_number','is_valid_member_number',
  'is_admin','is_board_or_admin','current_user_roles','has_role'
)
AND pronamespace = 'public'::regnamespace
ORDER BY proname;
-- Expected: 7 rows

-- 9.5 Member number format validation
SELECT public.is_valid_member_number('2026-001');  -- true
SELECT public.is_valid_member_number('26-001');    -- false
SELECT public.is_valid_member_number('2026-0001'); -- false

-- 9.6 Membership fee defaults for 2026
SELECT year, amount_nok, currency, payment_status
FROM public.membership_fees
ORDER BY payment_status;
-- Expected: amount_nok = 350.00 (or 0.00 for waived), currency = NOK,
--           payment_status IN (unpaid, pending_confirmation, confirmed, waived)
```

### If this step fails
Identify which migration was skipped and re-run it.

---

## STEP 10 — Test RLS policies for each role

Log in as each test user via the Supabase client or SQL Editor role impersonation.

**10.1 — Guest / unauthenticated (test.applicant@staging.local has no role)**
```sql
SELECT COUNT(*) FROM public.members;          -- Expected: 0
SELECT COUNT(*) FROM public.membership_fees;  -- Expected: 0
SELECT COUNT(*) FROM public.profiles;         -- Expected: 0 or own profile only
SELECT COUNT(*) FROM public.activity_logs;    -- Expected: 0
```

**10.2 — Member (test.member@staging.local)**
```sql
-- Can read own profile only
SELECT * FROM public.profiles;
-- Expected: 1 row (own profile)

-- Can read own member record only (if user_id is linked)
SELECT COUNT(*) FROM public.members;
-- Expected: 0 or 1 (own record only)

-- Can read own membership fees only
SELECT COUNT(*) FROM public.membership_fees;
-- Expected: 0 or own fees only

-- Cannot read activity logs
SELECT COUNT(*) FROM public.activity_logs;
-- Expected: 0 rows or RLS error

-- Cannot insert members
INSERT INTO public.members (member_number, full_name) VALUES ('2026-099', 'Test');
-- Expected: RLS error (policy blocks non-board/admin)
```

**10.3 — Volunteer (test.volunteer@staging.local)**
```sql
-- Same data isolation as member for Phase 1
-- Can read own profile and own member record
SELECT * FROM public.profiles;       -- Expected: own profile only
SELECT COUNT(*) FROM public.members; -- Expected: 0 or 1 (own only)

-- Cannot access other members' data
-- Cannot read activity logs
SELECT COUNT(*) FROM public.activity_logs; -- Expected: 0
```

**10.4 — Board Member (test.board@staging.local)**
```sql
-- Can read all member records
SELECT COUNT(*) FROM public.members;
-- Expected: all members visible

-- Can insert a member
INSERT INTO public.members (member_number, full_name, member_type, member_status, join_date)
VALUES (public.next_member_number(), 'Test Board Insert', 'regular', 'pending', CURRENT_DATE);
-- Expected: 1 row inserted

-- Cannot delete members (delete is administrator-only)
DELETE FROM public.members WHERE full_name = 'Test Board Insert';
-- Expected: 0 rows deleted (RLS blocks it)

-- Can read all membership fees
SELECT COUNT(*) FROM public.membership_fees;
-- Expected: all fees visible

-- Can read activity logs
SELECT COUNT(*) FROM public.activity_logs;
-- Expected: rows visible

-- Cleanup: run as administrator
-- DELETE FROM public.members WHERE full_name = 'Test Board Insert';
```

**10.5 — Administrator (test.admin@staging.local)**
```sql
-- Can read all tables
SELECT COUNT(*) FROM public.members;         -- all visible
SELECT COUNT(*) FROM public.membership_fees; -- all visible
SELECT COUNT(*) FROM public.activity_logs;   -- all visible

-- Can delete members
INSERT INTO public.members (member_number, full_name, member_type, member_status, join_date)
VALUES (public.next_member_number(), 'Test Admin Delete', 'regular', 'pending', CURRENT_DATE);
DELETE FROM public.members WHERE full_name = 'Test Admin Delete';
-- Expected: 1 row inserted, then 1 row deleted

-- Can manage role assignments
INSERT INTO public.user_roles (user_id, role_id)
SELECT auth.uid(), id FROM public.roles WHERE name = 'administrator';
-- Expected: no error (or conflict if already assigned)

-- Confirm is_admin() and is_board_or_admin() both return true
SELECT public.is_admin();           -- Expected: true
SELECT public.is_board_or_admin();  -- Expected: true
SELECT public.current_user_roles(); -- Expected: {'administrator'}
```

### If any test fails
- "permission denied" for an operation that should succeed: re-run 0008_rls_policies.sql
- `is_admin()` returns false for administrator: check that the user's UUID is in `public.user_roles` with role name `administrator` (not `admin`)
- `is_board_or_admin()` returns false for board_member: check role name is exactly `board_member` (not `board`)

---

## STEP 11 — Test membership fee workflow

Use member `2026-003` (unpaid) as the test subject.

**11.1 — Confirm unpaid state**
```sql
SELECT m.member_number, mf.year, mf.amount_nok, mf.currency, mf.payment_status
FROM public.membership_fees mf
JOIN public.members m ON m.id = mf.member_id
WHERE m.member_number = '2026-003' AND mf.year = 2026;
-- Expected: payment_status = 'unpaid', amount_nok = 350.00, currency = NOK
```

**11.2 — Member submits payment (unpaid → pending_confirmation)**
```sql
UPDATE public.membership_fees
SET
  payment_status = 'pending_confirmation',
  notes = 'Vipps payment submitted by member — awaiting board confirmation'
WHERE member_id = (SELECT id FROM public.members WHERE member_number = '2026-003')
  AND year = 2026;
-- Expected: 1 row updated
```

**11.3 — Board member confirms payment (pending_confirmation → confirmed)**
```sql
UPDATE public.membership_fees
SET
  payment_status = 'confirmed',
  payment_date = CURRENT_DATE,
  payment_method = 'Vipps',
  notes = 'Confirmed by board — Vipps transfer received 2026'
WHERE member_id = (SELECT id FROM public.members WHERE member_number = '2026-003')
  AND year = 2026;
-- Expected: 1 row updated
```

**11.4 — Write audit log entry**
```sql
INSERT INTO public.activity_logs (user_id, module, action, details)
VALUES (
  auth.uid(),
  'membership_fees',
  'payment_confirmed',
  jsonb_build_object(
    'member_number', '2026-003',
    'year', 2026,
    'amount_nok', 350.00,
    'currency', 'NOK',
    'payment_method', 'Vipps',
    'organisation', 'Diving Ecology Education Frosta'
  )
);
-- Expected: 1 row inserted
```

**11.5 — Verify audit log**
```sql
SELECT module, action, details, created_at
FROM public.activity_logs
ORDER BY created_at DESC LIMIT 1;
-- Expected: action = 'payment_confirmed', details contains member_number '2026-003'
```

**11.6 — Test waived status**
```sql
-- Confirm 2026-005 (junior) is already waived from seed
SELECT m.member_number, mf.payment_status, mf.amount_nok, mf.notes
FROM public.membership_fees mf
JOIN public.members m ON m.id = mf.member_id
WHERE m.member_number = '2026-005';
-- Expected: payment_status = 'waived', amount_nok = 0.00
```

### If this step fails
- "invalid input value for payment_status" — the constraint must use exactly `unpaid`, `pending_confirmation`, `confirmed`, `waived` — not `pending`, `paid`, `overdue`, or `refunded`
- Do not re-run 0005 as a repair for an existing table. Use the preflight audit,
  back up the database and apply a reviewed targeted constraint migration.
- Audit log insert fails with null `auth.uid()` — run as an authenticated user, not from the anonymous SQL editor

---

## STEP 12 — Confirm no service_role key in frontend

```bash
grep -r "service_role" src/
# Expected: no matches, or only comments saying "never use"

grep -r "SUPABASE_SERVICE_ROLE" src/
# Expected: no matches

grep "SUPABASE" src/lib/supabase.ts
# Expected: only VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```

### If this step fails
Remove any service_role key from `src/` immediately.
Rotate the key in **Project Settings → API → Rotate service_role key** if it was ever exposed.

---

## STEP 13 — Confirm VITE_DEMO_MODE=false connects to Supabase

**Action:** Run the dev server with `.env.staging` (`VITE_DEMO_MODE=false`).
Verify the Network tab shows requests to `https://<ref>.supabase.co/rest/v1/`.

In the browser console:
```javascript
// Expected: false
```

### If this step fails
- `isDemoMode()` returns `true` despite `false` in the env file — check for trailing whitespace
- Network requests go to `supabase.co` but return 401 — the anon key may be wrong; re-check Step 3

---

## STEP 14 — Confirm VITE_DEMO_MODE=true still uses demo data

**Action:** Run with `VITE_DEMO_MODE=true`.
Verify:
- Demo banner is visible (Testversjon / Wersja testowa / Test version)
- Member cards show demo data
- No Supabase network requests appear in the Network tab
- Association name "Diving Ecology Education Frosta" is displayed without abbreviation
- Logo is unchanged
- Member numbers in demo data display in format YYYY-NNN

All 5 hooks must return early in demo mode:
- `useAuth` → `{ user: null, session: null, loading: false, error: null }`
- `useMembers` → `{ members: [], loading: false, error: null }`
- `useMembershipFees` → `{ fees: [], loading: false, error: null }`
- `useCurrentProfile` → `{ profile: null, loading: false, error: null }`
- `useUserRoles` → `{ roles: [], roleNames: [], loading: false, error: null }`

### If this step fails
- Supabase requests appear despite demo mode — check each hook for the `if (isDemoMode()) { return; }` guard
- Demo UI is broken — confirm no changes were made to `App.tsx`, `MembershipCardsPage.tsx`, `config.ts`, or `types.ts`

---

## Summary checklist (quick reference)

| Step | Task | Status |
|------|------|--------|
| 1 | Create Supabase project frosta-staging | [ ] |
| 2 | Confirm EU region (Ireland or Frankfurt) | [ ] |
| 3 | Copy URL and anon key | [ ] |
| 4 | Create .env.staging | [ ] |
| 5.1 | Run 0001_create_roles.sql | [ ] |
| 5.2 | Run 0002_create_profiles.sql | [ ] |
| 5.3 | Run 0003_create_user_roles.sql | [ ] |
| 5.4 | Run 0004_create_members.sql | [ ] |
| 5.5 | Run 0005_create_membership_fees.sql | [ ] |
| 5.6 | Run 0006_create_activity_logs.sql | [ ] |
| 5.7 | Run 0007_helper_functions.sql | [ ] |
| 5.8 | Run 0008_rls_policies.sql | [ ] |
| 6 | Create 5 test users in Supabase Auth | [ ] |
| 7 | Assign roles (4 users, applicant gets none) | [ ] |
| 8 | Run seed.sql | [ ] |
| 9 | Verify all tables, roles, functions | [ ] |
| 10 | Test RLS for guest, member, volunteer, board_member, administrator | [ ] |
| 11 | Test membership fee workflow (unpaid → pending_confirmation → confirmed → audit log) | [ ] |
| 12 | Confirm no service_role key in frontend | [ ] |
| 13 | Confirm VITE_DEMO_MODE=false connects to Supabase | [ ] |
| 14 | Confirm VITE_DEMO_MODE=true uses demo data | [ ] |

Phase 1 is complete when all 14 steps are checked off.

---

## Inconsistencies fixed in this version (v2)

| Category | Was | Now |
|---|---|---|
| Role: admin | 'admin' | 'administrator' |
| Role: board | 'board' | 'board_member' |
| Role: treasurer | 'treasurer' | removed from Phase 1 |
| New role | (missing) | 'guest' added |
| New role | (missing) | 'volunteer' added |
| payment_status | 'pending' | 'unpaid' |
| payment_status | 'paid' | 'confirmed' |
| payment_status | 'overdue' | removed — not in Phase 1 |
| payment_status | 'refunded' | removed — not in Phase 1 |
| payment_status new | (missing) | 'pending_confirmation' |
| Fee amount | 500.00 NOK | 350.00 NOK |
| Fee year | 2024 | 2026 |
| Region description | eu-west-1 (Frankfurt) | Ireland / West Europe or Frankfurt / Central Europe |
| RLS function | has_role('admin') | is_admin() |
| RLS function | has_role('board') | is_board_or_admin() |
| RLS function | has_role('treasurer') | removed |
| Policy name suffix | _admin | _administrator or _board_or_admin |
| Test user | admin@frosta-staging.test | test.admin@staging.local |
| Test user | board@frosta-staging.test | test.board@staging.local |
| Test user | member@frosta-staging.test | test.member@staging.local |
| Test user | treasurer@frosta-staging.test | removed |
| New test user | (missing) | test.volunteer@staging.local |
| New test user | (missing) | test.applicant@staging.local (no role) |

Files changed: 0001, 0003, 0005, 0007, 0008, seed.sql, STAGING_CHECKLIST.md
