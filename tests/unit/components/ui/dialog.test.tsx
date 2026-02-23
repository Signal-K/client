import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/src/components/ui/dialog";

describe("Dialog", () => {
  it("renders trigger button", () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByText("Open Dialog")).toBeInTheDocument();
  });

  it("renders DialogHeader with children", () => {
    render(
      <DialogHeader>
        <span>Header Content</span>
      </DialogHeader>
    );
    expect(screen.getByText("Header Content")).toBeInTheDocument();
  });

  it("renders DialogTitle as a heading", () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>My Dialog Title</DialogTitle>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByText("My Dialog Title")).toBeInTheDocument();
  });

  it("renders DialogDescription", () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Descriptive text here</DialogDescription>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByText("Descriptive text here")).toBeInTheDocument();
  });

  it("renders DialogClose button", () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogClose>Close me</DialogClose>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByText("Close me")).toBeInTheDocument();
  });

  it("renders DialogFooter with children", () => {
    render(
      <DialogFooter>
        <button>Cancel</button>
        <button>Confirm</button>
      </DialogFooter>
    );
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByText("Confirm")).toBeInTheDocument();
  });
});
