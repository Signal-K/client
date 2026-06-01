import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { IntroStep } from "@/src/components/onboarding/OnboardingSteps";

describe("IntroStep", () => {
  it("renders with neutral language", () => {
    render(
      <IntroStep
        isPoweringUp={false}
        onPowerUp={vi.fn()}
      />
    );
    expect(screen.getByText(/System/)).toBeInTheDocument();
    expect(screen.getByText(/Online/)).toBeInTheDocument();
    expect(screen.getByText(/Operator console is in standby/)).toBeInTheDocument();
  });
});
