import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
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
  it("renders without crashing", async () => {
    const { container } = render(<TotalPoints />);
    expect(container).toBeDefined();
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it("passes onPointsUpdate callback without error", async () => {
    const cb = vi.fn();
    const { container } = render(<TotalPoints onPointsUpdate={cb} />);
    expect(container).toBeDefined();
    await waitFor(() => {
      expect(cb).toHaveBeenCalled();
    });
  });

  it("renders a type prop without error", async () => {
    const { container } = render(<TotalPoints type="stardust" />);
    expect(container).toBeDefined();
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});
