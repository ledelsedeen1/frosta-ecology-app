# Application handoff audit

Date: 2026-06-10

Audited application:

`remix_-diving-ecology-education-frosta (4)`

## GitHub and Claude changes

The supplied folders are exports, not Git working copies. They contain no
`.git` directory and no repository URL, so GitHub commits, authors and commit
hashes could not be verified.

File hashes show only two changes between local copies `(3)` and `(4)`:

- `src/views/DashboardView.tsx`: replaced the fixed date `2026-05-31` with the
  current ISO date.
- `src/translations.ts`: changed the Norwegian, Polish and English labels from
  “simulation time” to “current date”.

The included staging checklist also documents an earlier Phase 1 v2 change:

- roles changed to `guest`, `member`, `volunteer`, `board_member`,
  `administrator`;
- payment statuses changed to `unpaid`, `pending_confirmation`, `confirmed`,
  `waived`;
- the 2026 fee changed to 350 NOK;
- migrations `0001`, `0003`, `0005`, `0007`, `0008` and `seed.sql` were updated.

That earlier change is identical in copies `(3)` and `(4)`, so its Git commit
cannot be independently reconstructed from the supplied files.

## Supabase findings

The repository had two conflicting database models:

- `supabase/schema.sql`: legacy roles and column names;
- migrations `0001` through `0008`: current Phase 1 model.

Application services also mixed both models. Login expected `profiles.role`,
members expected legacy columns, and fees expected `amount/status/paid_at`
instead of `amount_nok/payment_status/payment_date`.

The frontend adapters were aligned with migrations `0001` through `0008`.

Prepared:

- `supabase/preflight_audit.sql`: read-only database inventory;
- `supabase/migrations/0009_safe_app_alignment.sql`: additive migration;
- `SUPABASE_MIGRATION_PLAN.md`: exact SQL Editor procedure.

Migration 0009 adds:

- member consent, language, emergency-contact and photo fields;
- hardened role/member-number functions;
- documents, events, participants, projects and announcements;
- chat messages and read receipts;
- payment claims;
- membership-card view;
- private Storage buckets and RLS policies.

No remote migration was executed. The local export has no Supabase credentials,
and the dashboard session was unavailable to the execution tools.

## Security changes

- One Supabase client and one demo-mode decision are now used.
- Login reads roles through `current_user_roles()` and maps database roles to
  existing UI aliases.
- The in-memory API is disabled by default in production.
- Live mode no longer loads the mock server state.
- Demo API mutations are blocked from live mode.
- Production server hides the Express signature, limits JSON size and adds
  baseline security headers.
- No service-role key is present in frontend code.
- `npm audit` reports zero known vulnerabilities.

## Mobile changes

- Added Capacitor 8.4.0 for Android and iOS.
- Added `android/` and `ios/` projects.
- Application ID: `no.divingecologyfrosta.app` (provisional).
- App version: `0.1.0`.
- Android version code: `1`.
- iOS build number: `1`.
- Added mobile build/sync scripts and release documentation.
- Added valid PWA icons, maskable icon, Apple touch icon and favicon.
- Added native Android/iOS icons and splash screens.
- PWA orientation now supports phones and tablets.

The application icon master was generated as a project asset and saved in:

- `resources/icon.png`
- `resources/splash.png`

## Verification

Passed:

- `npm run lint`
- `npm run build`
- `npx cap sync`
- production server smoke test: `/` returned HTTP 200
- production demo API guard: `/api/state` returned HTTP 503
- `npm audit`: 0 vulnerabilities
- Capacitor Doctor: Android project structure valid

Not available in this environment:

- Android APK/AAB build: JDK and Android SDK are not installed.
- iOS archive: requires macOS and Xcode.
- visual browser/device test: the in-app browser process could not start on
  this Windows environment.

## Remaining issues

- Verify the real Supabase schema with `preflight_audit.sql` before migration.
- Confirm whether project `keyfdbzybbyxnrjqkule` is staging or production.
- Do not run `seed.sql` against production.
- Chat, announcements, event registration, Storage upload and membership cards
  have database foundations but are not fully wired to the live UI.
- The JavaScript bundle is about 831 kB before gzip and should be code-split.
- Confirm the application ID before Play Console/App Store Connect registration.
- Verify organisation contact details, bank account, privacy policy and all
  demo-looking personal data before a public release.
- Add automated unit, RLS and end-to-end tests.
