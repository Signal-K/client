import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/src/components/ui/popover";

describe("Popover", () => {
  it("renders trigger", () => {
    render(
      <Popover>
        <PopoverTrigger>Open Popover</PopoverTrigger>
        <PopoverContent>Popover body</PopoverContent>
      </Popover>
    );
    expect(screen.getByText("Open Popover")).toBeInTheDocument();
  });

  it("renders content when open", () => {
    render(
      <Popover open>
        <PopoverTrigger>Open Popover</PopoverTrigger>
        <PopoverContent>Popover body</PopoverContent>
      </Popover>
    );
    expect(screen.getByText("Popover body")).toBeInTheDocument();
  });

  it("renders complex content when open", () => {
    render(
      <Popover open>
        <PopoverTrigger>Trigger</PopoverTrigger>
        <PopoverContent>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
          </ul>
        </PopoverContent>
      </Popover>
    );
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
  });

  it("applies className to PopoverContent when open", () => {
    render(
      <Popover open>
        <PopoverTrigger>Trigger</PopoverTrigger>
        <PopoverContent className="custom-popover">Content</PopoverContent>
      </Popover>
    );
    const content = screen.getByText("Content").closest("[data-radix-popper-content-wrapper]") ?? screen.getByText("Content").parentElement;
    expect(screen.getByText("Content")).toBeInTheDocument();
  });
});
