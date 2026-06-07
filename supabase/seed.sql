-- Diving Ecology Education Frosta
-- Seed data for development/staging (frosta-staging)
-- Member number format: YYYY-NNN
-- Formal display: Diving Ecology Education Frosta YYYY-NNN
-- Standard membership fee 2026: 350.00 NOK
-- WARNING: Do NOT run this in production (frosta-production)

-- ========================
-- Seed roles (idempotent)
-- Phase 1 role names: guest, member, volunteer, board_member, administrator
-- ========================
INSERT INTO public.roles (name, description) VALUES
  ('guest',         'Unauthenticated or unverified visitor of Diving Ecology Education Frosta'),
  ('member',        'Approved member of Diving Ecology Education Frosta'),
  ('volunteer',     'Active volunteer of Diving Ecology Education Frosta'),
  ('board_member',  'Board member of Diving Ecology Education Frosta'),
  ('administrator', 'System administrator of Diving Ecology Education Frosta')
ON CONFLICT (name) DO NOTHING;

-- ========================
-- Seed demo members
-- user_id is NULL — no auth users exist at seed time
-- ========================
INSERT INTO public.members (member_number, full_name, email, member_type, member_status, join_date) VALUES
  ('2026-001', 'Arne Solbakken',   'arne.solbakken@example.com',   'regular', 'active',   '2026-01-10'),
  ('2026-002', 'Marek Kowalski',   'marek.kowalski@example.com',   'regular', 'active',   '2026-01-15'),
  ('2026-003', 'Lars Eriksen',     'lars.eriksen@example.com',     'regular', 'active',   '2026-02-01'),
  ('2026-004', 'Anna Nowak',       'anna.nowak@example.com',       'family',  'active',   '2026-02-01'),
  ('2026-005', 'Johan Berg',       'johan.berg@example.com',       'junior',  'active',   '2026-03-01'),
  ('2025-001', 'Ingrid Holm',      'ingrid.holm@example.com',      'regular', 'active',   '2025-01-20'),
  ('2025-002', 'Piotr Wisnewski',  'piotr.wisnewski@example.com',  'regular', 'inactive', '2025-06-01')
ON CONFLICT (member_number) DO NOTHING;

-- ========================
-- Seed membership fees for 2026
-- Standard fee: 350.00 NOK
-- Payment statuses: unpaid, pending_confirmation, confirmed, waived
-- ========================

-- 2026-001: confirmed (paid via Vipps)
INSERT INTO public.membership_fees (member_id, year, amount_nok, currency, payment_status, payment_date, payment_method)
SELECT m.id, 2026, 350.00, 'NOK', 'confirmed', '2026-01-12', 'Vipps'
FROM public.members m WHERE m.member_number = '2026-001'
ON CONFLICT (member_id, year) DO NOTHING;

-- 2026-002: pending_confirmation (payment received, not yet confirmed)
INSERT INTO public.membership_fees (member_id, year, amount_nok, currency, payment_status)
SELECT m.id, 2026, 350.00, 'NOK', 'pending_confirmation'
FROM public.members m WHERE m.member_number = '2026-002'
ON CONFLICT (member_id, year) DO NOTHING;

-- 2026-003: unpaid
INSERT INTO public.membership_fees (member_id, year, amount_nok, currency, payment_status)
SELECT m.id, 2026, 350.00, 'NOK', 'unpaid'
FROM public.members m WHERE m.member_number = '2026-003'
ON CONFLICT (member_id, year) DO NOTHING;

-- 2026-004: unpaid (family member)
INSERT INTO public.membership_fees (member_id, year, amount_nok, currency, payment_status)
SELECT m.id, 2026, 350.00, 'NOK', 'unpaid'
FROM public.members m WHERE m.member_number = '2026-004'
ON CONFLICT (member_id, year) DO NOTHING;

-- 2026-005: waived (junior member)
INSERT INTO public.membership_fees (member_id, year, amount_nok, currency, payment_status, notes)
SELECT m.id, 2026, 0.00, 'NOK', 'waived', 'Junior member fee waived for 2026'
FROM public.members m WHERE m.member_number = '2026-005'
ON CONFLICT (member_id, year) DO NOTHING;
