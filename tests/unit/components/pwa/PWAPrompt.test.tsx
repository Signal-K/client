import { render, screen, waitFor, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  configurable: true,
  value: vi.fn((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

import PWAPrompt from "@/src/components/pwa/PWAPrompt";

describe("PWAPrompt", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders nothing by default (no install prompt event fired)", () => {
    const { container } = render(<PWAPrompt />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when pwa-prompt-dismissed is set in localStorage", () => {
    localStorage.setItem("pwa-prompt-dismissed", "true");
    const { container } = render(<PWAPrompt />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when pwa-installed is set in localStorage", () => {
    localStorage.setItem("pwa-installed", "true");
    const { container } = render(<PWAPrompt />);
    expect(container.firstChild).toBeNull();
  });

  it("shows install prompt after beforeinstallprompt event fires", async () => {
    render(<PWAPrompt />);

    // Simulate the beforeinstallprompt event
    const mockEvent = Object.assign(new Event("beforeinstallprompt"), {
      prompt: async () => {},
      userChoice: Promise.resolve({ outcome: "accepted" as const }),
    });
    
    act(() => {
      window.dispatchEvent(mockEvent);
    });

    // Component state update requires waiting
    await waitFor(() => {
      expect(screen.queryByText("Install Star Sailors")).toBeInTheDocument();
    });
  });
});
