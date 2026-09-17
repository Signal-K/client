"use client";

import { useEffect, useRef, useState } from "react";
import {
  MECHANIC_CLASSIFICATION_TYPES,
  MECHANIC_QUESTION_BANKS,
  PLAYTHROUGH_SURVEY_MAX,
  playthroughStorageKey,
  pickPlaythroughQuota,
  samplePlaythroughQuestions,
  SURVEY_DISPLAY_DELAY_MS,
} from "../mechanic-surveys";
import type { MechanicId, MechanicQuestion, PlaythroughSurveyPlan } from "../types";

export type ClassificationForMechanicSurvey = {
  classificationtype?: string | null;
};

function isMechanicId(view: string): view is MechanicId {
  return Object.prototype.hasOwnProperty.call(MECHANIC_CLASSIFICATION_TYPES, view);
}

function newPlaythroughId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `playthrough_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function readPlan(key: string): PlaythroughSurveyPlan | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PlaythroughSurveyPlan>;
    if (!parsed || typeof parsed.quota !== "number" || !Array.isArray(parsed.questionIds)) {
      return null;
    }
    return {
      id: typeof parsed.id === "string" && parsed.id.length > 0 ? parsed.id : newPlaythroughId(),
      quota: parsed.quota,
      questionIds: parsed.questionIds,
      answeredIds: parsed.answeredIds ?? [],
      skippedIds: parsed.skippedIds ?? [],
    };
  } catch {
    return null;
  }
}

function writePlan(key: string, plan: PlaythroughSurveyPlan) {
  try {
    localStorage.setItem(key, JSON.stringify(plan));
  } catch {
    // ignore quota / private-mode failures
  }
}

function questionById(mechanicId: MechanicId, id: string): MechanicQuestion | undefined {
  return MECHANIC_QUESTION_BANKS[mechanicId].find((q) => q.id === id);
}

export function useGameSurveys(
  userId?: string,
  classifications: ClassificationForMechanicSurvey[] = [],
  mechanicId?: string,
) {
  const [activeQuestion, setActiveQuestion] = useState<MechanicQuestion | null>(null);
  const [plan, setPlan] = useState<PlaythroughSurveyPlan | null>(null);
  const answeredThisVisitRef = useRef(false);
  const visitKey = `${userId ?? ""}:${mechanicId ?? ""}`;

  const relevantTypes =
    mechanicId && isMechanicId(mechanicId) ? MECHANIC_CLASSIFICATION_TYPES[mechanicId] : null;
  const relevantClassifications =
    relevantTypes == null
      ? []
      : relevantTypes.length === 0
        ? classifications
        : classifications.filter(
            (c) => c.classificationtype && relevantTypes.includes(c.classificationtype),
          );
  const relevantCount = relevantTypes && relevantTypes.length === 0 ? 1 : relevantClassifications.length;
  const classificationType = relevantClassifications.at(-1)?.classificationtype ?? null;

  useEffect(() => {
    answeredThisVisitRef.current = false;
  }, [visitKey]);

  useEffect(() => {
    if (!userId || !mechanicId || !isMechanicId(mechanicId)) {
      setActiveQuestion(null);
      setPlan(null);
      return;
    }
    if (relevantCount === 0 || answeredThisVisitRef.current) return;

    const key = playthroughStorageKey(userId, mechanicId);
    const timer = setTimeout(() => {
      if (answeredThisVisitRef.current) return;
      let next = readPlan(key);
      if (!next) {
        const quota = pickPlaythroughQuota();
        const sampled = samplePlaythroughQuestions(mechanicId, quota);
        next = {
          id: newPlaythroughId(),
          quota,
          questionIds: sampled.map((q) => q.id),
          answeredIds: [],
          skippedIds: [],
        };
        writePlan(key, next);
      } else if (!next.id) {
        next = { ...next, id: newPlaythroughId() };
        writePlan(key, next);
      }
      setPlan(next);

      const used = new Set([...next.answeredIds, ...next.skippedIds]);
      if (used.size >= Math.min(next.quota, PLAYTHROUGH_SURVEY_MAX)) {
        setActiveQuestion(null);
        return;
      }

      const remaining = next.questionIds
        .map((id) => questionById(mechanicId, id))
        .filter((q): q is MechanicQuestion => Boolean(q) && !used.has(q.id));

      setActiveQuestion(remaining[0] ?? null);
    }, SURVEY_DISPLAY_DELAY_MS);

    return () => clearTimeout(timer);
  }, [userId, mechanicId, relevantCount]);

  const persist = (status: "answered" | "skipped") => {
    if (!activeQuestion || !userId || !mechanicId || !isMechanicId(mechanicId)) return;
    answeredThisVisitRef.current = true;
    const key = playthroughStorageKey(userId, mechanicId);
    const current = readPlan(key) ?? plan;
    if (!current) {
      setActiveQuestion(null);
      return;
    }
    const updated: PlaythroughSurveyPlan = {
      ...current,
      answeredIds:
        status === "answered"
          ? Array.from(new Set([...current.answeredIds, activeQuestion.id]))
          : current.answeredIds,
      skippedIds:
        status === "skipped"
          ? Array.from(new Set([...current.skippedIds, activeQuestion.id]))
          : current.skippedIds,
    };
    writePlan(key, updated);
    setPlan(updated);
    setActiveQuestion(null);
  };

  const shownCount = (plan?.answeredIds.length ?? 0) + (plan?.skippedIds.length ?? 0);

  return {
    activeQuestion,
    quota: plan?.quota ?? 0,
    shownCount,
    playthroughId: plan?.id ?? null,
    classificationType,
    dismissSurvey: () => persist("skipped"),
    completeSurvey: () => persist("answered"),
  };
}
