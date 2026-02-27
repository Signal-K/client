import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import EcosystemMissionsCard from "@/src/features/game/components/EcosystemMissionsCard";

describe("EcosystemMissionsCard", () => {
  it("renders key ecosystem sections", () => {
    render(<EcosystemMissionsCard />);
    expect(screen.getByText("Citizen Science Across Worlds")).toBeInTheDocument();
    expect(screen.getByText("Active Web Missions")).toBeInTheDocument();
    expect(screen.getByText("System Upgrades")).toBeInTheDocument();
    expect(screen.getByText("Next Expansion: Field Sim Prototypes")).toBeInTheDocument();
  });

  it("exposes navigation links", () => {
    render(<EcosystemMissionsCard />);
    expect(screen.getByRole("link", { name: /Active Web Missions/i })).toHaveAttribute(
      "href",
      "/scenes/uploads"
    );
    expect(screen.getByRole("link", { name: /System Upgrades/i })).toHaveAttribute(
      "href",
      "/research"
    );
  });
});
