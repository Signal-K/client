import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

import { useProjectEngagementSurveys } from "@/features/surveys/hooks/useProjectEngagementSurveys";
import { surveyStorageKey } from "@/features/surveys/mechanic-surveys";

describe("useProjectEngagementSurveys", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("returns null activeSurvey when no userId", () => {
    const { result } = renderHook(() =>
      useProjectEngagementSurveys(undefined, [{ classificationtype: "planet" }])
    );
    expect(result.current.activeSurvey).toBeNull();
  });

  it("returns null activeSurvey when classifications array is empty", () => {
    const { result } = renderHook(() =>
      useProjectEngagementSurveys("user-1", [])
    );
    expect(result.current.activeSurvey).toBeNull();
  });

  it("returns null when contribution count is below threshold", () => {
    const classifications = [
      { classificationtype: "planet" },
      { classificationtype: "planet" },
    ]; // only 2, threshold is 5
    const { result } = renderHook(() =>
      useProjectEngagementSurveys("user-1", classifications)
    );
    expect(result.current.activeSurvey).toBeNull();
  });

  it("shows planet-hunters survey after 5 planet classifications", () => {
    const classifications = Array(5).fill({ classificationtype: "planet" });
    const { result } = renderHook(() =>
      useProjectEngagementSurveys("user-1", classifications)
    );
    expect(result.current.activeSurvey?.id).toBe("project_engage_planet_hunters_v1");
    expect(result.current.activeSurvey?.projectType).toBe("planet-hunters");
  });

  it("shows planet-hunters survey for telescope-tess classifications", () => {
    const classifications = Array(5).fill({ classificationtype: "telescope-tess" });
    const { result } = renderHook(() =>
      useProjectEngagementSurveys("user-1", classifications)
    );
    expect(result.current.activeSurvey?.id).toBe("project_engage_planet_hunters_v1");
  });

  it("shows asteroid-hunting survey after 5 telescope-minorPlanet classifications", () => {
    const classifications = Array(5).fill({
      classificationtype: "telescope-minorPlanet",
    });
    const { result } = renderHook(() =>
      useProjectEngagementSurveys("user-1", classifications)
    );
    expect(result.current.activeSurvey?.id).toBe("project_engage_asteroid_hunting_v1");
    expect(result.current.activeSurvey?.projectType).toBe("asteroid-hunting");
  });

  it("shows asteroid-hunting survey for active-asteroids classifications", () => {
    const classifications = Array(5).fill({ classificationtype: "active-asteroids" });
    const { result } = renderHook(() =>
      useProjectEngagementSurveys("user-1", classifications)
    );
    expect(result.current.activeSurvey?.id).toBe("project_engage_asteroid_hunting_v1");
  });

  it("shows rover survey after 5 rover classifications", () => {
    const classifications = Array(5).fill({ classificationtype: "rover" });
    const { result } = renderHook(() =>
      useProjectEngagementSurveys("user-1", classifications)
    );
    expect(result.current.activeSurvey?.id).toBe("project_engage_rover_v1");
    expect(result.current.activeSurvey?.projectType).toBe("rover");
  });

  it("shows cloudspotting survey after 5 cloud classifications", () => {
    const classifications = Array(5).fill({ classificationtype: "cloud" });
    const { result } = renderHook(() =>
      useProjectEngagementSurveys("user-1", classifications)
    );
    expect(result.current.activeSurvey?.id).toBe("project_engage_cloudspotting_v1");
    expect(result.current.activeSurvey?.projectType).toBe("cloudspotting");
  });

  it("shows cloudspotting survey for lidar-jovianVortexHunter classifications", () => {
    const classifications = Array(5).fill({
      classificationtype: "lidar-jovianVortexHunter",
    });
    const { result } = renderHook(() =>
      useProjectEngagementSurveys("user-1", classifications)
    );
    expect(result.current.activeSurvey?.id).toBe("project_engage_cloudspotting_v1");
  });

  it("shows sunspots survey after 5 telescope-sunspot classifications", () => {
    const classifications = Array(5).fill({
      classificationtype: "telescope-sunspot",
    });
    const { result } = renderHook(() =>
      useProjectEngagementSurveys("user-1", classifications)
    );
    expect(result.current.activeSurvey?.id).toBe("project_engage_sunspots_v1");
    expect(result.current.activeSurvey?.projectType).toBe("sunspots");
  });

  it("does not show survey if already completed in localStorage", () => {
    const key = surveyStorageKey("project_engage_planet_hunters_v1", "user-1");
    localStorage.setItem(key, "completed");

    const classifications = Array(5).fill({ classificationtype: "planet" });
    const { result } = renderHook(() =>
      useProjectEngagementSurveys("user-1", classifications)
    );
    expect(result.current.activeSurvey).toBeNull();
  });

  it("does not show survey if already dismissed in localStorage", () => {
    const key = surveyStorageKey("project_engage_planet_hunters_v1", "user-1");
    localStorage.setItem(key, "dismissed");

    const classifications = Array(5).fill({ classificationtype: "planet" });
    const { result } = renderHook(() =>
      useProjectEngagementSurveys("user-1", classifications)
    );
    expect(result.current.activeSurvey).toBeNull();
  });

  it("dismissSurvey sets localStorage and clears activeSurvey", () => {
    const classifications = Array(5).fill({ classificationtype: "planet" });
    const { result } = renderHook(() =>
      useProjectEngagementSurveys("user-1", classifications)
    );

    expect(result.current.activeSurvey).not.toBeNull();

    act(() => {
      result.current.dismissSurvey();
    });

    expect(result.current.activeSurvey).toBeNull();
    const key = surveyStorageKey("project_engage_planet_hunters_v1", "user-1");
    expect(localStorage.getItem(key)).toBe("dismissed");
  });

  it("completeSurvey sets localStorage and clears activeSurvey", () => {
    const classifications = Array(5).fill({ classificationtype: "planet" });
    const { result } = renderHook(() =>
      useProjectEngagementSurveys("user-1", classifications)
    );

    expect(result.current.activeSurvey).not.toBeNull();

    act(() => {
      result.current.completeSurvey();
    });

    expect(result.current.activeSurvey).toBeNull();
    const key = surveyStorageKey("project_engage_planet_hunters_v1", "user-1");
    expect(localStorage.getItem(key)).toBe("completed");
  });

  it("dismissSurvey is a no-op when no active survey", () => {
    const { result } = renderHook(() =>
      useProjectEngagementSurveys("user-1", [])
    );
    expect(() =>
      act(() => {
        result.current.dismissSurvey();
      })
    ).not.toThrow();
  });

  it("completeSurvey is a no-op when no active survey", () => {
    const { result } = renderHook(() =>
      useProjectEngagementSurveys("user-1", [])
    );
    expect(() =>
      act(() => {
        result.current.completeSurvey();
      })
    ).not.toThrow();
  });

  it("handles null classificationtype gracefully", () => {
    const classifications = [
      { classificationtype: null },
      { classificationtype: undefined },
      { classificationtype: "planet" },
    ];
    // Only 1 valid planet classification — below threshold of 5
    const { result } = renderHook(() =>
      useProjectEngagementSurveys("user-1", classifications)
    );
    expect(result.current.activeSurvey).toBeNull();
  });

  it("counts mixed classification types independently", () => {
    // 3 planet + 3 asteroid — neither exceeds threshold of 5 individually
    const classifications = [
      ...Array(3).fill({ classificationtype: "planet" }),
      ...Array(3).fill({ classificationtype: "telescope-minorPlanet" }),
    ];
    const { result } = renderHook(() =>
      useProjectEngagementSurveys("user-1", classifications)
    );
    expect(result.current.activeSurvey).toBeNull();
  });

  it("prioritises the first matching project survey when multiple thresholds are met", () => {
    // Both planet-hunters (5) and asteroid-hunting (5) thresholds met
    // planet-hunters comes first in the array so it should win
    const classifications = [
      ...Array(5).fill({ classificationtype: "planet" }),
      ...Array(5).fill({ classificationtype: "telescope-minorPlanet" }),
    ];
    const { result } = renderHook(() =>
      useProjectEngagementSurveys("user-1", classifications)
    );
    expect(result.current.activeSurvey?.id).toBe("project_engage_planet_hunters_v1");
  });

  it("falls through to next eligible survey when first is already completed", () => {
    const planetKey = surveyStorageKey("project_engage_planet_hunters_v1", "user-1");
    localStorage.setItem(planetKey, "completed");

    const classifications = [
      ...Array(5).fill({ classificationtype: "planet" }),
      ...Array(5).fill({ classificationtype: "telescope-minorPlanet" }),
    ];
    const { result } = renderHook(() =>
      useProjectEngagementSurveys("user-1", classifications)
    );
    expect(result.current.activeSurvey?.id).toBe("project_engage_asteroid_hunting_v1");
  });

  it("survey has correct structure (title, subtitle, questions)", () => {
    const classifications = Array(5).fill({ classificationtype: "planet" });
    const { result } = renderHook(() =>
      useProjectEngagementSurveys("user-1", classifications)
    );

    const survey = result.current.activeSurvey;
    expect(survey).not.toBeNull();
    expect(survey?.title).toBeTruthy();
    expect(survey?.subtitle).toBeTruthy();
    expect(Array.isArray(survey?.questions)).toBe(true);
    expect(survey?.questions.length).toBeGreaterThanOrEqual(1);
    const question = survey?.questions[0];
    expect(question?.id).toBe("dedicated_interest");
    expect(Array.isArray(question?.options)).toBe(true);
    expect(question?.options.length).toBeGreaterThan(0);
  });

  it("exactly 5 classifications triggers the survey (at threshold boundary)", () => {
    const classifications = Array(5).fill({ classificationtype: "rover" });
    const { result } = renderHook(() =>
      useProjectEngagementSurveys("user-1", classifications)
    );
    expect(result.current.activeSurvey?.id).toBe("project_engage_rover_v1");
  });

  it("4 classifications does not trigger the survey (just below threshold)", () => {
    const classifications = Array(4).fill({ classificationtype: "rover" });
    const { result } = renderHook(() =>
      useProjectEngagementSurveys("user-1", classifications)
    );
    expect(result.current.activeSurvey).toBeNull();
  });
});
