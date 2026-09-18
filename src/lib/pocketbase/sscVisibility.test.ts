import { describe, expect, it } from "vitest";

import { VISIBLE_RECORD_FILTER, withVisibleRecords } from "./sscVisibility";

describe("sscVisibility", () => {
  it("appends the hide flag to an existing PocketBase filter", () => {
    expect(withVisibleRecords("owner = 'abc'")).toBe(`owner = 'abc' && ${VISIBLE_RECORD_FILTER}`);
  });
});
