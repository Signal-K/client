import { describe, expect, it } from "vitest";

import {
  STAGING_PLAYTEST_MARKER,
  authorizesStagingPlaytest,
  isStagingPlaytestMetadata,
  type StagingPlaytestConfig,
} from "./stagingPlaytestAuth";

const config: StagingPlaytestConfig = {
  enabled: true,
  host: "staging.starsailors.space",
  secret: "a-long-staging-only-secret",
};

function request(host: string, secret?: string | null) {
  return new Request("https://example.test/api/test/staging/playtest", {
    headers: {
      host,
      ...(secret ? { "x-staging-playtest-secret": secret } : {}),
    },
  });
}

describe("staging playtest auth guard", () => {
  it("requires the enabled flag, exact staging host, and operator secret", () => {
    expect(authorizesStagingPlaytest(request("staging.starsailors.space", config.secret), config)).toBe(true);
    expect(authorizesStagingPlaytest(request("starsailors.space", config.secret), config)).toBe(false);
    expect(authorizesStagingPlaytest(request("staging.starsailors.space"), config)).toBe(false);
    expect(authorizesStagingPlaytest(request("staging.starsailors.space", "wrong"), config)).toBe(false);
    expect(authorizesStagingPlaytest(request("staging.starsailors.space", config.secret), { ...config, enabled: false })).toBe(false);
  });

  it("recognizes only the server-owned playtest marker", () => {
    expect(isStagingPlaytestMetadata({ starSailorsPlaytest: { marker: STAGING_PLAYTEST_MARKER } })).toBe(true);
    expect(isStagingPlaytestMetadata({ starSailorsPlaytest: { marker: "other" } })).toBe(false);
    expect(isStagingPlaytestMetadata({})).toBe(false);
  });
});
