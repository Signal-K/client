import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CommentCard } from "@/src/components/social/comments/CommentSingle";

const mockMergeClassificationConfiguration = vi.hoisted(() => vi.fn());

vi.mock("@/src/components/profile/setup/Avatar", () => ({
  AvatarGenerator: ({ author }: any) => <div data-testid="avatar">{author}</div>,
}));

vi.mock("@/src/lib/gameplay/classification-configuration", () => ({
  mergeClassificationConfiguration: mockMergeClassificationConfiguration,
}));

vi.mock("@/src/components/ui/card", () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h3>{children}</h3>,
}));

vi.mock("@/src/components/ui/button", () => ({
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}));

const defaultProps = {
  id: 1,
  author: "testuser",
  content: "This is a comment",
  createdAt: "2024-01-01T00:00:00Z",
  replyCount: 0,
  classificationId: 42,
};

describe("CommentCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders author name", () => {
    render(<CommentCard {...defaultProps} />);
    expect(screen.getAllByText("testuser").length).toBeGreaterThanOrEqual(1);
  });

  it("renders comment content", () => {
    render(<CommentCard {...defaultProps} />);
    expect(screen.getByText("This is a comment")).toBeDefined();
  });

  it("renders Surveyor badge when isSurveyor=true", () => {
    render(<CommentCard {...defaultProps} isSurveyor />);
    expect(screen.getByText("Surveyor")).toBeDefined();
  });

  it("renders category when provided", () => {
    render(<CommentCard {...defaultProps} category="exoplanet" value="yes" />);
    expect(screen.getAllByText("exoplanet").length).toBeGreaterThanOrEqual(1);
  });

  it("renders Confirm button when configuration is provided", () => {
    render(<CommentCard {...defaultProps} configuration={{ planetType: "gas-giant" }} />);
    expect(screen.getByText("Confirm")).toBeDefined();
  });

  it("renders avatar", () => {
    render(<CommentCard {...defaultProps} />);
    expect(screen.getByTestId("avatar")).toBeDefined();
  });

  it("handleConfirmComment calls mergeClassificationConfiguration with configuration", async () => {
    mockMergeClassificationConfiguration.mockResolvedValue({ ok: true });
    render(<CommentCard {...defaultProps} configuration={{ planetType: "gas-giant" }} />);
    fireEvent.click(screen.getByText("Confirm"));
    expect(mockMergeClassificationConfiguration).toHaveBeenCalledWith(42, { planetType: "gas-giant" });
  });

  it("handleConfirmComment does nothing when no configuration", () => {
    render(<CommentCard {...defaultProps} />);
    // No Confirm button should be present without configuration
    expect(screen.queryByText("Confirm")).toBeNull();
  });

  it("handleConfirmComment handles API errors gracefully", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockMergeClassificationConfiguration.mockResolvedValue({ ok: false, error: "Server error" });
    render(<CommentCard {...defaultProps} configuration={{ planetType: "rocky" }} />);
    fireEvent.click(screen.getByText("Confirm"));
    // Wait for the async handler to settle
    await new Promise(r => setTimeout(r, 0));
    consoleSpy.mockRestore();
  });
});
