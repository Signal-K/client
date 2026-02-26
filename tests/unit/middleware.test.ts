import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockGetUser, mockRedirect, mockNext } = vi.hoisted(() => {
  const mockGetUser = vi.fn();
  const mockRedirect = vi.fn((url: URL) => ({ status: 302, headers: { location: url.toString() } }));
  const mockNext = vi.fn(() => ({ cookies: { set: vi.fn() } }));
  return { mockGetUser, mockRedirect, mockNext };
});

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
}));

vi.mock("next/server", () => ({
  NextResponse: {
    next: mockNext,
    redirect: mockRedirect,
  },
}));

import { middleware } from "@/src/middleware";

function makeRequest(pathname: string, baseUrl = "http://localhost:3000") {
  const url = new URL(pathname, baseUrl);
  return {
    headers: new Headers(),
    nextUrl: url,
    url: url.toString(),
    cookies: {
      getAll: () => [],
      set: vi.fn(),
    },
  } as any;
}

describe("middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNext.mockReturnValue({ cookies: { set: vi.fn() } });
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
  });

  it("redirects unauthenticated user from '/game/something' to '/auth?next=...'", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
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
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const req = makeRequest("/game");
    await middleware(req);
    expect(mockRedirect).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: "/auth", search: "?next=%2Fgame" })
    );
  });

  it("redirects authenticated user from '/auth' to '/game'", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "1" } } });
    const req = makeRequest("/auth");
    await middleware(req);
    expect(mockRedirect).toHaveBeenCalledWith(expect.objectContaining({ pathname: "/game" }));
  });

  it("passes through unauthenticated user on '/auth'", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const req = makeRequest("/auth");
    await middleware(req);
    expect(mockRedirect).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
  });

  it("passes through authenticated user on '/game/missions'", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "1" } } });
    const req = makeRequest("/game/missions");
    await middleware(req);
    expect(mockRedirect).not.toHaveBeenCalled();
  });
});
