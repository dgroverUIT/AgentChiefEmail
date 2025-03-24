/*
  # Remove Organization ID Column

  1. Changes
    - Drop organization_id column and related index
    - No policy changes needed since they were updated in previous migrations
    
  2. Security
    - No security changes as policies are already in place
*/

-- Drop organization-related index and column
DROP INDEX IF EXISTS idx_bots_organization;
ALTER TABLE bots DROP COLUMN IF EXISTS organization_id;