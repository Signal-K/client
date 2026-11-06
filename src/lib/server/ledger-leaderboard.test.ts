import { describe, expect, it } from "vitest";

import {
  fetchLedgerLeaderboard,
  ledgerLeaderboardConfig,
  ledgerUserIds,
  shapeLedgerLeaderboard,
} from "./ledger-leaderboard";

const config = { url: "https://shared.example", key: "k" };
const answer = (body: unknown, ok = true) => (async () => ({ ok, json: async () => body })) as unknown as typeof fetch;

describe("ledgerLeaderboardConfig", () => {
  it("needs both the url and the key", () => {
    expect(ledgerLeaderboardConfig({ SHARED_POCKETBASE_URL: "https://x/", SHARED_INTERNAL_API_KEY: "k" })).toEqual({ url: "https://x", key: "k" });
    expect(ledgerLeaderboardConfig({ SHARED_POCKETBASE_URL: "https://x" })).toBeNull();
    expect(ledgerLeaderboardConfig({})).toBeNull();
  });
});

describe("fetchLedgerLeaderboard", () => {
  it("returns null when unconfigured, failing, throwing or empty, so the old score is used", async () => {
    expect(await fetchLedgerLeaderboard("u", null)).toBeNull();
    expect(await fetchLedgerLeaderboard("u", config, answer({}, false))).toBeNull();
    expect(await fetchLedgerLeaderboard("u", config, (async () => { throw new Error("down"); }) as unknown as typeof fetch)).toBeNull();
    expect(await fetchLedgerLeaderboard("u", config, answer({ top: [] }))).toBeNull();
  });

  it("sends the internal key and the user id", async () => {
    let seen: { url?: string; key?: string } = {};
    const fetcher = (async (url: string, init: { headers: Record<string, string> }) => {
      seen = { url, key: init.headers["X-Internal-Api-Key"] };
      return { ok: true, json: async () => ({ top: [{ userId: "a", score: 3 }] }) };
    }) as unknown as typeof fetch;
    await fetchLedgerLeaderboard("user 1", config, fetcher);
    expect(seen).toEqual({ url: "https://shared.example/api/platform/leaderboard?limit=5&userId=user%201", key: "k" });
  });
});

describe("shapeLedgerLeaderboard", () => {
  const ledger = {
    top: [
      { userId: "a", score: 41 },
      { userId: "b", score: 41 },
      { userId: "c", score: 9 },
    ],
    me: { userId: "z", score: 2, rank: 4 },
  };
  const names = new Map([["a", "ada"], ["z", "zed"]]);

  it("names rows, shares ties, and adds the caller below the top when they are not in it", () => {
    const { entries, currentUser } = shapeLedgerLeaderboard(ledger, "z", names);
    expect(entries.map((e) => [e.rank, e.username, e.score])).toEqual([
      [1, "ada", 41],
      [1, "User b", 41],
      [3, "User c", 9],
    ]);
    expect(currentUser).toEqual({ rank: 4, username: "zed", score: 2, isCurrentUser: true });
  });

  it("marks the caller inside the top and adds no second row", () => {
    const { entries, currentUser } = shapeLedgerLeaderboard({ ...ledger, me: { userId: "a", score: 41, rank: 1 } }, "a", names);
    expect(entries[0].isCurrentUser).toBe(true);
    expect(currentUser).toBeNull();
  });

  it("shows no caller row for a player with no score", () => {
    expect(shapeLedgerLeaderboard({ ...ledger, me: { userId: "z", score: 0, rank: 0 } }, "z", names).currentUser).toBeNull();
  });
});

describe("ledgerUserIds", () => {
  it("lists each name to look up once", () => {
    expect(ledgerUserIds({ top: [{ userId: "a", score: 1 }, { userId: "z", score: 1 }] }, "z")).toEqual(["a", "z"]);
  });
});
