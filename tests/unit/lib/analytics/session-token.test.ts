import { describe, it, expect, vi, beforeEach } from "vitest";
import { getOrCreateAnalyticsSessionToken } from "@/lib/analytics/session-token";

describe("getOrCreateAnalyticsSessionToken", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("returns null on server (no window)", () => {
    const originalWindow = global.window;
    // @ts-ignore
    delete global.window;
    const token = getOrCreateAnalyticsSessionToken();
    expect(token).toBeNull();
    global.window = originalWindow;
  });

  it("creates and stores a token on first call", () => {
    const token = getOrCreateAnalyticsSessionToken();
    expect(token).toBeTruthy();
    expect(typeof token).toBe("string");
    expect(token!.length).toBeGreaterThan(0);
  });

  it("returns the same token on subsequent calls", () => {
    const first = getOrCreateAnalyticsSessionToken();
    const second = getOrCreateAnalyticsSessionToken();
    expect(first).toBe(second);
  });

  it("persists token in sessionStorage", () => {
    const token = getOrCreateAnalyticsSessionToken();
    const stored = sessionStorage.getItem("starsailors_session_token_v1");
    expect(stored).toBe(token);
  });

  it("returns existing token from sessionStorage", () => {
    sessionStorage.setItem("starsailors_session_token_v1", "existing-token");
    const token = getOrCreateAnalyticsSessionToken();
    expect(token).toBe("existing-token");
  });

  it("returns null when sessionStorage throws", () => {
    // Simulate restricted storage by replacing sessionStorage with a throwing object
    const original = Object.getOwnPropertyDescriptor(window, "sessionStorage");
    Object.defineProperty(window, "sessionStorage", {
      get() { throw new DOMException("Access denied"); },
      configurable: true,
    });
    try {
      const token = getOrCreateAnalyticsSessionToken();
      expect(token).toBeNull();
    } finally {
      if (original) Object.defineProperty(window, "sessionStorage", original);
    }
  });
});
