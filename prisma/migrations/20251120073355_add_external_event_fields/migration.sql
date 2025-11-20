-- AlterTable: Add external API integration fields to Event table
-- 外部API統合フィールドをEventテーブルに追加

-- Add new columns (all nullable to avoid data loss)
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "external_id" TEXT;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "external_source" TEXT;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "external_data" JSONB;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "sport_type" TEXT;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "last_synced_at" TIMESTAMP(3);
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "sync_status" TEXT NOT NULL DEFAULT 'pending';

-- Create unique constraint on external_id and external_source (only for non-null values)
-- NULL values are allowed and don't violate uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS "Event_external_id_external_source_key" 
ON "Event" ("external_id", "external_source") 
WHERE "external_id" IS NOT NULL AND "external_source" IS NOT NULL;

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS "Event_external_id_external_source_idx" 
ON "Event" ("external_id", "external_source");

CREATE INDEX IF NOT EXISTS "Event_fight_date_status_idx" 
ON "Event" ("fight_date", "status");

CREATE INDEX IF NOT EXISTS "Event_last_synced_at_idx" 
ON "Event" ("last_synced_at");

CREATE INDEX IF NOT EXISTS "Event_sport_type_fight_date_idx" 
ON "Event" ("sport_type", "fight_date");

