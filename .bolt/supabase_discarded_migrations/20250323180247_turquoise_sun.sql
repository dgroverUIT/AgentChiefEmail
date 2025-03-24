/*
  # Fix Template RLS and Organization Handling

  1. Changes
    - Drop existing template RLS policies
    - Create new policies with better organization ID handling
    - Add index for organization_id lookups
    
  2. Security
    - Ensures proper organization-based access control
    - Uses safe UUID comparisons
    - Adds proper indexing
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their organization's templates" ON templates;
DROP POLICY IF EXISTS "Users can create templates for their organization" ON templates;
DROP POLICY IF EXISTS "Users can update their organization's templates" ON templates;
DROP POLICY IF EXISTS "Users can delete their organization's templates" ON templates;

-- Create index for organization_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_templates_organization_id ON templates(organization_id);

-- Create new policies with proper organization ID handling
CREATE POLICY "Users can view their organization's templates"
  ON templates FOR SELECT
  TO authenticated
  USING (
    organization_id IS NOT NULL AND
    organization_id::text = coalesce(auth.jwt() ->> 'organization_id', '')::text
  );

CREATE POLICY "Users can create templates for their organization"
  ON templates FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IS NOT NULL AND
    organization_id::text = coalesce(auth.jwt() ->> 'organization_id', '')::text
  );

CREATE POLICY "Users can update their organization's templates"
  ON templates FOR UPDATE
  TO authenticated
  USING (
    organization_id IS NOT NULL AND
    organization_id::text = coalesce(auth.jwt() ->> 'organization_id', '')::text
  );

CREATE POLICY "Users can delete their organization's templates"
  ON templates FOR DELETE
  TO authenticated
  USING (
    organization_id IS NOT NULL AND
    organization_id::text = coalesce(auth.jwt() ->> 'organization_id', '')::text
  );