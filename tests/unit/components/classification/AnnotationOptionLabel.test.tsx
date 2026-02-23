import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AnnotationOptionLabel } from "@/src/components/classification/AnnotationOptionLabel";

describe("AnnotationOptionLabel", () => {
  it("renders the option text", () => {
    render(<AnnotationOptionLabel option="Fan" />);
    expect(screen.getByText("Fan")).toBeInTheDocument();
  });

  it("applies yellow color classes for 'Fan' option", () => {
    const { container } = render(<AnnotationOptionLabel option="Fan" />);
    const span = container.querySelector("span");
    expect(span?.className).toContain("bg-yellow-200");
    expect(span?.className).toContain("text-yellow-800");
  });

  it("applies cyan color classes for 'Cloud' option", () => {
    const { container } = render(<AnnotationOptionLabel option="Cloud" />);
    const span = container.querySelector("span");
    expect(span?.className).toContain("bg-cyan-200");
    expect(span?.className).toContain("text-cyan-800");
  });

  it("applies blue color classes for 'Blotch' option", () => {
    const { container } = render(<AnnotationOptionLabel option="Blotch" />);
    const span = container.querySelector("span");
    expect(span?.className).toContain("bg-blue-200");
  });

  it("applies red color classes for 'Rover' option", () => {
    const { container } = render(<AnnotationOptionLabel option="Rover" />);
    const span = container.querySelector("span");
    expect(span?.className).toContain("bg-red-200");
  });

  it("applies fallback gray classes for unknown option", () => {
    const { container } = render(<AnnotationOptionLabel option="Unknown" />);
    const span = container.querySelector("span");
    expect(span?.className).toContain("bg-gray-100");
    expect(span?.className).toContain("text-gray-700");
  });

  it("extracts base type from option string with count suffix", () => {
    const { container } = render(<AnnotationOptionLabel option="Fan (x2)" />);
    const span = container.querySelector("span");
    expect(span?.className).toContain("bg-yellow-200");
    expect(span?.textContent).toBe("Fan (x2)");
  });

  it("applies purple color classes for 'Custom' option", () => {
    const { container } = render(<AnnotationOptionLabel option="Custom" />);
    const span = container.querySelector("span");
    expect(span?.className).toContain("bg-purple-200");
  });
});
