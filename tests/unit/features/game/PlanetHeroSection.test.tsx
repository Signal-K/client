import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import PlanetHeroSection from "@/src/features/game/components/PlanetHeroSection";

describe("PlanetHeroSection", () => {
  it("renders the planet name", () => {
    render(<PlanetHeroSection planetName="Mars" />);
    expect(screen.getByRole("heading", { name: "Mars" })).toBeInTheDocument();
  });

  it("defaults to 'Sector 7G' when no sectorName given", () => {
    render(<PlanetHeroSection planetName="Mars" />);
    expect(screen.getByText("Sector 7G")).toBeInTheDocument();
  });

  it("renders custom sectorName", () => {
    render(<PlanetHeroSection planetName="Jupiter" sectorName="Zone Alpha" />);
    expect(screen.getByText("Zone Alpha")).toBeInTheDocument();
  });

  it("renders stardust value when provided", () => {
    render(<PlanetHeroSection planetName="Venus" stardust={1500} />);
    expect(screen.getByText("1,500")).toBeInTheDocument();
  });

  it("renders stardust label when stardust is provided", () => {
    render(<PlanetHeroSection planetName="Venus" stardust={0} />);
    expect(screen.getByText("Stardust")).toBeInTheDocument();
  });

  it("does not render stardust section when not provided", () => {
    render(<PlanetHeroSection planetName="Neptune" />);
    expect(screen.queryByText("Stardust")).toBeNull();
  });

  it("uses planet name as img alt text", () => {
    render(<PlanetHeroSection planetName="Saturn" />);
    expect(screen.getByAltText("Saturn")).toBeInTheDocument();
  });

  it("merges custom className", () => {
    const { container } = render(
      <PlanetHeroSection planetName="Earth" className="my-hero" />
    );
    expect(container.firstElementChild?.className).toContain("my-hero");
  });
});
