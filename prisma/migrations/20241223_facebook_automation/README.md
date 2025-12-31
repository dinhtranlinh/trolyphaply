# Facebook Page Automation - Database Setup

## 📋 Tổng quan

Database schema cho tính năng quản trị Facebook Pages automation. Thiết kế tối giản, chỉ lưu thông số quản trị, không lưu trữ content.

## 🗂️ Tables (9 tables)

1. **facebook_connection** - Admin Facebook token (1 record duy nhất)
2. **facebook_pages** - Danh sách Pages (minimal info)
3. **auto_reply_rules** - Template auto-reply rules
4. **auto_message_rules** - Auto inbox message rules
5. **facebook_events** - Webhook events (dedupe, auto-delete 7 ngày)
6. **automation_queue** - Delayed job queue (1-5 phút)
7. **automation_logs** - Audit trail
8. **page_stats** - Daily KPI counters
9. **system_config** - Global settings (safe mode, rate limits)

## 🚀 Apply Migration

### Cách 1: Prisma (Recommended)

```bash
# Generate Prisma client
npx prisma generate

# Apply migration
npx prisma db push

# Hoặc tạo migration mới
npx prisma migrate dev --name facebook_automation
```

### Cách 2: Direct SQL (Supabase)

```bash
# Copy SQL và paste vào Supabase SQL Editor
cat prisma/migrations/20241223_facebook_automation/migration.sql
```

## 🔍 Verify Tables

```bash
# Sử dụng script test
node verify-tables.js

# Hoặc check trong Supabase Dashboard
# Tables tab → Search "facebook_"
```

## 📊 Default Data

Migration tự động thêm:

```sql
-- Safe mode (mặc định: tắt)
system_config.facebook_safe_mode = {
  "enabled": false,
  "reason": null
}

-- Rate limits
system_config.facebook_rate_limits = {
  "replies_per_page_per_minute": 10,
  "replies_per_user_per_minutes": 5,
  "messages_per_page_per_hour": 50
}
```

## 🧹 Auto-Cleanup

Function `cleanup_old_facebook_events()` sẽ xóa events > 7 ngày.

Cần schedule chạy hàng ngày:

```sql
-- Option 1: Supabase Extension (pg_cron)
SELECT cron.schedule(
  'cleanup-facebook-events',
  '0 2 * * *', -- 2 AM daily
  'SELECT cleanup_old_facebook_events()'
);

-- Option 2: Node-cron trong server
// Sẽ implement trong lib/facebook/cleanup.ts
```

## 🔐 Security Notes

1. **Tokens luôn encrypted** - Cần implement trong app layer
2. **Service Role Key** - Chỉ dùng server-side
3. **Row Level Security** - Chưa enable (admin-only app)

## 📝 Schema Changes

Nếu cần thay đổi schema:

1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name change_description`
3. Update types trong `types/facebook-automation.ts`
4. Regenerate client: `npx prisma generate`

## ✅ Checklist sau khi apply

- [ ] Tables created successfully
- [ ] Indexes created
- [ ] Triggers working (updated_at)
- [ ] Default configs inserted
- [ ] Prisma client generated
- [ ] Types file updated
- [ ] Server restarted

## 🐛 Troubleshooting

**Lỗi: Table already exists**

```sql
-- Drop toàn bộ Facebook tables (cẩn thận!)
DROP TABLE IF EXISTS "system_config" CASCADE;
DROP TABLE IF EXISTS "page_stats" CASCADE;
DROP TABLE IF EXISTS "automation_logs" CASCADE;
DROP TABLE IF EXISTS "automation_queue" CASCADE;
DROP TABLE IF EXISTS "facebook_events" CASCADE;
DROP TABLE IF EXISTS "auto_message_rules" CASCADE;
DROP TABLE IF EXISTS "auto_reply_rules" CASCADE;
DROP TABLE IF EXISTS "facebook_pages" CASCADE;
DROP TABLE IF EXISTS "facebook_connection" CASCADE;
```

**Lỗi: Function already exists**

```sql
DROP FUNCTION IF EXISTS cleanup_old_facebook_events();
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
```

## 📚 Next Steps

Sau khi database ready:

1. Tạo API routes (`/api/facebook/*`)
2. Tạo Admin UI (`/app/admin/facebook/*`)
3. Implement core services (`lib/facebook/*`)
4. Setup cron job cho queue processing
5. Test với Facebook Test App

---

**Created:** 2024-12-23  
**Version:** 1.0.0  
**Status:** Ready for implementation
