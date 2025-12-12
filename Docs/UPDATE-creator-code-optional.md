# Hướng dẫn Update: Creator Code Optional

## Thay đổi chính

### 1. Creator Code giờ là KHÔNG BẮT BUỘC

- Người dùng có thể bỏ trống → hiển thị "Ẩn danh"
- Người dùng có thể nhập mã của mình → lưu lại để dùng cho các prompt sau
- Không cần unique nữa → 1 người có thể tạo nhiều prompts

### 2. LocalStorage để ghi nhớ mã

- Lần đầu tạo prompt: nhập mã (hoặc bỏ trống)
- Lần sau: tự động điền mã đã dùng
- Dropdown gợi ý hiển thị 5 mã gần đây nhất

### 3. Tìm kiếm/Lọc theo Creator Code

- Tab "Của tôi": Nhập mã của bạn → lọc tất cả prompts của mã đó
- Mã được lưu vào localStorage key: `current_creator_code`
- Lịch sử 10 mã gần nhất lưu trong: `creator_code_history`

## Cách chạy Migration

### Bước 1: Chạy SQL trong Supabase

Mở Supabase SQL Editor:
https://supabase.com/dashboard/project/icqivkassoxfaukqbzyt/sql/new

Copy toàn bộ nội dung file: `Docs/MIGRATION-UPDATE-creator-code-optional.sql`

Click **Run** để thực thi.

### Bước 2: Verify Changes

Chạy query kiểm tra:

```sql
-- Kiểm tra constraints
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'ai_image_prompts'::regclass;

-- Kiểm tra indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'ai_image_prompts';
```

Kết quả mong đợi:

- ✅ `check_creator_code_length`: cho phép NULL
- ✅ `check_creator_code_format`: cho phép NULL
- ✅ `idx_ai_prompts_creator_code_not_null`: index chỉ cho NOT NULL values
- ❌ `ai_image_prompts_creator_code_key` (UNIQUE constraint) đã bị xóa

### Bước 3: Test Insert

Test tạo prompt anonymous:

```sql
INSERT INTO ai_image_prompts (title, prompt_template, category, creator_code)
VALUES ('Test Anonymous', 'Test prompt', 'Portrait', NULL);
```

Test tạo prompt với mã:

```sql
INSERT INTO ai_image_prompts (title, prompt_template, category, creator_code)
VALUES ('Test Named 1', 'Test prompt 2', 'Landscape', 'test_user');

INSERT INTO ai_image_prompts (title, prompt_template, category, creator_code)
VALUES ('Test Named 2', 'Test prompt 3', 'Product', 'test_user');
```

✅ Cả 3 insert đều phải thành công (không bị lỗi UNIQUE constraint)

## Cách sử dụng Frontend

### Tạo Prompt Mới

1. Click nút **+** (FAB) ở góc phải dưới
2. Điền thông tin:

   - **Tiêu đề** (bắt buộc)
   - **Mô tả** (không bắt buộc)
   - **Prompt Template** (bắt buộc)
   - **Mã của bạn**:
     - Bỏ trống = Ẩn danh
     - Nhập mã = Được nhớ lại lần sau
     - Click vào dropdown để chọn mã đã dùng
   - **Category** (bắt buộc)
   - **Upload ảnh** (không bắt buộc)
   - **Tags** (không bắt buộc)

3. Click **Tạo Prompt**

### Lọc Prompt theo Mã

1. Click tab **"Của tôi"**
2. Nhập mã creator code vào ô input
3. Danh sách sẽ tự động lọc theo mã đó
4. Mã được lưu lại, lần sau mở trang sẽ tự động điền

## LocalStorage Keys

```javascript
// Mã hiện tại đang dùng
localStorage.getItem("current_creator_code");

// Lịch sử 10 mã gần nhất (JSON array)
localStorage.getItem("creator_code_history");
```

## Code Changes Summary

### Files Modified:

1. **Docs/MIGRATION-ai-prompts.sql**

   - Changed: `creator_code VARCHAR(30)` (nullable)
   - Removed: UNIQUE constraint
   - Updated: Constraints to allow NULL

2. **Docs/MIGRATION-UPDATE-creator-code-optional.sql** (NEW)

   - Migration script để update existing database

3. **components/forms/CreateAIPromptForm.tsx**

   - Added: LocalStorage helpers (getCreatorHistory, saveCreatorCode, getCurrentCreatorCode)
   - Added: useEffect to load saved code on mount
   - Added: Suggestions dropdown from history
   - Updated: Validation (creatorCode optional)
   - Updated: Status messages (yellow for existing code, gray for empty)

4. **components/content/AIPromptCard.tsx**

   - Updated: Interface `creatorCode?: string | null`
   - Updated: Display `{creatorCode ? '@' + creatorCode : 'Ẩn danh'}`

5. **app/api/ai-prompts/route.ts**

   - Removed: Uniqueness check for creator_code
   - Updated: Validation (creatorCode optional)
   - Changed: Allow NULL creator_code in INSERT

6. **lib/imageUtils.ts** (NEW)

   - Extracted: resizeImage function (client-only, no Supabase deps)

7. **lib/supabaseStorage.ts**
   - Removed: resizeImage function (moved to imageUtils.ts)
   - Fixed: Fallback logic for missing service role key

## Next Steps

Sau khi chạy migration:

1. ✅ Test tạo prompt không có mã (anonymous)
2. ✅ Test tạo prompt với mã
3. ✅ Test tạo nhiều prompts cùng 1 mã
4. ✅ Test dropdown suggestions
5. ✅ Test lọc theo mã trong tab "Của tôi"
6. ✅ Test upload ảnh
7. ✅ Test copy prompt

Nếu gặp lỗi gì báo lại để debug!
