-- SQL Script to create style_guides tables
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/icqivkassoxfaukqbzyt/sql

-- Create style_guides table
CREATE TABLE IF NOT EXISTS style_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  characteristics TEXT[] NOT NULL DEFAULT '{}',
  tone TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'vi',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create style_guide_examples table
CREATE TABLE IF NOT EXISTS style_guide_examples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  style_guide_id UUID NOT NULL REFERENCES style_guides(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_style_guide_examples_style_guide_id 
  ON style_guide_examples(style_guide_id);
CREATE INDEX IF NOT EXISTS idx_style_guides_is_default 
  ON style_guides(is_default);

-- Verify tables created
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('style_guides', 'style_guide_examples');
