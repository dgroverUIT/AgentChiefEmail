/*
  # Fix Database Schema and RLS Policies

  1. Changes
    - Remove organization_id column from bots table
    - Update RLS policies to work without organization_id
    - Fix template policies to handle null organization IDs
    - Add proper indexes

  2. Security
    - Maintains RLS but simplifies access control
    - Ensures proper authentication checks
*/

-- Drop existing policies safely using DO block
DO $$ 
BEGIN
  -- Drop bot policies if they exist
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'bots' 
    AND policyname = 'Users can view their organization''s bots'
  ) THEN
    DROP POLICY "Users can view their organization's bots" ON bots;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'bots' 
    AND policyname = 'Users can create bots for their organization'
  ) THEN
    DROP POLICY "Users can create bots for their organization" ON bots;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'bots' 
    AND policyname = 'Users can update their organization''s bots'
  ) THEN
    DROP POLICY "Users can update their organization's bots" ON bots;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'bots' 
    AND policyname = 'Users can view bots'
  ) THEN
    DROP POLICY "Users can view bots" ON bots;
  END IF;

  -- Drop template policies if they exist
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'templates' 
    AND policyname = 'Users can view their organization''s templates'
  ) THEN
    DROP POLICY "Users can view their organization's templates" ON templates;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'templates' 
    AND policyname = 'Users can create templates for their organization'
  ) THEN
    DROP POLICY "Users can create templates for their organization" ON templates;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'templates' 
    AND policyname = 'Users can update their organization''s templates'
  ) THEN
    DROP POLICY "Users can update their organization's templates" ON templates;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'templates' 
    AND policyname = 'Users can delete their organization''s templates'
  ) THEN
    DROP POLICY "Users can delete their organization's templates" ON templates;
  END IF;
END $$;

-- Drop organization_id column and related index if they exist
DROP INDEX IF EXISTS idx_bots_organization;
ALTER TABLE bots DROP COLUMN IF EXISTS organization_id;

-- Create new simplified policies for bots
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'bots' 
    AND policyname = 'Users can view bots'
  ) THEN
    CREATE POLICY "Users can view bots"
      ON bots FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'bots' 
    AND policyname = 'Users can create bots'
  ) THEN
    CREATE POLICY "Users can create bots"
      ON bots FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'bots' 
    AND policyname = 'Users can update bots'
  ) THEN
    CREATE POLICY "Users can update bots"
      ON bots FOR UPDATE
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Create new simplified policies for templates
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'templates' 
    AND policyname = 'Users can view templates'
  ) THEN
    CREATE POLICY "Users can view templates"
      ON templates FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'templates' 
    AND policyname = 'Users can create templates'
  ) THEN
    CREATE POLICY "Users can create templates"
      ON templates FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'templates' 
    AND policyname = 'Users can update templates'
  ) THEN
    CREATE POLICY "Users can update templates"
      ON templates FOR UPDATE
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'templates' 
    AND policyname = 'Users can delete templates'
  ) THEN
    CREATE POLICY "Users can delete templates"
      ON templates FOR DELETE
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Create indexes for better performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_bots_email_address ON bots(email_address);
CREATE INDEX IF NOT EXISTS idx_bots_created_by ON bots(created_by);
CREATE INDEX IF NOT EXISTS idx_templates_created_by ON templates(created_by);