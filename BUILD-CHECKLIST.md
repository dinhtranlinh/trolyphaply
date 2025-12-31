# Pre-Build Checklist - TroLyPhapLy

**MỤC ĐÍCH:** Tránh lỗi TypeScript khi build bằng cách kiểm tra TRƯỚC KHI build.

---

## 🚦 Quy trình ĐÚNG trước mỗi lần build:

### 1. Chạy validation script (BẮT BUỘC)

```bash
# Windows PowerShell
npm run precheck

# Hoặc dùng script riêng
powershell -ExecutionPolicy Bypass -File scripts/pre-build-check.ps1

# Hoặc chỉ check schema
npm run validate
```

### 2. Chờ kết quả kiểm tra

Script sẽ kiểm tra:

- ✅ Environment variables
- ✅ Schema consistency (interfaces vs DB)
- ✅ Common anti-patterns (.isActive, .match_type, etc.)
- ✅ TypeScript compilation (dry run)

### 3. Nếu CÓ LỖI → DỪNG LẠI

```
❌ FOUND 3 ISSUE(S) - DO NOT BUILD YET!

📁 lib/facebook/replyRulesService.ts
   ❌ Line 145: Forbidden field access: .match_type
   ❌ Line 148: Forbidden field access: .template

📁 lib/facebook/pagesService.ts
   ❌ Line 228: Forbidden field access: .isActive
```

**FIX TẤT CẢ LỖI** rồi chạy lại `npm run precheck` cho đến khi pass.

### 4. Nếu PASS → Build an toàn

```
✅ ALL CHECKS PASSED - Safe to build!

Run: npm run build
```

Giờ mới chạy:

```bash
npm run build
# Hoặc dùng build với auto-validation
npm run build:safe
```

---

## 📋 Database Schema Reference

### Bảng quan trọng cần nhớ:

#### `facebook_pages`

```sql
- page_id (VARCHAR)         -- Facebook page ID
- page_name (VARCHAR)       -- NOT "name"
- automation_enabled (BOOL) -- NOT "is_active" or "isActive"
- page_access_token (TEXT)  -- NOT "accessToken"
- created_at (TIMESTAMP)    -- NOT "createdAt"
- updated_at (TIMESTAMP)    -- NOT "updatedAt"
```

#### `auto_reply_rules`

```sql
- trigger_type (VARCHAR)    -- NOT "match_type"
- reply_templates (TEXT[])  -- ARRAY, NOT single "template"
- enabled (BOOL)            -- NOT "is_active"
```

#### `auto_message_rules`

```sql
- trigger_on (TEXT[])       -- ARRAY: ['comment'], ['reaction'], hoặc cả hai
- message_template (TEXT)   -- Single string
- enabled (BOOL)
```

---

## ⚠️ Common Mistakes (FORBIDDEN)

| ❌ WRONG (Lỗi)          | ✅ CORRECT (Đúng)               |
| ----------------------- | ------------------------------- |
| `page.isActive`         | `page.automation_enabled`       |
| `rule.match_type`       | `rule.trigger_type`             |
| `rule.template`         | `rule.reply_templates[0]`       |
| `page.pageId`           | `page.page_id`                  |
| `rule.is_active`        | `rule.enabled`                  |
| `page.createdAt`        | `page.created_at`               |
| `rule.daily_uses_count` | ❌ REMOVED - không còn trong DB |
| `rule.max_daily_uses`   | ❌ REMOVED - không còn trong DB |

---

## 🛠️ Khi nào dùng script nào?

### `npm run validate`

- Chỉ check schema (nhanh nhất)
- Dùng khi sửa code trong lib/facebook hoặc app/api/facebook

### `npm run precheck`

- Full validation (schema + TypeScript + env vars)
- Chạy TRƯỚC MỌI LẦN BUILD

### `npm run build:safe`

- Tự động chạy validation rồi mới build
- KHUYẾN NGHỊ dùng thay vì `npm run build` thông thường

---

## 📝 Development Workflow

```bash
# 1. Sửa code
code lib/facebook/replyRulesService.ts

# 2. Test trên dev server
npm run dev

# 3. Khi muốn build production
npm run precheck    # Kiểm tra trước

# 4a. Nếu pass
npm run build       # Build

# 4b. Nếu có lỗi
# → Fix lỗi theo gợi ý
# → Quay lại bước 3
```

---

## 🎯 Lưu ý đặc biệt

### Interface PHẢI dùng snake_case

```typescript
// ✅ ĐÚNG
export interface ReplyRule {
  trigger_type: "all" | "keyword";
  reply_templates: string[];
  created_at: string;
}

// ❌ SAI
export interface ReplyRule {
  matchType: "all" | "keyword"; // Wrong!
  template: string; // Wrong!
  createdAt: Date; // Wrong!
}
```

### Exception: Input parameters OK

```typescript
// ✅ OK - body.match_type là input từ UI
if (body.match_type !== undefined) {
  input.trigger_type = body.match_type; // Convert to DB field
}

// ✅ OK - params.pageId là parameter
async function processJob(params: { pageId: string }) {
  // pageId here is OK - it's a function parameter
}
```

---

## 🔄 Update checklist này

Mỗi khi thêm/sửa table hoặc field:

1. Update [facebook-tables-v2.sql](facebook-tables-v2.sql)
2. Update [scripts/validate-schema.ts](scripts/validate-schema.ts) → DB_SCHEMA
3. Update interfaces trong lib/facebook/\*.ts
4. Update checklist này
5. Chạy `npm run precheck` để verify

---

**LẦN SAU KHI GẶP BUILD ERROR:**

1. ❌ ĐỪNG cố build lại ngay
2. ❌ ĐỪNG fix từng chỗ một
3. ✅ CHẠY `npm run precheck` để xem TẤT CẢ lỗi
4. ✅ FIX HẾT trong 1 lần
5. ✅ Verify bằng `npm run precheck` lần nữa
6. ✅ Giờ mới build

**"Measure twice, cut once"** 🎯
