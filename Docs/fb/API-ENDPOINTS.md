# 📡 Facebook Page Automation - API Endpoints

> **Version**: 1.0.0  
> **Base URL**: `https://trolyphaply.vn` (Production) or `http://localhost:3456` (Development)  
> **Authentication**: Admin session cookie (`admin_session`)  
> **Last Updated**: December 23, 2025

---

## 📑 Table of Contents

1. [Connection Management](#connection-management)
2. [Pages Management](#pages-management)
3. [Reply Rules](#reply-rules)
4. [Message Rules](#message-rules)
5. [Events Stream](#events-stream)
6. [Logs & Statistics](#logs--statistics)
7. [Queue Management](#queue-management)
8. [Safe Mode](#safe-mode)
9. [Cron Jobs](#cron-jobs)
10. [Webhooks](#webhooks)

---

## 🔗 Connection Management

### Get Connection Status

**GET** `/api/facebook/connection`

Returns current Facebook token status and connection information.

**Response**:

```json
{
  "connected": true,
  "connection": {
    "id": 1,
    "admin_id": 1,
    "access_token_encrypted": "...",
    "token_expires_at": "2025-02-23T10:00:00.000Z",
    "scopes": ["pages_manage_metadata", "pages_read_engagement", ...],
    "created_at": "2025-12-23T10:00:00.000Z",
    "updated_at": "2025-12-23T10:00:00.000Z"
  }
}
```

---

### Verify Token

**POST** `/api/facebook/connection/verify`

Verifies a Facebook access token without saving it.

**Request**:

```json
{
  "access_token": "EAAxxxxx..."
}
```

**Response**:

```json
{
  "valid": true,
  "token_info": {
    "app_id": "123456789",
    "application": "TroLyPhapLy",
    "expires_at": 1740297600,
    "is_valid": true,
    "scopes": ["pages_manage_metadata", ...],
    "user_id": "987654321"
  },
  "has_required_permissions": true,
  "missing_permissions": []
}
```

---

### Save Connection

**POST** `/api/facebook/connection`

Saves Facebook access token and establishes connection.

**Request**:

```json
{
  "access_token": "EAAxxxxx..."
}
```

**Response**:

```json
{
  "success": true,
  "message": "Connection established successfully",
  "connection": {
    "id": 1,
    "token_expires_at": "2025-02-23T10:00:00.000Z"
  }
}
```

---

### Delete Connection

**DELETE** `/api/facebook/connection`

Removes Facebook connection and revokes token.

**Response**:

```json
{
  "success": true,
  "message": "Connection deleted successfully"
}
```

---

## 📄 Pages Management

### List All Pages

**GET** `/api/facebook/pages`

Returns all managed Facebook pages.

**Response**:

```json
{
  "pages": [
    {
      "id": 1,
      "page_id": "123456789",
      "name": "My Page Name",
      "access_token_encrypted": "...",
      "category": "Local Business",
      "followers_count": 1500,
      "automation_enabled": true,
      "added_at": "2025-12-23T10:00:00.000Z"
    }
  ]
}
```

---

### Sync Pages from Facebook

**POST** `/api/facebook/pages/sync`

Fetches latest pages from Facebook Graph API and syncs to database.

**Response**:

```json
{
  "success": true,
  "synced": 3,
  "added": 1,
  "updated": 2,
  "pages": [...]
}
```

---

### Get Single Page

**GET** `/api/facebook/pages/:id`

Returns details for a specific page.

**Response**:

```json
{
  "page": {
    "id": 1,
    "page_id": "123456789",
    "name": "My Page Name",
    ...
  }
}
```

---

### Update Page

**PATCH** `/api/facebook/pages/:id`

Updates page settings.

**Request**:

```json
{
  "automation_enabled": true
}
```

**Response**:

```json
{
  "success": true,
  "page": {...}
}
```

---

### Delete Page

**DELETE** `/api/facebook/pages/:id`

Removes page and cascades to rules and logs.

**Response**:

```json
{
  "success": true,
  "message": "Page deleted successfully"
}
```

---

## 💬 Reply Rules

### List Reply Rules

**GET** `/api/facebook/reply-rules`

**Query Parameters**:

- `page_id` (optional): Filter by page
- `is_active` (optional): Filter by active status (true/false)

**Response**:

```json
{
  "rules": [
    {
      "id": 1,
      "name": "Welcome Commenters",
      "page_id": "123456789",
      "post_id": null,
      "trigger_type": "keyword",
      "keywords": ["xin chào", "hello"],
      "exclude_keywords": ["spam"],
      "template": "[Xin chào|Hi] {full_name}!",
      "priority": 5,
      "daily_limit": 100,
      "usage_count": 42,
      "is_active": true,
      "created_at": "2025-12-23T10:00:00.000Z"
    }
  ]
}
```

---

### Create Reply Rule

**POST** `/api/facebook/reply-rules`

**Request**:

```json
{
  "name": "Welcome Commenters",
  "page_id": "123456789",
  "post_id": null,
  "trigger_type": "keyword",
  "keywords": ["xin chào", "hello"],
  "exclude_keywords": ["spam"],
  "template": "[Xin chào|Hi] {full_name}!",
  "priority": 5,
  "daily_limit": 100,
  "is_active": true
}
```

**Response**:

```json
{
  "success": true,
  "rule": {...}
}
```

**Validation Rules**:

- `name`: Required, 1-200 characters
- `page_id`: Required, must exist
- `trigger_type`: "all" or "keyword"
- `keywords`: Required if trigger_type="keyword"
- `template`: Required, 10-2000 characters, valid syntax
- `priority`: 1-10
- `daily_limit`: Optional, >= 1

---

### Get Reply Rule

**GET** `/api/facebook/reply-rules/:id`

**Response**:

```json
{
  "rule": {...}
}
```

---

### Update Reply Rule

**PATCH** `/api/facebook/reply-rules/:id`

**Request**: Same fields as create (all optional)

**Response**:

```json
{
  "success": true,
  "rule": {...}
}
```

---

### Delete Reply Rule

**DELETE** `/api/facebook/reply-rules/:id`

**Response**:

```json
{
  "success": true
}
```

---

### Preview Template

**POST** `/api/facebook/reply-rules/preview`

Generates variations from template with spin syntax.

**Request**:

```json
{
  "template": "[Xin chào|Hi] {full_name}!",
  "user_name": "Nguyễn Văn A",
  "count": 10
}
```

**Response**:

```json
{
  "variations": [
    "Xin chào Nguyễn Văn A!",
    "Hi Nguyễn Văn A!",
    "Xin chào Nguyễn Văn A!",
    ...
  ]
}
```

---

### Test Comment Matching

**POST** `/api/facebook/reply-rules/test`

Tests if a comment matches any rule.

**Request**:

```json
{
  "page_id": "123456789",
  "comment_text": "Xin chào shop",
  "user_id": "987654321"
}
```

**Response**:

```json
{
  "matched": true,
  "rule": {...},
  "explanation": "Matched keyword 'xin chào' with priority 5"
}
```

---

### Bulk Update Reply Rules

**POST** `/api/facebook/reply-rules/bulk`

**Request**:

```json
{
  "rule_ids": [1, 2, 3],
  "updates": {
    "is_active": false
  }
}
```

**Response**:

```json
{
  "success": true,
  "updated": 3
}
```

---

## 📨 Message Rules

### List Message Rules

**GET** `/api/facebook/message-rules`

**Query Parameters**:

- `page_id` (optional): Filter by page
- `is_active` (optional): Filter by active status

**Response**:

```json
{
  "rules": [
    {
      "id": 1,
      "name": "Welcome Message",
      "page_id": "123456789",
      "trigger_on_comment": true,
      "trigger_on_reaction": false,
      "template": "Chào {full_name}!",
      "cooldown_minutes": 60,
      "priority": 5,
      "daily_limit": 50,
      "usage_count": 15,
      "is_active": true,
      "created_at": "2025-12-23T10:00:00.000Z"
    }
  ]
}
```

---

### Create Message Rule

**POST** `/api/facebook/message-rules`

**Request**:

```json
{
  "name": "Welcome Message",
  "page_id": "123456789",
  "trigger_on_comment": true,
  "trigger_on_reaction": false,
  "template": "Chào {full_name}!",
  "cooldown_minutes": 60,
  "priority": 5,
  "daily_limit": 50,
  "is_active": true
}
```

**Response**:

```json
{
  "success": true,
  "rule": {...}
}
```

**Validation Rules**:

- `name`: Required, 1-200 characters
- `page_id`: Required, must exist
- At least one trigger (comment or reaction) must be true
- `template`: Required, 10-2000 characters
- `cooldown_minutes`: Required, >= 1
- `priority`: 1-10

---

### Get Message Rule

**GET** `/api/facebook/message-rules/:id`

---

### Update Message Rule

**PATCH** `/api/facebook/message-rules/:id`

---

### Delete Message Rule

**DELETE** `/api/facebook/message-rules/:id`

---

### Test Trigger Matching

**POST** `/api/facebook/message-rules/test`

Tests if a trigger matches any rule.

**Request**:

```json
{
  "page_id": "123456789",
  "trigger": "comment",
  "user_id": "987654321"
}
```

**Response**:

```json
{
  "matched": true,
  "rule": {...},
  "in_cooldown": false,
  "explanation": "Triggered by comment"
}
```

---

### Bulk Update Message Rules

**POST** `/api/facebook/message-rules/bulk`

---

## 📡 Events Stream

### List Events

**GET** `/api/facebook/events`

**Query Parameters**:

- `page_id` (optional): Filter by page
- `event_type` (optional): Filter by type (comment/reaction/message/mention)
- `status` (optional): Filter by status (pending/processed/failed)
- `limit` (optional): Max results (default: 50)
- `offset` (optional): Pagination offset

**Response**:

```json
{
  "events": [
    {
      "id": 1,
      "event_id": "unique_event_hash",
      "event_type": "comment",
      "page_id": "123456789",
      "user_id": "987654321",
      "post_id": "123456789_987654321",
      "comment_id": "123456789_111111111",
      "status": "processed",
      "created_at": "2025-12-23T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

---

### Get Single Event

**GET** `/api/facebook/events/:id`

**Response**:

```json
{
  "event": {...}
}
```

---

### Get Event Statistics

**GET** `/api/facebook/events/stats`

**Query Parameters**:

- `page_id` (optional)
- `start_date` (optional): ISO date
- `end_date` (optional): ISO date

**Response**:

```json
{
  "total": 500,
  "by_type": {
    "comment": 300,
    "reaction": 150,
    "message": 40,
    "mention": 10
  },
  "by_status": {
    "pending": 5,
    "processed": 480,
    "failed": 15
  }
}
```

---

## 📊 Logs & Statistics

### List Logs

**GET** `/api/facebook/logs`

**Query Parameters**:

- `page_id` (optional)
- `action_type` (optional): comment_reply / inbox_message
- `status` (optional): sent / failed
- `start_date` (optional): ISO date
- `end_date` (optional): ISO date
- `limit` (optional): Max results (default: 50)
- `offset` (optional): Pagination offset

**Response**:

```json
{
  "logs": [
    {
      "id": 1,
      "page_id": "123456789",
      "rule_id": 5,
      "action_type": "comment_reply",
      "status": "sent",
      "user_id": "987654321",
      "user_name": "Nguyễn Văn A",
      "comment_text": "Xin chào shop",
      "response_text": "Chào Nguyễn Văn A! Cảm ơn đã comment.",
      "error_message": null,
      "trigger": "keyword:xin chào",
      "sent_at": "2025-12-23T10:00:00.000Z",
      "created_at": "2025-12-23T09:59:45.000Z"
    }
  ],
  "pagination": {...}
}
```

---

### Get Single Log

**GET** `/api/facebook/logs/:id`

---

### Export Logs to CSV

**GET** `/api/facebook/logs/export`

**Query Parameters**: Same as list logs

**Response**: CSV file download

```
Content-Type: text/csv
Content-Disposition: attachment; filename="facebook-logs-2025-12-23.csv"
```

**CSV Format**:

```csv
ID,Page ID,Rule ID,Action Type,Status,User ID,User Name,Comment Text,Response Text,Error Message,Trigger,Sent At,Created At
1,123456789,5,comment_reply,sent,987654321,Nguyễn Văn A,"Xin chào shop","Chào Nguyễn Văn A! Cảm ơn đã comment.",,keyword:xin chào,2025-12-23T10:00:00.000Z,2025-12-23T09:59:45.000Z
```

---

### Get Statistics

**GET** `/api/facebook/logs/stats`

**Query Parameters**:

- `type` (required): summary / today / daily / action / page / hourly / success
- Additional params depend on type:
  - `daily`: `days` (default: 7)
  - `page`: `page_id` (required)
  - `action`: none
  - `hourly`: `date` (optional, default: today)

**Response for `type=summary`**:

```json
{
  "today_sent": 45,
  "today_failed": 3,
  "today_total": 48,
  "total_sent": 1250,
  "total_failed": 50,
  "total": 1300,
  "success_rate": 96.15
}
```

**Response for `type=daily`**:

```json
{
  "daily_stats": [
    {
      "date": "2025-12-23",
      "sent": 45,
      "failed": 3,
      "total": 48
    },
    {
      "date": "2025-12-22",
      "sent": 38,
      "failed": 2,
      "total": 40
    }
  ]
}
```

**Response for `type=action`**:

```json
{
  "by_action": {
    "comment_reply": {
      "sent": 800,
      "failed": 20,
      "total": 820
    },
    "inbox_message": {
      "sent": 450,
      "failed": 30,
      "total": 480
    }
  }
}
```

**Response for `type=hourly`**:

```json
{
  "hourly_distribution": [
    { "hour": 0, "count": 5 },
    { "hour": 1, "count": 2 },
    ...
    { "hour": 23, "count": 8 }
  ]
}
```

---

## 🔄 Queue Management

### Get Queue Status

**GET** `/api/facebook/queue/status`

**Response**:

```json
{
  "pending": 15,
  "processing": 2,
  "completed": 450,
  "failed": 8,
  "oldest_pending": "2025-12-23T09:55:00.000Z"
}
```

---

### Process Queue (Manual Trigger)

**POST** `/api/facebook/queue/process`

Manually triggers queue processing (normally done by cron).

**Response**:

```json
{
  "success": true,
  "processed": 5,
  "failed": 1,
  "remaining": 10
}
```

---

## 🛡️ Safe Mode

### Get Safe Mode Status

**GET** `/api/facebook/safe-mode`

**Response**:

```json
{
  "enabled": false,
  "updated_at": "2025-12-23T10:00:00.000Z"
}
```

---

### Toggle Safe Mode

**POST** `/api/facebook/safe-mode`

**Request**:

```json
{
  "enabled": true
}
```

**Response**:

```json
{
  "success": true,
  "enabled": true
}
```

---

## ⏰ Cron Jobs

### Get Cron Status

**GET** `/api/facebook/cron`

**Response**:

```json
{
  "running": true,
  "jobs": [
    {
      "name": "processQueue",
      "schedule": "* * * * *",
      "last_run": "2025-12-23T10:05:00.000Z",
      "next_run": "2025-12-23T10:06:00.000Z"
    },
    {
      "name": "cleanupEvents",
      "schedule": "0 2 * * *",
      "last_run": "2025-12-23T02:00:00.000Z",
      "next_run": "2025-12-24T02:00:00.000Z"
    },
    {
      "name": "aggregateStats",
      "schedule": "0 3 * * *",
      "last_run": "2025-12-23T03:00:00.000Z",
      "next_run": "2025-12-24T03:00:00.000Z"
    }
  ]
}
```

---

### Start Cron Jobs

**POST** `/api/facebook/cron`

**Request**:

```json
{
  "action": "start"
}
```

---

### Stop Cron Jobs

**POST** `/api/facebook/cron`

**Request**:

```json
{
  "action": "stop"
}
```

⚠️ **Warning**: Stopping cron disables queue processing

---

## 🪝 Webhooks

### Webhook Verification (GET)

**GET** `/api/facebook/webhooks`

Used by Facebook to verify webhook endpoint.

**Query Parameters**:

- `hub.mode`: "subscribe"
- `hub.verify_token`: Your verify token
- `hub.challenge`: Random string from Facebook

**Response**: Echo back `hub.challenge`

---

### Webhook Event Receiver (POST)

**POST** `/api/facebook/webhooks`

Receives events from Facebook webhooks.

**Request** (example):

```json
{
  "object": "page",
  "entry": [
    {
      "id": "123456789",
      "time": 1703332800,
      "changes": [
        {
          "field": "feed",
          "value": {
            "item": "comment",
            "comment_id": "123456789_987654321",
            "post_id": "123456789_111111111",
            "verb": "add",
            "parent_id": "123456789_111111111",
            "created_time": 1703332800,
            "from": {
              "id": "987654321",
              "name": "Nguyễn Văn A"
            },
            "message": "Xin chào shop"
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
  "success": true,
  "received": 1
}
```

**Process Flow**:

1. Verify signature
2. Parse event
3. Check for duplicates
4. Record event in database
5. Enqueue automation jobs
6. Return 200 OK (< 1s)

---

## 🔐 Authentication

All endpoints require admin authentication via session cookie:

```
Cookie: admin_session=your_session_token_here
```

**401 Unauthorized** returned if not authenticated.

---

## ⚠️ Error Responses

All errors follow this format:

```json
{
  "error": "Error message description",
  "code": "ERROR_CODE",
  "details": {}
}
```

**Common Error Codes**:

- `UNAUTHORIZED`: Not authenticated
- `FORBIDDEN`: No permission
- `NOT_FOUND`: Resource doesn't exist
- `VALIDATION_ERROR`: Invalid input
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error

---

## 📈 Rate Limits

### API Rate Limits (Internal)

- No rate limits on admin endpoints
- Recommended: < 100 requests/minute

### Facebook API Rate Limits (External)

- Page replies: 10 per minute
- User messages: 1 per 5 minutes (enforced by cooldown)
- Page messages: 50 per hour
- System automatically enforces these

---

## 🧪 Testing Endpoints

### Using cURL

```bash
# Get connection status
curl -X GET http://localhost:3456/api/facebook/connection \
  -H "Cookie: admin_session=your_token"

# Create reply rule
curl -X POST http://localhost:3456/api/facebook/reply-rules \
  -H "Cookie: admin_session=your_token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Rule",
    "page_id": "123456789",
    "trigger_type": "all",
    "template": "Hello {full_name}!",
    "priority": 5,
    "is_active": true
  }'

# Export logs
curl -X GET "http://localhost:3456/api/facebook/logs/export?status=sent" \
  -H "Cookie: admin_session=your_token" \
  -o logs.csv
```

### Using Test Scripts

```bash
# Integration test
node test-facebook-automation.js

# Performance test
node test-performance.js
```

---

**Document Version**: 1.0.0  
**Last Updated**: December 23, 2025  
**Base URL**: `/api/facebook/*`
