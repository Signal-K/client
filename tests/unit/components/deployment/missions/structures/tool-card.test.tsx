import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ToolCard from "@/src/components/deployment/missions/structures/tool-card";

vi.mock("@/src/components/ui/card", () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
}));

vi.mock("@/src/components/ui/badge", () => ({
  Badge: ({ children, className }: any) => <span className={className}>{children}</span>,
}));

describe("ToolCard", () => {
  const defaultProps = {
    icon: <svg data-testid="icon" />,
    name: "Telescope",
    count: 2,
    status: "active" as const,
    description: "A powerful telescope",
  };

  it("renders tool name", () => {
    render(<ToolCard {...defaultProps} />);
    expect(screen.getByText("Telescope")).toBeDefined();
  });

  it("renders description", () => {
    render(<ToolCard {...defaultProps} />);
    expect(screen.getByText("A powerful telescope")).toBeDefined();
  });

  it("renders count", () => {
    render(<ToolCard {...defaultProps} />);
    expect(screen.getByText("Count: 2")).toBeDefined();
  });

  it("renders status badge", () => {
    render(<ToolCard {...defaultProps} />);
    expect(screen.getByText("active")).toBeDefined();
  });

  it("renders icon slot", () => {
    render(<ToolCard {...defaultProps} />);
    expect(screen.getByTestId("icon")).toBeDefined();
  });

  it("renders idle status", () => {
    render(<ToolCard {...defaultProps} status="idle" />);
    expect(screen.getByText("idle")).toBeDefined();
  });
});
