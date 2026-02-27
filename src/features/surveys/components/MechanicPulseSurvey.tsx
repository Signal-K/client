"use client";

import { useMemo, useState } from "react";
import { Gauge, Send, X } from "lucide-react";
import { cn } from "@/src/shared/utils";
import type { MechanicMicroSurvey } from "@/src/features/surveys/types";

type MechanicPulseSurveyProps = {
  survey: MechanicMicroSurvey;
  onSubmit: (answers: Record<string, string>) => Promise<void> | void;
  onDismiss: () => void;
  className?: string;
};

export default function MechanicPulseSurvey({
  survey,
  onSubmit,
  onDismiss,
  className,
}: MechanicPulseSurveyProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const questions = useMemo(
    () => survey.questions.filter((q): q is NonNullable<typeof q> => Boolean(q)),
    [survey.questions]
  );

  const requiredQuestions = useMemo(
    () => questions.filter((q) => q.required !== false),
    [questions]
  );

  const canSubmit = requiredQuestions.every((q) => Boolean(answers[q.id])) && !isSubmitting;

  const handleAnswer = (questionId: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(answers);
    } catch {
      setError("Transmission failed. Try once more.");
      setIsSubmitting(false);
    }
  };

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-cyan-300/25",
        "bg-gradient-to-br from-cyan-950/70 via-slate-950/95 to-indigo-950/70",
        "shadow-[0_0_0_1px_rgba(34,211,238,0.12),0_22px_44px_rgba(0,0,0,0.5)]",
        "p-4 sm:p-5",
        className
      )}
    >
      <div className="absolute -left-10 -top-12 h-28 w-28 rounded-full bg-cyan-400/20 blur-2xl" />
      <div className="absolute -right-10 -bottom-12 h-28 w-28 rounded-full bg-indigo-500/20 blur-2xl" />

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss mechanic survey"
        className="absolute right-3 top-3 rounded-md p-1 text-cyan-100/70 hover:text-cyan-100 hover:bg-cyan-200/10"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="relative pr-7">
        <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-200/85">Mission Debrief</p>
        <div className="mt-2 flex items-start gap-2">
          <Gauge className="mt-0.5 h-5 w-5 text-cyan-300" />
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-cyan-100">{survey.title}</h3>
            <p className="text-sm text-cyan-100/80 mt-1">{survey.subtitle}</p>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {questions.map((question) => (
            <div key={question.id} className="rounded-xl border border-cyan-300/20 bg-slate-950/35 p-3">
              <p className="text-xs sm:text-sm text-cyan-100 font-medium">{question.prompt}</p>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                {question.options.map((option) => {
                  const selected = answers[question.id] === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleAnswer(question.id, option)}
                      className={cn(
                        "rounded-lg border px-2.5 py-2 text-xs sm:text-sm transition-colors",
                        selected
                          ? "border-emerald-300/60 bg-emerald-500/20 text-emerald-100"
                          : "border-cyan-300/30 bg-cyan-500/10 text-cyan-100/90 hover:bg-cyan-500/20"
                      )}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {error && <p className="mt-2 text-xs text-red-300">{error}</p>}

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="inline-flex items-center gap-2 rounded-lg border border-emerald-300/35 bg-emerald-500/20 px-3 py-2 text-sm font-medium text-emerald-100 hover:bg-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
            {isSubmitting ? "Transmitting..." : "Send Debrief"}
          </button>
        </div>
      </div>
    </section>
  );
}
