/*
# Tighten table grants to least privilege

1. Security changes
- The platform's default privileges granted UPDATE/DELETE (and more) to anon/authenticated on
  public tables. RLS still blocked those verbs (no policy = denied), but this migration makes
  the grants match the app's real usage exactly:
  * campaigns: SELECT, INSERT (public browse + campaign submission)
  * categories: SELECT only
  * donations: SELECT, INSERT (leaderboards + checkout)
  * updates: SELECT, INSERT
  * inquiries: INSERT only for public (read/update stays service_role only)
  * withdrawals: INSERT only for public (read/update stays service_role only)
  * newsletter_subscribers: INSERT only
  * saved_campaigns: SELECT, INSERT, DELETE (donor manages own saved list)
- No policies are changed. The make_donation SECURITY DEFINER function remains intentionally
  callable by anon + authenticated: the donation checkout runs as a guest and the function
  validates that the campaign is approved before recording the donation.

2. Notes
- Revoking unused verbs closes the door even if a permissive policy were added by mistake later.
*/

REVOKE UPDATE, DELETE ON campaigns FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON categories FROM anon, authenticated;
REVOKE UPDATE, DELETE ON donations FROM anon, authenticated;
REVOKE UPDATE, DELETE ON updates FROM anon, authenticated;
REVOKE SELECT, UPDATE, DELETE ON inquiries FROM anon, authenticated;
REVOKE SELECT, UPDATE, DELETE ON withdrawals FROM anon, authenticated;
REVOKE SELECT, UPDATE, DELETE ON newsletter_subscribers FROM anon, authenticated;
REVOKE UPDATE ON saved_campaigns FROM anon, authenticated;
