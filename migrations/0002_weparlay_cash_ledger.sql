CREATE TABLE IF NOT EXISTS "weparlay_cash_ledger" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" varchar NOT NULL,
  "reference_id" varchar(255) NOT NULL,
  "type" varchar(32) NOT NULL,
  "amount" double precision NOT NULL,
  "balance_before" double precision NOT NULL,
  "balance_after" double precision NOT NULL,
  "description" text NOT NULL,
  "metadata" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "weparlay_cash_ledger_reference_id_unique" UNIQUE("reference_id"),
  CONSTRAINT "weparlay_cash_ledger_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id")
);

CREATE INDEX IF NOT EXISTS "weparlay_cash_ledger_user_created_idx"
  ON "weparlay_cash_ledger" ("user_id", "created_at");