import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockRedirect, mockNext } = vi.hoisted(() => {
  const createMockResponse = () => {
    const cookies = {
      set: vi.fn(),
      getAll: vi.fn(() => []),
    };
    return {
      status: 200,
      headers: new Headers(),
      cookies,
    };
  };

  const mockRedirect = vi.fn((url: URL) => {
    const res = createMockResponse();
    res.status = 302;
    res.headers.set("location", url.toString());
    return res;
  });

  const mockNext = vi.fn(() => createMockResponse());

  return { mockRedirect, mockNext };
});

vi.mock("next/server", () => ({
  NextResponse: {
    next: mockNext,
    redirect: mockRedirect,
  },
}));

const mockGetUser = vi.fn(async () => ({ data: { user: null } }));

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}));

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";

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
    mockGetUser.mockResolvedValue({ data: { user: null } } as any);
  });

  it("redirects unauthenticated user from '/game/something' to '/auth?next=...'", async () => {
    const req = makeRequest("/game/something?view=telescope");
    await middleware(req);
    expect(mockRedirect).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: "/auth",
        search: "?next=%2Fgame%2Fsomething%3Fview%3Dtelescope",
      })
    );
  });

  it("redirects unauthenticated user from '/game' to '/auth?next=/game'", async () => {
    const req = makeRequest("/game");
    await middleware(req);
    expect(mockRedirect).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: "/auth", search: "?next=%2Fgame" })
    );
  });

  it("passes through unauthenticated user on '/auth'", async () => {
    const req = makeRequest("/auth");
    await middleware(req);
    expect(mockRedirect).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
  });

  it("passes through authenticated user on '/game/missions' with auth cookie", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "123" } } } as any);
    const req = makeRequest("/game/missions", "http://localhost:3000", [
      { name: "sb-abc-auth-token", value: "token" },
    ]);
    await middleware(req);
    expect(mockRedirect).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
  });

  it("passes through authenticated user with chunked auth cookie", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "123" } } } as any);
    const req = makeRequest("/game/missions", "http://localhost:3000", [
      { name: "sb-abc-auth-token.0", value: "token-chunk" },
    ]);
    await middleware(req);
    expect(mockRedirect).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
  });

  // ── Landing page (/) redirect for authenticated users ────────────────────

  it("redirects authenticated user from '/' to '/game?from=landing'", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "123" } } } as any);
    const req = makeRequest("/", "http://localhost:3000", [
      { name: "sb-abc-auth-token", value: "token" },
    ]);
    await middleware(req);
    expect(mockRedirect).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: "/game", search: "?from=landing" })
    );
  });

  it("passes through unauthenticated user on '/' (shows landing page)", async () => {
    const req = makeRequest("/", "http://localhost:3000", []);
    await middleware(req);
    expect(mockRedirect).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
  });

  it("redirects authenticated user on '/' with chunked cookie to '/game?from=landing'", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "123" } } } as any);
    const req = makeRequest("/", "http://localhost:3000", [
      { name: "sb-abc-auth-token.0", value: "chunk" },
    ]);
    await middleware(req);
    expect(mockRedirect).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: "/game", search: "?from=landing" })
    );
  });
});
