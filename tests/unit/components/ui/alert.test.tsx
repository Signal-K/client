import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Alert, AlertDescription } from "@/src/components/ui/alert";

describe("Alert", () => {
  it("renders with role='alert'", () => {
    render(<Alert>Alert content</Alert>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("renders children text", () => {
    render(<Alert>Something went wrong</Alert>);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("applies default variant classes", () => {
    render(<Alert>Test</Alert>);
    const alert = screen.getByRole("alert");
    expect(alert.className).toContain("bg-background");
  });

  it("applies destructive variant classes", () => {
    render(<Alert variant="destructive">Danger</Alert>);
    const alert = screen.getByRole("alert");
    expect(alert.className).toContain("destructive");
  });

  it("merges custom className", () => {
    render(<Alert className="my-alert">Test</Alert>);
    expect(screen.getByRole("alert").className).toContain("my-alert");
  });
});

describe("AlertDescription", () => {
  it("renders children text", () => {
    render(<AlertDescription>Description text</AlertDescription>);
    expect(screen.getByText("Description text")).toBeInTheDocument();
  });

  it("merges custom className", () => {
    const { container } = render(
      <AlertDescription className="my-desc">Desc</AlertDescription>
    );
    expect(container.firstElementChild?.className).toContain("my-desc");
  });
});

describe("Alert with AlertDescription", () => {
  it("renders both components together", () => {
    render(
      <Alert>
        <AlertDescription>This is a description</AlertDescription>
      </Alert>
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("This is a description")).toBeInTheDocument();
  });
});
