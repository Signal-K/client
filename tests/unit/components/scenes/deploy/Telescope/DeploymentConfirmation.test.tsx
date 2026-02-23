import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const mockPush = vi.hoisted(() => vi.fn());

import DeploymentConfirmation from "@/src/components/scenes/deploy/Telescope/DeploymentConfirmation";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/src/components/ui/card", () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h2>{children}</h2>,
  CardDescription: ({ children }: any) => <p>{children}</p>,
}));

vi.mock("@/src/components/ui/badge", () => ({
  Badge: ({ children }: any) => <span>{children}</span>,
}));

vi.mock("@/src/components/ui/button", () => ({
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}));

const deploymentResult = {
  anomalies: ["Alpha Centauri b", "Kepler-22 b"],
  sectorName: "Sector-7G",
};

describe("DeploymentConfirmation", () => {
  it("renders the deployed successfully title", () => {
    render(<DeploymentConfirmation deploymentResult={deploymentResult} onClose={vi.fn()} />);
    expect(screen.getByText("Telescope Deployed Successfully!")).toBeDefined();
  });

  it("shows sector name", () => {
    render(<DeploymentConfirmation deploymentResult={deploymentResult} onClose={vi.fn()} />);
    expect(screen.getByText(/Sector-7G/)).toBeDefined();
  });

  it("lists anomalies", () => {
    render(<DeploymentConfirmation deploymentResult={deploymentResult} onClose={vi.fn()} />);
    expect(screen.getByText("Alpha Centauri b")).toBeDefined();
    expect(screen.getByText("Kepler-22 b")).toBeDefined();
  });

  it("calls onClose when X button clicked", () => {
    const onClose = vi.fn();
    render(<DeploymentConfirmation deploymentResult={deploymentResult} onClose={onClose} />);
    // The X button is the first button in the document
    const xBtn = document.querySelector("button.absolute") as HTMLElement;
    fireEvent.click(xBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders next steps list", () => {
    render(<DeploymentConfirmation deploymentResult={deploymentResult} onClose={vi.fn()} />);
    expect(screen.getByText("What happens next?")).toBeDefined();
  });

  it("navigates to telescope when View Telescope Interface is clicked", () => {
    render(<DeploymentConfirmation deploymentResult={deploymentResult} onClose={vi.fn()} />);
    fireEvent.click(screen.getByText("View Telescope Interface"));
    expect(mockPush).toHaveBeenCalledWith("/structures/telescope");
  });

  it("calls onClose when Return to Dashboard is clicked", () => {
    const onClose = vi.fn();
    render(<DeploymentConfirmation deploymentResult={deploymentResult} onClose={onClose} />);
    fireEvent.click(screen.getByText("Return to Dashboard"));
    expect(onClose).toHaveBeenCalled();
  });
});
