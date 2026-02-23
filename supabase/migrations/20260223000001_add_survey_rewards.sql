-- Migration: survey_rewards table
-- Created: 2026-02-23
-- Purpose: One row per (user, survey) pair — server-side dedup + audit log
--          for PostHog survey completion stardust rewards.

CREATE TABLE IF NOT EXISTS "public"."survey_rewards" (
  "id"               uuid        NOT NULL DEFAULT gen_random_uuid(),
  "created_at"       timestamptz NOT NULL DEFAULT now(),
  "user_id"          uuid        NOT NULL,
  "survey_id"        text        NOT NULL,
  "survey_name"      text,
  "stardust_granted" integer     NOT NULL DEFAULT 5,
  CONSTRAINT survey_rewards_pkey PRIMARY KEY (id),
  -- Server-side deduplication: one reward per (user, survey) pair
  CONSTRAINT survey_rewards_user_survey_unique UNIQUE (user_id, survey_id)
);

ALTER TABLE "public"."survey_rewards"
  ENABLE ROW LEVEL SECURITY;

-- Users can read their own rewards (stardust balance display)
CREATE POLICY "survey_rewards_select_own"
  ON "public"."survey_rewards"
  FOR SELECT
  USING (auth.uid() = user_id);

-- Insert/update only via service-role (API route handles writes)
GRANT SELECT ON TABLE "public"."survey_rewards" TO "authenticated";
GRANT ALL ON TABLE "public"."survey_rewards" TO "service_role";
