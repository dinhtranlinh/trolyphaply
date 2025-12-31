-- Facebook Page Automation Migration
-- Created: 2024-12-23
-- Purpose: Add Facebook automation tables (minimal storage, admin-only)

-- ============================================
-- 1. FACEBOOK CONNECTION (1 record only)
-- ============================================
CREATE TABLE IF NOT EXISTS "facebook_connection" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_access_token" TEXT NOT NULL,
  "token_expires_at" TIMESTAMPTZ,
  "scopes" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "status" VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
  "last_verified_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. FACEBOOK PAGES (minimal info)
-- ============================================
CREATE TABLE IF NOT EXISTS "facebook_pages" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "page_id" VARCHAR(50) UNIQUE NOT NULL,
  "page_name" VARCHAR(255) NOT NULL,
  "page_access_token" TEXT NOT NULL,
  "category" VARCHAR(100),
  "follower_count" INTEGER,
  "automation_enabled" BOOLEAN DEFAULT TRUE,
  "status" VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  "last_sync_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_fb_pages_page_id" ON "facebook_pages"("page_id");
CREATE INDEX IF NOT EXISTS "idx_fb_pages_status" ON "facebook_pages"("status");

-- ============================================
-- 3. AUTO REPLY RULES (template-based)
-- ============================================
CREATE TABLE IF NOT EXISTS "auto_reply_rules" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) NOT NULL,
  "page_id" UUID NOT NULL REFERENCES "facebook_pages"("id") ON DELETE CASCADE,
  "post_id" VARCHAR(100), -- NULL = apply to all posts
  "trigger_type" VARCHAR(20) DEFAULT 'all' CHECK (trigger_type IN ('all', 'keyword')),
  "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "exclude_keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "reply_templates" TEXT[] NOT NULL, -- Array of spin syntax templates
  "priority" INTEGER DEFAULT 0,
  "enabled" BOOLEAN DEFAULT TRUE,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_reply_rules_page" ON "auto_reply_rules"("page_id", "enabled");
CREATE INDEX IF NOT EXISTS "idx_reply_rules_post" ON "auto_reply_rules"("page_id", "post_id");

-- ============================================
-- 4. AUTO MESSAGE RULES (inbox automation)
-- ============================================
CREATE TABLE IF NOT EXISTS "auto_message_rules" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) NOT NULL,
  "page_id" UUID NOT NULL REFERENCES "facebook_pages"("id") ON DELETE CASCADE,
  "trigger_on" TEXT[] DEFAULT ARRAY['comment']::TEXT[], -- comment, reaction
  "message_template" TEXT NOT NULL,
  "cooldown_minutes" INTEGER DEFAULT 1440, -- 24 hours
  "enabled" BOOLEAN DEFAULT TRUE,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_message_rules_page" ON "auto_message_rules"("page_id", "enabled");

-- ============================================
-- 5. FACEBOOK EVENTS (dedupe + tracking)
-- Auto-delete after 7 days via cron/trigger
-- ============================================
CREATE TABLE IF NOT EXISTS "facebook_events" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "event_type" VARCHAR(50) NOT NULL, -- comment, reaction, post
  "page_id" VARCHAR(50) NOT NULL,
  "post_id" VARCHAR(100),
  "comment_id" VARCHAR(100),
  "user_id" VARCHAR(50),
  "dedupe_key" VARCHAR(255) UNIQUE NOT NULL, -- For idempotency
  "payload" JSONB NOT NULL,
  "status" VARCHAR(20) DEFAULT 'received' CHECK (status IN ('received', 'processed', 'failed')),
  "processed_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_fb_events_dedupe" ON "facebook_events"("dedupe_key");
CREATE INDEX IF NOT EXISTS "idx_fb_events_page_time" ON "facebook_events"("page_id", "created_at");
CREATE INDEX IF NOT EXISTS "idx_fb_events_status" ON "facebook_events"("status");

-- Auto-cleanup function (delete events older than 7 days)
CREATE OR REPLACE FUNCTION cleanup_old_facebook_events()
RETURNS void AS $$
BEGIN
  DELETE FROM "facebook_events" WHERE "created_at" < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. AUTOMATION QUEUE (delayed jobs)
-- ============================================
CREATE TABLE IF NOT EXISTS "automation_queue" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "job_type" VARCHAR(50) NOT NULL, -- reply_comment, send_message
  "page_id" VARCHAR(50) NOT NULL,
  "target_id" VARCHAR(100) NOT NULL, -- comment_id or user_id
  "payload" JSONB NOT NULL,
  "scheduled_at" TIMESTAMPTZ NOT NULL, -- Execute after this time
  "attempts" INTEGER DEFAULT 0,
  "max_attempts" INTEGER DEFAULT 3,
  "status" VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  "error" TEXT,
  "completed_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_queue_scheduled" ON "automation_queue"("status", "scheduled_at");
CREATE INDEX IF NOT EXISTS "idx_queue_page" ON "automation_queue"("page_id", "status");

-- ============================================
-- 7. AUTOMATION LOGS (audit trail)
-- ============================================
CREATE TABLE IF NOT EXISTS "automation_logs" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "action_type" VARCHAR(50) NOT NULL, -- reply_sent, message_sent, rule_matched, skipped
  "page_id" VARCHAR(50) NOT NULL,
  "post_id" VARCHAR(100),
  "target_id" VARCHAR(100),
  "rule_id" UUID,
  "content_sent" TEXT,
  "status" VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failed', 'skipped')),
  "metadata" JSONB,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_logs_page_time" ON "automation_logs"("page_id", "created_at");
CREATE INDEX IF NOT EXISTS "idx_logs_action_status" ON "automation_logs"("action_type", "status");

-- ============================================
-- 8. PAGE STATS (daily KPI counters)
-- ============================================
CREATE TABLE IF NOT EXISTS "page_stats" (
  "page_id" UUID NOT NULL REFERENCES "facebook_pages"("id") ON DELETE CASCADE,
  "date" DATE NOT NULL,
  "comments_total" INTEGER DEFAULT 0,
  "replies_sent" INTEGER DEFAULT 0,
  "messages_sent" INTEGER DEFAULT 0,
  "reactions_total" INTEGER DEFAULT 0,
  "failed_jobs" INTEGER DEFAULT 0,
  PRIMARY KEY ("page_id", "date")
);

CREATE INDEX IF NOT EXISTS "idx_stats_date" ON "page_stats"("date");

-- ============================================
-- 9. SYSTEM CONFIG (global settings)
-- ============================================
CREATE TABLE IF NOT EXISTS "system_config" (
  "key" VARCHAR(100) PRIMARY KEY,
  "value" JSONB NOT NULL,
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default safe mode config
INSERT INTO "system_config" ("key", "value")
VALUES ('facebook_safe_mode', '{"enabled": false, "reason": null}'::jsonb)
ON CONFLICT ("key") DO NOTHING;

-- Insert default rate limits
INSERT INTO "system_config" ("key", "value")
VALUES ('facebook_rate_limits', '{
  "replies_per_page_per_minute": 10,
  "replies_per_user_per_minutes": 5,
  "messages_per_page_per_hour": 50
}'::jsonb)
ON CONFLICT ("key") DO NOTHING;

-- ============================================
-- TRIGGERS FOR updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_facebook_connection_updated_at
  BEFORE UPDATE ON "facebook_connection"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_facebook_pages_updated_at
  BEFORE UPDATE ON "facebook_pages"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_auto_reply_rules_updated_at
  BEFORE UPDATE ON "auto_reply_rules"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_auto_message_rules_updated_at
  BEFORE UPDATE ON "auto_message_rules"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_config_updated_at
  BEFORE UPDATE ON "system_config"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================
COMMENT ON TABLE "facebook_connection" IS 'Single admin Facebook connection (OAuth token)';
COMMENT ON TABLE "facebook_pages" IS 'Facebook Pages managed by admin (minimal info, no content storage)';
COMMENT ON TABLE "auto_reply_rules" IS 'Template-based auto-reply rules (spin syntax supported)';
COMMENT ON TABLE "auto_message_rules" IS 'Auto-message (inbox) rules triggered by interactions';
COMMENT ON TABLE "facebook_events" IS 'Webhook events for deduplication (auto-deleted after 7 days)';
COMMENT ON TABLE "automation_queue" IS 'Delayed job queue (1-5 min random delay)';
COMMENT ON TABLE "automation_logs" IS 'Audit trail for all automation actions';
COMMENT ON TABLE "page_stats" IS 'Daily KPI counters for dashboard';
COMMENT ON TABLE "system_config" IS 'Global settings (safe mode, rate limits, etc.)';
