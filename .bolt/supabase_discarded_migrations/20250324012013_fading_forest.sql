/*
  # Initial Schema for EmailAI Application

  1. New Tables
    - `bots`
      - Core bot configuration and statistics
      - Tracks bot status, email settings, and performance metrics
    
    - `conversations`
      - Email conversation threads
      - Links messages and tracks conversation status
    
    - `messages`
      - Individual email messages within conversations
      - Stores message content and metadata
    
    - `templates`
      - Email response templates
      - Includes variables and categorization
    
    - `knowledge_base`
      - Training data sources
      - Documents and website content for bot training
    
    - `fine_tuning_questions`
      - Training questions for bots
      - Expected answers and performance metrics
    
    - `bot_fine_tuning_questions`
      - Junction table for bot-question associations
      - Tracks which questions are used for which bots

  2. Security
    - RLS enabled on all tables
    - Authentication-based access control
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Bots table
CREATE TABLE IF NOT EXISTS bots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  email_address text UNIQUE NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_active timestamptz,
  total_emails integer NOT NULL DEFAULT 0,
  response_rate numeric(5,2) NOT NULL DEFAULT 100.0,
  forward_template_id uuid,
  forward_email_address text,
  include_customer_in_forward boolean DEFAULT false,
  created_by uuid NOT NULL
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id uuid NOT NULL REFERENCES bots(id),
  customer_email text NOT NULL,
  subject text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  started_at timestamptz NOT NULL DEFAULT now(),
  last_message_at timestamptz NOT NULL DEFAULT now(),
  total_messages integer NOT NULL DEFAULT 0,
  tags text[] DEFAULT '{}',
  sentiment text DEFAULT 'neutral'
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id),
  sender text NOT NULL,
  content text NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT now()
);

-- Templates table
CREATE TABLE IF NOT EXISTS templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  subject text NOT NULL,
  content text NOT NULL,
  variables text[] DEFAULT '{}',
  language text NOT NULL DEFAULT 'en',
  last_modified timestamptz NOT NULL DEFAULT now(),
  created_by uuid NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  tags text[] DEFAULT '{}'
);

-- Knowledge base table
CREATE TABLE IF NOT EXISTS knowledge_base (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  source text NOT NULL,
  status text NOT NULL DEFAULT 'processing',
  description text,
  last_updated timestamptz NOT NULL DEFAULT now(),
  tags text[] DEFAULT '{}',
  created_by uuid NOT NULL
);

-- Fine-tuning questions table
CREATE TABLE IF NOT EXISTS fine_tuning_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  expected_answer text NOT NULL,
  category text NOT NULL,
  difficulty text NOT NULL,
  tags text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  last_used timestamptz,
  success_rate numeric(5,2),
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid NOT NULL
);

-- Bot-question association table
CREATE TABLE IF NOT EXISTS bot_fine_tuning_questions (
  bot_id uuid NOT NULL REFERENCES bots(id),
  question_id uuid NOT NULL REFERENCES fine_tuning_questions(id),
  PRIMARY KEY (bot_id, question_id)
);

-- Enable RLS on all tables
ALTER TABLE bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE fine_tuning_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_fine_tuning_questions ENABLE ROW LEVEL SECURITY;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bots_email_address ON bots(email_address);
CREATE INDEX IF NOT EXISTS idx_bots_created_by ON bots(created_by);
CREATE INDEX IF NOT EXISTS idx_conversations_bot ON conversations(bot_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_templates_created_by ON templates(created_by);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_created_by ON knowledge_base(created_by);
CREATE INDEX IF NOT EXISTS idx_fine_tuning_questions_created_by ON fine_tuning_questions(created_by);
CREATE INDEX IF NOT EXISTS idx_bot_fine_tuning_questions_bot ON bot_fine_tuning_questions(bot_id);
CREATE INDEX IF NOT EXISTS idx_bot_fine_tuning_questions_question ON bot_fine_tuning_questions(question_id);

-- Drop any existing policies to avoid conflicts
DO $$ 
BEGIN
  -- Drop all existing policies
  DROP POLICY IF EXISTS "Users can view bots" ON bots;
  DROP POLICY IF EXISTS "Users can create bots" ON bots;
  DROP POLICY IF EXISTS "Users can update bots" ON bots;
  
  DROP POLICY IF EXISTS "Users can view conversations" ON conversations;
  DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
  DROP POLICY IF EXISTS "Users can update conversations" ON conversations;
  
  DROP POLICY IF EXISTS "Users can view messages" ON messages;
  DROP POLICY IF EXISTS "Users can create messages" ON messages;
  
  DROP POLICY IF EXISTS "Users can view templates" ON templates;
  DROP POLICY IF EXISTS "Users can create templates" ON templates;
  DROP POLICY IF EXISTS "Users can update templates" ON templates;
  
  DROP POLICY IF EXISTS "Users can view knowledge base" ON knowledge_base;
  DROP POLICY IF EXISTS "Users can create knowledge base items" ON knowledge_base;
  DROP POLICY IF EXISTS "Users can update knowledge base" ON knowledge_base;
  
  DROP POLICY IF EXISTS "Users can view fine-tuning questions" ON fine_tuning_questions;
  DROP POLICY IF EXISTS "Users can create fine-tuning questions" ON fine_tuning_questions;
  DROP POLICY IF EXISTS "Users can update fine-tuning questions" ON fine_tuning_questions;
  
  DROP POLICY IF EXISTS "Users can view bot-question associations" ON bot_fine_tuning_questions;
  DROP POLICY IF EXISTS "Users can create bot-question associations" ON bot_fine_tuning_questions;
  DROP POLICY IF EXISTS "Users can update bot-question associations" ON bot_fine_tuning_questions;
END $$;

-- Create policies for all tables
-- Bots policies
CREATE POLICY "Users can view bots"
  ON bots FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create bots"
  ON bots FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update bots"
  ON bots FOR UPDATE
  TO authenticated
  USING (true);

-- Conversations policies
CREATE POLICY "Users can view conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update conversations"
  ON conversations FOR UPDATE
  TO authenticated
  USING (true);

-- Messages policies
CREATE POLICY "Users can view messages"
  ON messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Templates policies
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

-- Knowledge base policies
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

-- Fine-tuning questions policies
CREATE POLICY "Users can view fine-tuning questions"
  ON fine_tuning_questions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create fine-tuning questions"
  ON fine_tuning_questions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update fine-tuning questions"
  ON fine_tuning_questions FOR UPDATE
  TO authenticated
  USING (true);

-- Bot-question association policies
CREATE POLICY "Users can view bot-question associations"
  ON bot_fine_tuning_questions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create bot-question associations"
  ON bot_fine_tuning_questions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update bot-question associations"
  ON bot_fine_tuning_questions FOR UPDATE
  TO authenticated
  USING (true);