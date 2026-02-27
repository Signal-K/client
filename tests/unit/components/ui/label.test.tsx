import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Label } from "@/src/components/ui/label";

describe("Label", () => {
  it("renders label text", () => {
    render(<Label>Email</Label>);
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("renders as a label element", () => {
    const { container } = render(<Label>Name</Label>);
    expect(container.querySelector("label")).not.toBeNull();
  });

  it("associates with htmlFor input", () => {
    render(
      <div>
        <Label htmlFor="my-input">My Label</Label>
        <input id="my-input" />
      </div>
    );
    const label = screen.getByText("My Label");
    expect(label).toBeInTheDocument();
    expect(label.getAttribute("for")).toBe("my-input");
  });

  it("merges custom className", () => {
    const { container } = render(<Label className="custom-label">Test</Label>);
    expect(container.querySelector("label")?.className).toContain("custom-label");
  });
});
