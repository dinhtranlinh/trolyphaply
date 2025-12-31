# SESSION 1 - Quick Start Guide

This guide helps you start using the Facebook automation pipeline right after SESSION 1 completion.

## Prerequisites

- ✅ SESSION 0 completed (database tables created)
- ✅ SESSION 1 completed (all services and APIs created)
- ✅ `node-cron` installed
- ✅ Facebook webhooks verified (see `.env` for credentials)

## Step 1: Check Environment Variables

Ensure your `.env` has these values:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Facebook
FACEBOOK_APP_ID=856285397321094
FACEBOOK_APP_SECRET=your_app_secret
FACEBOOK_VERIFY_TOKEN=trolyphaply_webhook_secret_xyz789abc
```

## Step 2: Start Development Server

```bash
npm run dev
# Server running at http://localhost:3456
```

## Step 3: Enable Safe Mode (Optional)

For testing, you may want to start with safe mode enabled:

```bash
curl -X POST http://localhost:3456/api/facebook/safe-mode \
  -H "Content-Type: application/json" \
  -d '{"enable":true,"reason":"Initial testing","setBy":"admin"}'
```

## Step 4: Insert Test Data (Manual for now)

Since SESSION 2 (Connection UI) is not done yet, manually insert test data:

### 4.1 Add Facebook Connection

```sql
-- In Supabase SQL Editor
INSERT INTO facebook_connection (
  id,
  access_token,
  token_expires_at,
  token_type
) VALUES (
  gen_random_uuid(),
  'YOUR_FACEBOOK_PAGE_ACCESS_TOKEN', -- Get from Graph API Explorer
  NOW() + INTERVAL '60 days',
  'page'
);
```

**How to get token**:

1. Go to https://developers.facebook.com/tools/explorer/
2. Select your app
3. Request token with permissions: `pages_manage_posts`, `pages_read_engagement`, `pages_messaging`
4. Copy the token

### 4.2 Add Your Facebook Page

```sql
INSERT INTO facebook_pages (
  id,
  page_id,
  name,
  access_token,
  connection_id,
  is_active
) VALUES (
  gen_random_uuid(),
  'YOUR_PAGE_ID', -- Get from your Facebook page settings
  'Your Page Name',
  'YOUR_PAGE_ACCESS_TOKEN', -- From above
  (SELECT id FROM facebook_connection LIMIT 1),
  true
);
```

### 4.3 Add Test Reply Rule

```sql
INSERT INTO auto_reply_rules (
  id,
  page_id,
  name,
  keywords,
  reply_templates,
  is_active,
  priority
) VALUES (
  gen_random_uuid(),
  'YOUR_PAGE_ID',
  'Test Auto Reply',
  ARRAY['hello', 'hi', 'chào'],
  ARRAY[
    '[Hello|Hi|Xin chào] {full_name}! [How can I help you?|What can I do for you?|Need assistance?]',
    '[Hey|Hi there] {first_name}! [Thanks for reaching out|Thanks for your message]!'
  ],
  true,
  1
);
```

## Step 5: Test Webhook Reception

Send a test webhook from Facebook Developer Console:

1. Go to https://developers.facebook.com/apps/YOUR_APP_ID/webhooks/
2. Click "Test" button next to "feed" subscription
3. Send test event

**Expected result**:

- Check server logs: `tail -f dev3456.err`
- Should see: `✅ Event queued: comment_reply comment_xxx`
- Check database:
  ```sql
  SELECT * FROM facebook_events ORDER BY created_at DESC LIMIT 5;
  SELECT * FROM automation_queue ORDER BY created_at DESC LIMIT 5;
  ```

## Step 6: Test Queue Processing

### Option A: Wait for Cron (Automatic)

Start cron jobs:

```bash
curl -X POST http://localhost:3456/api/facebook/cron \
  -H "Content-Type: application/json" \
  -d '{"action":"start"}'
```

Wait 1-5 minutes for scheduled time, then check logs:

```bash
tail -f dev3456.err | grep "\[Cron\]"
```

### Option B: Manual Trigger (Immediate)

```bash
curl -X POST http://localhost:3456/api/facebook/queue/process \
  -H "Content-Type: application/json" \
  -d '{"limit":10}'
```

**Expected response**:

```json
{
  "success": true,
  "processed": 1,
  "successful": 1,
  "failed": 0,
  "details": [
    {
      "jobId": "job_123",
      "type": "reply_comment",
      "success": true,
      "actionId": "comment_456"
    }
  ]
}
```

## Step 7: Verify on Facebook

1. Go to your Facebook page
2. Find the test comment/post
3. Check if auto-reply was posted

## Step 8: Monitor Queue

```bash
# Get queue status
curl http://localhost:3456/api/facebook/queue/status | jq

# Expected response:
# {
#   "success": true,
#   "stats": {
#     "pending": 0,
#     "processing": 0,
#     "completed": 1,
#     "failed": 0,
#     "total": 1
#   }
# }
```

## Step 9: Check Logs

```sql
-- Recent actions
SELECT
  page_id,
  action_type,
  success,
  reason,
  created_at
FROM automation_logs
ORDER BY created_at DESC
LIMIT 10;

-- Page stats
SELECT
  page_id,
  date,
  replies_sent,
  messages_sent,
  events_received
FROM page_stats
WHERE date = CURRENT_DATE;
```

## Step 10: Disable Safe Mode (If Enabled)

```bash
curl -X POST http://localhost:3456/api/facebook/safe-mode \
  -H "Content-Type: application/json" \
  -d '{"enable":false,"setBy":"admin"}'
```

---

## Troubleshooting

### Webhooks not received

**Symptom**: No entries in `facebook_events` table

**Solution**:

1. Check webhook is subscribed to `feed`, `mention`, `messages`
2. Verify `FACEBOOK_VERIFY_TOKEN` matches in Meta app settings
3. Check server logs: `tail -f dev3456.err`
4. Test verification:
   ```bash
   curl "http://localhost:3456/api/facebook/webhooks?hub.mode=subscribe&hub.verify_token=trolyphaply_webhook_secret_xyz789abc&hub.challenge=test123"
   # Should return: test123
   ```

### Jobs not processing

**Symptom**: Jobs stuck in `pending` status

**Solution**:

1. Check cron is running:
   ```bash
   curl http://localhost:3456/api/facebook/cron
   ```
2. Check `scheduled_for` timestamp hasn't passed yet:
   ```sql
   SELECT id, scheduled_for, NOW() FROM automation_queue WHERE status = 'pending';
   ```
3. Check safe mode is disabled:
   ```bash
   curl http://localhost:3456/api/facebook/safe-mode
   ```
4. Manually trigger:
   ```bash
   curl -X POST http://localhost:3456/api/facebook/queue/process -d '{"limit":10}'
   ```

### Reply not posted on Facebook

**Symptom**: Job marked `completed` but no comment visible

**Solution**:

1. Check automation logs for error:
   ```sql
   SELECT * FROM automation_logs WHERE success = false ORDER BY created_at DESC LIMIT 5;
   ```
2. Verify page access token is valid:
   ```bash
   curl "https://graph.facebook.com/v24.0/me?access_token=YOUR_TOKEN"
   ```
3. Check token permissions:
   ```bash
   curl "https://graph.facebook.com/v24.0/debug_token?input_token=YOUR_TOKEN&access_token=APP_ID|APP_SECRET"
   ```
4. Verify comment ID still exists:
   ```bash
   curl "https://graph.facebook.com/v24.0/COMMENT_ID?access_token=YOUR_TOKEN"
   ```

### Rate limit reached

**Symptom**: Logs show "Rate limit reached"

**Solution**:

1. Wait for cooldown period:
   - Page reply: 1 minute
   - User reply: 5 minutes
   - Page message: 1 hour
2. Or adjust limits in `system_config`:
   ```sql
   UPDATE system_config
   SET rate_limits = '{
     "page_reply_per_minute": 20,
     "user_reply_cooldown_seconds": 300,
     "page_message_per_hour": 100
   }'
   WHERE key = 'facebook_rate_limits';
   ```

---

## Testing Checklist

- [ ] Webhook verification works (GET request)
- [ ] Webhook receives events (POST request)
- [ ] Events deduplicated (no duplicates in `facebook_events`)
- [ ] Jobs enqueued with delay (check `scheduled_for` in future)
- [ ] Cron jobs start successfully
- [ ] Cron picks up pending jobs
- [ ] Safe mode blocks automation when enabled
- [ ] Safe mode allows automation when disabled
- [ ] Reply posted on Facebook successfully
- [ ] Automation logs recorded
- [ ] Page stats incremented
- [ ] Rate limiting enforced

---

## Next Steps

Once SESSION 1 is working:

1. **SESSION 2**: Create OAuth connection flow (no manual SQL inserts)
2. **SESSION 3**: Build reply rules UI (manage keywords, templates)
3. **SESSION 4**: Build message rules UI (inbox automation)
4. **SESSION 5**: Create admin dashboard (monitor queue, logs)

---

## Useful Commands

```bash
# Start dev server
npm run dev

# Start cron jobs
curl -X POST localhost:3456/api/facebook/cron -d '{"action":"start"}'

# Stop cron jobs
curl -X POST localhost:3456/api/facebook/cron -d '{"action":"stop"}'

# Check queue status
curl localhost:3456/api/facebook/queue/status | jq

# Process queue manually
curl -X POST localhost:3456/api/facebook/queue/process -d '{"limit":10}' | jq

# Enable safe mode
curl -X POST localhost:3456/api/facebook/safe-mode -d '{"enable":true,"reason":"Testing"}' | jq

# Disable safe mode
curl -X POST localhost:3456/api/facebook/safe-mode -d '{"enable":false}' | jq

# Check safe mode status
curl localhost:3456/api/facebook/safe-mode | jq

# View server logs
tail -f dev3456.err

# View cron logs only
tail -f dev3456.err | grep "\[Cron\]"

# Run automated tests
node test-session1.js
```

---

**Last Updated**: December 23, 2025  
**Status**: ✅ Ready to test
