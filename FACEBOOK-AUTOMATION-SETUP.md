# Facebook Automation Module - Setup Guide

## Database Setup (One-time)

### Create Tables in Supabase

1. Go to Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql/new
2. Copy entire content from `facebook-automation-schema.sql`
3. Click "Run" to create all 10 tables:
   - facebook_connection
   - facebook_pages
   - auto_reply_rules
   - auto_message_rules
   - facebook_events
   - automation_queue
   - automation_logs
   - page_stats
   - rate_limits
   - user_cooldowns

### Environment Variables Required

```env
# Supabase (Already configured)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<REDACTED>
SUPABASE_SERVICE_ROLE_KEY=<REDACTED>

# Facebook Token Encryption
FACEBOOK_TOKEN_ENCRYPTION_KEY=your-32-character-encryption-key-here

# Optional: Facebook App (for token extension - not required)
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
```

## Usage

### 1. Connect Facebook Account

1. Go to `/admin/facebook/connection`
2. Get User Access Token from Facebook Graph API Explorer
3. Paste token and click "Save & Connect"
4. Token will be encrypted and stored in database

### 2. Sync Pages

1. Go to `/admin/facebook/pages`
2. Click "Sync Pages" button
3. All pages you manage will be fetched and saved

### 3. Create Reply Rules

1. Go to `/admin/facebook/reply-rules`
2. Click "Create Rule"
3. Set keywords and reply template with spin syntax:
   ```
   [Xin chào|Hi|Hello] {full_name}! [Cảm ơn bạn|Thanks] đã comment 😊
   ```

### 4. Create Message Rules

1. Go to `/admin/facebook/message-rules`
2. Set trigger (comment/reaction) and message template
3. Set cooldown period (default 24 hours)

### 5. Monitor Activity

- **Dashboard**: `/admin/facebook` - KPI cards and 7-day charts
- **Events**: `/admin/facebook/events` - Real-time webhook events
- **Logs**: `/admin/facebook/logs` - Audit trail with CSV export

## Key Features

- ✅ Auto-reply to comments with keyword matching
- ✅ Auto-send inbox messages to commenters
- ✅ Template engine with spin syntax for variations
- ✅ Rate limiting and user cooldown
- ✅ Safe mode kill-switch
- ✅ Comprehensive logging and analytics

## Files Reference

- `facebook-automation-schema.sql` - Database schema (10 tables)
- `lib/facebook/` - Core automation services
- `app/api/facebook/` - API endpoints
- `app/admin/facebook/` - Admin UI pages

## Notes

- Token encryption uses AES-256-CBC with random IV per token
- Schema matches Prisma 7 definitions (types only, no runtime Prisma)
- All database access via Supabase client for performance
- Session 10 achievement: Full Facebook automation with 79 files, ~9,150 LOC
