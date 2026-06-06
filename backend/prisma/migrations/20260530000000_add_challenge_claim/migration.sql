ALTER TABLE "user_challenge_progress"
  ADD COLUMN "claimed" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "claimed_at" TIMESTAMPTZ;
