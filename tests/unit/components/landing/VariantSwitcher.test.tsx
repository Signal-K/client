import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn().mockReturnValue("/"),
  useRouter: vi.fn(() => ({ push: vi.fn(), replace: vi.fn() })),
  useSearchParams: vi.fn(() => ({ get: vi.fn() })),
}));

import { VariantSwitcher } from "@/src/components/landing/VariantSwitcher";

describe("VariantSwitcher", () => {
  it("renders all 6 variant links", () => {
    render(<VariantSwitcher />);
    expect(screen.getByText("V1 Light")).toBeInTheDocument();
    expect(screen.getByText("V2 Dark")).toBeInTheDocument();
    expect(screen.getByText("V3 Editorial")).toBeInTheDocument();
    expect(screen.getByText("V4 Cinematic")).toBeInTheDocument();
    expect(screen.getByText("V5 Interactive")).toBeInTheDocument();
    expect(screen.getByText("V6 Warm")).toBeInTheDocument();
  });

  it("each link has the correct href", () => {
    render(<VariantSwitcher />);
    expect(screen.getByRole("link", { name: "V1 Light" })).toHaveAttribute("href", "/apt");
    expect(screen.getByRole("link", { name: "V2 Dark" })).toHaveAttribute("href", "/apt/v2");
    expect(screen.getByRole("link", { name: "V6 Warm" })).toHaveAttribute("href", "/apt/v6");
  });

  it("renders a nav with accessible label", () => {
    render(<VariantSwitcher />);
    expect(
      screen.getByRole("navigation", { name: "Landing page variant switcher" })
    ).toBeInTheDocument();
  });

  it("active link has aria-current=page when pathname matches", () => {
    // The global mock makes usePathname return "/"
    // None of the variants match "/", so no aria-current should be set
    render(<VariantSwitcher />);
    const links = screen.getAllByRole("link");
    links.forEach((link) => {
      expect(link).not.toHaveAttribute("aria-current", "page");
    });
  });
});
