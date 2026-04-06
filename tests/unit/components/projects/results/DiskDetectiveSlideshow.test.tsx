import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { DiskDetectiveSlideshow } from "@/src/components/projects/(classifications)/results/DiskDetectiveSlideshow";

describe("DiskDetectiveSlideshow", () => {
  it("shows loading state when loading=true", () => {
    render(<DiskDetectiveSlideshow images={[]} loading={true} />);
    expect(screen.getByText("Loading images...")).toBeInTheDocument();
  });

  it("shows empty state when no images and not loading", () => {
    render(<DiskDetectiveSlideshow images={[]} />);
    expect(screen.getByText("No survey images available")).toBeInTheDocument();
  });

  it("renders heading", () => {
    render(<DiskDetectiveSlideshow images={[]} />);
    expect(screen.getByText("📡 Survey Images")).toBeInTheDocument();
  });

  it("renders a single image without navigation", () => {
    render(
      <DiskDetectiveSlideshow images={["http://example.com/img1.png"]} />
    );
    const img = screen.getByAltText("Survey image 1");
    expect(img).toBeInTheDocument();
    expect(screen.queryByText("← Prev")).not.toBeInTheDocument();
    expect(screen.queryByText("Next →")).not.toBeInTheDocument();
  });

  it("renders multiple images with navigation buttons", () => {
    render(
      <DiskDetectiveSlideshow
        images={["http://example.com/img1.png", "http://example.com/img2.png"]}
      />
    );
    expect(screen.getByText("← Prev")).toBeInTheDocument();
    expect(screen.getByText("Next →")).toBeInTheDocument();
  });

  it("shows current image index and total", () => {
    render(
      <DiskDetectiveSlideshow
        images={["http://example.com/img1.png", "http://example.com/img2.png"]}
      />
    );
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
  });

  it("advances to next image on Next click", () => {
    render(
      <DiskDetectiveSlideshow
        images={[
          "http://example.com/img1.png",
          "http://example.com/img2.png",
        ]}
      />
    );
    fireEvent.click(screen.getByText("Next →"));
    expect(screen.getByText("2 / 2")).toBeInTheDocument();
    expect(screen.getByAltText("Survey image 2")).toBeInTheDocument();
  });

  it("wraps around to first image after last on Next", () => {
    render(
      <DiskDetectiveSlideshow
        images={[
          "http://example.com/img1.png",
          "http://example.com/img2.png",
        ]}
      />
    );
    fireEvent.click(screen.getByText("Next →"));
    fireEvent.click(screen.getByText("Next →"));
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
  });

  it("goes to previous image on Prev click", () => {
    render(
      <DiskDetectiveSlideshow
        images={[
          "http://example.com/img1.png",
          "http://example.com/img2.png",
        ]}
      />
    );
    fireEvent.click(screen.getByText("Next →"));
    fireEvent.click(screen.getByText("← Prev"));
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
  });

  it("wraps around to last image from first on Prev", () => {
    render(
      <DiskDetectiveSlideshow
        images={[
          "http://example.com/img1.png",
          "http://example.com/img2.png",
        ]}
      />
    );
    fireEvent.click(screen.getByText("← Prev"));
    expect(screen.getByText("2 / 2")).toBeInTheDocument();
  });

  it("clicking a thumbnail navigates to that image", () => {
    render(
      <DiskDetectiveSlideshow
        images={[
          "http://example.com/img1.png",
          "http://example.com/img2.png",
          "http://example.com/img3.png",
        ]}
      />
    );
    const thumbnails = screen.getAllByAltText(/Thumbnail/);
    fireEvent.click(thumbnails[2]);
    expect(screen.getByText("3 / 3")).toBeInTheDocument();
  });

  it("active thumbnail has blue border class", () => {
    render(
      <DiskDetectiveSlideshow
        images={[
          "http://example.com/img1.png",
          "http://example.com/img2.png",
        ]}
      />
    );
    const thumbnailButtons = screen
      .getAllByRole("button")
      .filter((b) => b.className.includes("rounded"));
    expect(thumbnailButtons[0].className).toContain("border-blue-400");
    expect(thumbnailButtons[1].className).toContain("border-gray-600");
  });
});
