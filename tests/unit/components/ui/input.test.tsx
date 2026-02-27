import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Input } from "@/src/components/ui/input";

describe("Input", () => {
  it("renders an input element", () => {
    render(<Input />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders with placeholder text", () => {
    render(<Input placeholder="Enter text..." />);
    expect(screen.getByPlaceholderText("Enter text...")).toBeInTheDocument();
  });

  it("renders with provided value", () => {
    render(<Input defaultValue="hello" />);
    expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe("hello");
  });

  it("is disabled when disabled prop is passed", () => {
    render(<Input disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("renders with type='password'", () => {
    const { container } = render(<Input type="password" />);
    expect(container.querySelector("input[type='password']")).not.toBeNull();
  });

  it("accepts user input", () => {
    render(<Input />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "test value" } });
    expect((input as HTMLInputElement).value).toBe("test value");
  });

  it("merges custom className", () => {
    const { container } = render(<Input className="my-input" />);
    expect(container.querySelector("input")?.className).toContain("my-input");
  });
});
