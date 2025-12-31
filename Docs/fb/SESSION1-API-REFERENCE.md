# SESSION 1 API Reference

Quick reference for all API endpoints created in SESSION 1.

## Base URL

- Development: `http://localhost:3456`
- Production: `http://localhost:8686`

---

## Safe Mode API

### Get Safe Mode Status

```
GET /api/facebook/safe-mode
```

**Response**:

```json
{
  "success": true,
  "safeMode": false,
  "reason": null,
  "setAt": null,
  "setBy": null
}
```

### Toggle Safe Mode

```
POST /api/facebook/safe-mode
Content-Type: application/json

{
  "enable": true,
  "reason": "Emergency maintenance",
  "setBy": "admin"
}
```

**Response**:

```json
{
  "success": true,
  "safeMode": true,
  "message": "🛑 Safe mode ENABLED - All automation stopped",
  "safe_mode": true,
  "reason": "Emergency maintenance",
  "set_at": "2025-12-23T10:30:00Z",
  "set_by": "admin"
}
```

---

## Queue API

### Get Queue Status

```
GET /api/facebook/queue/status
```

**Response**:

```json
{
  "success": true,
  "stats": {
    "pending": 15,
    "processing": 2,
    "completed": 142,
    "failed": 3,
    "total": 162
  },
  "recentJobs": [
    {
      "id": "job_123",
      "job_type": "reply",
      "page_id": "page_456",
      "status": "completed",
      "scheduled_for": "2025-12-23T10:15:30Z",
      "created_at": "2025-12-23T10:12:15Z",
      "completed_at": "2025-12-23T10:15:45Z",
      "attempt": 1,
      "error": null
    }
  ],
  "oldestPending": {
    "id": "job_789",
    "scheduled_for": "2025-12-23T10:20:00Z"
  },
  "timestamp": "2025-12-23T10:25:00Z"
}
```

### Manually Process Queue

```
POST /api/facebook/queue/process
Content-Type: application/json

{
  "limit": 10
}
```

**Response**:

```json
{
  "success": true,
  "processed": 5,
  "successful": 4,
  "failed": 1,
  "details": [
    {
      "jobId": "123",
      "type": "reply",
      "success": true,
      "actionId": "comment_456"
    },
    {
      "jobId": "124",
      "type": "reply",
      "success": false,
      "reason": "Page not active"
    }
  ]
}
```

---

## Cron Jobs API

### Get Cron Status

```
GET /api/facebook/cron
```

**Response**:

```json
{
  "success": true,
  "running": true,
  "taskCount": 3,
  "tasks": [
    {
      "name": "Queue Processor",
      "schedule": "Every minute"
    },
    {
      "name": "Event Cleanup",
      "schedule": "Daily at 2 AM"
    },
    {
      "name": "Stats Aggregation",
      "schedule": "Daily at 3 AM"
    }
  ]
}
```

### Start/Stop Cron Jobs

```
POST /api/facebook/cron
Content-Type: application/json

{
  "action": "start"
}
```

**Actions**: `"start"` or `"stop"`

**Response**:

```json
{
  "success": true,
  "message": "Cron jobs started",
  "status": {
    "running": true,
    "taskCount": 3,
    "tasks": [...]
  }
}
```

---

## Webhooks Endpoint

### Webhook Verification (Facebook)

```
GET /api/facebook/webhooks?hub.mode=subscribe&hub.verify_token=YOUR_TOKEN&hub.challenge=RANDOM_STRING
```

**Response**: Returns the `hub.challenge` value as plain text.

### Receive Webhook Events

```
POST /api/facebook/webhooks
Content-Type: application/json
x-hub-signature-256: sha256=<HMAC_SHA256_SIGNATURE>

{
  "object": "page",
  "entry": [
    {
      "id": "PAGE_ID",
      "time": 1234567890,
      "changes": [
        {
          "field": "feed",
          "value": {
            "item": "comment",
            "post_id": "POST_ID",
            "comment_id": "COMMENT_ID",
            "from": {
              "id": "USER_ID",
              "name": "Test User"
            },
            "message": "This is a test comment",
            "verb": "add",
            "created_time": "2025-12-23T10:00:00+0000"
          }
        }
      ]
    }
  ]
}
```

**Response**:

```json
{
  "success": true
}
```

**Note**: Always returns 200 OK within 1 second to avoid Facebook retry.

---

## Testing with curl

### Test Safe Mode

```bash
# Get status
curl http://localhost:3456/api/facebook/safe-mode

# Enable
curl -X POST http://localhost:3456/api/facebook/safe-mode \
  -H "Content-Type: application/json" \
  -d '{"enable":true,"reason":"Testing","setBy":"curl"}'

# Disable
curl -X POST http://localhost:3456/api/facebook/safe-mode \
  -H "Content-Type: application/json" \
  -d '{"enable":false,"setBy":"curl"}'
```

### Test Queue

```bash
# Get status
curl http://localhost:3456/api/facebook/queue/status

# Process jobs
curl -X POST http://localhost:3456/api/facebook/queue/process \
  -H "Content-Type: application/json" \
  -d '{"limit":10}'
```

### Test Cron

```bash
# Get status
curl http://localhost:3456/api/facebook/cron

# Start
curl -X POST http://localhost:3456/api/facebook/cron \
  -H "Content-Type: application/json" \
  -d '{"action":"start"}'

# Stop
curl -X POST http://localhost:3456/api/facebook/cron \
  -H "Content-Type: application/json" \
  -d '{"action":"stop"}'
```

---

## Error Responses

All endpoints return error responses in this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

Common HTTP status codes:

- `200` - Success
- `400` - Bad request (invalid parameters)
- `403` - Forbidden (invalid signature, unauthorized)
- `500` - Internal server error

---

## Rate Limits

### Page Reply Limit

- **Limit**: 10 replies per minute per page
- **Check**: Enforced in `automationEngine.ts`
- **Storage**: In-memory Map cache

### User Reply Cooldown

- **Limit**: 5 minutes between replies to same user
- **Check**: Enforced in `automationEngine.ts`
- **Storage**: In-memory Map cache

### Page Message Limit

- **Limit**: 50 messages per hour per page
- **Check**: Enforced in `automationEngine.ts`
- **Storage**: In-memory Map cache

---

## Database Tables

### automation_queue

Jobs waiting to be processed.

**Columns**:

- `id` (UUID) - Primary key
- `job_type` (enum) - 'reply' or 'message'
- `page_id` (text) - Facebook page ID
- `status` (enum) - 'pending', 'processing', 'completed', 'failed'
- `scheduled_for` (timestamp) - When to process
- `job_data` (jsonb) - Event data
- `attempt` (int) - Retry count (max 3)
- `error` (text) - Last error message
- `created_at`, `completed_at` (timestamp)

**Query Examples**:

```sql
-- Get pending jobs
SELECT * FROM automation_queue
WHERE status = 'pending'
  AND scheduled_for <= NOW()
ORDER BY scheduled_for ASC
LIMIT 10;

-- Count by status
SELECT status, COUNT(*)
FROM automation_queue
GROUP BY status;

-- Failed jobs
SELECT * FROM automation_queue
WHERE status = 'failed'
ORDER BY created_at DESC;
```

### automation_logs

Permanent audit trail.

**Columns**:

- `id` (UUID) - Primary key
- `page_id` (text) - Facebook page ID
- `action_type` (enum) - 'reply', 'private_reply', 'message'
- `success` (boolean) - Whether action succeeded
- `reason` (text) - Success/failure reason
- `job_data` (jsonb) - Original job data
- `created_at` (timestamp)

**Query Examples**:

```sql
-- Recent actions
SELECT * FROM automation_logs
ORDER BY created_at DESC
LIMIT 20;

-- Success rate by page
SELECT page_id,
  COUNT(*) as total,
  SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful,
  ROUND(100.0 * SUM(CASE WHEN success THEN 1 ELSE 0 END) / COUNT(*), 2) as success_rate
FROM automation_logs
GROUP BY page_id;

-- Failed actions
SELECT * FROM automation_logs
WHERE success = false
ORDER BY created_at DESC;
```

### page_stats

Daily KPI counters.

**Columns**:

- `id` (UUID) - Primary key
- `page_id` (text) - Facebook page ID
- `date` (date) - Stats date
- `replies_sent` (int) - Comment replies count
- `messages_sent` (int) - Inbox messages count
- `events_received` (int) - Webhook events count

**Query Examples**:

```sql
-- Today's stats
SELECT * FROM page_stats
WHERE date = CURRENT_DATE;

-- Weekly stats
SELECT page_id,
  SUM(replies_sent) as total_replies,
  SUM(messages_sent) as total_messages,
  SUM(events_received) as total_events
FROM page_stats
WHERE date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY page_id;

-- Daily trend (last 30 days)
SELECT date,
  SUM(replies_sent) as replies,
  SUM(messages_sent) as messages
FROM page_stats
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY date
ORDER BY date DESC;
```

---

## Logs and Debugging

### Check Logs

```bash
# Development server logs
tail -f dev3456.err

# Production server logs
tail -f prod8686.err

# Cron job output
grep "[Cron]" dev3456.err
```

### Common Log Messages

```
✅ [Cron] Job 123 completed successfully
⚠️ [Cron] Job 456 failed: Page not active
❌ [Cron] Error processing job 789: Rate limit exceeded
🔄 Duplicate event ignored: comment_reply comment_123
📩 Event: feed on page page_456
✅ Event queued: comment_reply comment_789
```

---

## Monitoring Checklist

Daily checks:

- [ ] Queue status: No stuck jobs in 'processing'
- [ ] Failed jobs: Check `automation_logs` for failures
- [ ] Safe mode: Verify not accidentally enabled
- [ ] Cron jobs: Confirm running every minute
- [ ] Rate limits: Check if any pages hitting limits
- [ ] Page stats: Verify counters incrementing
- [ ] Event deduplication: Check for duplicate events

Weekly checks:

- [ ] Old events cleanup: Confirm 7-day retention
- [ ] Queue backlog: Ensure processing keeps up with webhooks
- [ ] Success rate: Calculate from `automation_logs`
- [ ] Error patterns: Identify recurring failures

---

## Quick Troubleshooting

### Jobs not processing

1. Check cron is running: `curl http://localhost:3456/api/facebook/cron`
2. Check safe mode disabled: `curl http://localhost:3456/api/facebook/safe-mode`
3. Check pending jobs: `curl http://localhost:3456/api/facebook/queue/status`
4. Manually trigger: `curl -X POST http://localhost:3456/api/facebook/queue/process -d '{"limit":10}'`

### Webhooks not enqueuing

1. Check webhook signature verification
2. Check dedupe not blocking: Query `facebook_events` table
3. Check logs for errors: `tail -f dev3456.err`
4. Test with Facebook's "Send Test Event" button

### Rate limits too restrictive

1. Edit `system_config` table:
   ```sql
   UPDATE system_config
   SET rate_limits = '{
     "page_reply_per_minute": 20,
     "user_reply_cooldown_seconds": 300,
     "page_message_per_hour": 100
   }'
   WHERE id = 1;
   ```
2. Restart server to clear cache

---

**Last Updated**: December 23, 2025  
**Session**: 1  
**Status**: ✅ Complete
