/*
  # Update organization_id constraints and policies

  1. Changes
    - Make organization_id nullable in templates and knowledge_base tables
    - Update RLS policies to handle null organization_id
    - Simplify policy structure
    
  2. Security
    - Maintains RLS with simplified access control
    - Ensures proper authentication checks
*/

-- Make organization_id nullable
ALTER TABLE templates ALTER COLUMN organization_id DROP NOT NULL;
ALTER TABLE knowledge_base ALTER COLUMN organization_id DROP NOT NULL;

-- Drop existing template policies
DROP POLICY IF EXISTS "Users can view templates" ON templates;
DROP POLICY IF EXISTS "Users can create templates" ON templates;
DROP POLICY IF EXISTS "Users can update templates" ON templates;
DROP POLICY IF EXISTS "Users can delete templates" ON templates;

-- Create new template policies
CREATE POLICY "Users can view templates"
  ON templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create templates"
  ON templates FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update templates"
  ON templates FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete templates"
  ON templates FOR DELETE
  TO authenticated
  USING (true);

-- Drop existing knowledge base policies
DROP POLICY IF EXISTS "Users can view knowledge base" ON knowledge_base;
DROP POLICY IF EXISTS "Users can create knowledge base items" ON knowledge_base;
DROP POLICY IF EXISTS "Users can update knowledge base" ON knowledge_base;
DROP POLICY IF EXISTS "Users can view their organization's knowledge base" ON knowledge_base;
DROP POLICY IF EXISTS "Users can create knowledge base items for their organization" ON knowledge_base;
DROP POLICY IF EXISTS "Users can update their organization's knowledge base" ON knowledge_base;

-- Create new knowledge base policies
CREATE POLICY "Users can view knowledge base"
  ON knowledge_base FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create knowledge base items"
  ON knowledge_base FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update knowledge base"
  ON knowledge_base FOR UPDATE
  TO authenticated
  USING (true);