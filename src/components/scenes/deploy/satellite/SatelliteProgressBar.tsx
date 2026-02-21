import React, { useMemo } from "react";

interface SatelliteProgressBarProps {
  deployTime: Date | string;
  now?: Date;
  height?: number | string;
  width?: number | string;
  investigationType?: "planet" | "weather";
  classification?: {
    id?: number | string;
    media?: any;
    anomaly?: number;
  };
  classificationId?: number | string;
  hideStepCards?: boolean;
  style?: React.CSSProperties;
  parentWidth?: number;
}

type MissionStep = {
  label: string;
  atMinutes: number;
  detail: string;
};

const PLANET_STEPS: MissionStep[] = [
  { label: "Deploy", atMinutes: 0, detail: "Satellite enters orbit." },
  { label: "Star Scan", atMinutes: 12, detail: "Stellar properties sampled." },
  { label: "Transit Fit", atMinutes: 24, detail: "Transit period/depth estimated." },
  { label: "Planet Stats", atMinutes: 40, detail: "Mass, radius, density resolved." },
  { label: "Ready", atMinutes: 60, detail: "Classification payload ready." },
];

const WEATHER_STEPS: MissionStep[] = [
  { label: "Deploy", atMinutes: 0, detail: "Satellite enters target track." },
  { label: "Scan", atMinutes: 10, detail: "Atmospheric scan begins." },
  { label: "Anomaly", atMinutes: 25, detail: "Cloud/vortex candidate found." },
  { label: "Rescan", atMinutes: 40, detail: "Secondary pass running." },
  { label: "Ready", atMinutes: 60, detail: "New weather task available." },
];

export default function SatelliteProgressBar(props: SatelliteProgressBarProps) {
  const {
    deployTime,
    now,
    height = 12,
    width = "100%",
    investigationType = "planet",
    hideStepCards = false,
    classificationId,
    style,
  } = props;

  const steps = investigationType === "weather" ? WEATHER_STEPS : PLANET_STEPS;
  const totalMs = steps[steps.length - 1].atMinutes * 60 * 1000;

  const start = typeof deployTime === "string" ? new Date(deployTime) : deployTime;
  const current = now ?? new Date();
  const elapsed = Math.max(0, current.getTime() - start.getTime());
  const progress = Math.max(0, Math.min(100, (elapsed / totalMs) * 100));
  const complete = progress >= 100;

  const activeStepIndex = useMemo(() => {
    const elapsedMinutes = elapsed / 60000;
    let idx = 0;
    for (let i = 0; i < steps.length; i += 1) {
      if (elapsedMinutes >= steps[i].atMinutes) idx = i;
    }
    return idx;
  }, [elapsed, steps]);

  const label = useMemo(() => {
    if (complete) return "Mission complete";
    const remainingMs = Math.max(0, totalMs - elapsed);
    const mins = Math.ceil(remainingMs / 60000);
    return `${mins}m remaining`;
  }, [complete, elapsed, totalMs]);

  return (
    <div style={{ width, ...style }}>
      <div className="mb-2 flex items-center justify-between text-xs text-white/80">
        <span>{label}</span>
        <span className="text-cyan-300">{steps[activeStepIndex]?.label}</span>
      </div>

      <div className="relative w-full overflow-hidden rounded-full bg-white/20" style={{ height }}>
        <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 transition-all duration-700" style={{ width: `${progress}%` }} />
      </div>

      {!hideStepCards ? (
        <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-5">
          {steps.map((step, index) => {
            const isDone = index < activeStepIndex || complete;
            const isActive = index === activeStepIndex && !complete;
            return (
              <div
                key={step.label}
                className={`rounded-md border p-2 text-xs ${
                  isDone
                    ? "border-cyan-400/60 bg-cyan-500/10 text-cyan-100"
                    : isActive
                      ? "border-blue-300/70 bg-blue-500/10 text-blue-100"
                      : "border-white/10 bg-white/5 text-white/60"
                }`}
              >
                <div className="font-semibold">{step.label}</div>
                <div className="mt-1 leading-snug">{step.detail}</div>
              </div>
            );
          })}
        </div>
      ) : null}

      {classificationId ? (
        <div className="mt-2 text-[11px] text-white/60">Linked classification #{String(classificationId)}</div>
      ) : null}
    </div>
  );
}
