import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MineralDepositCallout } from "@/src/components/projects/(classifications)/results/MineralDepositCallout";

const baseDeposit = {
  mineral_configuration: {
    type: "Iron Oxide",
    purity: 0.875,
    amount: 423.6,
    metadata: { source: "AI4Mars" },
  },
};

describe("MineralDepositCallout", () => {
  it("returns null when deposit is falsy", () => {
    const { container } = render(<MineralDepositCallout deposit={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("returns null when deposit is undefined", () => {
    const { container } = render(<MineralDepositCallout deposit={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders the rock emoji", () => {
    render(<MineralDepositCallout deposit={baseDeposit} />);
    expect(screen.getByText("🪨")).toBeInTheDocument();
  });

  it("renders mineral type", () => {
    render(<MineralDepositCallout deposit={baseDeposit} />);
    expect(screen.getByText("Iron Oxide")).toBeInTheDocument();
  });

  it("renders purity as percentage", () => {
    render(<MineralDepositCallout deposit={baseDeposit} />);
    expect(screen.getByText("87.5%")).toBeInTheDocument();
  });

  it("renders amount rounded to nearest unit", () => {
    render(<MineralDepositCallout deposit={baseDeposit} />);
    expect(screen.getByText("424 units")).toBeInTheDocument();
  });

  it("renders source", () => {
    render(<MineralDepositCallout deposit={baseDeposit} />);
    expect(screen.getByText("AI4Mars")).toBeInTheDocument();
  });

  it("renders Details link button", () => {
    render(<MineralDepositCallout deposit={baseDeposit} />);
    expect(screen.getByRole("button", { name: "Details" })).toBeInTheDocument();
  });

  it("Details button links to /inventory", () => {
    render(<MineralDepositCallout deposit={baseDeposit} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/inventory");
  });

  it("shows Unknown type when type is missing", () => {
    const deposit = { mineral_configuration: {} };
    render(<MineralDepositCallout deposit={deposit} />);
    // Both type and source show "Unknown" — verify at least one is present
    expect(screen.getAllByText("Unknown").length).toBeGreaterThanOrEqual(1);
  });

  it("shows N/A purity when purity is missing", () => {
    const deposit = { mineral_configuration: { type: "Silicate" } };
    render(<MineralDepositCallout deposit={deposit} />);
    const naElements = screen.getAllByText("N/A");
    expect(naElements.length).toBeGreaterThanOrEqual(1);
  });

  it("shows N/A amount when amount is missing", () => {
    const deposit = { mineral_configuration: { type: "Silicate" } };
    render(<MineralDepositCallout deposit={deposit} />);
    const naElements = screen.getAllByText("N/A");
    expect(naElements.length).toBeGreaterThan(0);
  });

  it("shows Unknown source when metadata source is missing", () => {
    const deposit = { mineral_configuration: { type: "Silicate", metadata: {} } };
    render(<MineralDepositCallout deposit={deposit} />);
    expect(screen.getAllByText("Unknown").length).toBeGreaterThanOrEqual(1);
  });

  it("renders with empty mineral_configuration object", () => {
    const deposit = { mineral_configuration: {} };
    render(<MineralDepositCallout deposit={deposit} />);
    expect(screen.getByText("🪨")).toBeInTheDocument();
  });
});
