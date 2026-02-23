import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MediaSlider } from "@/src/components/classifications/MediaSlider";

vi.mock("@/src/components/ui/dialog", () => ({
  Dialog: ({ children }: any) => <div>{children}</div>,
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogTrigger: ({ children }: any) => <div>{children}</div>,
}));

describe("MediaSlider", () => {
  it("returns null when media is empty", () => {
    const { container } = render(<MediaSlider media={[]} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders first image", () => {
    render(<MediaSlider media={["https://example.com/img1.jpg"]} />);
    const img = document.querySelector("img");
    expect(img?.getAttribute("src")).toBe("https://example.com/img1.jpg");
  });

  it("does not show navigation buttons for single image", () => {
    render(<MediaSlider media={["https://example.com/img1.jpg"]} />);
    expect(screen.queryByLabelText("Previous image")).toBeNull();
    expect(screen.queryByLabelText("Next image")).toBeNull();
  });

  it("shows navigation buttons for multiple images", () => {
    render(
      <MediaSlider
        media={["https://example.com/1.jpg", "https://example.com/2.jpg"]}
      />
    );
    expect(screen.getByLabelText("Previous image")).toBeDefined();
    expect(screen.getByLabelText("Next image")).toBeDefined();
  });

  it("advances to next image on next click", () => {
    render(
      <MediaSlider
        media={["https://example.com/1.jpg", "https://example.com/2.jpg"]}
      />
    );
    fireEvent.click(screen.getByLabelText("Next image"));
    const img = document.querySelector("img") as HTMLImageElement;
    expect(img.src).toBe("https://example.com/2.jpg");
  });

  it("combines media and sourceMedia", () => {
    render(
      <MediaSlider
        media={["https://example.com/1.jpg"]}
        sourceMedia={["https://example.com/src.jpg"]}
      />
    );
    expect(screen.getByLabelText("Next image")).toBeDefined();
  });
});
