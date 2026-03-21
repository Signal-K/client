import { describe, it, expect } from "vitest";
import { MECHANIC_SURVEYS, SURVEY_DISPLAY_DELAY_MS, surveyStorageKey } from "@/features/surveys/mechanic-surveys";

describe("MECHANIC_SURVEYS", () => {
  it("is a non-empty array", () => {
    expect(Array.isArray(MECHANIC_SURVEYS)).toBe(true);
    expect(MECHANIC_SURVEYS.length).toBeGreaterThan(0);
  });

  it("every survey has required fields", () => {
    for (const survey of MECHANIC_SURVEYS) {
      expect(survey.id).toBeTruthy();
      expect(survey.title).toBeTruthy();
      expect(survey.subtitle).toBeTruthy();
      expect(["game", "ecosystem"]).toContain(survey.triggerSurface);
      expect(Array.isArray(survey.questions)).toBe(true);
      expect(survey.questions.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("every question has required fields", () => {
    for (const survey of MECHANIC_SURVEYS) {
      for (const question of survey.questions) {
        if (!question) continue;
        expect(question.id).toBeTruthy();
        expect(question.prompt).toBeTruthy();
        expect(Array.isArray(question.options)).toBe(true);
        expect(question.options.length).toBeGreaterThan(0);
      }
    }
  });

  it("all survey IDs are unique", () => {
    const ids = MECHANIC_SURVEYS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("SURVEY_DISPLAY_DELAY_MS", () => {
  it("is a positive number", () => {
    expect(typeof SURVEY_DISPLAY_DELAY_MS).toBe("number");
    expect(SURVEY_DISPLAY_DELAY_MS).toBeGreaterThan(0);
  });
});

describe("surveyStorageKey", () => {
  it("returns a string containing the survey ID and user ID", () => {
    const key = surveyStorageKey("my_survey_v1", "user-abc");
    expect(key).toContain("my_survey_v1");
    expect(key).toContain("user-abc");
  });

  it("returns different keys for different survey IDs", () => {
    const key1 = surveyStorageKey("survey_a", "user-1");
    const key2 = surveyStorageKey("survey_b", "user-1");
    expect(key1).not.toBe(key2);
  });

  it("returns different keys for different user IDs", () => {
    const key1 = surveyStorageKey("survey_a", "user-1");
    const key2 = surveyStorageKey("survey_a", "user-2");
    expect(key1).not.toBe(key2);
  });

  it("is deterministic for the same inputs", () => {
    const key1 = surveyStorageKey("survey_x", "user-z");
    const key2 = surveyStorageKey("survey_x", "user-z");
    expect(key1).toBe(key2);
  });
});
