import { beforeEach, describe, expect, it, vi } from "vitest";

const calls: string[] = [];
let adminClients = 0;
const currentUser = vi.fn(async () => ({ primaryEmailAddress: { emailAddress: "a@b.c" } }));

vi.mock("@clerk/nextjs/server", () => ({ currentUser: () => currentUser() }));
vi.mock("@/lib/server/routeAuth", () => ({
  getRouteUser: async () => ({ user: { id: "user_1" }, authError: null }),
}));
vi.mock("@/lib/pocketbase/sscVisibility", () => ({ withVisibleRecords: (f: string) => f }));

const rows: Record<string, unknown[]> = {
  profiles: [{ id: "p1", username: "ada", fullName: "Ada", classificationPoints: 7 }],
  inventory: Array.from({ length: 200 }, (_, i) => ({ item: i + 1 })),
  linked_anomalies: Array.from({ length: 200 }, (_, i) => ({ automaton: `automaton-${i}` })),
  ss_classifications: [{ id: "c1" }],
  hub_state: [{ id: "h1", onboarding: null, garden: null }],
};

function fakePb() {
  adminClients += 1;
  return {
    filter: (f: string) => f,
    collection: (name: string) => ({
      getFirstListItem: async () => {
        calls.push(name);
        const row = rows[name]?.[0];
        if (!row) throw new Error("404");
        return row;
      },
      getList: async () => {
        calls.push(name);
        return { items: rows[name] ?? [], totalItems: (rows[name] ?? []).length };
      },
    }),
  };
}
vi.mock("@/lib/pocketbase/adminClient", () => ({ createPocketbaseAdminClient: async () => fakePb() }));

import { GET } from "./route";

beforeEach(() => {
  calls.length = 0;
  adminClients = 0;
  currentUser.mockClear();
});

describe("GET /api/gameplay/hub/bootstrap budget", () => {
  it("stays within the Workers Free subrequest budget on a warm token", async () => {
    await GET();
    // Every PocketBase read is one subrequest; the token is cached, so no auth call.
    expect(calls.length).toBeLessThanOrEqual(8);
    expect(adminClients).toBe(1); // hub state reuses the shared client
    expect(currentUser).not.toHaveBeenCalled(); // no Clerk API call for named accounts
  });

  it("only calls Clerk when the account has no username yet", async () => {
    rows.profiles = [{ id: "p1", username: "", classificationPoints: 0 }];
    await GET();
    expect(currentUser).toHaveBeenCalledTimes(1);
    rows.profiles = [{ id: "p1", username: "ada", fullName: "Ada", classificationPoints: 7 }];
  });

  it("keeps the response small and fast even with maximum bounded lists", async () => {
    const started = performance.now();
    const res = await GET();
    const body = await res.text();
    expect(performance.now() - started).toBeLessThan(250);
    expect(new TextEncoder().encode(body).length).toBeLessThan(8 * 1024);
    expect(JSON.parse(body)).toMatchObject({ username: "ada", classificationCount: 1 });
  });
});
