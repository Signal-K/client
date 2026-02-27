import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SciFiButton } from "@/src/components/ui/styles/sci-fi/button";

vi.mock("@/src/components/ui/button", () => ({
  Button: ({ children, className, ...props }: any) => (
    <button className={className} {...props}>{children}</button>
  ),
}));

vi.mock("@/src/shared/utils", () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(" "),
}));

describe("SciFiButton", () => {
  it("renders children", () => {
    render(<SciFiButton>Click me</SciFiButton>);
    expect(screen.getByText("Click me")).toBeDefined();
  });

  it("renders inactive state by default", () => {
    render(<SciFiButton>Idle</SciFiButton>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-slate-900");
  });

  it("renders active state when active=true", () => {
    render(<SciFiButton active>Active</SciFiButton>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-cyan-950");
  });

  it("applies secondary variant classes", () => {
    render(<SciFiButton variant="secondary">Secondary</SciFiButton>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("border-red-500/50");
  });

  it("passes through additional props", () => {
    render(<SciFiButton data-testid="sci-btn">Test</SciFiButton>);
    expect(screen.getByTestId("sci-btn")).toBeDefined();
  });
});
