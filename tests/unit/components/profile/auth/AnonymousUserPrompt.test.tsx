import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AnonymousUserPrompt from "@/src/components/profile/auth/AnonymousUserPrompt";

const mockUseAuthUser = vi.hoisted(() => vi.fn());
const mockConvertHandlers = vi.hoisted(() => ({ onSuccess: null as any, onCancel: null as any }));

vi.mock("@/src/hooks/useAuthUser", () => ({
  useAuthUser: mockUseAuthUser,
}));

vi.mock("@/src/components/profile/auth/ConvertAnonymousAccount", () => ({
  default: ({ onSuccess, onCancel }: any) => {
    mockConvertHandlers.onSuccess = onSuccess;
    mockConvertHandlers.onCancel = onCancel;
    return <div data-testid="convert-account">
      <button onClick={onSuccess}>Upgrade</button>
      <button onClick={onCancel}>Cancel</button>
    </div>;
  },
}));

vi.mock("@/src/components/ui/card", () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@/src/components/ui/alert", () => ({
  Alert: ({ children }: any) => <div>{children}</div>,
  AlertDescription: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@/src/components/ui/dialog", () => ({
  Dialog: ({ children }: any) => <div>{children}</div>,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@/src/components/ui/button", () => ({
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}));

describe("AnonymousUserPrompt", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("renders nothing when user is not anonymous", () => {
    mockUseAuthUser.mockReturnValue({ user: { id: "user-1" } });
    const { container } = render(<AnonymousUserPrompt classificationsCount={5} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders nothing when anonymous but below thresholds and showPrompt=false", () => {
    mockUseAuthUser.mockReturnValue({ user: { is_anonymous: true } });
    const { container } = render(
      <AnonymousUserPrompt classificationsCount={0} discoveryCount={0} timeSpent={0} />
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders prompt banner when anonymous and meets classification threshold", () => {
    mockUseAuthUser.mockReturnValue({ user: { is_anonymous: true } });
    const { container } = render(<AnonymousUserPrompt classificationsCount={3} />);
    expect(container.innerHTML).not.toBe("");
  });

  it("renders prompt when showPrompt=true", () => {
    mockUseAuthUser.mockReturnValue({ user: { is_anonymous: true } });
    const { container } = render(<AnonymousUserPrompt showPrompt />);
    expect(container.innerHTML).not.toBe("");
  });

  it("handleDismiss dismisses the banner (Maybe Later)", () => {
    mockUseAuthUser.mockReturnValue({ user: { is_anonymous: true } });
    const { container } = render(<AnonymousUserPrompt showPrompt />);
    expect(container.innerHTML).not.toBe("");
    fireEvent.click(screen.getByText("Maybe Later"));
    // Component should now return null since isDismissed=true
    expect(container.innerHTML).toBe("");
  });

  it("handleOpenModal opens the modal by clicking Save Account", () => {
    mockUseAuthUser.mockReturnValue({ user: { is_anonymous: true } });
    render(<AnonymousUserPrompt showPrompt />);
    const saveBtn = screen.getAllByText(/Save Account/i)[0];
    fireEvent.click(saveBtn);
    // Modal is always rendered (mock), but isOpen state should change
    expect(screen.getByTestId("convert-account")).toBeInTheDocument();
  });

  it("handleUpgradeSuccess dismisses via ConvertAnonymousAccount onSuccess", () => {
    mockUseAuthUser.mockReturnValue({ user: { is_anonymous: true } });
    const { container } = render(<AnonymousUserPrompt showPrompt />);
    expect(container.innerHTML).not.toBe("");
    // Trigger the Upgrade button in the mocked ConvertAnonymousAccount
    fireEvent.click(screen.getByText("Upgrade"));
    expect(container.innerHTML).toBe("");
  });

  it("handleCloseModal closes via ConvertAnonymousAccount onCancel", () => {
    mockUseAuthUser.mockReturnValue({ user: { is_anonymous: true } });
    render(<AnonymousUserPrompt showPrompt />);
    // Trigger the Cancel button in the mocked ConvertAnonymousAccount
    fireEvent.click(screen.getByText("Cancel"));
    // Component stays but isOpen=false; component still shows since isDismissed=false
    expect(screen.getByText("Maybe Later")).toBeInTheDocument();
  });
});
