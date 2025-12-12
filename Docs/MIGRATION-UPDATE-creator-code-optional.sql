-- Update AI Prompts: Make creator_code optional (allow anonymous users)
-- Run this in Supabase SQL Editor after the initial migration
-- URL: https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new

BEGIN;

-- Step 1: Drop the UNIQUE constraint on creator_code
ALTER TABLE ai_image_prompts DROP CONSTRAINT IF EXISTS ai_image_prompts_creator_code_key;

-- Step 2: Make creator_code nullable
ALTER TABLE ai_image_prompts ALTER COLUMN creator_code DROP NOT NULL;

-- Step 3: Drop old constraints
ALTER TABLE ai_image_prompts DROP CONSTRAINT IF EXISTS check_creator_code_length;
ALTER TABLE ai_image_prompts DROP CONSTRAINT IF EXISTS check_creator_code_format;

-- Step 4: Add new constraints (allow NULL)
ALTER TABLE ai_image_prompts
  ADD CONSTRAINT check_creator_code_length CHECK (creator_code IS NULL OR (char_length(creator_code) >= 3 AND char_length(creator_code) <= 30)),
  ADD CONSTRAINT check_creator_code_format CHECK (creator_code IS NULL OR creator_code ~ '^[a-zA-Z0-9_]+$');

-- Step 5: Drop old index
DROP INDEX IF EXISTS idx_ai_prompts_creator_code;

-- Step 6: Create new index excluding NULL values
CREATE INDEX idx_ai_prompts_creator_code_not_null ON ai_image_prompts(creator_code) WHERE creator_code IS NOT NULL;

-- Step 7: Update comment
COMMENT ON COLUMN ai_image_prompts.creator_code IS 'Mã định danh người tạo (optional, NULL = anonymous, 3-30 ký tự, chỉ chữ, số, gạch dưới)';

COMMIT;

-- ========================================
-- VERIFY CHANGES
-- ========================================
-- Check constraints:
-- SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'ai_image_prompts'::regclass;

-- Check indexes:
-- SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'ai_image_prompts';

-- Test insert anonymous prompt:
-- INSERT INTO ai_image_prompts (title, prompt_template, category, creator_code) 
-- VALUES ('Test Anonymous', 'Test prompt', 'Portrait', NULL);

-- Test insert with creator_code:
-- INSERT INTO ai_image_prompts (title, prompt_template, category, creator_code) 
-- VALUES ('Test Named', 'Test prompt 2', 'Landscape', 'test_user');
