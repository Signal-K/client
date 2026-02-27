import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import TotalPoints from "@/src/components/deployment/missions/structures/Stardust/Total";

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ counts: {}, researchedTechTypes: [] }),
    })
  ));
});

describe("TotalPoints component", () => {
  it("renders without crashing", () => {
    const { container } = render(<TotalPoints />);
    expect(container).toBeDefined();
  });

  it("passes onPointsUpdate callback without error", () => {
    const cb = vi.fn();
    const { container } = render(<TotalPoints onPointsUpdate={cb} />);
    expect(container).toBeDefined();
  });

  it("renders a type prop without error", () => {
    const { container } = render(<TotalPoints type="stardust" />);
    expect(container).toBeDefined();
  });
});
