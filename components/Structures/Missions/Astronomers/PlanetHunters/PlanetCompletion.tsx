import React, { useState } from "react";
import { CheckCircle, AlertCircle, ArrowRightLeft } from "lucide-react";

interface PlanetProgressProps {
  temperature: number | null;
  radius: number | null;
  biomassScore: number;
  period: string;
}

const getBiomassStage = (score: number) => {
  if (score < 0.1) {
    return {
      label: "Awaiting Catalysts",
      description: "The world is waiting on weather events to spark life.",
      color: "from-gray-500 to-gray-700",
    };
  } else if (score < 0.3) {
    return {
      label: "Microbial Genesis",
      description: "Simple microbial and fungal life is forming.",
      color: "from-green-600 to-green-800",
    };
  } else if (score < 0.5) {
    return {
      label: "Biotic Expansion",
      description: "Life is spreading across the surface.",
      color: "from-teal-500 to-teal-800",
    };
  } else {
    return {
      label: "Ecological Complexity",
      description: "Complex ecosystems and adaptive traits emerging.",
      color: "from-emerald-400 to-emerald-700",
    };
  }
};

export default function PlanetProgress({
  temperature,
  radius,
  biomassScore,
  period,
}: PlanetProgressProps) {
  const [chapter, setChapter] = useState<1 | 2>(1);
  const isConfirmed = {
    temperature: temperature !== null,
    radius: radius !== null,
    biomass: biomassScore !== null && !isNaN(biomassScore),
    period: period !== "",
  };

  const biomassPercent = Math.max(0, Math.min(biomassScore * 100, 100));
  const biomassStage = getBiomassStage(biomassScore);

  return (
    <div className="space-y-6 w-full max-w-xl text-sm text-gray-300 font-medium">
      <div className="flex justify-between items-center">
        <div className="uppercase tracking-wide text-xs text-gray-400">
          Chapter {chapter}
        </div>
        <button
          onClick={() => setChapter(chapter === 1 ? 2 : 1)}
          className="flex items-center space-x-1 px-2 py-1 rounded-lg border border-gray-600 bg-gradient-to-br from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 text-gray-300"
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>Switch</span>
        </button>
      </div>

      {chapter === 1 ? (
        <div>
          <div className="uppercase tracking-wide text-xs text-gray-400 mb-1">
            Planet Data Confirmation
          </div>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(isConfirmed).map(([key, value]) => (
              <div
                key={key}
                className={`flex items-center justify-center py-2 px-3 rounded-xl border text-xs uppercase tracking-wide
                  ${
                    value
                      ? "border-green-400 text-green-300 bg-gradient-to-br from-green-900 to-green-700"
                      : "border-gray-600 text-gray-400 bg-gradient-to-br from-gray-800 to-gray-700"
                  }
                `}
              >
                {value ? <CheckCircle className="w-4 h-4 mr-1" /> : <AlertCircle className="w-4 h-4 mr-1" />}
                {key}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-700 bg-gradient-to-br from-gray-900 to-gray-800 p-4 text-center">
          <div className="text-sm text-gray-400">Values pending for Chapter 2</div>
        </div>
      )}

      <div>
        <div className="uppercase tracking-wide text-xs text-gray-400 mb-1">
          Biomass Evolution
        </div>
        <div className="w-full h-4 rounded-xl bg-gray-800 shadow-inner overflow-hidden border border-gray-600">
          <div
            className={`h-full transition-all duration-700 rounded-xl bg-gradient-to-r ${biomassStage.color}`}
            style={{ width: `${biomassPercent}%` }}
          />
        </div>
        <div className="mt-2">
          <div className="text-sm font-semibold text-white">{biomassStage.label}</div>
          <div className="text-xs text-gray-400">{biomassStage.description}</div>
        </div>
      </div>
    </div>
  );
};