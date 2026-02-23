import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AvatarGenerator, Avatar } from "@/src/components/profile/setup/Avatar";

const mockUseSession = vi.hoisted(() => vi.fn());

vi.mock("@/src/lib/auth/session-context", () => ({
  useSession: mockUseSession,
}));

vi.mock("next/image", () => ({
  default: ({ src, alt }: any) => <img src={src} alt={alt} />,
}));

describe("AvatarGenerator", () => {
  it("renders an img element with dicebear URL", async () => {
    mockUseSession.mockReturnValue(null);
    render(<AvatarGenerator author="testuser" />);
    const img = await screen.findByAltText("Generated Avatar");
    expect(img.getAttribute("src")).toContain("testuser");
  });

  it("uses bottts style", async () => {
    render(<AvatarGenerator author="alice" />);
    const img = await screen.findByAltText("Generated Avatar");
    expect(img.getAttribute("src")).toContain("bottts");
  });

  it("encodes special characters in author name", async () => {
    render(<AvatarGenerator author="user name" />);
    const img = await screen.findByAltText("Generated Avatar");
    expect(img.getAttribute("src")).toContain("user%20name");
  });
});

describe("Avatar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading skeleton initially when session exists", () => {
    mockUseSession.mockReturnValue({ user: { id: "user-1" } });
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ avatar_url: null }),
    } as Response);
    render(<Avatar />);
    expect(document.querySelector(".animate-pulse")).not.toBeNull();
  });

  it("shows default SVG avatar when no avatar_url", async () => {
    mockUseSession.mockReturnValue({ user: { id: "user-1" } });
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ avatar_url: null }),
    } as Response);
    render(<Avatar />);
    await waitFor(() => {
      expect(document.querySelector(".animate-pulse")).toBeNull();
    });
    expect(document.querySelector("svg")).not.toBeNull();
  });

  it("shows image when avatar_url is provided", async () => {
    mockUseSession.mockReturnValue({ user: { id: "user-1" } });
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ avatar_url: "my-avatar.png" }),
    } as Response);
    render(<Avatar />);
    await waitFor(() => {
      expect(screen.getByAltText("User Avatar")).toBeInTheDocument();
    });
  });

  it("handles fetch error gracefully", async () => {
    mockUseSession.mockReturnValue({ user: { id: "user-1" } });
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      statusText: "Not Found",
      json: async () => ({ error: "Not found" }),
    } as Response);
    render(<Avatar />);
    await waitFor(() => {
      expect(document.querySelector(".animate-pulse")).toBeNull();
    });
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Error fetching avatar"), expect.anything());
    consoleSpy.mockRestore();
  });

  it("does not fetch when session has no user id", () => {
    mockUseSession.mockReturnValue(null);
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<Avatar />);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
