-- QA Session Contexts
-- Created: 2026-01-01
-- Purpose: Store per-session answer summaries for contextual follow-ups

CREATE TABLE IF NOT EXISTS "qa_session_contexts" (
  "session_id" UUID PRIMARY KEY,
  "context" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_qa_session_contexts_updated_at" ON "qa_session_contexts"("updated_at");

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_qa_session_contexts_updated_at
  BEFORE UPDATE ON "qa_session_contexts"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
