import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Button } from "@/src/components/ui/button";

describe("Button", () => {
  it("renders children text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("renders as a button element by default", () => {
    const { container } = render(<Button>Test</Button>);
    expect(container.querySelector("button")).not.toBeNull();
  });

  it("calls onClick handler when clicked", () => {
    const handler = vi.fn();
    render(<Button onClick={handler}>Click</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("is disabled when disabled prop is passed", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("applies outline variant class", () => {
    const { container } = render(<Button variant="outline">Outline</Button>);
    expect(container.querySelector("button")?.className).toContain("border");
  });

  it("applies destructive variant class", () => {
    const { container } = render(<Button variant="destructive">Destructive</Button>);
    expect(container.querySelector("button")?.className).toContain("destructive");
  });

  it("applies sm size class", () => {
    const { container } = render(<Button size="sm">Small</Button>);
    expect(container.querySelector("button")?.className).toContain("h-9");
  });

  it("applies lg size class", () => {
    const { container } = render(<Button size="lg">Large</Button>);
    expect(container.querySelector("button")?.className).toContain("h-14");
  });

  it("merges custom className", () => {
    const { container } = render(<Button className="my-custom">Test</Button>);
    expect(container.querySelector("button")?.className).toContain("my-custom");
  });

  it("renders as a Slot (child element) when asChild is true", () => {
    const { container } = render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );
    expect(container.querySelector("a")).not.toBeNull();
    expect(container.querySelector("button")).toBeNull();
  });
});
