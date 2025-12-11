-- Migration: Create Q&A Prompt Management System
-- Created: 2025-12-11
-- Purpose: Tạo bảng quản lý prompt hỏi đáp, văn phong luật, nguồn dữ liệu

-- 1. Bảng văn phong luật (legal writing styles)
CREATE TABLE IF NOT EXISTS legal_writing_styles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  example_content TEXT,
  tone VARCHAR(100),
  characteristics JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Bảng prompt hỏi đáp
CREATE TABLE IF NOT EXISTS qa_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  system_prompt TEXT NOT NULL,
  formatting_instructions TEXT,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Bảng liên kết prompt với văn phong (many-to-many)
CREATE TABLE IF NOT EXISTS qa_prompt_writing_styles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID REFERENCES qa_prompts(id) ON DELETE CASCADE,
  style_id UUID REFERENCES legal_writing_styles(id) ON DELETE CASCADE,
  priority INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(prompt_id, style_id)
);

-- 4. Bảng nguồn dữ liệu ưu tiên
CREATE TABLE IF NOT EXISTS data_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  url VARCHAR(500) NOT NULL,
  priority INTEGER NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Bảng lịch sử thay đổi prompt
CREATE TABLE IF NOT EXISTS qa_prompt_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID REFERENCES qa_prompts(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  system_prompt TEXT NOT NULL,
  formatting_instructions TEXT,
  changed_by VARCHAR(255),
  changed_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_qa_prompts_active ON qa_prompts(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_data_sources_priority ON data_sources(priority);
CREATE INDEX IF NOT EXISTS idx_prompt_styles_prompt ON qa_prompt_writing_styles(prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_history_prompt ON qa_prompt_history(prompt_id, version);

-- Insert default legal writing styles (extracted from authentic Vietnamese legal writings in vanmau.txt)
INSERT INTO legal_writing_styles (name, description, example_content, tone, characteristics) VALUES
(
  'Phản biện xây dựng',
  'Văn phong phản biện mang tính xây dựng, đặt câu hỏi sắc bén dựa trên phân tích pháp lý sâu',
  'Xin đặt ra một câu hỏi cho dự thảo: giả sử đào tạo một luật sư công bắt đầu từ 2027 đào tạo 12 tháng đến 2028, tập sự 12 tháng là 2029, kết thúc thí điểm là 2030. Trong 12 tháng còn lại để đánh giá tổng kết, vị luật sư công sẽ làm được bao nhiêu vụ việc? Ở quê tôi các cụ vẫn có câu: "KHOAN THỔI VỘI ĂN" có khi chỉ là ăn cơm sống.',
  'Phản biện, xây dựng',
  '["Đặt câu hỏi sắc bén", "Dẫn chứng cụ thể từ pháp luật", "Phân tích mâu thuẫn và bất cập", "Đưa ra giải pháp thay thế", "Sử dụng tục ngữ để minh họa"]'::jsonb
),
(
  'Dân gian gần dân',
  'Văn phong gần gũi, sử dụng tục ngữ thành ngữ Việt Nam để giải thích pháp luật cho dễ hiểu',
  'Khoản 2, Điều 8 của Bộ luật hình sự quy định: "những hành vi tuy có dấu hiệu của tội phạm nhưng tính chất nguy hiểm cho xã hội không đáng kể thì không phải là tội phạm". Giá như có từ tâm của những người bảo vệ pháp luật nhận diện ra rằng, đây chỉ là những người nông dân nhận thức pháp luật kém. Gốc rễ từ lòng dân, không cường quyền nào thắng được!',
  'Gần gũi, dân dã',
  '["Dùng câu tục ngữ ca dao để mở đầu", "Giải thích pháp luật bằng ngôn ngữ đời thường", "Liên hệ thực tiễn cuộc sống", "Nhấn mạnh tình người và lòng dân"]'::jsonb
),
(
  'Nhân văn cảm động',
  'Văn phong mang tính nhân văn cao, kể chuyện thực tế có chiều sâu tâm lý và hoàn cảnh',
  'Trong bài bào chữa này, cho tôi xin cho năm đứa trẻ cần có một cái tết, một bàn tay ấm áp của người dì, một tình cảm thương yêu của người lớn như bao nhiêu đứa trẻ khác giữa mùa đông giá lạnh này. Nếu được hội đồng xét xử xem xét các điều kiện trên để giảm nhẹ hình phạt, tôi tha thiết mong muốn hội đồng xét xử sẽ xem xét mở rộng lòng từ bi, chính sách nhân đạo trong tư pháp hình sự.',
  'Nhân văn, cảm động',
  '["Kể câu chuyện thực tế cảm động", "Nhấn mạnh hoàn cảnh con người", "Chi tiết cụ thể về gia đình xã hội", "Kết hợp lý luật với tình người", "Sử dụng hình ảnh và cảm xúc"]'::jsonb
),
(
  'Học thuật phân tích',
  'Văn phong học thuật, phân tích so sánh pháp luật quốc tế và trong nước một cách chặt chẽ',
  'Điều 96 (khoản 2) của Bộ luật Dân sự năm 2015 quy định pháp nhân chấm dứt kể từ thời điểm xóa tên trong sổ đăng ký. Quy định này có mấy sai lầm: Thứ nhất, mâu thuẫn với khoản 2 Điều 92 vì khoản này lại quy định "pháp nhân được chuyển đổi chấm dứt kể từ thời điểm pháp nhân chuyển đổi được thành lập". Thứ hai, thời điểm xóa tên chưa chắc là thời điểm pháp nhân không còn sản nghiệp.',
  'Học thuật, chặt chẽ',
  '["So sánh với pháp luật các nước", "Dẫn chứng điều luật cụ thể", "Phân tích mâu thuẫn logic", "Sử dụng thuật ngữ pháp lý chính xác", "Kết cấu luận chứng chặt chẽ"]'::jsonb
);

-- Insert default data sources with priority
INSERT INTO data_sources (name, url, priority, description) VALUES
('Cổng thông tin điện tử Chính phủ', 'vanban.chinhphu.vn', 1, 'Nguồn văn bản pháp luật chính thống nhất từ Chính phủ Việt Nam'),
('Bộ Tư pháp', 'moj.gov.vn', 2, 'Website chính thức của Bộ Tư pháp, cung cấp thông tin pháp luật và thủ tục hành chính'),
('Thư viện Pháp luật', 'thuvienphapluat.vn', 3, 'Trang tra cứu văn bản pháp luật phổ biến'),
('Luật Việt Nam', 'luatvietnam.vn', 4, 'Cổng thông tin pháp luật và tư vấn'),
('Pháp luật Online', 'plo.vn', 5, 'Báo điện tử chuyên về pháp luật');

-- Create default prompt
INSERT INTO qa_prompts (name, system_prompt, formatting_instructions, is_active) VALUES
(
  'Prompt Hỏi Đáp Pháp Lý v1.0',
  'Bạn là một trợ lý pháp lý AI chuyên nghiệp của Việt Nam. Nhiệm vụ của bạn là:

1. Trả lời các câu hỏi về pháp luật và thủ tục hành chính Việt Nam
2. Cung cấp thông tin chính xác, dễ hiểu, có cấu trúc rõ ràng
3. Trích dẫn điều luật, văn bản pháp luật khi có thể
4. Lưu ý người dùng tham khảo ý kiến chuyên gia cho các vấn đề phức tạp
5. Sử dụng ngôn ngữ thân thiện, dễ hiểu với người dân

NGUỒN DỮ LIỆU ƯU TIÊN:
- Ưu tiên tham khảo từ Legal Library (cơ sở dữ liệu nội bộ)
- Tham khảo từ các nguồn chính thống theo thứ tự:
  1. vanban.chinhphu.vn (Văn bản Chính phủ)
  2. moj.gov.vn (Bộ Tư pháp)
  3. thuvienphapluat.vn (Thư viện Pháp luật)
  4. luatvietnam.vn (Luật Việt Nam)
  5. plo.vn (Pháp luật Online)
- KHÔNG sử dụng nguồn khác ngoài danh sách trên',
  'Định dạng câu trả lời:
- Ngắn gọn, súc tích (200-300 từ)
- Chia thành các đoạn rõ ràng
- Liệt kê các bước nếu là thủ tục
- Đưa ra ví dụ minh họa nếu cần
- Trích dẫn điều luật cụ thể khi có

LƯU Ý: Đây chỉ là thông tin tham khảo, không thay thế tư vấn pháp lý chính thức. Khuyến nghị người dùng tham khảo luật sư hoặc chuyên gia pháp lý cho các vấn đề phức tạp.',
  true
);

-- Link default prompt with all writing styles
INSERT INTO qa_prompt_writing_styles (prompt_id, style_id, priority)
SELECT 
  (SELECT id FROM qa_prompts WHERE name = 'Prompt Hỏi Đáp Pháp Lý v1.0'),
  id,
  ROW_NUMBER() OVER (ORDER BY created_at)
FROM legal_writing_styles;

COMMENT ON TABLE legal_writing_styles IS 'Lưu trữ các mẫu văn phong viết luật';
COMMENT ON TABLE qa_prompts IS 'Quản lý các prompt cho hệ thống hỏi đáp pháp lý';
COMMENT ON TABLE qa_prompt_writing_styles IS 'Liên kết giữa prompt và văn phong (many-to-many)';
COMMENT ON TABLE data_sources IS 'Danh sách nguồn dữ liệu bên ngoài theo thứ tự ưu tiên';
COMMENT ON TABLE qa_prompt_history IS 'Lưu lịch sử thay đổi các phiên bản prompt';
