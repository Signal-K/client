import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PostHogProvider } from "@/src/components/providers/PostHogProvider";

vi.mock("posthog-js/react", () => ({
  PostHogProvider: ({ children }: any) => <div data-testid="ph-provider">{children}</div>,
}));

vi.mock("posthog-js", () => ({
  default: {
    __loaded: false,
    init: vi.fn(),
    register: vi.fn(),
  },
}));

describe("PostHogProvider", () => {
  it("renders children when no apiKey is provided", () => {
    render(
      <PostHogProvider>
        <span>child content</span>
      </PostHogProvider>
    );
    expect(screen.getByText("child content")).toBeDefined();
  });

  it("renders children immediately before client loads", () => {
    render(
      <PostHogProvider apiKey="test-key">
        <span>content</span>
      </PostHogProvider>
    );
    // client is null initially (async init), children still shown as fallback
    expect(screen.getByText("content")).toBeDefined();
  });

  it("does not crash with all props provided", () => {
    render(
      <PostHogProvider apiKey="key" projectId="proj" region="us">
        <div>app</div>
      </PostHogProvider>
    );
    expect(screen.getByText("app")).toBeDefined();
  });
});
