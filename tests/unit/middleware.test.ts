import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockRedirect, mockNext } = vi.hoisted(() => {
  const mockRedirect = vi.fn((url: URL) => ({ status: 302, headers: { location: url.toString() } }));
  const mockNext = vi.fn(() => ({ cookies: { set: vi.fn() } }));
  return { mockRedirect, mockNext };
});

vi.mock("next/server", () => ({
  NextResponse: {
    next: mockNext,
    redirect: mockRedirect,
  },
}));

import { middleware } from "@/src/middleware";

function makeRequest(
  pathname: string,
  baseUrl = "http://localhost:3000",
  cookieRows: Array<{ name: string; value: string }> = []
) {
  const url = new URL(pathname, baseUrl);
  return {
    headers: new Headers(),
    nextUrl: url,
    url: url.toString(),
    cookies: {
      getAll: () => cookieRows,
      set: vi.fn(),
    },
  } as any;
}

describe("middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNext.mockReturnValue({ cookies: { set: vi.fn() } });
  });

  it("redirects unauthenticated user from '/game/something' to '/auth?next=...'", async () => {
    const req = makeRequest("/game/something?view=telescope");
    middleware(req);
    expect(mockRedirect).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: "/auth",
        search: "?next=%2Fgame%2Fsomething%3Fview%3Dtelescope",
      })
    );
  });

  it("redirects unauthenticated user from '/game' to '/auth?next=/game'", async () => {
    const req = makeRequest("/game");
    middleware(req);
    expect(mockRedirect).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: "/auth", search: "?next=%2Fgame" })
    );
  });

  it("passes through unauthenticated user on '/auth'", async () => {
    const req = makeRequest("/auth");
    middleware(req);
    expect(mockRedirect).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
  });

  it("passes through authenticated user on '/game/missions' with auth cookie", async () => {
    const req = makeRequest("/game/missions", "http://localhost:3000", [
      { name: "sb-abc-auth-token", value: "token" },
    ]);
    middleware(req);
    expect(mockRedirect).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
  });

  it("passes through authenticated user with chunked auth cookie", async () => {
    const req = makeRequest("/game/missions", "http://localhost:3000", [
      { name: "sb-abc-auth-token.0", value: "token-chunk" },
    ]);
    middleware(req);
    expect(mockRedirect).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
  });
});
