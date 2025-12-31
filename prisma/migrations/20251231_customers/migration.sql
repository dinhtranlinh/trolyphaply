-- Customer Management Migration
-- Created: 2025-12-31
-- Purpose: Add customer tags and customer lists for admin management

-- ============================================
-- 1. CUSTOMER TAGS
-- ============================================
CREATE TABLE IF NOT EXISTS "customer_tags" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(100) UNIQUE NOT NULL,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_customer_tags_name" ON "customer_tags"("name");

-- ============================================
-- 2. CUSTOMERS
-- ============================================
CREATE TABLE IF NOT EXISTS "customers" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) NOT NULL,
  "phone" VARCHAR(50) UNIQUE NOT NULL,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_customers_phone" ON "customers"("phone");
CREATE INDEX IF NOT EXISTS "idx_customers_name" ON "customers"("name");

-- ============================================
-- 3. CUSTOMER TAG LINKS (many-to-many)
-- ============================================
CREATE TABLE IF NOT EXISTS "customer_tag_links" (
  "customer_id" UUID NOT NULL REFERENCES "customers"("id") ON DELETE CASCADE,
  "tag_id" UUID NOT NULL REFERENCES "customer_tags"("id") ON DELETE CASCADE,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("customer_id", "tag_id")
);

CREATE INDEX IF NOT EXISTS "idx_customer_tag_links_tag" ON "customer_tag_links"("tag_id");
CREATE INDEX IF NOT EXISTS "idx_customer_tag_links_customer" ON "customer_tag_links"("customer_id");

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

CREATE TRIGGER update_customer_tags_updated_at
  BEFORE UPDATE ON "customer_tags"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON "customers"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
