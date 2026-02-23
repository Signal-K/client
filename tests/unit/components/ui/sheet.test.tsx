import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/src/components/ui/sheet";

describe("Sheet", () => {
  it("renders trigger", () => {
    render(
      <Sheet>
        <SheetTrigger>Open Sheet</SheetTrigger>
        <SheetContent>
          <SheetTitle>Sheet Title</SheetTitle>
        </SheetContent>
      </Sheet>
    );
    expect(screen.getByText("Open Sheet")).toBeInTheDocument();
  });

  it("renders sheet content when open", () => {
    render(
      <Sheet open>
        <SheetContent>
          <SheetTitle>Visible Title</SheetTitle>
          <p>Sheet body text</p>
        </SheetContent>
      </Sheet>
    );
    expect(screen.getByText("Visible Title")).toBeInTheDocument();
    expect(screen.getByText("Sheet body text")).toBeInTheDocument();
  });

  it("renders SheetHeader inside open Sheet", () => {
    render(
      <Sheet open>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Header Title</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );
    expect(screen.getByText("Header Title")).toBeInTheDocument();
  });

  it("applies custom className to SheetContent when open", () => {
    const { container } = render(
      <Sheet open>
        <SheetContent className="custom-sheet">
          <SheetTitle>Title</SheetTitle>
          <p>Content</p>
        </SheetContent>
      </Sheet>
    );
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("renders SheetTitle inside open sheet", () => {
    render(
      <Sheet open>
        <SheetContent>
          <SheetTitle>My Title</SheetTitle>
        </SheetContent>
      </Sheet>
    );
    expect(screen.getByText("My Title")).toBeInTheDocument();
  });

  it("renders SheetFooter with children", () => {
    render(
      <SheetFooter>
        <button>Cancel</button>
        <button>Save</button>
      </SheetFooter>
    );
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByText("Save")).toBeInTheDocument();
  });
});
