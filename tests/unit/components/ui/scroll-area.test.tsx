import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ScrollArea } from "@/src/components/ui/scroll-area";

describe("ScrollArea", () => {
  it("renders children", () => {
    render(<ScrollArea><p>Scroll content</p></ScrollArea>);
    expect(screen.getByText("Scroll content")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <ScrollArea className="my-scroll-area"><span>Content</span></ScrollArea>
    );
    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain("my-scroll-area");
  });

  it("renders multiple children", () => {
    render(
      <ScrollArea>
        <div>Item A</div>
        <div>Item B</div>
        <div>Item C</div>
      </ScrollArea>
    );
    expect(screen.getByText("Item A")).toBeInTheDocument();
    expect(screen.getByText("Item B")).toBeInTheDocument();
    expect(screen.getByText("Item C")).toBeInTheDocument();
  });
});
