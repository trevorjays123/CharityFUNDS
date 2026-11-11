/*
# Add missing foreign-key indexes

1. Performance changes
- Adds indexes on updates(campaign_id) and withdrawals(campaign_id), which the performance
  advisor flagged as unindexed foreign keys. Other advisor items (unused indexes on a fresh
  database, auth connection strategy) require no action.
*/

CREATE INDEX IF NOT EXISTS idx_updates_campaign ON updates(campaign_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_campaign ON withdrawals(campaign_id);
