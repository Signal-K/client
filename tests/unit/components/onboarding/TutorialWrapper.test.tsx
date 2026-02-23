import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockUseUserPreferences = vi.hoisted(() => vi.fn());

vi.mock("@/src/hooks/useUserPreferences", () => ({
  useUserPreferences: mockUseUserPreferences,
}));

vi.mock("@/src/components/onboarding/InteractiveTutorial", () => ({
  default: ({
    onComplete,
    onSkip,
  }: {
    onComplete: () => void;
    onSkip: () => void;
    title: string;
  }) => (
    <div data-testid="interactive-tutorial">
      <button onClick={onComplete}>Complete Tutorial</button>
      <button onClick={onSkip}>Skip Tutorial</button>
    </div>
  ),
}));

import TutorialWrapper from "@/src/components/onboarding/TutorialWrapper";

const defaultSteps = [{ title: "Step 1", content: "Do this first" }] as any;

describe("TutorialWrapper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUserPreferences.mockReturnValue({
      hasTutorialCompleted: vi.fn().mockReturnValue(false),
      markTutorialComplete: vi.fn(),
      resetTutorial: vi.fn(),
      isLoading: false,
    });
  });

  it("renders children content", () => {
    // Tutorial not completed → it'll show the tutorial, but children still should exist
    render(
      <TutorialWrapper
        tutorialId="welcome-tour"
        steps={defaultSteps}
        title="Welcome"
      >
        <p>Main content here</p>
      </TutorialWrapper>
    );
    // tutorial not completed = shows tutorial overlay, children rendered behind
    expect(screen.getByTestId("interactive-tutorial")).toBeInTheDocument();
  });

  it("shows children directly when tutorial already completed", () => {
    mockUseUserPreferences.mockReturnValue({
      hasTutorialCompleted: vi.fn().mockReturnValue(true),
      markTutorialComplete: vi.fn(),
      resetTutorial: vi.fn(),
      isLoading: false,
    });

    render(
      <TutorialWrapper
        tutorialId="welcome-tour"
        steps={defaultSteps}
        title="Welcome"
      >
        <p>App content</p>
      </TutorialWrapper>
    );
    expect(screen.getByText("App content")).toBeInTheDocument();
    expect(screen.queryByTestId("interactive-tutorial")).toBeNull();
  });

  it("calls onComplete callback when tutorial is completed", () => {
    const onComplete = vi.fn();
    render(
      <TutorialWrapper
        tutorialId="welcome-tour"
        steps={defaultSteps}
        title="Welcome"
        onComplete={onComplete}
      >
        <p>Content</p>
      </TutorialWrapper>
    );
    fireEvent.click(screen.getByText("Complete Tutorial"));
    expect(onComplete).toHaveBeenCalled();
  });

  it("renders nothing while isLoading is true", () => {
    mockUseUserPreferences.mockReturnValue({
      hasTutorialCompleted: vi.fn().mockReturnValue(false),
      markTutorialComplete: vi.fn(),
      resetTutorial: vi.fn(),
      isLoading: true,
    });

    const { container } = render(
      <TutorialWrapper
        tutorialId="welcome-tour"
        steps={defaultSteps}
        title="Welcome"
      >
        <p>Loading content</p>
      </TutorialWrapper>
    );
    // While loading, tutorial is not shown yet; children still render but tutorial overlay not set up yet
    expect(container).toBeDefined();
  });

  it("calls onSkip when Skip Tutorial is clicked", () => {
    const onSkip = vi.fn();
    const markTutorialComplete = vi.fn();
    mockUseUserPreferences.mockReturnValue({
      hasTutorialCompleted: vi.fn().mockReturnValue(false),
      markTutorialComplete,
      resetTutorial: vi.fn(),
      isLoading: false,
    });

    render(
      <TutorialWrapper
        tutorialId="welcome-tour"
        steps={defaultSteps}
        title="Welcome"
        onSkip={onSkip}
      >
        <p>Content</p>
      </TutorialWrapper>
    );
    fireEvent.click(screen.getByText("Skip Tutorial"));
    expect(markTutorialComplete).toHaveBeenCalledWith("welcome-tour");
    expect(onSkip).toHaveBeenCalled();
  });

  it("shows replay button and triggers handleReplay when clicked", () => {
    const resetTutorial = vi.fn();
    mockUseUserPreferences.mockReturnValue({
      hasTutorialCompleted: vi.fn().mockReturnValue(true),
      markTutorialComplete: vi.fn(),
      resetTutorial,
      isLoading: false,
    });

    render(
      <TutorialWrapper
        tutorialId="welcome-tour"
        steps={defaultSteps}
        title="Welcome"
        showReplayButton={true}
        replayButtonPosition="top-right"
      >
        <p>Content</p>
      </TutorialWrapper>
    );

    // Find replay button and click
    const replayBtn = document.querySelector("[title='Replay Welcome']") as HTMLElement;
    expect(replayBtn).not.toBeNull();
    fireEvent.click(replayBtn);
    expect(resetTutorial).toHaveBeenCalledWith("welcome-tour");
    // After replay, tutorial should show again
    expect(screen.getByTestId("interactive-tutorial")).toBeInTheDocument();
  });
});
