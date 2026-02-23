import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import PushNotificationPrompt from "@/src/features/notifications/components/PushNotificationPrompt";

vi.mock("@/src/components/ui/button", () => ({
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}));

describe("PushNotificationPrompt", () => {
  beforeEach(() => {
    // Default: push not supported in jsdom
    vi.stubGlobal("Notification", undefined);
  });

  it("renders nothing when push is not supported", () => {
    const { container } = render(<PushNotificationPrompt />);
    expect(container.innerHTML).toBe("");
  });

  it("renders nothing when Notification permission already granted", () => {
    // Set Notification as granted
    vi.stubGlobal("Notification", { permission: "granted" });
    const { container } = render(<PushNotificationPrompt />);
    expect(container.innerHTML).toBe("");
  });
});
