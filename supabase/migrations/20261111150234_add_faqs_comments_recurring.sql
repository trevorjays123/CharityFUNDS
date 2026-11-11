/*
# Add FAQs, comments, and recurring donations

1. New Tables
- `faqs` (id, question, answer, sort_order, created_at) — public FAQ page content,
  manageable from the admin panel.
- `comments` (id, campaign_id, author_name, body, created_at) — public supporter
  comments on a campaign page.

2. Modified Tables
- `donations`: new columns
  * `frequency` text ('one_time' | 'monthly', default 'one_time') — marks a recurring gift.
  * `next_charge_at` timestamptz — the simulated next billing date for monthly donations.

3. Functions
- `make_donation` gains an optional trailing `p_frequency` parameter. When 'monthly',
  it stamps `next_charge_at` one month out. Existing callers keep working because the
  new parameter defaults to 'one_time'.

4. Security
- RLS enabled on `faqs` and `comments`.
- Public (anon + authenticated) can read/insert comments, and read faqs.
- Only service_role (the admin edge function) can insert/delete faqs.
- Grants match app usage exactly.

5. Notes
- Seeding of initial FAQ rows happens in a follow-up migration.
*/

CREATE TABLE IF NOT EXISTS faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_campaign ON comments(campaign_id);

ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'donations' AND column_name = 'frequency'
  ) THEN
    ALTER TABLE donations
      ADD COLUMN frequency text NOT NULL DEFAULT 'one_time'
        CHECK (frequency IN ('one_time','monthly')),
      ADD COLUMN next_charge_at timestamptz;
  END IF;
END $$;

GRANT SELECT, INSERT ON comments TO anon, authenticated;
GRANT SELECT ON faqs TO anon, authenticated;
GRANT SELECT, INSERT, DELETE ON faqs TO service_role;

DROP POLICY IF EXISTS "public_select_comments" ON comments;
CREATE POLICY "public_select_comments" ON comments
FOR SELECT TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "public_insert_comments" ON comments;
CREATE POLICY "public_insert_comments" ON comments
FOR INSERT TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "public_select_faqs" ON faqs;
CREATE POLICY "public_select_faqs" ON faqs
FOR SELECT TO anon, authenticated
USING (true);

CREATE OR REPLACE FUNCTION make_donation(
  p_campaign_id uuid,
  p_donor_name text,
  p_amount numeric,
  p_donor_email text DEFAULT NULL,
  p_message text DEFAULT NULL,
  p_payment_method text DEFAULT 'stripe',
  p_frequency text DEFAULT 'one_time'
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_donation_id uuid;
  v_status text;
BEGIN
  IF p_frequency NOT IN ('one_time', 'monthly') THEN
    RAISE EXCEPTION 'Invalid donation frequency';
  END IF;

  SELECT status INTO v_status FROM campaigns WHERE id = p_campaign_id FOR UPDATE;
  IF v_status IS NULL OR v_status <> 'approved' THEN
    RAISE EXCEPTION 'Campaign not found or not accepting donations';
  END IF;

  INSERT INTO donations (campaign_id, donor_name, donor_email, message, amount, payment_method, payment_status, frequency, next_charge_at)
  VALUES (
    p_campaign_id, p_donor_name, p_donor_email, p_message, p_amount, p_payment_method, 'succeeded',
    p_frequency,
    CASE WHEN p_frequency = 'monthly' THEN now() + interval '1 month' ELSE NULL END
  )
  RETURNING id INTO v_donation_id;

  UPDATE campaigns
  SET raised_amount = raised_amount + p_amount
  WHERE id = p_campaign_id;

  RETURN v_donation_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION make_donation(uuid, text, numeric, text, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION make_donation(uuid, text, numeric, text, text, text, text) TO anon, authenticated;
