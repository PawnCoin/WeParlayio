CREATE TABLE IF NOT EXISTS "daily_tournament_states" (
  "id" varchar PRIMARY KEY NOT NULL,
  "day" varchar(10) NOT NULL,
  "status" varchar(24) DEFAULT 'open' NOT NULL,
  "state" jsonb NOT NULL,
  "lock_at" timestamp with time zone NOT NULL,
  "settle_after" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "daily_tournament_day_idx" ON "daily_tournament_states" ("day");
CREATE INDEX IF NOT EXISTS "daily_tournament_status_idx" ON "daily_tournament_states" ("status");
