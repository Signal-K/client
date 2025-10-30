"use client";

import React from "react";
import { Progress } from "@/src/components/ui/progress";
import { Check, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { CLASSIFICATION_LABELS, ClassificationDiversityProgress } from "@/src/types/achievement";

interface ClassificationDiversityWidgetProps {
  data: ClassificationDiversityProgress;
}

export default function ClassificationDiversityWidget({ data }: ClassificationDiversityWidgetProps) {
  const router = useRouter();

  const progressPercent = (data.completed / data.total) * 100;

  return (
    <div className="p-4 bg-card/30 rounded-lg border border-[#5fcbc3]/20 space-y-3">
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-1">Classification Diversity</h4>
        <p className="text-xs text-muted-foreground">Complete at least one of each type</p>
      </div>

      <Progress value={progressPercent} className="h-2" />

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {data.classifications.map((classification: any) => (
          <div
            key={classification.type}
            className={`flex items-start justify-between gap-2 p-2 rounded text-xs ${
              classification.isComplete
                ? "bg-[#5fcbc3]/10"
                : "bg-[#2c4f64]/20"
            }`}
          >
            <div className="flex items-start gap-2 flex-1 min-w-0">
              {classification.isComplete ? (
                <Check className="h-3 w-3 flex-shrink-0 text-[#5fcbc3] mt-0.5" />
              ) : (
                <div className="h-3 w-3 flex-shrink-0 mt-0.5 rounded-full border border-gray-500" />
              )}
              <div className="flex-1 min-w-0">
                <div className={`font-medium truncate ${classification.isComplete ? "text-[#5fcbc3]" : "text-gray-400"}`}>
                  {CLASSIFICATION_LABELS[classification.type as keyof typeof CLASSIFICATION_LABELS] || classification.type}
                </div>
                {!classification.isComplete && (
                  <div className="text-[10px] text-gray-500 mt-0.5">{classification.hint}</div>
                )}
                {classification.isComplete && (
                  <div className="text-[10px] text-[#5fcbc3]/70 mt-0.5">
                    {classification.count} completed
                  </div>
                )}
              </div>
            </div>
            {!classification.isComplete && (
              <button
                onClick={() => router.push(classification.route)}
                className="flex-shrink-0 text-[#5fcbc3] hover:text-[#5fcbc3]/80"
                title="Go to project"
              >
                <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
