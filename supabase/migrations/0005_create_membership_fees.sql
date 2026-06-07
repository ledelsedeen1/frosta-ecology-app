-- Diving Ecology Education Frosta
-- Migration 0005: Create membership_fees table
-- Project slug: frosta-staging
--
-- Payment status values (Phase 1):
--   unpaid               - Fee registered, not yet paid
--   pending_confirmation - Payment received, awaiting confirmation
--   confirmed            - Payment confirmed and recorded
--   waived               - Fee waived (e.g. honorary member, hardship)
--
-- Standard membership fee 2026: 350.00 NOK

CREATE TABLE IF NOT EXISTS public.membership_fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  year integer NOT NULL CHECK (year >= 2000 AND year <= 2100),
  amount_nok numeric(10, 2) NOT NULL DEFAULT 350.00,
  currency text NOT NULL DEFAULT 'NOK',
  payment_status text NOT NULL DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid', 'pending_confirmation', 'confirmed', 'waived')),
  payment_date date,
  payment_method text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (member_id, year)
);

COMMENT ON TABLE public.membership_fees IS 'Membership fees for Diving Ecology Education Frosta. Standard 2026: 350 NOK. Currency: NOK';
COMMENT ON COLUMN public.membership_fees.payment_status IS 'Values: unpaid, pending_confirmation, confirmed, waived';
COMMENT ON COLUMN public.membership_fees.amount_nok IS 'Fee amount in NOK. Standard 2026 = 350.00';

CREATE INDEX IF NOT EXISTS membership_fees_member_id_idx ON public.membership_fees(member_id);
CREATE INDEX IF NOT EXISTS membership_fees_year_idx ON public.membership_fees(year);
CREATE INDEX IF NOT EXISTS membership_fees_payment_status_idx ON public.membership_fees(payment_status);

CREATE TRIGGER membership_fees_updated_at
  BEFORE UPDATE ON public.membership_fees
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
