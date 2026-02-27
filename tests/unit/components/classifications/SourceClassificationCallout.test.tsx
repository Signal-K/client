import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
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
});
