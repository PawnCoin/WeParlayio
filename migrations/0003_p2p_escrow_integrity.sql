CREATE UNIQUE INDEX IF NOT EXISTS "p2p_transaction_once"
  ON "p2p_transactions" ("challenge_id", "user_id", "transaction_type");
