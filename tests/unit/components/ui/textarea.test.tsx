import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Textarea } from "@/src/components/ui/textarea";

describe("Textarea", () => {
  it("renders a textarea element", () => {
    render(<Textarea />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders with placeholder text", () => {
    render(<Textarea placeholder="Enter description..." />);
    expect(screen.getByPlaceholderText("Enter description...")).toBeInTheDocument();
  });

  it("renders with default value", () => {
    render(<Textarea defaultValue="Some text" />);
    expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe("Some text");
  });

  it("is disabled when disabled prop is passed", () => {
    render(<Textarea disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("accepts user input", () => {
    render(<Textarea />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "hello world" } });
    expect((textarea as HTMLTextAreaElement).value).toBe("hello world");
  });

  it("merges custom className", () => {
    const { container } = render(<Textarea className="my-textarea" />);
    expect(container.querySelector("textarea")?.className).toContain("my-textarea");
  });
});
