import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Separator } from "@/src/components/ui/separator";

describe("Separator", () => {
  it("renders without crashing", () => {
    const { container } = render(<Separator />);
    expect(container.firstChild).not.toBeNull();
  });

  it("defaults to horizontal orientation", () => {
    const { container } = render(<Separator />);
    const el = container.firstElementChild as HTMLElement;
    expect(el?.className).toContain("h-[1px]");
    expect(el?.className).toContain("w-full");
  });

  it("applies vertical orientation classes", () => {
    const { container } = render(<Separator orientation="vertical" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el?.className).toContain("h-full");
    expect(el?.className).toContain("w-[1px]");
  });

  it("merges custom className", () => {
    const { container } = render(<Separator className="my-sep" />);
    expect(container.firstElementChild?.className).toContain("my-sep");
  });
});
