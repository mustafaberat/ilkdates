-- Remove unused profile/share fields. Do not touch events or user rows.
DROP TABLE IF EXISTS "shares";
ALTER TABLE "users" DROP COLUMN IF EXISTS "alias";
ALTER TABLE "users" DROP COLUMN IF EXISTS "relationship_start";
ALTER TABLE "users" DROP COLUMN IF EXISTS "share_noindex";
ALTER TABLE "users" DROP COLUMN IF EXISTS "share_include_note";
