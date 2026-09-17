"use client";

import { useEffect, useState } from "react";
import { usePostHog } from "posthog-js/react";
import { getStationChrome } from "@/src/features/game/components/station/station-chrome";
import { cn } from "@/src/lib/utils";
import type { MechanicQuestion } from "@/src/features/surveys/types";

type InMechanicSurveyStepProps = {
  question: MechanicQuestion;
  step: number;
  of: number;
  playthroughId?: string | null;
  classificationType?: string | null;
  onSubmit: (answer: string) => Promise<void> | void;
  onSkip: () => void;
};

export default function InMechanicSurveyStep({
  question,
  step,
  of,
  playthroughId,
  classificationType,
  onSubmit,
  onSkip,
}: InMechanicSurveyStepProps) {
  const posthog = usePostHog();
  const chrome = getStationChrome(question.mechanicId);
  const [selected, setSelected] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    posthog?.capture("mechanic_survey_shown", {
      $survey_id: question.id,
      mechanic: question.mechanicId,
      coverage: question.coverage,
      playthrough_id: playthroughId,
      classification_type: classificationType,
      playthrough_step: step,
      playthrough_quota: of,
    });
  }, [
    posthog,
    question.id,
    question.mechanicId,
    question.coverage,
    playthroughId,
    classificationType,
    step,
    of,
  ]);

  const handleLog = async () => {
    if (!selected || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmit(selected);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      className="relative mb-4 overflow-hidden rounded-xl border text-left"
      style={{
        borderColor: chrome.borderColor,
        background:
          "linear-gradient(180deg, rgba(4,10,22,0.96) 0%, rgba(6,14,28,0.92) 100%)",
        boxShadow: `inset 1px 1px 0 rgba(255,255,255,0.05), 0 8px 24px rgba(0,0,0,0.35)`,
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, rgba(${chrome.accentRgb},0.55), transparent)`,
        }}
        aria-hidden
      />

      <header className="flex items-center justify-between px-4 pt-3 pb-2">
        <div>
          <p
            className="font-mono text-[7px] uppercase tracking-[0.28em] leading-none mb-1"
            style={{ color: `rgba(${chrome.accentRgb},0.65)` }}
          >
            {chrome.moduleId} · packet {step}/{of || step}
          </p>
          <p className="text-sm font-black text-white/90 leading-none">{chrome.full}</p>
        </div>
        <span
          className="font-mono text-[8px] uppercase tracking-widest"
          style={{ color: `rgba(${chrome.accentRgb},0.7)` }}
        >
          Confirm
        </span>
      </header>

      <div className="px-4 pb-4">
        <p className="text-sm text-white/85 mb-3">{question.prompt}</p>
        <div className="grid grid-cols-1 gap-2">
          {question.options.map((option) => {
            const isSelected = selected === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setSelected(option)}
                className={cn(
                  "rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                  isSelected ? "text-white" : "text-white/80 hover:text-white",
                )}
                style={{
                  borderColor: isSelected
                    ? `rgba(${chrome.accentRgb},0.7)`
                    : "rgba(255,255,255,0.08)",
                  background: isSelected
                    ? `rgba(${chrome.accentRgb},0.18)`
                    : "rgba(255,255,255,0.03)",
                }}
              >
                {option}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onSkip}
            className="font-mono text-[10px] uppercase tracking-widest text-white/35 hover:text-white/60"
          >
            {chrome.skipLabel}
          </button>
          <button
            type="button"
            onClick={handleLog}
            disabled={!selected || isSubmitting}
            className="rounded-lg border px-3 py-2 text-sm font-medium disabled:opacity-40"
            style={{
              borderColor: `rgba(${chrome.accentRgb},0.45)`,
              background: `rgba(${chrome.accentRgb},0.16)`,
              color: `rgb(${chrome.accentRgb})`,
            }}
          >
            {isSubmitting ? "Logging…" : chrome.logLabel}
          </button>
        </div>
      </div>
    </section>
  );
}
