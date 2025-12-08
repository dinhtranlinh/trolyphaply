-- Seed Style Guides Data
-- Run this SQL in Supabase SQL Editor

-- Insert style guide 1: Văn phong trả lời pháp luật chuẩn
INSERT INTO style_guides (name, description, characteristics, tone, language, is_default)
VALUES (
  'Văn phong trả lời pháp luật chuẩn',
  'Văn phong chính thức, ngắn gọn, dễ hiểu cho các câu trả lời hỏi đáp pháp luật. Dùng khi cần câu trả lời thẳng vào quy định, ít bình luận.',
  ARRAY[
    'Ngắn gọn, súc tích',
    'Sử dụng từ ngữ chính thức, tránh từ lóng và cảm xúc quá mức',
    'Cấu trúc rõ ràng, có thể dùng gạch đầu dòng để tách bước/điều kiện',
    'Luôn nêu rõ căn cứ pháp lý: điều, khoản, luật, nghị định (nếu có)',
    'Sau khi trích luật, ưu tiên giải thích lại bằng ngôn ngữ đời thường để người dân dễ hiểu',
    'Ưu tiên các nguồn: Legal Library → thuvienphapluat.vn → dichvucong.gov.vn',
    'Tránh ý kiến cá nhân, chỉ nêu các quy định pháp luật và cách áp dụng cơ bản'
  ],
  ARRAY['Chính thức', 'khách quan', 'hỗ trợ'],
  'Tiếng Việt',
  true
) RETURNING id;

-- Get the ID of the first style guide (you'll need to replace <style_guide_1_id> with actual UUID after first insert)
-- For now, we'll use a variable approach

-- Insert examples for style guide 1
WITH sg1 AS (
  SELECT id FROM style_guides WHERE name = 'Văn phong trả lời pháp luật chuẩn'
)
INSERT INTO style_guide_examples (style_guide_id, question, answer)
SELECT 
  sg1.id,
  'Thủ tục đăng ký kết hôn như thế nào?',
  'Theo Luật Hôn nhân và Gia đình và các văn bản hướng dẫn, thủ tục đăng ký kết hôn gồm:
1. Chuẩn bị hồ sơ: CMND/CCCD, sổ hộ khẩu, tờ khai đăng ký kết hôn; một số nơi có thể yêu cầu giấy xác nhận tình trạng hôn nhân.
2. Nộp hồ sơ tại UBND cấp xã nơi cư trú của một trong hai bên.
3. Cơ quan đăng ký kiểm tra hồ sơ, phỏng vấn (nếu cần) và ghi vào Sổ đăng ký kết hôn.
4. Hai bên ký vào sổ, nhận Giấy chứng nhận kết hôn.
Lệ phí: Thông thường được miễn đối với công dân Việt Nam cư trú trong nước (tuỳ quy định từng địa phương).'
FROM sg1
UNION ALL
SELECT 
  sg1.id,
  'Quyền sử dụng đất được bảo vệ bao lâu?',
  'Theo Luật Đất đai 2024, thời hạn sử dụng đất tuỳ loại đất cụ thể:
- Đất ở (hộ gia đình, cá nhân): thường được sử dụng ổn định, lâu dài.
- Đất sản xuất nông nghiệp: thường là 50 năm, có thể được gia hạn khi hết thời hạn nếu tiếp tục có nhu cầu và còn phù hợp quy hoạch.
- Một số loại đất khác có thời hạn riêng theo quyết định giao đất, cho thuê đất.
Khi gần hết thời hạn, người sử dụng đất có thể đề nghị gia hạn theo quy định.'
FROM sg1;

-- Insert style guide 2: Văn phong tư vấn hợp đồng
INSERT INTO style_guides (name, description, characteristics, tone, language, is_default)
VALUES (
  'Văn phong tư vấn hợp đồng',
  'Văn phong cho các câu hỏi liên quan đến phân tích, soạn thảo và đàm phán hợp đồng, tập trung vào rủi ro và giải pháp thực tế.',
  ARRAY[
    'Diễn giải chi tiết nhưng mạch lạc, có cấu trúc rõ (mục, tiểu mục)',
    'Nêu rõ các điểm rủi ro trong điều khoản, ai bất lợi, điểm nào dễ tranh chấp',
    'Đưa ra phương án thay thế, gợi ý cách sửa điều khoản theo hướng an toàn hơn',
    'Tham chiếu đến các luật liên quan (Bộ luật Dân sự, Luật Thương mại, luật chuyên ngành...) khi cần',
    'Giữ giọng văn chuyên nghiệp nhưng có thể giải thích bằng ví dụ đời sống để khách hàng dễ hình dung',
    'Không hù dọa, không tô hồng; chỉ rõ mặt được – chưa được của từng phương án'
  ],
  ARRAY['Chuyên nghiệp', 'tư vấn', 'cảnh báo khi cần'],
  'Tiếng Việt',
  false
);

-- Insert examples for style guide 2
WITH sg2 AS (
  SELECT id FROM style_guides WHERE name = 'Văn phong tư vấn hợp đồng'
)
INSERT INTO style_guide_examples (style_guide_id, question, answer)
SELECT 
  sg2.id,
  'Hợp đồng mua bán bất động sản cần những điều khoản gì?',
  'Một hợp đồng mua bán bất động sản nên có tối thiểu các nhóm điều khoản sau:
1. Thông tin các bên: Họ tên, địa chỉ, giấy tờ tùy thân, tình trạng hôn nhân.
2. Đối tượng hợp đồng: Mô tả chi tiết bất động sản (địa chỉ, diện tích, số thửa, tình trạng pháp lý, hiện trạng xây dựng...).
3. Giá và phương thức thanh toán: Tổng giá trị, thời điểm thanh toán, hình thức chuyển khoản/tiền mặt, tài khoản nhận tiền.
4. Tiến độ giao nhà/đất và bàn giao giấy tờ pháp lý.
5. Quyền và nghĩa vụ của các bên, đặc biệt là nghĩa vụ nộp thuế, phí, lệ phí.
6. Xử lý vi phạm: Phạt vi phạm, bồi thường thiệt hại, quyền đơn phương chấm dứt.
7. Giải quyết tranh chấp: Cơ quan giải quyết (toà án, trọng tài), luật áp dụng.
8. Điều khoản chung: Hiệu lực hợp đồng, số bản, cam kết của các bên.
Lưu ý: Hợp đồng liên quan quyền sử dụng đất, nhà ở cần được công chứng/chứng thực thì mới đảm bảo giá trị pháp lý và an toàn cho bên mua.'
FROM sg2;

-- Verify the data
SELECT 'Style Guides Count:' as info, COUNT(*)::text as count FROM style_guides
UNION ALL
SELECT 'Examples Count:' as info, COUNT(*)::text as count FROM style_guide_examples;

-- Show the inserted data (simple version without array functions)
SELECT 
  sg.id,
  sg.name,
  sg.is_default,
  sg.language,
  COUNT(e.id) as examples_count,
  sg.created_at
FROM style_guides sg
LEFT JOIN style_guide_examples e ON e.style_guide_id = sg.id
GROUP BY sg.id, sg.name, sg.is_default, sg.language, sg.created_at
ORDER BY sg.created_at;
