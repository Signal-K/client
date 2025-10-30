"use client";

import React from "react";
import { Progress } from "@/src/components/ui/progress";
import { Check } from "lucide-react";
import { ResourceExtractionProgress } from "@/src/types/achievement";

interface ResourceExtractionWidgetProps {
  data: ResourceExtractionProgress;
}

export default function ResourceExtractionWidget({ data }: ResourceExtractionWidgetProps) {
  const progressPercent = (data.extracted / data.total) * 100;

  return (
    <div className="p-4 bg-card/30 rounded-lg border border-[#5fcbc3]/20 space-y-3">
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-1">Resource Extraction</h4>
        <p className="text-xs text-muted-foreground">Extract at least one of each mineral type</p>
      </div>

      <Progress value={progressPercent} className="h-2" />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
        {data.resources.map((resource: any) => (
          <div
            key={resource.type}
            className={`flex items-center gap-2 p-2 rounded text-xs ${
              resource.isExtracted
                ? "bg-[#5fcbc3]/10 text-[#5fcbc3]"
                : "bg-[#2c4f64]/20 text-gray-400"
            }`}
          >
            {resource.isExtracted ? (
              <Check className="h-3 w-3 flex-shrink-0" />
            ) : (
              <div className="h-3 w-3 flex-shrink-0 rounded-full border border-gray-500" />
            )}
            <span className="truncate">{resource.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
