import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import NPSPopup from "@/src/components/ui/helpers/nps-popup";

const mockUseAuthUser = vi.hoisted(() => vi.fn());

vi.mock("@/src/hooks/useAuthUser", () => ({
  useAuthUser: mockUseAuthUser,
}));

vi.mock("@/src/components/ui/button", () => ({
  Button: ({ children, onClick, variant, size }: any) => (
    <button onClick={onClick} data-variant={variant}>{children}</button>
  ),
}));

vi.mock("@/src/components/ui/card", () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h2>{children}</h2>,
}));

vi.mock("@/src/components/ui/textarea", () => ({
  Textarea: ({ value, onChange, placeholder }: any) => (
    <textarea value={value ?? ""} onChange={onChange} placeholder={placeholder} />
  ),
}));

vi.mock("@/src/components/ui/label", () => ({
  Label: ({ children }: any) => <label>{children}</label>,
}));

describe("NPSPopup", () => {
  beforeEach(() => {
    mockUseAuthUser.mockReturnValue({ user: { id: "u1" } });
  });

  it("renders nothing when isOpen=false", () => {
    const { container } = render(<NPSPopup isOpen={false} onClose={vi.fn()} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders survey when isOpen=true", () => {
    render(<NPSPopup isOpen onClose={vi.fn()} />);
    expect(screen.getByText("Quick Survey")).toBeDefined();
  });

  it("calls onClose when X button clicked", () => {
    const onClose = vi.fn();
    render(<NPSPopup isOpen onClose={onClose} />);
    // The X button is a ghost button
    const closeBtn = document.querySelector("[data-variant='ghost']") as HTMLElement;
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders score buttons 1-10", () => {
    render(<NPSPopup isOpen onClose={vi.fn()} />);
    // Score buttons 1 through 10
    expect(screen.getByText("1")).toBeDefined();
    expect(screen.getByText("10")).toBeDefined();
  });
});
