import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockGetSession, mockRedirect, mockNext } = vi.hoisted(() => {
  const mockGetSession = vi.fn();
  const mockRedirect = vi.fn((url: URL) => ({ status: 302, headers: { location: url.toString() } }));
  const mockNext = vi.fn(() => ({ cookies: { set: vi.fn() } }));
  return { mockGetSession, mockRedirect, mockNext };
});

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: { getSession: mockGetSession },
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

  it("redirects authenticated user from '/' to '/game'", async () => {
    mockGetSession.mockResolvedValue({ data: { session: { user: { id: "1" } } } });
    const req = makeRequest("/");
    await middleware(req);
    expect(mockRedirect).toHaveBeenCalledWith(expect.objectContaining({ pathname: "/game" }));
  });

  it("redirects unauthenticated user from '/game/something' to '/'", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    const req = makeRequest("/game/something");
    await middleware(req);
    expect(mockRedirect).toHaveBeenCalledWith(expect.objectContaining({ pathname: "/" }));
  });

  it("redirects unauthenticated user from '/game' to '/'", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    const req = makeRequest("/game");
    await middleware(req);
    expect(mockRedirect).toHaveBeenCalledWith(expect.objectContaining({ pathname: "/" }));
  });

  it("passes through unauthenticated user on non-game path", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    const req = makeRequest("/about");
    await middleware(req);
    expect(mockRedirect).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
  });

  it("passes through authenticated user on non-root path", async () => {
    mockGetSession.mockResolvedValue({ data: { session: { user: { id: "1" } } } });
    const req = makeRequest("/game/missions");
    await middleware(req);
    expect(mockRedirect).not.toHaveBeenCalled();
  });
});
