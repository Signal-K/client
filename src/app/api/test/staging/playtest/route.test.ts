import { beforeEach, describe, expect, it, vi } from "vitest";

const SECRET = "a-long-staging-only-secret";
const MARKER = "star-sailors-staging-playtest-v1";

type FakeUser = { id: string; privateMetadata: unknown };
const users = new Map<string, FakeUser>();
const records = new Map<string, Array<{ id: string; owner: string }>>();
const deleteUser = vi.fn(async (id: string) => void users.delete(id));

vi.mock("@clerk/nextjs/server", () => ({
  clerkClient: async () => ({
    users: {
      createUser: async (params: { privateMetadata: unknown }) => {
        const user = { id: "user_new", privateMetadata: params.privateMetadata };
        users.set(user.id, user);
        return user;
      },
      getUser: async (id: string) => {
        const user = users.get(id);
        if (!user) throw new Error("not found");
        return user;
      },
      deleteUser,
    },
    signInTokens: { createSignInToken: async () => ({ token: "ticket_123" }) },
  }),
}));
vi.mock("@/lib/pocketbase/adminClient", () => ({
  createPocketbaseAdminClient: async () => ({
    filter: (_f: string, params: { userId: string }) => params.userId,
    collection: (name: string) => ({
      getFullList: async ({ filter }: { filter: string }) =>
        (records.get(name) ?? []).filter((r) => r.owner === filter),
      delete: async (id: string) =>
        void records.set(name, (records.get(name) ?? []).filter((r) => r.id !== id)),
    }),
  }),
}));

import { DELETE, POST } from "./route";

function call(
  method: "POST" | "DELETE",
  { host = "staging.starsailors.space", secret = SECRET as string | null, body }: { host?: string; secret?: string | null; body?: unknown } = {},
) {
  const init = {
    method,
    headers: { host, ...(secret ? { "x-staging-playtest-secret": secret } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  };
  const request = new Request("https://example.test/api/test/staging/playtest", init);
  return method === "POST" ? POST(request) : DELETE(request);
}

beforeEach(() => {
  process.env.STAGING_PLAYTEST_AUTH_ENABLED = "true";
  process.env.STAGING_PLAYTEST_AUTH_SECRET = SECRET;
  delete process.env.STAGING_PLAYTEST_HOST;
  users.clear();
  records.clear();
  deleteUser.mockClear();
  vi.spyOn(console, "info").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

describe("staging playtest lifecycle", () => {
  it.each([
    ["production host", { host: "starsailors.space" }],
    ["missing secret", { secret: null }],
    ["wrong secret", { secret: "wrong" }],
  ])("returns 404 for %s on both verbs without touching Clerk", async (_name, opts) => {
    users.set("victim", { id: "victim", privateMetadata: {} });
    expect((await call("POST", opts)).status).toBe(404);
    expect((await call("DELETE", { ...opts, body: { userId: "victim" } })).status).toBe(404);
    expect(users.has("victim")).toBe(true);
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it("provisions a marked user and returns a short-lived ticket", async () => {
    const res = await call("POST");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ userId: "user_new", ticket: "ticket_123" });
    expect(users.get("user_new")?.privateMetadata).toMatchObject({ starSailorsPlaytest: { marker: MARKER } });
  });

  it("cleans up an owned user and its records, then verifies deletion", async () => {
    await call("POST");
    records.set("profiles", [{ id: "p1", owner: "user_new" }, { id: "p2", owner: "someone_else" }]);
    const res = await call("DELETE", { body: { userId: "user_new" } });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ deleted: true, deletedRecords: 1 });
    expect(users.has("user_new")).toBe(false);
    expect(records.get("profiles")).toEqual([{ id: "p2", owner: "someone_else" }]);
  });

  it("refuses to delete a real (unmarked) user", async () => {
    users.set("real_user", { id: "real_user", privateMetadata: {} });
    const res = await call("DELETE", { body: { userId: "real_user" } });
    expect(res.status).toBe(404);
    expect(deleteUser).not.toHaveBeenCalled();
    expect(users.has("real_user")).toBe(true);
  });
});
