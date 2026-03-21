import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { SourceClassificationCallout } from "@/src/components/classifications/SourceClassificationCallout";

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn(() =>
    Promise.resolve({
      ok: false,
      json: () => Promise.resolve({}),
      statusText: "Not Found",
    })
  ));
});

describe("SourceClassificationCallout", () => {
  it("renders nothing when no source_classification_id is given", async () => {
    const { container } = render(
      <SourceClassificationCallout classificationConfiguration={{}} />
    );
    // loading=true initially → returns null
    expect(container.innerHTML).toBe("");
  });

  it("renders nothing while loading", () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
    const { container } = render(
      <SourceClassificationCallout
        classificationConfiguration={{ source_classification_id: 5 }}
      />
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders nothing when fetch fails", async () => {
    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: "Not found" }),
        statusText: "Not Found",
      })
    ));
    const { container } = render(
      <SourceClassificationCallout
        classificationConfiguration={{ source_classification_id: 99 }}
      />
    );
    await waitFor(() => {
      expect(container.innerHTML).toBe("");
    });
  });

  it("renders callout when classification is fetched successfully", async () => {
    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          classification: { id: 42, content: "Light curve data", media: null },
        }),
      })
    ));
    render(
      <SourceClassificationCallout
        classificationConfiguration={{ source_classification_id: 42 }}
      />
    );
    await waitFor(() => {
      expect(screen.getByText(/Classification #42/)).toBeDefined();
    });
  });

  it("renders image when media contains a URL", async () => {
    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          classification: {
            id: 7,
            content: null,
            media: ["https://example.com/image.png"],
          },
        }),
      })
    ));
    render(
      <SourceClassificationCallout
        classificationConfiguration={{ source_classification_id: 7 }}
      />
    );
    await waitFor(() => {
      const img = document.querySelector("img") as HTMLImageElement;
      expect(img?.src).toContain("https://example.com/image.png");
    });
  });

  it("renders image when media is nested array", async () => {
    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          classification: {
            id: 8,
            content: null,
            media: [["https://example.com/nested.png", "extra"]],
          },
        }),
      })
    ));
    render(
      <SourceClassificationCallout
        classificationConfiguration={{ source_classification_id: 8 }}
      />
    );
    await waitFor(() => {
      const img = document.querySelector("img") as HTMLImageElement;
      expect(img?.src).toContain("https://example.com/nested.png");
    });
  });

  it("renders nothing when fetch throws", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new Error("network error"))));
    const { container } = render(
      <SourceClassificationCallout
        classificationConfiguration={{ source_classification_id: 5 }}
      />
    );
    await waitFor(() => {
      expect(container.innerHTML).toBe("");
    });
  });
});
