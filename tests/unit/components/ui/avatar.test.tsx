import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Avatar, AvatarImage, AvatarFallback } from "@/src/components/ui/avatar";

describe("Avatar", () => {
  it("renders without crashing", () => {
    const { container } = render(<Avatar />);
    expect(container.firstChild).not.toBeNull();
  });

  it("merges custom className", () => {
    const { container } = render(<Avatar className="my-avatar" />);
    expect(container.firstElementChild?.className).toContain("my-avatar");
  });
});

describe("AvatarFallback", () => {
  it("renders fallback text", () => {
    render(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("merges custom className on fallback", () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback className="my-fallback">AB</AvatarFallback>
      </Avatar>
    );
    const fallback = container.querySelector("[class*='my-fallback']");
    expect(fallback).not.toBeNull();
  });
});

describe("Avatar with image and fallback", () => {
  it("renders Avatar structure", () => {
    const { container } = render(
      <Avatar>
        <AvatarImage src="/avatar.png" alt="User avatar" />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
    );
    expect(container.firstChild).not.toBeNull();
  });
});
