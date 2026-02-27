import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@supabase/ssr", () => ({
  createBrowserClient: vi.fn(() => ({ auth: {}, from: vi.fn() })),
}));

// We need this dynamic import to ensure the module is fresh per test group
describe("getSupabaseBrowserClient", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("returns a client when env vars are set", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://localhost:54321");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key-test");

    const { getSupabaseBrowserClient } = await import("@/lib/supabase/browser");
    const client = getSupabaseBrowserClient();
    expect(client).toBeTruthy();
    expect(typeof client).toBe("object");
  });

  it("returns the same cached instance on subsequent calls", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://localhost:54321");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key-test");

    const { getSupabaseBrowserClient } = await import("@/lib/supabase/browser");
    const client1 = getSupabaseBrowserClient();
    const client2 = getSupabaseBrowserClient();
    expect(client1).toBe(client2);
  });

  it("throws when NEXT_PUBLIC_SUPABASE_URL is missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key-test");

    const { getSupabaseBrowserClient } = await import("@/lib/supabase/browser");
    expect(() => getSupabaseBrowserClient()).toThrow(
      "Missing Supabase environment variables"
    );
  });

  it("throws when NEXT_PUBLIC_SUPABASE_ANON_KEY is missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://localhost:54321");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");

    const { getSupabaseBrowserClient } = await import("@/lib/supabase/browser");
    expect(() => getSupabaseBrowserClient()).toThrow(
      "Missing Supabase environment variables"
    );
  });
});
