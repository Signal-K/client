-- Survey rewards: one row per user per survey, used for dedup and audit
CREATE TABLE IF NOT EXISTS "public"."survey_rewards" (
  "id"               uuid        NOT NULL DEFAULT gen_random_uuid(),
  "created_at"       timestamptz NOT NULL DEFAULT now(),
  "user_id"          uuid        NOT NULL,
  "survey_id"        text        NOT NULL,
  "survey_name"      text,
  "stardust_granted" integer     NOT NULL DEFAULT 5,
  CONSTRAINT survey_rewards_pkey PRIMARY KEY (id),
  -- One reward per (user, survey) pair — server-side deduplication
  CONSTRAINT survey_rewards_user_survey_unique UNIQUE (user_id, survey_id)
);

ALTER TABLE "public"."survey_rewards"
  ENABLE ROW LEVEL SECURITY;

-- Users can read their own rewards (e.g. for stardust balance display)
CREATE POLICY "survey_rewards_select_own"
  ON "public"."survey_rewards"
  FOR SELECT
  USING (auth.uid() = user_id);

-- Write access via service-role only (the API route uses a service client)
-- No INSERT/UPDATE/DELETE policy for authenticated role intentionally.
