import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
} from "@/src/components/ui/toast";

describe("Toast", () => {
  it("renders ToastViewport inside ToastProvider", () => {
    const { container } = render(
      <ToastProvider>
        <ToastViewport />
      </ToastProvider>
    );
    expect(container.firstChild).toBeTruthy();
  });

  it("renders Toast with title and description", () => {
    render(
      <ToastProvider>
        <Toast open>
          <ToastTitle>Toast Title</ToastTitle>
          <ToastDescription>Toast Description</ToastDescription>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );
    expect(screen.getByText("Toast Title")).toBeInTheDocument();
    expect(screen.getByText("Toast Description")).toBeInTheDocument();
  });

  it("renders destructive variant", () => {
    const { container } = render(
      <ToastProvider>
        <Toast open variant="destructive">
          <ToastTitle>Error!</ToastTitle>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );
    expect(screen.getByText("Error!")).toBeInTheDocument();
  });

  it("renders Toast with title and custom class", () => {
    const { container } = render(
      <ToastProvider>
        <Toast open className="custom-toast">
          <ToastTitle>Styled Toast</ToastTitle>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );
    expect(screen.getByText("Styled Toast")).toBeInTheDocument();
  });
});
