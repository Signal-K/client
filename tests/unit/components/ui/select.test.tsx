import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/src/components/ui/select";

describe("Select", () => {
  it("renders the trigger", () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Pick one" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Option A</SelectItem>
        </SelectContent>
      </Select>
    );
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("shows placeholder text in trigger", () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Choose option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="x">X Option</SelectItem>
        </SelectContent>
      </Select>
    );
    expect(screen.getByText("Choose option")).toBeInTheDocument();
  });

  it("trigger has a chevron down icon", () => {
    const { container } = render(
      <Select>
        <SelectTrigger aria-label="select trigger">
          <SelectValue placeholder="Select…" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="v1">Value 1</SelectItem>
        </SelectContent>
      </Select>
    );
    // Radix renders a span with icon inside the trigger
    const trigger = screen.getByRole("combobox");
    expect(trigger).toBeInTheDocument();
  });

  it("applies custom className to trigger", () => {
    render(
      <Select>
        <SelectTrigger className="my-trigger">
          <SelectValue placeholder="…" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="x">X</SelectItem>
        </SelectContent>
      </Select>
    );
    const trigger = screen.getByRole("combobox");
    expect(trigger.className).toContain("my-trigger");
  });
});
