import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/src/components/ui/card";

describe("Card components", () => {
  describe("Card", () => {
    it("renders children", () => {
      render(<Card>Card content</Card>);
      expect(screen.getByText("Card content")).toBeInTheDocument();
    });

    it("renders as a div", () => {
      const { container } = render(<Card>Test</Card>);
      expect(container.querySelector("div")).not.toBeNull();
    });

    it("merges custom className", () => {
      const { container } = render(<Card className="my-card">Test</Card>);
      expect(container.firstElementChild?.className).toContain("my-card");
    });
  });

  describe("CardHeader", () => {
    it("renders children", () => {
      render(<CardHeader>Header</CardHeader>);
      expect(screen.getByText("Header")).toBeInTheDocument();
    });
  });

  describe("CardTitle", () => {
    it("renders as h3", () => {
      const { container } = render(<CardTitle>My Title</CardTitle>);
      expect(container.querySelector("h3")).not.toBeNull();
      expect(screen.getByText("My Title")).toBeInTheDocument();
    });
  });

  describe("CardDescription", () => {
    it("renders description text", () => {
      render(<CardDescription>A description</CardDescription>);
      expect(screen.getByText("A description")).toBeInTheDocument();
    });
  });

  describe("CardContent", () => {
    it("renders children", () => {
      render(<CardContent>Body content</CardContent>);
      expect(screen.getByText("Body content")).toBeInTheDocument();
    });
  });

  describe("CardFooter", () => {
    it("renders children", () => {
      render(<CardFooter>Footer</CardFooter>);
      expect(screen.getByText("Footer")).toBeInTheDocument();
    });
  });

  it("renders full card structure", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Desc</CardDescription>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    );
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Desc")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });
});
