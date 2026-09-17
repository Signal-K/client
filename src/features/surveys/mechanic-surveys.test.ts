import { describe, expect, it } from "vitest";
import {
  MECHANIC_QUESTION_BANKS,
  PLAYTHROUGH_SURVEY_MAX,
  PLAYTHROUGH_SURVEY_MIN,
  pickPlaythroughQuota,
  samplePlaythroughQuestions,
} from "./mechanic-surveys";

describe("playthrough survey sampling", () => {
  it("picks a quota between 3 and 5 inclusive", () => {
    const seen = new Set<number>();
    for (let i = 0; i < 40; i++) {
      const quota = pickPlaythroughQuota(() => i / 40);
      expect(quota).toBeGreaterThanOrEqual(PLAYTHROUGH_SURVEY_MIN);
      expect(quota).toBeLessThanOrEqual(PLAYTHROUGH_SURVEY_MAX);
      seen.add(quota);
    }
    expect(seen.has(3)).toBe(true);
    expect(seen.has(5)).toBe(true);
  });

  it("samples only one-question items for a mechanic", () => {
    const questions = samplePlaythroughQuestions("telescope", 4, [], () => 0.2);
    expect(questions).toHaveLength(4);
    expect(new Set(questions.map((q) => q.id)).size).toBe(4);
    for (const q of questions) {
      expect(q.mechanicId).toBe("telescope");
      expect(q.options).toHaveLength(3);
      expect(q.prompt.length).toBeGreaterThan(0);
    }
  });

  it("avoids already-used ids when the bank is large enough", () => {
    const used = MECHANIC_QUESTION_BANKS.telescope.slice(0, 3).map((q) => q.id);
    const questions = samplePlaythroughQuestions("telescope", 3, used, () => 0.1);
    expect(questions.every((q) => !used.includes(q.id))).toBe(true);
  });

  it("covers comprehension/clarity/confidence/pace/intent for each live mechanic", () => {
    for (const mechanicId of ["telescope", "satellite", "rover", "solar", "inventory"] as const) {
      const tags = new Set(MECHANIC_QUESTION_BANKS[mechanicId].map((q) => q.coverage));
      expect(tags.has("comprehension")).toBe(true);
      expect(tags.has("clarity")).toBe(true);
      expect(tags.has("confidence")).toBe(true);
      expect(tags.has("pace")).toBe(true);
      expect(tags.has("intent")).toBe(true);
      expect(MECHANIC_QUESTION_BANKS[mechanicId].length).toBeGreaterThanOrEqual(PLAYTHROUGH_SURVEY_MAX);
    }
  });
});
