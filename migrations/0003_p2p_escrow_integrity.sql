CREATE UNIQUE INDEX IF NOT EXISTS "p2p_transaction_once"
  ON "p2p_transactions" ("challenge_id", "user_id", "transaction_type");

ALTER TABLE "p2p_challenges"
  ADD CONSTRAINT "p2p_nonnegative_amounts"
  CHECK ("bet_amount" > 0 AND "total_pot" > 0 AND COALESCE("escrow_held", 0) >= 0)
  NOT VALID;
