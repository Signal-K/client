/**
 * Integration tests for the GameSurveys component verifying that:
 * 1. No survey is rendered when the user has no classifications (new user)
 * 2. A mechanic survey renders once classifications exceed the threshold
 * 3. The component renders null for unauthenticated sessions
 *
 * Classifications must be stable constant references — inline array literals
 * would create new references on each re-render and clear the survey state.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";

vi.mock("posthog-js/react", () => ({
  usePostHog: () => ({ capture: vi.fn() }),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(() => ({ get: vi.fn(() => null) })),
  useRouter: vi.fn(() => ({ push: vi.fn(), replace: vi.fn() })),
}));

vi.mock("@/features/surveys/components/MechanicPulseSurvey", () => ({
  default: ({ survey }: { survey: { id: string } }) => (
    <div data-testid="mechanic-pulse-survey" data-survey-id={survey.id} />
  ),
}));

import { GameSurveys } from "@/features/surveys/components/GameSurveys";

// Stable classification fixtures (must not be inline literals in renderHook/render props)
const NO_CLASSIFICATIONS: { classificationtype: string | null }[] = [];
const TELESCOPE_2 = [
  { classificationtype: "telescope-tess" },
  { classificationtype: "planet" },
];
const TELESCOPE_3 = [
  { classificationtype: "telescope-tess" },
  { classificationtype: "planet" },
  { classificationtype: "telescope-tess" },
];

async function setView(view: string) {
  const { useSearchParams } = await import("next/navigation");
  vi.mocked(useSearchParams).mockReturnValue({ get: () => view } as any);
}

describe("GameSurveys component — classification gate integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders nothing when userId is undefined", async () => {
    await setView("telescope");
    const { container } = render(
      <GameSurveys userId={undefined} classifications={NO_CLASSIFICATIONS} />
    );
    act(() => { vi.runAllTimers(); });
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing for a brand-new user with no classifications", async () => {
    await setView("telescope");
    const { container } = render(
      <GameSurveys userId="user-new" classifications={NO_CLASSIFICATIONS} />
    );
    act(() => { vi.runAllTimers(); });
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when below the classification threshold (2 of 3)", async () => {
    await setView("telescope");
    const { container } = render(
      <GameSurveys userId="user-1" classifications={TELESCOPE_2} />
    );
    act(() => { vi.runAllTimers(); });
    expect(container).toBeEmptyDOMElement();
  });

  it("renders a survey once the classification threshold is met (3 of 3)", async () => {
    await setView("telescope");
    render(<GameSurveys userId="user-1" classifications={TELESCOPE_3} />);
    act(() => { vi.runAllTimers(); });
    expect(screen.getByTestId("mechanic-pulse-survey")).toBeInTheDocument();
    expect(screen.getByTestId("mechanic-pulse-survey")).toHaveAttribute(
      "data-survey-id",
      "mechanic_telescope_loop_v1"
    );
  });
});
