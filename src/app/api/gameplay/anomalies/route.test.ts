import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getList = vi.fn();

vi.mock("@/lib/pocketbase/adminClient", () => ({
  createPocketbaseAdminClient: async () => ({
    filter: (expr: string) => expr,
    collection: () => ({ getList }),
  }),
}));
vi.mock("@/lib/server/routeAuth", () => ({ getRouteUser: async () => ({ user: null, authError: null }) }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { GET } from "./route";

describe("GET /api/gameplay/anomalies", () => {
  beforeEach(() => getList.mockReset().mockResolvedValue({ items: [] }));

  it("skips the total count and marks the public catalogue cacheable", async () => {
    const response = await GET(new NextRequest("https://example.test/api/gameplay/anomalies?anomalySet=sunspot"));
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("s-maxage=60");
    expect(getList.mock.calls[0][2]).toMatchObject({ skipTotal: true });
  });
});
