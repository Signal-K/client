import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ClassificationTypeIcon } from "@/src/components/classification/ClassificationTypeIcon";

describe("ClassificationTypeIcon", () => {
  it("renders an svg for 'sunspot' type", () => {
    const { container } = render(<ClassificationTypeIcon type="sunspot" />);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("renders an svg for 'planet' type", () => {
    const { container } = render(<ClassificationTypeIcon type="planet" />);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("renders an svg for 'cloud' type", () => {
    const { container } = render(<ClassificationTypeIcon type="cloud" />);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("renders an svg for 'roverImg' type", () => {
    const { container } = render(<ClassificationTypeIcon type="roverImg" />);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("renders an svg for 'automaton-aiForMars' type", () => {
    const { container } = render(<ClassificationTypeIcon type="automaton-aiForMars" />);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("renders null for unknown type", () => {
    const { container } = render(<ClassificationTypeIcon type="unknown-type" />);
    expect(container.firstChild).toBeNull();
  });

  it("applies custom className to the cloned svg element", () => {
    const { container } = render(
      <ClassificationTypeIcon type="sunspot" className="custom-class" />
    );
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("class")).toBe("custom-class");
  });
});
