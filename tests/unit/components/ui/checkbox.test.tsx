import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Checkbox } from "@/src/components/ui/checkbox";

describe("Checkbox", () => {
  it("renders without crashing", () => {
    const { container } = render(<Checkbox />);
    expect(container.firstChild).not.toBeNull();
  });

  it("renders a button with role checkbox", () => {
    const { container } = render(<Checkbox />);
    // Radix checkbox renders as a button with role="checkbox"
    const checkbox = container.querySelector("[role='checkbox']");
    expect(checkbox).not.toBeNull();
  });

  it("renders in unchecked state by default", () => {
    const { container } = render(<Checkbox />);
    const checkbox = container.querySelector("[role='checkbox']");
    expect(checkbox?.getAttribute("data-state")).toBe("unchecked");
  });

  it("renders in checked state when checked=true", () => {
    const { container } = render(<Checkbox checked onCheckedChange={() => {}} />);
    const checkbox = container.querySelector("[role='checkbox']");
    expect(checkbox?.getAttribute("data-state")).toBe("checked");
  });

  it("is disabled when disabled prop is passed", () => {
    const { container } = render(<Checkbox disabled />);
    const checkbox = container.querySelector("[role='checkbox']");
    expect(checkbox).toBeDisabled();
  });

  it("merges custom className", () => {
    const { container } = render(<Checkbox className="my-check" />);
    const checkbox = container.querySelector("[role='checkbox']");
    expect(checkbox?.className).toContain("my-check");
  });
});
