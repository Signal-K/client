import { timingSafeEqual } from "node:crypto";

export const STAGING_PLAYTEST_MARKER = "star-sailors-staging-playtest-v1";

export type StagingPlaytestConfig = {
  enabled: boolean;
  host: string;
  secret: string | null;
};

function normalizedHost(value: string | null): string {
  return (value || "").trim().toLowerCase().replace(/:\d+$/, "");
}

function equalSecrets(provided: string | null, expected: string | null): boolean {
  if (!provided || !expected) return false;

  const left = Buffer.from(provided);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function stagingPlaytestConfig(env: NodeJS.ProcessEnv = process.env): StagingPlaytestConfig {
  return {
    enabled: env.STAGING_PLAYTEST_AUTH_ENABLED === "true",
    host: normalizedHost(env.STAGING_PLAYTEST_HOST || "staging.starsailors.space"),
    secret: env.STAGING_PLAYTEST_AUTH_SECRET || null,
  };
}

/**
 * This guard intentionally has three independent conditions. A staging build
 * is not enough on its own: the endpoint must also receive the staging host
 * and an operator-held secret. That keeps it absent from both production and
 * arbitrary preview URLs even if a runtime environment is misconfigured.
 */
export function authorizesStagingPlaytest(
  request: Request,
  config: StagingPlaytestConfig = stagingPlaytestConfig(),
): boolean {
  return (
    config.enabled &&
    normalizedHost(request.headers.get("host")) === config.host &&
    equalSecrets(request.headers.get("x-staging-playtest-secret"), config.secret)
  );
}

export function isStagingPlaytestMetadata(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const marker = (value as Record<string, unknown>).starSailorsPlaytest;
  return (
    !!marker &&
    typeof marker === "object" &&
    (marker as Record<string, unknown>).marker === STAGING_PLAYTEST_MARKER
  );
}
