import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ViewportHeader } from "@/src/features/game/components/station/ViewportHeader";

describe("ViewportHeader", () => {
  describe("known station IDs", () => {
    it.each([
      ["telescope", "OBS-01", "Telescope Array"],
      ["satellite", "COMMS-01", "Satellite Control"],
      ["rover", "GND-01", "Rover Operations"],
      ["solar", "PWR-01", "Solar Watch"],
      ["inventory", "AUX-02", "Cargo Bay"],
    ])("renders correct meta for stationId=%s", (stationId, moduleId, fullName) => {
      render(
        <ViewportHeader label="Label" stationId={stationId} onBack={vi.fn()} />
      );
      expect(screen.getByText(moduleId)).toBeInTheDocument();
      expect(screen.getByText(fullName)).toBeInTheDocument();
    });
  });

  describe("unknown station ID fallback", () => {
    it("uses label as full name when stationId is unknown", () => {
      render(
        <ViewportHeader label="Custom Station" stationId="unknown-station" onBack={vi.fn()} />
      );
      expect(screen.getByText("Custom Station")).toBeInTheDocument();
    });

    it("shows MOD-?? module ID for unknown stationId", () => {
      render(
        <ViewportHeader label="Custom" stationId="unknown-xyz" onBack={vi.fn()} />
      );
      expect(screen.getByText("MOD-??")).toBeInTheDocument();
    });
  });

  describe("navigation", () => {
    it("renders back button with accessible label", () => {
      render(
        <ViewportHeader label="Telescope Array" stationId="telescope" onBack={vi.fn()} />
      );
      expect(
        screen.getByRole("button", { name: /return to mission control/i })
      ).toBeInTheDocument();
    });

    it("calls onBack when back button is clicked", () => {
      const onBack = vi.fn();
      render(
        <ViewportHeader label="Telescope Array" stationId="telescope" onBack={onBack} />
      );
      fireEvent.click(screen.getByRole("button", { name: /return to mission control/i }));
      expect(onBack).toHaveBeenCalledTimes(1);
    });
  });

  describe("live indicator", () => {
    it("shows Active status text", () => {
      render(
        <ViewportHeader label="Telescope Array" stationId="telescope" onBack={vi.fn()} />
      );
      expect(screen.getByText("Active")).toBeInTheDocument();
    });
  });

  describe("Control link text", () => {
    it("shows Control navigation text", () => {
      render(
        <ViewportHeader label="Telescope Array" stationId="telescope" onBack={vi.fn()} />
      );
      expect(screen.getByText("Control")).toBeInTheDocument();
    });
  });
});
