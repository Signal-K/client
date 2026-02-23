import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SciFiPanel } from "@/src/components/ui/styles/sci-fi/panel";

describe("SciFiPanel", () => {
  it("renders children", () => {
    render(<SciFiPanel>Panel content</SciFiPanel>);
    expect(screen.getByText("Panel content")).toBeDefined();
  });

  it("applies primary border colour by default", () => {
    const { container } = render(<SciFiPanel>Content</SciFiPanel>);
    const panel = container.firstChild as HTMLElement;
    expect(panel.className).toContain("border-[#B4CDE5]");
  });

  it("applies secondary border colour when variant=secondary", () => {
    const { container } = render(<SciFiPanel variant="secondary">Content</SciFiPanel>);
    const panel = container.firstChild as HTMLElement;
    expect(panel.className).toContain("border-[#D8DEE9]");
  });

  it("applies custom className", () => {
    const { container } = render(<SciFiPanel className="custom-class">Content</SciFiPanel>);
    const panel = container.firstChild as HTMLElement;
    expect(panel.className).toContain("custom-class");
  });
});
