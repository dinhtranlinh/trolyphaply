-- Add missing version column to qa_prompts table
ALTER TABLE qa_prompts ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

-- Update existing records to have version 1
UPDATE qa_prompts SET version = 1 WHERE version IS NULL;
