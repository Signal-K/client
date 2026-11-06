import { describe, expect, it } from "vitest";

import {
  LEGACY_POINTS_DAY,
  LEDGER_MAX_POINTS,
  buildLegacyPointsRows,
  chunk,
} from "./classification-points-ledger";

describe("buildLegacyPointsRows", () => {
  it("makes one weighted row per player on the sentinel day", () => {
    const { rows, skipped } = buildLegacyPointsRows([
      { userId: "user_a", classificationPoints: 42 },
      { userId: "user_b", classificationPoints: 7.9 },
    ]);
    expect(rows).toEqual([
      { userId: "user_a", game: "garden", kind: "legacy-classification-points", day: LEGACY_POINTS_DAY, points: 42, project: "legacy" },
      { userId: "user_b", game: "garden", kind: "legacy-classification-points", day: LEGACY_POINTS_DAY, points: 7, project: "legacy" },
    ]);
    expect(skipped).toEqual({ noUser: 0, noPoints: 0 });
  });

  it("skips players with no id, no points, or a repeated id, and caps the total", () => {
    const { rows, skipped } = buildLegacyPointsRows([
      { userId: "", classificationPoints: 5 },
      { userId: "user_a", classificationPoints: 0 },
      { userId: "user_b", classificationPoints: null },
      { userId: "user_c", classificationPoints: 9_999_999 },
      { userId: "user_c", classificationPoints: 3 },
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0].points).toBe(LEDGER_MAX_POINTS);
    expect(skipped).toEqual({ noUser: 2, noPoints: 2 });
  });

  it("never uses a day a month count could include", () => {
    expect(LEGACY_POINTS_DAY < "2026-01").toBe(true);
  });
});

describe("chunk", () => {
  it("splits into batches the ingest route accepts", () => {
    const sizes = chunk(Array.from({ length: 450 }, (_, i) => i)).map((c) => c.length);
    expect(sizes).toEqual([200, 200, 50]);
  });
});
