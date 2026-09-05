CREATE TABLE IF NOT EXISTS "p2p_disputes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "challenge_id" varchar NOT NULL REFERENCES "p2p_challenges"("id"),
  "opened_by" varchar NOT NULL REFERENCES "users"("id"),
  "reason" text NOT NULL,
  "evidence" text,
  "status" varchar(32) DEFAULT 'open' NOT NULL,
  "resolution" text,
  "resolved_by" varchar REFERENCES "users"("id"),
  "resolved_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "p2p_disputes_challenge_created_idx"
  ON "p2p_disputes" ("challenge_id", "created_at");
