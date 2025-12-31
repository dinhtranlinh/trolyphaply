# Facebook Automation Module - Technical Reference

**Last Updated:** December 24, 2025  
**Status:** ✅ Interfaces aligned with DB schema  
**Next Action:** Build production and configure webhooks

---

## ⚠️ CRITICAL: TypeScript Interfaces Convention

**MANDATORY RULE:** All TypeScript interfaces MUST use **snake_case** to match database schema exactly.

### Why This Matters

- **Supabase returns snake_case** from PostgreSQL (no auto-conversion)
- Mismatched interfaces cause **TypeScript build errors**
- Forces unnecessary mapping layers that introduce bugs

### Enforcement Checklist

**Before adding ANY new interface or field:**

1. ✅ Check database schema in `facebook-tables-v2.sql`
2. ✅ Use **exact column names** (snake_case)
3. ✅ Run `npm run build` to verify TypeScript compilation
4. ✅ Test on dev server BEFORE production build

### Interface Standards

```typescript
// ✅ CORRECT - Matches DB exactly
export interface ReplyRule {
  id: string;
  page_id: string; // NOT pageId
  trigger_type: "all" | "keyword"; // NOT match_type
  reply_templates: string[]; // NOT template (single)
  enabled: boolean; // NOT is_active
  created_at: string; // NOT createdAt
}

// ❌ WRONG - CamelCase mismatch
export interface ReplyRule {
  pageId: string; // DB has page_id
  matchType: string; // DB has trigger_type
  template: string; // DB has reply_templates (array)
  isActive: boolean; // DB has enabled
}
```

### Common Pitfalls (AVOID)

| ❌ Wrong (camelCase) | ✅ Correct (snake_case)   | DB Column            |
| -------------------- | ------------------------- | -------------------- |
| `pageId`             | `page_id`                 | `page_id`            |
| `isActive`           | `enabled`                 | `enabled`            |
| `matchType`          | `trigger_type`            | `trigger_type`       |
| `template` (string)  | `reply_templates` (array) | `reply_templates`    |
| `createdAt` (Date)   | `created_at` (string)     | `created_at`         |
| `automationEnabled`  | `automation_enabled`      | `automation_enabled` |
| `lastSyncAt`         | `last_sync_at`            | `last_sync_at`       |
| `dailyUsesCount`     | ❌ Does NOT exist         | (removed from DB)    |
| `maxDailyUses`       | ❌ Does NOT exist         | (removed from DB)    |

### Schema Audit History

**December 24, 2025 - Major Interface Refactor:**

- Fixed 50+ TypeScript errors from interface/DB mismatches
- Removed non-existent fields: `daily_uses_count`, `max_daily_uses`, `last_used_at`
- Aligned all interfaces with actual database schema
- Added this documentation to prevent future issues

**Affected Files:**

- `lib/facebook/replyRulesService.ts` - ReplyRule interfaces
- `lib/facebook/messageRulesService.ts` - MessageRule interfaces
- `lib/facebook/pagesService.ts` - FacebookPage interface
- All API routes in `app/api/facebook/**/*.ts`

---

## 📊 Database Schema

### Overview

- **10 tables** in Supabase PostgreSQL
- **Direct Supabase access** (no Prisma runtime)
- **Prisma schema** for types only
- **File:** `facebook-automation-schema.sql`

### Tables Summary

| Table               | Columns | Primary Key        | Purpose                       |
| ------------------- | ------- | ------------------ | ----------------------------- |
| facebook_connection | 8       | id (VARCHAR 36)    | User access token (encrypted) |
| facebook_pages      | 11      | id (VARCHAR 36)    | Managed pages list            |
| auto_reply_rules    | 11      | id (VARCHAR 36)    | Comment auto-reply rules      |
| auto_message_rules  | 9       | id (VARCHAR 36)    | Inbox message automation      |
| facebook_events     | 11      | id (VARCHAR 36)    | Webhook events log            |
| automation_queue    | 12      | id (VARCHAR 36)    | Job queue for processing      |
| automation_logs     | 10      | id (VARCHAR 36)    | Audit trail                   |
| page_stats          | 7       | (page_id, date)    | Daily aggregated metrics      |
| rate_limits         | 3       | key (VARCHAR 255)  | API rate limiting             |
| user_cooldowns      | 3       | (page_id, user_id) | Message cooldown tracking     |

---

## 🔑 Column Naming Convention

**✅ VERIFIED:** Supabase returns snake_case from PostgreSQL!

### Standard Pattern

```typescript
// Prisma Schema (for types only - not used at runtime)
model FacebookConnection {
  userAccessToken  String  @map("user_access_token")
}

// Database columns (PostgreSQL)
CREATE TABLE facebook_connection (
  user_access_token TEXT  -- snake_case
);

// Code Usage (Supabase client)
// 1. INSERT/UPDATE/UPSERT: Use snake_case (DB column names)
const { data } = await supabase
  .from('facebook_connection')
  .upsert({
    user_access_token: token,  // ✅ CORRECT - matches DB
    userAccessToken: token      // ❌ WRONG - column doesn't exist
  });

// 2. SELECT response: Access via snake_case
const { data } = await supabase
  .from('facebook_connection')
  .select('*')
  .single();

console.log(data.user_access_token);  // ✅ CORRECT - returned as snake_case
console.log(data.userAccessToken);    // ❌ WRONG - undefined
```

**Key Principle:** Supabase does NOT convert names. Always use database column names (snake_case).

### Table-Specific Mappings

#### 1. facebook_connection

| Prisma (Code)   | Database          | Type        | Notes                                         |
| --------------- | ----------------- | ----------- | --------------------------------------------- |
| id              | id                | VARCHAR(36) | Fixed: '00000000-0000-0000-0000-000000000001' |
| userAccessToken | user_access_token | TEXT        | Encrypted (AES-256-CBC with IV)               |
| tokenExpiresAt  | token_expires_at  | TIMESTAMPTZ | 60 days from creation                         |
| scopes          | scopes            | TEXT[]      | Permission array                              |
| status          | status            | VARCHAR(20) | 'active', 'expired', 'revoked'                |
| lastVerifiedAt  | last_verified_at  | TIMESTAMPTZ | Last token check                              |
| createdAt       | created_at        | TIMESTAMPTZ | -                                             |
| updatedAt       | updated_at        | TIMESTAMPTZ | -                                             |

**⚠️ Removed columns:** `token_iv` (now embedded in token), `token_type`, `user_id`

#### 2. facebook_pages

| Prisma (Code)     | Database           | Type         | Notes                     |
| ----------------- | ------------------ | ------------ | ------------------------- |
| id                | id                 | VARCHAR(36)  | UUID                      |
| pageId            | page_id            | VARCHAR(50)  | Facebook Page ID (unique) |
| pageName          | page_name          | VARCHAR(255) | Display name              |
| pageAccessToken   | page_access_token  | TEXT         | Encrypted page token      |
| category          | category           | VARCHAR(100) | Page category             |
| followerCount     | follower_count     | INTEGER      | Total followers           |
| automationEnabled | automation_enabled | BOOLEAN      | Enable/disable per page   |
| status            | status             | VARCHAR(20)  | 'active', 'inactive'      |
| lastSyncAt        | last_sync_at       | TIMESTAMPTZ  | Last /me/accounts sync    |
| createdAt         | created_at         | TIMESTAMPTZ  | -                         |
| updatedAt         | updated_at         | TIMESTAMPTZ  | -                         |

**⚠️ Removed columns:** `connection_id`, `is_active` (use `automation_enabled`)

#### 3. auto_reply_rules

| Prisma (Code)   | Database         | Type         | Notes                          |
| --------------- | ---------------- | ------------ | ------------------------------ |
| id              | id               | VARCHAR(36)  | UUID                           |
| name            | name             | VARCHAR(255) | Rule display name              |
| pageId          | page_id          | VARCHAR(36)  | FK to facebook_pages.id        |
| postId          | post_id          | VARCHAR(100) | Specific post ID (null = all)  |
| triggerType     | trigger_type     | VARCHAR(20)  | 'all', 'keyword'               |
| keywords        | keywords         | TEXT[]       | Trigger keywords (OR logic)    |
| excludeKeywords | exclude_keywords | TEXT[]       | Blacklist keywords             |
| replyTemplates  | reply_templates  | TEXT[]       | Spin templates array           |
| priority        | priority         | INTEGER      | Execution order (higher first) |
| enabled         | enabled          | BOOLEAN      | Active status                  |
| createdAt       | created_at       | TIMESTAMPTZ  | -                              |
| updatedAt       | updated_at       | TIMESTAMPTZ  | -                              |

**⚠️ Removed columns:** `daily_limit`, `usage_count`, `last_reset_at`, `is_active`

#### 4. auto_message_rules

| Prisma (Code)   | Database         | Type         | Notes                   |
| --------------- | ---------------- | ------------ | ----------------------- |
| id              | id               | VARCHAR(36)  | UUID                    |
| name            | name             | VARCHAR(255) | Rule display name       |
| pageId          | page_id          | VARCHAR(36)  | FK to facebook_pages.id |
| triggerOn       | trigger_on       | TEXT[]       | ['comment', 'reaction'] |
| messageTemplate | message_template | TEXT         | Single spin template    |
| cooldownMinutes | cooldown_minutes | INTEGER      | Default 1440 (24h)      |
| enabled         | enabled          | BOOLEAN      | Active status           |
| createdAt       | created_at       | TIMESTAMPTZ  | -                       |
| updatedAt       | updated_at       | TIMESTAMPTZ  | -                       |

**⚠️ Removed columns:** `daily_limit`, `usage_count`, `last_reset_at`, `is_active`

#### 5. facebook_events

| Prisma (Code) | Database     | Type         | Notes                             |
| ------------- | ------------ | ------------ | --------------------------------- |
| id            | id           | VARCHAR(36)  | UUID                              |
| eventType     | event_type   | VARCHAR(50)  | 'comment', 'reaction', 'post'     |
| pageId        | page_id      | VARCHAR(50)  | Facebook Page ID                  |
| postId        | post_id      | VARCHAR(100) | Facebook Post ID                  |
| commentId     | comment_id   | VARCHAR(100) | Facebook Comment ID               |
| userId        | user_id      | VARCHAR(50)  | Facebook User ID                  |
| dedupeKey     | dedupe_key   | VARCHAR(255) | Idempotency key (unique)          |
| payload       | payload      | JSONB        | Full webhook payload              |
| status        | status       | VARCHAR(20)  | 'received', 'processed', 'failed' |
| processedAt   | processed_at | TIMESTAMPTZ  | Processing timestamp              |
| createdAt     | created_at   | TIMESTAMPTZ  | -                                 |

**⚠️ Removed columns:** `processed` (use `status`), `raw_data` (use `payload`)

#### 6. automation_queue

| Prisma (Code) | Database     | Type         | Notes                                          |
| ------------- | ------------ | ------------ | ---------------------------------------------- |
| id            | id           | VARCHAR(36)  | UUID                                           |
| jobType       | job_type     | VARCHAR(50)  | 'reply_comment', 'send_message'                |
| pageId        | page_id      | VARCHAR(50)  | Target page ID                                 |
| targetId      | target_id    | VARCHAR(100) | Comment/User ID                                |
| payload       | payload      | JSONB        | Job data                                       |
| scheduledAt   | scheduled_at | TIMESTAMPTZ  | Execute after this time                        |
| attempts      | attempts     | INTEGER      | Retry count                                    |
| maxAttempts   | max_attempts | INTEGER      | Default 3                                      |
| status        | status       | VARCHAR(20)  | 'pending', 'processing', 'completed', 'failed' |
| error         | error        | TEXT         | Error message                                  |
| completedAt   | completed_at | TIMESTAMPTZ  | Completion time                                |
| createdAt     | created_at   | TIMESTAMPTZ  | -                                              |

**⚠️ Removed columns:** `target_type` (inferred from jobType)

#### 7. automation_logs

| Prisma (Code) | Database     | Type         | Notes                                        |
| ------------- | ------------ | ------------ | -------------------------------------------- |
| id            | id           | VARCHAR(36)  | UUID                                         |
| actionType    | action_type  | VARCHAR(50)  | 'reply_sent', 'message_sent', 'rule_matched' |
| pageId        | page_id      | VARCHAR(50)  | Target page                                  |
| postId        | post_id      | VARCHAR(100) | Related post                                 |
| targetId      | target_id    | VARCHAR(100) | Comment/User ID                              |
| ruleId        | rule_id      | VARCHAR(36)  | Triggering rule                              |
| contentSent   | content_sent | TEXT         | Actual text sent                             |
| status        | status       | VARCHAR(20)  | 'success', 'failed', 'skipped'               |
| metadata      | metadata     | JSONB        | Additional context                           |
| createdAt     | created_at   | TIMESTAMPTZ  | -                                            |

**⚠️ Removed columns:** `details` (use `metadata`), `error_message` (in metadata)

#### 8. page_stats

| Prisma (Code)  | Database        | Type        | Notes                        |
| -------------- | --------------- | ----------- | ---------------------------- |
| pageId         | page_id         | VARCHAR(50) | FK to facebook_pages.page_id |
| date           | date            | DATE        | Stats date                   |
| commentsTotal  | comments_total  | INTEGER     | Total comments seen          |
| repliesSent    | replies_sent    | INTEGER     | Auto-replies sent            |
| messagesSent   | messages_sent   | INTEGER     | Inbox messages sent          |
| reactionsTotal | reactions_total | INTEGER     | Total reactions              |
| failedJobs     | failed_jobs     | INTEGER     | Failed automation jobs       |

**⚠️ Removed columns:** `id` (composite PK), `events_received`, `errors_count`

#### 9. rate_limits

| Prisma (Code) | Database | Type         | Notes                 |
| ------------- | -------- | ------------ | --------------------- |
| key           | key      | VARCHAR(255) | PK: 'page:{id}:reply' |
| count         | count    | INTEGER      | Current usage         |
| resetAt       | reset_at | TIMESTAMPTZ  | Window reset time     |

#### 10. user_cooldowns

| Prisma (Code) | Database        | Type        | Notes                  |
| ------------- | --------------- | ----------- | ---------------------- |
| pageId        | page_id         | VARCHAR(50) | Composite PK           |
| userId        | user_id         | VARCHAR(50) | Composite PK           |
| lastMessageAt | last_message_at | TIMESTAMPTZ | Last message sent time |

---

## 🔐 Token Encryption

### Implementation: AES-256-CBC

- **Key:** 32-byte from `FACEBOOK_TOKEN_ENCRYPTION_KEY` env
- **IV:** Random 16 bytes per token
- **Storage Format:** `{iv_hex}:{encrypted_hex}` (single column)
- **Location:** [lib/facebook/tokenManager.ts](lib/facebook/tokenManager.ts)

```typescript
// Encryption
function encryptToken(token: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  const encrypted = cipher.update(token, "utf8", "hex") + cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

// Decryption
function decryptToken(encryptedWithIv: string): string {
  const [ivHex, encrypted] = encryptedWithIv.split(":");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    key,
    Buffer.from(ivHex, "hex")
  );
  return decipher.update(encrypted, "hex", "utf8") + decipher.final("utf8");
}
```

---

## 📁 Code Structure

### Services (lib/facebook/)

| File                   | Purpose                     | Database Tables Used         |
| ---------------------- | --------------------------- | ---------------------------- |
| tokenManager.ts        | Token lifecycle, encryption | facebook_connection          |
| pagesService.ts        | Page management, sync       | facebook_pages               |
| replyRulesService.ts   | Reply rule CRUD             | auto_reply_rules             |
| messageRulesService.ts | Message rule CRUD           | auto_message_rules           |
| automationEngine.ts    | Core automation logic       | All tables                   |
| queueService.ts        | Job queue management        | automation_queue             |
| rateLimit.ts           | Rate limiting               | rate_limits, automation_logs |
| cooldownService.ts     | User cooldown checks        | user_cooldowns               |
| dedupe.ts              | Event deduplication         | facebook_events              |
| spinContent.ts         | Template randomization      | -                            |
| graphApi.ts            | Facebook Graph API wrapper  | -                            |
| webhookConfig.ts       | Webhook verification        | -                            |
| safeMode.ts            | Global kill-switch          | -                            |
| statsService.ts        | Analytics aggregation       | page_stats, automation_logs  |

### API Routes (app/api/facebook/)

| Route               | Methods           | Purpose            |
| ------------------- | ----------------- | ------------------ |
| /connection         | GET, POST, DELETE | Token management   |
| /connection/verify  | POST              | Token validation   |
| /pages              | GET, PUT          | Pages list         |
| /pages/sync         | POST              | Sync from Facebook |
| /reply-rules        | GET, POST         | Reply rules CRUD   |
| /reply-rules/[id]   | GET, PUT, DELETE  | Single rule ops    |
| /message-rules      | GET, POST         | Message rules CRUD |
| /message-rules/[id] | GET, PUT, DELETE  | Single rule ops    |
| /events             | GET               | Events list        |
| /events/stats       | GET               | Event statistics   |
| /queue/status       | GET               | Queue overview     |
| /logs               | GET               | Logs list          |
| /logs/export        | GET               | CSV export         |
| /webhooks           | GET, POST         | Facebook webhooks  |

### Admin UI (app/admin/facebook/)

| Page          | Route          | Purpose           |
| ------------- | -------------- | ----------------- |
| Dashboard     | /              | KPI cards, charts |
| Connection    | /connection    | Token management  |
| Pages         | /pages         | Pages list, sync  |
| Reply Rules   | /reply-rules   | Rules management  |
| Message Rules | /message-rules | Rules management  |
| Events        | /events        | Real-time events  |
| Logs          | /logs          | Audit trail       |

---

## ✅ Code Quality Status

### Schema Consistency Audit (Dec 24, 2025)

**Result:** ✅ **All code is CORRECT!**

Initial audit script reported 92 "issues" but further investigation revealed they were **false positives**.

**Root Cause:** Audit script incorrectly assumed Supabase auto-converts snake_case → camelCase.

**Actual Behavior (Verified):**

```javascript
// Test proof (see test-supabase-naming.js)
const { data } = await supabase
  .from("facebook_connection")
  .select("*")
  .single();

console.log(Object.keys(data));
// Output: ['id', 'user_access_token', 'token_expires_at', ...]
// NOT: ['id', 'userAccessToken', 'tokenExpiresAt', ...]
```

**Conclusion:** Current codebase correctly uses snake_case for all database operations. No fixes needed.

### Real Issues (Already Fixed)

1. ✅ **Token encryption** - IV now embedded in encrypted string
2. ✅ **Removed obsolete columns** - `token_iv`, `is_active`, `daily_limit` removed from code
3. ✅ **Schema migration** - 10 tables created with correct structure

### Code Review Checklist

When adding new features, verify:

- [ ] Use snake_case for all Supabase operations (INSERT/UPDATE/SELECT)
- [ ] Database column names match `facebook-automation-schema.sql`
- [ ] No references to removed columns (`token_iv`, `is_active`, `daily_limit`)
- [ ] Encrypted tokens use format `{iv_hex}:{encrypted_hex}`

---

## 📝 Development Guidelines

### Before Adding New Features

1. Read this document completely
2. Check Prisma schema for correct column names
3. Use camelCase in code, never snake_case
4. Run audit: `node audit-schema-v2.js`

### After Code Changes

1. Run audit script
2. Update this document if schema changes
3. Test with both empty and populated tables
4. Verify encryption/decryption works

### Testing Checklist

- [ ] Token save/retrieve works
- [ ] Pages sync works
- [ ] Rules can be created/updated
- [ ] Automation processes events correctly
- [ ] Rate limiting functions
- [ ] No database errors in logs

---

## 🔄 Migration History

### v1.0 - Initial Schema (Session 10)

- Created 9 tables + system_config
- Used token_iv as separate column
- Had is_active, daily_limit fields

### v2.0 - Schema Audit (Current)

- Removed system_config table
- Merged IV into encrypted token
- Removed daily usage tracking columns
- Standardized to 10 tables
- **Status:** Code fixes pending

---

## 📚 External References

- **Prisma Schema:** [prisma/schema.prisma](prisma/schema.prisma)
- **SQL Migration:** [facebook-automation-schema.sql](facebook-automation-schema.sql)
- **Setup Guide:** [FACEBOOK-AUTOMATION-SETUP.md](FACEBOOK-AUTOMATION-SETUP.md)
- **Session History:** [Docs/TODO-TroLyPhapLy.md](Docs/TODO-TroLyPhapLy.md)
- **User Guide:** [Docs/fb/USER-GUIDE-FACEBOOK.md](Docs/fb/USER-GUIDE-FACEBOOK.md)
- **API Docs:** [Docs/fb/API-ENDPOINTS.md](Docs/fb/API-ENDPOINTS.md)

---

**⚠️ IMPORTANT:** This document must be updated after every schema or major code change!
