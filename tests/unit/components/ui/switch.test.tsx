import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Switch } from "@/src/components/ui/switch";

describe("Switch", () => {
  it("renders without crashing", () => {
    const { container } = render(<Switch />);
    expect(container.firstChild).not.toBeNull();
  });

  it("renders with role='switch'", () => {
    const { container } = render(<Switch />);
    const sw = container.querySelector("[role='switch']");
    expect(sw).not.toBeNull();
  });

  it("is unchecked by default", () => {
    const { container } = render(<Switch />);
    const sw = container.querySelector("[role='switch']");
    expect(sw?.getAttribute("aria-checked")).toBe("false");
  });

  it("renders as checked when checked=true", () => {
    const { container } = render(<Switch checked onCheckedChange={() => {}} />);
    const sw = container.querySelector("[role='switch']");
    expect(sw?.getAttribute("aria-checked")).toBe("true");
  });

  it("is disabled when disabled prop is passed", () => {
    const { container } = render(<Switch disabled />);
    const sw = container.querySelector("[role='switch']");
    expect(sw).toBeDisabled();
  });

  it("merges custom className", () => {
    const { container } = render(<Switch className="my-switch" />);
    const sw = container.querySelector("[role='switch']");
    expect(sw?.className).toContain("my-switch");
  });
});
