import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/src/components/ui/dropdown-menu";

describe("DropdownMenu", () => {
  it("renders trigger button", () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    expect(screen.getByText("Open Menu")).toBeInTheDocument();
  });

  it("renders content and items when open", () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item A</DropdownMenuItem>
          <DropdownMenuItem>Item B</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    expect(screen.getByText("Item A")).toBeInTheDocument();
    expect(screen.getByText("Item B")).toBeInTheDocument();
  });

  it("renders DropdownMenuLabel when open", () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Section Label</DropdownMenuLabel>
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    expect(screen.getByText("Section Label")).toBeInTheDocument();
  });

  it("renders separator in open menu", () => {
    const { container } = render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>A</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>B</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("applies className to trigger", () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger className="menu-btn">Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Option</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    const trigger = screen.getByText("Menu");
    expect(trigger.className).toContain("menu-btn");
  });

  it("renders DropdownMenuItem with inset true (pl-8 class)", () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>T</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem inset>Indented Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    const item = screen.getByText("Indented Item");
    expect(item.className).toContain("pl-8");
  });

  it("renders DropdownMenuLabel with inset true (pl-8 class)", () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>T</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel inset>Indented Label</DropdownMenuLabel>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    const label = screen.getByText("Indented Label");
    expect(label.className).toContain("pl-8");
  });
});
