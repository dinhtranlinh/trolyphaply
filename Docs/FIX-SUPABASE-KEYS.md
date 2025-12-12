# ⚠️ CẬP NHẬT SUPABASE KEYS

## Vấn đề hiện tại:

Keys trong `.env.development` sai format. Supabase keys phải là JWT tokens dài (bắt đầu với `eyJ...`).

## Cách lấy keys đúng:

1. Vào Supabase Dashboard: https://supabase.com/dashboard/project/icqivkassoxfaukqbzyt/settings/api

2. Copy 2 keys sau:

### **NEXT_PUBLIC_SUPABASE_ANON_KEY** (anon/public)

- Tìm mục "Project API keys" → "anon" → "public"
- Copy key dài bắt đầu với `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### **SUPABASE_SERVICE_ROLE_KEY** (service_role)

- Tìm mục "Project API keys" → "service_role"
- ⚠️ Key này là SECRET, không được public
- Copy key dài bắt đầu với `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Cập nhật vào 3 files:

### `.env.development`

```env
NEXT_PUBLIC_SUPABASE_URL="https://icqivkassoxfaukqbzyt.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imljcml2a2Fzc294ZmF1a3Fienl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODk1NjU1MzIsImV4cCI6MjAwNTE0MTUzMn0.YOUR_ANON_KEY_HERE"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imljcml2a2Fzc294ZmF1a3Fienl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY4OTU2NTUzMiwiZXhwIjoyMDA1MTQxNTMyfQ.YOUR_SERVICE_ROLE_KEY_HERE"
```

### `.env.production`

(Copy tương tự)

### `.env`

(Copy tương tự)

## Sau khi cập nhật:

1. Restart dev server: `npm run dev`
2. Test trang: http://localhost:3456/ai-prompts
3. Thử tạo prompt mới (nút + ở góc phải dưới)
