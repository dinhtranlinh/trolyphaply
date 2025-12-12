-- Run this migration in Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new

BEGIN;

-- Drop existing table if exists (for clean migration)
DROP TABLE IF EXISTS ai_image_prompts CASCADE;

-- Create table
CREATE TABLE ai_image_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  prompt_template TEXT NOT NULL,
  example_image_url TEXT,
  creator_code VARCHAR(30), -- Optional: NULL = anonymous user
  tags TEXT[] DEFAULT '{}',
  category VARCHAR(100) NOT NULL,
  likes_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_ai_prompts_creator_code ON ai_image_prompts(creator_code);
CREATE INDEX idx_ai_prompts_category ON ai_image_prompts(category);
CREATE INDEX idx_ai_prompts_created_at ON ai_image_prompts(created_at DESC);
CREATE INDEX idx_ai_prompts_likes ON ai_image_prompts(likes_count DESC);
CREATE INDEX idx_ai_prompts_views ON ai_image_prompts(views_count DESC);
CREATE INDEX idx_ai_prompts_is_public ON ai_image_prompts(is_public) WHERE is_public = true;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ai_prompts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-update updated_at
CREATE TRIGGER trigger_update_ai_prompts_updated_at
  BEFORE UPDATE ON ai_image_prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_prompts_updated_at();

-- Add constraints
ALTER TABLE ai_image_prompts
  ADD CONSTRAINT check_creator_code_length CHECK (creator_code IS NULL OR (char_length(creator_code) >= 3 AND char_length(creator_code) <= 30)),
  ADD CONSTRAINT check_creator_code_format CHECK (creator_code IS NULL OR creator_code ~ '^[a-zA-Z0-9_]+$'),
  ADD CONSTRAINT check_category_valid CHECK (category IN (
    'Portrait', 'Landscape', 'Product', 'Abstract', 'Video', 
    'Interior', 'Food', 'Business', 'Other'
  ));

-- Add index for filtering by creator_code (including NULL)
CREATE INDEX idx_ai_prompts_creator_code_null ON ai_image_prompts(creator_code) WHERE creator_code IS NOT NULL;

-- Add comments
COMMENT ON TABLE ai_image_prompts IS 'Bảng lưu trữ AI prompts cho tạo ảnh trên Banana';
COMMENT ON COLUMN ai_image_prompts.creator_code IS 'Mã định danh người tạo (optional, NULL = anonymous, 3-30 ký tự, chỉ chữ, số, gạch dưới)';
COMMENT ON COLUMN ai_image_prompts.example_image_url IS 'URL ảnh ví dụ từ Supabase Storage';
COMMENT ON COLUMN ai_image_prompts.prompt_template IS 'Nội dung prompt mẫu để tạo ảnh';

-- Insert sample data for testing
INSERT INTO ai_image_prompts (title, description, prompt_template, creator_code, category, tags, example_image_url) VALUES
(
  'Video phù dữ liệu AR trong rừng Redwood',
  'Một lời nhắc tạo video để tạo cảnh trong rừng gỗ đỏ rêu phong, nơi một người phụ nữ tương tác với thẻ dữ liệu thực tế tăng cường xác định một cây dương xỉ, nhấn mạnh ánh sáng tự nhiên và một cảnh quay rộng, ổn định.',
  'Một video quay cảnh người phụ nữ quý góp trong khu rừng gỗ đỏ rậm rạp, nơi có các tia nắng chiếu qua tán cây. Người phụ nữ này vươn tay ra chạm vào lá dương xỉ, và một thẻ dữ liệu kỹ thuật số nổi lên trên đầu nhẹ, hiển thị tên khoa học, thời gian dòng đời, và các sự kiện sinh thái. Cảnh quay rộng, ổn định.',
  'redwood_ar_demo',
  'Video',
  ARRAY['AR', 'nature', 'forest', 'cinematic'],
  NULL
),
(
  'Chân dung nghệ thuật Fantasy',
  'Prompt tạo chân dung phong cách fantasy với ánh sáng ma thuật',
  'A mystical portrait of an elven warrior, ethereal lighting, glowing eyes, ornate armor with intricate details, fantasy art style, cinematic composition, dramatic atmosphere, 4K quality, trending on ArtStation',
  'fantasy_master_01',
  'Portrait',
  ARRAY['fantasy', 'portrait', 'elf', 'magical'],
  NULL
),
(
  'Sản phẩm Apple Watch hiện đại',
  'Prompt chụp ảnh sản phẩm Apple Watch với lighting chuyên nghiệp',
  'Professional product photography of Apple Watch Ultra, floating in mid-air, dramatic studio lighting, gradient background from deep blue to black, reflective surface, ultra detailed, commercial photography, 8K resolution',
  'product_pro_2024',
  'Product',
  ARRAY['product', 'apple', 'watch', 'studio'],
  NULL
);

COMMIT;

-- ========================================
-- NEXT STEP: Create Storage Bucket
-- ========================================
-- Go to: Storage > Create new bucket
-- Name: ai-prompt-images
-- Public: Yes
-- File size limit: 5MB
-- Allowed MIME types: image/jpeg, image/png, image/webp
