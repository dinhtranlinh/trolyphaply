-- Customer phone encryption migration
-- Adds encrypted fields and hash for lookup/uniqueness

ALTER TABLE "customers"
  ADD COLUMN IF NOT EXISTS "phone_encrypted" TEXT,
  ADD COLUMN IF NOT EXISTS "phone_hash" TEXT,
  ADD COLUMN IF NOT EXISTS "phone_last4" VARCHAR(10);

ALTER TABLE "customers"
  ALTER COLUMN "phone" DROP NOT NULL;

ALTER TABLE "customers"
  DROP CONSTRAINT IF EXISTS "customers_phone_key";

DROP INDEX IF EXISTS "idx_customers_phone";

CREATE UNIQUE INDEX IF NOT EXISTS "idx_customers_phone_hash"
  ON "customers" ("phone_hash");
