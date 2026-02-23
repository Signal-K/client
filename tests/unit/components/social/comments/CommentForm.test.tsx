import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CommentForm } from "@/src/components/social/comments/CommentForm";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

vi.mock("@/src/components/social/actions", () => ({
  submitCommentAction: vi.fn().mockResolvedValue({ ok: true }),
}));

vi.mock("@/src/components/ui/button", () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>{children}</button>
  ),
}));

vi.mock("@/src/components/ui/textarea", () => ({
  Textarea: ({ value, onChange, placeholder }: any) => (
    <textarea value={value} onChange={onChange} placeholder={placeholder} />
  ),
}));

vi.mock("@/src/components/ui/toast", () => ({
  ToastProvider: ({ children }: any) => <div>{children}</div>,
  Toast: ({ children }: any) => <div>{children}</div>,
  ToastTitle: ({ children }: any) => <div>{children}</div>,
  ToastDescription: ({ children }: any) => <div>{children}</div>,
  ToastViewport: () => <div />,
}));

describe("CommentForm", () => {
  it("renders a textarea", () => {
    render(<CommentForm classificationId={1} />);
    expect(screen.getByRole("textbox")).toBeDefined();
  });

  it("renders a submit button", () => {
    render(<CommentForm classificationId={1} />);
    expect(screen.getByRole("button")).toBeDefined();
  });

  it("updates textarea value on input", () => {
    render(<CommentForm classificationId={1} />);
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "Hello world" } });
    expect(textarea.value).toBe("Hello world");
  });
});
