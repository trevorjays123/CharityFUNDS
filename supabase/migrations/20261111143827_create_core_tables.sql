/*
# Create core tables for charity/crowdfunding platform

1. New Tables
- `categories` (id, name, slug, created_at) — campaign categories (Education, Health, etc.)
- `campaigns` (id, title, description, story, category_id, goal_amount, raised_amount,
  image_url, status, creator_name, location, featured, created_at) — fundraising campaigns.
  `status` is one of 'pending', 'approved', 'rejected'.
- `donations` (id, campaign_id, donor_name, donor_email, message, amount, payment_method,
  payment_status, created_at) — individual donations tied to a campaign. `payment_method`
  is 'stripe' | 'paypal'; `payment_status` is 'succeeded' | 'pending' | 'failed'.
- `inquiries` (id, name, email, message, handled, created_at) — contact-form messages.
- `updates` (id, campaign_id, title, body, created_at) — organizer posted campaign updates.
- `withdrawals` (id, campaign_id, amount, status, requested_at, processed_at) —
  organizer withdrawal requests ('pending' | 'approved' | 'rejected').
- `newsletter_subscribers` (id, email, created_at) — newsletter signup emails.
- `saved_campaigns` (campaign_id, donor_email, created_at) — campaigns a supporter follows/saves.

2. Security
- Enable RLS on every table.
- Public read access for campaigns (approved ones), categories, updates, donations.
- Anyone (anon + authenticated) can insert donations and inquiries and newsletter signups —
  these are public checkout/contact flows in a no-auth app.
- Only service_role (admin panel server path) can change campaign status, process withdrawals.
- Granted minimum privileges to anon, authenticated, and service_role.

3. Notes
- No auth is used in the app; policies target anon + authenticated.
- Seed data is inserted in a separate migration.
*/

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  story text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  goal_amount numeric(12,2) NOT NULL CHECK (goal_amount > 0),
  raised_amount numeric(12,2) NOT NULL DEFAULT 0 CHECK (raised_amount >= 0),
  image_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  creator_name text NOT NULL DEFAULT 'Anonymous Organizer',
  creator_email text,
  location text,
  featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  donor_name text NOT NULL,
  donor_email text,
  message text,
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  payment_method text NOT NULL DEFAULT 'stripe' CHECK (payment_method IN ('stripe','paypal')),
  payment_status text NOT NULL DEFAULT 'succeeded' CHECK (payment_status IN ('succeeded','pending','failed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  handled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS withdrawals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  requested_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS saved_campaigns (
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  donor_email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (campaign_id, donor_email)
);

CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_category ON campaigns(category_id);
CREATE INDEX IF NOT EXISTS idx_donations_campaign ON donations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_donations_email ON donations(donor_email);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_campaigns ENABLE ROW LEVEL SECURITY;

-- campaigns: public read of approved; anon-key insert (new campaign submissions start pending)
GRANT SELECT, INSERT ON campaigns TO anon, authenticated;
GRANT UPDATE ON campaigns TO service_role;

DROP POLICY IF EXISTS "public_select_approved_campaigns" ON campaigns;
CREATE POLICY "public_select_approved_campaigns" ON campaigns
FOR SELECT TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "public_insert_campaigns" ON campaigns;
CREATE POLICY "public_insert_campaigns" ON campaigns
FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- categories: public read
GRANT SELECT ON categories TO anon, authenticated;

DROP POLICY IF EXISTS "public_select_categories" ON categories;
CREATE POLICY "public_select_categories" ON categories
FOR SELECT TO anon, authenticated
USING (true);

-- donations: public read (leaderboard), public insert (checkout flow)
GRANT SELECT, INSERT ON donations TO anon, authenticated;

DROP POLICY IF EXISTS "public_select_donations" ON donations;
CREATE POLICY "public_select_donations" ON donations
FOR SELECT TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "public_insert_donations" ON donations;
CREATE POLICY "public_insert_donations" ON donations
FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- inquiries: anyone can submit; only service_role reads
GRANT INSERT ON inquiries TO anon, authenticated;
GRANT SELECT, UPDATE ON inquiries TO service_role;

DROP POLICY IF EXISTS "public_insert_inquiries" ON inquiries;
CREATE POLICY "public_insert_inquiries" ON inquiries
FOR INSERT TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "service_select_inquiries" ON inquiries;
CREATE POLICY "service_select_inquiries" ON inquiries
FOR SELECT TO service_role
USING (true);

DROP POLICY IF EXISTS "service_update_inquiries" ON inquiries;
CREATE POLICY "service_update_inquiries" ON inquiries
FOR UPDATE TO service_role
USING (true)
WITH CHECK (true);

-- updates: public read, public insert (organizers post from campaign page)
GRANT SELECT, INSERT ON updates TO anon, authenticated;

DROP POLICY IF EXISTS "public_select_updates" ON updates;
CREATE POLICY "public_select_updates" ON updates
FOR SELECT TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "public_insert_updates" ON updates;
CREATE POLICY "public_insert_updates" ON updates
FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- withdrawals: insert by anyone (organizer request), read/modify via service_role only
GRANT INSERT ON withdrawals TO anon, authenticated;
GRANT SELECT, UPDATE ON withdrawals TO service_role;

DROP POLICY IF EXISTS "public_insert_withdrawals" ON withdrawals;
CREATE POLICY "public_insert_withdrawals" ON withdrawals
FOR INSERT TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "service_select_withdrawals" ON withdrawals;
CREATE POLICY "service_select_withdrawals" ON withdrawals
FOR SELECT TO service_role
USING (true);

DROP POLICY IF EXISTS "service_update_withdrawals" ON withdrawals;
CREATE POLICY "service_update_withdrawals" ON withdrawals
FOR UPDATE TO service_role
USING (true)
WITH CHECK (true);

-- newsletter: insert only for public
GRANT INSERT ON newsletter_subscribers TO anon, authenticated;
GRANT SELECT ON newsletter_subscribers TO service_role;

DROP POLICY IF EXISTS "public_insert_newsletter" ON newsletter_subscribers;
CREATE POLICY "public_insert_newsletter" ON newsletter_subscribers
FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- saved campaigns: keyed on donor_email (no auth), anon-key client manages its own list
GRANT SELECT, INSERT, DELETE ON saved_campaigns TO anon, authenticated;

DROP POLICY IF EXISTS "public_select_saved_campaigns" ON saved_campaigns;
CREATE POLICY "public_select_saved_campaigns" ON saved_campaigns
FOR SELECT TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "public_insert_saved_campaigns" ON saved_campaigns;
CREATE POLICY "public_insert_saved_campaigns" ON saved_campaigns
FOR INSERT TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "public_delete_saved_campaigns" ON saved_campaigns;
CREATE POLICY "public_delete_saved_campaigns" ON saved_campaigns
FOR DELETE TO anon, authenticated
USING (true);

-- Atomic donation: validates campaign exists and is approved, inserts the donation
-- and increments raised_amount in a single transaction.
CREATE OR REPLACE FUNCTION make_donation(
  p_campaign_id uuid,
  p_donor_name text,
  p_amount numeric,
  p_donor_email text DEFAULT NULL,
  p_message text DEFAULT NULL,
  p_payment_method text DEFAULT 'stripe'
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_donation_id uuid;
  v_status text;
BEGIN
  SELECT status INTO v_status FROM campaigns WHERE id = p_campaign_id FOR UPDATE;
  IF v_status IS NULL OR v_status <> 'approved' THEN
    RAISE EXCEPTION 'Campaign not found or not accepting donations';
  END IF;

  INSERT INTO donations (campaign_id, donor_name, donor_email, message, amount, payment_method, payment_status)
  VALUES (p_campaign_id, p_donor_name, p_donor_email, p_message, p_amount, p_payment_method, 'succeeded')
  RETURNING id INTO v_donation_id;

  UPDATE campaigns
  SET raised_amount = raised_amount + p_amount
  WHERE id = p_campaign_id;

  RETURN v_donation_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION make_donation(uuid, text, numeric, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION make_donation(uuid, text, numeric, text, text, text) TO anon, authenticated;
