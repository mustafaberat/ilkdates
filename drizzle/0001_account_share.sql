ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "alias" varchar(80);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "relationship_start" date;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "share_noindex" boolean NOT NULL DEFAULT true;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "share_include_note" boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS "shares" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "public_id" varchar(16) NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "event_id" uuid NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
  "noindex" boolean NOT NULL DEFAULT true,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "shares_public_id_unique" ON "shares" ("public_id");
CREATE UNIQUE INDEX IF NOT EXISTS "shares_user_event_unique" ON "shares" ("user_id", "event_id");
