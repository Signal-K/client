import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PushNotificationPrompt from "@/src/features/notifications/components/PushNotificationPrompt";

vi.mock("@/src/components/ui/button", () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>{children}</button>
  ),
}));

describe("PushNotificationPrompt", () => {
  beforeEach(() => {
    vi.stubGlobal("Notification", undefined);
    localStorage.clear();
  });

  it("renders nothing when push is not supported", () => {
    const { container } = render(<PushNotificationPrompt />);
    expect(container.innerHTML).toBe("");
  });

  it("renders nothing when Notification permission already granted", () => {
    vi.stubGlobal("Notification", { permission: "granted" });
    const { container } = render(<PushNotificationPrompt />);
    expect(container.innerHTML).toBe("");
  });

  it("renders nothing when previously dismissed", () => {
    localStorage.setItem("push_prompt_dismissed_v1", "1");
    vi.stubGlobal("Notification", { permission: "default" });
    Object.defineProperty(navigator, "serviceWorker", { value: {}, configurable: true });
    Object.defineProperty(window, "PushManager", { value: {}, configurable: true });
    const { container } = render(<PushNotificationPrompt />);
    expect(container.innerHTML).toBe("");
  });

  it("shows prompt when supported and not dismissed", () => {
    vi.stubGlobal("Notification", { permission: "default" });
    Object.defineProperty(navigator, "serviceWorker", { value: {}, configurable: true });
    Object.defineProperty(window, "PushManager", { value: {}, configurable: true });
    render(<PushNotificationPrompt />);
    expect(screen.getByText("Enable browser notifications")).toBeDefined();
  });

  it("dismiss button calls reject API and hides prompt", async () => {
    vi.stubGlobal("Notification", { permission: "default" });
    Object.defineProperty(navigator, "serviceWorker", { value: {}, configurable: true });
    Object.defineProperty(window, "PushManager", { value: {}, configurable: true });
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({ ok: true })));

    render(<PushNotificationPrompt />);
    const notNowBtn = screen.getByText("Not now");
    fireEvent.click(notNowBtn);

    await waitFor(() => {
      expect(localStorage.getItem("push_prompt_dismissed_v1")).toBe("1");
    });
  });
});
