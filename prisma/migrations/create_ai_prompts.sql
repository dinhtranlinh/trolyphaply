-- Migration: Create AI Image Prompts table
-- Date: 2025-12-12
-- Purpose: Quản lý prompts tạo ảnh AI cho Banana

-- Create table
CREATE TABLE IF NOT EXISTS ai_image_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  prompt_template TEXT NOT NULL,
  example_image_url TEXT,
  creator_code VARCHAR(30) NOT NULL UNIQUE,
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
  ADD CONSTRAINT check_creator_code_length CHECK (char_length(creator_code) >= 3 AND char_length(creator_code) <= 30),
  ADD CONSTRAINT check_creator_code_format CHECK (creator_code ~ '^[a-zA-Z0-9_]+$'),
  ADD CONSTRAINT check_category_valid CHECK (category IN (
    'Portrait', 'Landscape', 'Product', 'Abstract', 'Video', 
    'Interior', 'Food', 'Business', 'Other'
  ));

-- Add comments
COMMENT ON TABLE ai_image_prompts IS 'Bảng lưu trữ AI prompts cho tạo ảnh trên Banana';
COMMENT ON COLUMN ai_image_prompts.creator_code IS 'Mã định danh người tạo (unique, 3-30 ký tự)';
COMMENT ON COLUMN ai_image_prompts.example_image_url IS 'URL ảnh ví dụ từ Supabase Storage';
COMMENT ON COLUMN ai_image_prompts.prompt_template IS 'Nội dung prompt mẫu để tạo ảnh';

-- Insert sample data for testing
INSERT INTO ai_image_prompts (title, description, prompt_template, creator_code, category, tags) VALUES
(
  'Video phù dữ liệu AR trong rừng Redwood',
  'Một lời nhắc tạo video để tạo cảnh trong rừng gỗ đỏ rêu phong, nơi một người phụ nữ tương tác với thẻ dữ liệu thực tế tăng cường xác định một cây dương xỉ, nhấn mạnh ánh sáng tự nhiên và một cảnh quay rộng, ổn định.',
  'Một video quay cảnh người phụ nữ quý gói trong khu rừng gỗ đỏ rậm rạp, nơi có các tia nắng chiếu qua tán cây. Người phụ nữ này vươn tay ra chạm vào lá dương xỉ, và một thẻ dữ liệu kỹ thuật số nổi lên trên đầu nhẹ, hiển thị tên khoa học, thời gian dòng đời, và các sự kiện sinh thái. Cảnh quay rộng, ổn định.',
  'redwood_ar',
  'Video',
  ARRAY['AR', 'nature', 'forest', 'cinematic']
),
(
  'Chân dung nghệ thuật Fantasy',
  'Prompt tạo chân dung phong cách fantasy với ánh sáng ma thuật',
  'A mystical portrait of an elven warrior, ethereal lighting, glowing eyes, ornate armor with intricate details, fantasy art style, cinematic composition, dramatic atmosphere, 4K quality, trending on ArtStation',
  'fantasy_master',
  'Portrait',
  ARRAY['fantasy', 'portrait', 'elf', 'magical']
);
