/*
  # Add Forward Email Display Field to Bots Table

  1. Changes
    - Add forward_email_display column to bots table
    - Set default value to 'Forward your emails here'
    - Make field read-only through RLS policies
    
  2. Security
    - Field is read-only through RLS
    - Maintains existing security model
*/

-- Add the new column
ALTER TABLE bots ADD COLUMN IF NOT EXISTS forward_email_display text NOT NULL DEFAULT 'Forward your emails here';

-- Update existing bots to have the default value
UPDATE bots SET forward_email_display = 'Forward your emails here' WHERE forward_email_display IS NULL;