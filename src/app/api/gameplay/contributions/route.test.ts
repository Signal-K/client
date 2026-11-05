import { beforeEach, describe, expect, it, vi } from "vitest";

let signedIn = true;
vi.mock("@/lib/server/routeAuth", () => ({
  getRouteUser: async () => (signedIn ? { user: { id: "user_1" }, authError: null } : { user: null, authError: new Error("no") }),
}));

let createResult: () => Promise<unknown> = async () => ({});
const create = vi.fn(() => createResult());
let adminFails = false;
vi.mock("@/lib/pocketbase/adminClient", () => ({
  createPocketbaseAdminClient: async () => {
    if (adminFails) throw new Error("no admin");
    return { collection: () => ({ create }) };
  },
}));

import { resetContributionMemo } from "@/lib/server/contributions";
import { POST } from "./route";

function post(body: unknown) {
  return POST(new Request("http://x/api/gameplay/contributions", { method: "POST", body: JSON.stringify(body) }) as never);
}

beforeEach(() => {
  signedIn = true;
  adminFails = false;
  createResult = async () => ({});
  create.mockClear();
  resetContributionMemo();
});

describe("POST /api/gameplay/contributions", () => {
  it("rejects a signed-out player", async () => {
    signedIn = false;
    expect((await post({ kind: "classification" })).status).toBe(401);
    expect(create).not.toHaveBeenCalled();
  });

  it("rejects an unknown kind without touching the ledger", async () => {
    expect((await post({ kind: "exchange-sale" })).status).toBe(400);
    expect((await post({})).status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  it("ignores a client-supplied day or player", async () => {
    const res = await post({ kind: "event", day: "1999-01-01", userId: "someone_else" });
    expect(await res.json()).toEqual({ ok: true, counted: true });
    const row = (create.mock.calls[0] as unknown[])[0] as { userId: string; day: string };
    expect(row.userId).toBe("user_1");
    expect(row.day).not.toBe("1999-01-01");
  });

  it("counts the first contribution and not the repeat", async () => {
    expect(await (await post({ kind: "classification" })).json()).toEqual({ ok: true, counted: true });
    expect(await (await post({ kind: "classification" })).json()).toEqual({ ok: true, counted: false });
    expect(create).toHaveBeenCalledTimes(1);
  });

  it("answers 202 when the ledger is not deployed", async () => {
    createResult = async () => Promise.reject({ status: 404 });
    const res = await post({ kind: "classification" });
    expect(res.status).toBe(202);
    expect(await res.json()).toEqual({ ok: false, reason: "ledger-unavailable" });
  });

  it("answers 202 when the admin client cannot be built", async () => {
    adminFails = true;
    expect((await post({ kind: "classification" })).status).toBe(202);
  });
});
