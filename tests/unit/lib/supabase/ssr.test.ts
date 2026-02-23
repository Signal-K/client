import { describe, it, expect, vi } from "vitest";

vi.mock("next/headers", () => ({
  cookies: () => ({
    getAll: () => [],
    set: vi.fn(),
  }),
}));

const mockCreateServerClient = vi.fn(() => ({ auth: {}, from: vi.fn() }));
vi.mock("@supabase/ssr", () => ({
  createServerClient: mockCreateServerClient,
}));

vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-anon-key");

describe("createSupabaseServerClient", () => {
  it("returns a client when env vars are present", async () => {
    const { createSupabaseServerClient } = await import("@/src/lib/supabase/ssr");
    const client = createSupabaseServerClient();
    expect(client).toBeDefined();
    expect(mockCreateServerClient).toHaveBeenCalled();
  });

  it("calls createServerClient with the URL and key", async () => {
    mockCreateServerClient.mockClear();
    const { createSupabaseServerClient } = await import("@/src/lib/supabase/ssr");
    createSupabaseServerClient();
    expect(mockCreateServerClient).toHaveBeenCalledWith(
      "https://test.supabase.co",
      "test-anon-key",
      expect.any(Object)
    );
  });
});
