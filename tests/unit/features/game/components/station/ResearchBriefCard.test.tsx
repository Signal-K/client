import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ResearchBriefCard } from "@/src/features/game/components/station/ResearchBriefCard";

describe("ResearchBriefCard", () => {
  it("renders with stardust balance", () => {
    render(<ResearchBriefCard availableStardust={42} onNavigate={vi.fn()} />);
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("Research Protocols")).toBeInTheDocument();
    expect(screen.getByText("Advance Station Capabilities")).toBeInTheDocument();
  });

  it("calls onNavigate when clicked", () => {
    const onNavigate = vi.fn();
    render(<ResearchBriefCard availableStardust={10} onNavigate={onNavigate} />);
    
    const card = screen.getByRole("button");
    fireEvent.click(card);
    
    expect(onNavigate).toHaveBeenCalledTimes(1);
  });

  it("calls onNavigate when pressing Enter", () => {
    const onNavigate = vi.fn();
    render(<ResearchBriefCard availableStardust={10} onNavigate={onNavigate} />);
    
    const card = screen.getByRole("button");
    fireEvent.keyDown(card, { key: "Enter" });
    
    expect(onNavigate).toHaveBeenCalledTimes(1);
  });
});
