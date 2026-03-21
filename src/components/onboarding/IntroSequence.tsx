"use client";

import { useEffect, useState } from "react";

interface IntroSequenceProps {
  onComplete: () => void;
}

// 3-phase CSS-only intro: power-up → signal wave → fade to onboarding
// Total: ~4s. Skip always visible.
const PHASES = [
  { label: "Powering up station…",  duration: 1400 },
  { label: "First signals arriving…", duration: 1400 },
  { label: "Initialising mission…",  duration: 800  },
] as const;

export function IntroSequence({ onComplete }: IntroSequenceProps) {
  const [phase, setPhase] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (phase >= PHASES.length) {
      finish();
      return;
    }
    const t = setTimeout(() => setPhase((p) => p + 1), PHASES[phase].duration);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  function finish() {
    setExiting(true);
    setTimeout(onComplete, 400);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
      style={{ opacity: exiting ? 0 : 1, transition: "opacity 0.4s ease" }}
    >
      {/* Star field backdrop */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-30">
        {Array.from({ length: 40 }, (_, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              width: 1 + (i % 2),
              height: 1 + (i % 2),
              left: `${(Math.sin(i * 127.1) * 43758.5453 % 1 + 1) % 1 * 100}%`,
              top:  `${(Math.sin(i * 311.7 + 1) * 43758.5453 % 1 + 1) % 1 * 100}%`,
              animationDuration: `${2 + (i % 4)}s`,
              animationDelay: `${(i % 6) * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* Station icon — flickers on in phase 0 */}
      <div
        className="mb-8 text-6xl"
        style={{
          opacity: phase >= 1 ? 1 : 0.2,
          transition: "opacity 0.6s ease",
          filter: phase >= 1 ? "drop-shadow(0 0 16px rgba(var(--primary-rgb),0.8))" : "none",
        }}
      >
        🛸
      </div>

      {/* Signal wave — appears in phase 1 */}
      {phase >= 1 && (
        <div className="mb-6 flex gap-1 items-end h-8">
          {Array.from({ length: 12 }, (_, i) => (
            <span
              key={i}
              className="block w-1 rounded-full bg-primary"
              style={{
                height: `${20 + Math.sin(i * 0.8) * 14}px`,
                opacity: 0.4 + (i % 3) * 0.2,
                animation: "pulse-slow 1.2s ease-in-out infinite",
                animationDelay: `${i * 0.08}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Phase label */}
      <p
        className="font-mono text-xs uppercase tracking-[0.3em] text-primary"
        style={{ opacity: phase < PHASES.length ? 1 : 0, transition: "opacity 0.3s" }}
      >
        {PHASES[Math.min(phase, PHASES.length - 1)].label}
      </p>

      {/* Progress dots */}
      <div className="mt-6 flex gap-2">
        {PHASES.map((_, i) => (
          <span
            key={i}
            className="h-1.5 rounded-full transition-all duration-500"
            style={{
              width: phase > i ? 24 : 6,
              background: phase > i ? "rgb(var(--primary-rgb))" : "rgba(var(--primary-rgb),0.3)",
            }}
          />
        ))}
      </div>

      {/* Skip — always visible */}
      <button
        onClick={finish}
        className="absolute bottom-8 right-6 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 hover:text-muted-foreground transition-colors"
      >
        Skip →
      </button>
    </div>
  );
}
