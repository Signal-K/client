import { ChevronLeft } from "lucide-react";
import { getStationChrome } from "./station-chrome";

interface ViewportHeaderProps {
  label: string;
  stationId: string;
  onBack: () => void;
}

export function ViewportHeader({ label, stationId, onBack }: ViewportHeaderProps) {
  const meta = getStationChrome(stationId);
  const title = meta.moduleId === "MOD-??" ? label : meta.full;

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md animate-fade-in"
      style={{
        background: "linear-gradient(180deg, rgba(4,10,22,0.97) 0%, rgba(4,10,22,0.93) 100%)",
        borderBottom: `1px solid ${meta.borderColor}`,
        boxShadow: `0 1px 0 ${meta.borderColor}, 0 4px 16px rgba(0,0,0,0.4)`,
      }}
    >
      {/* Bottom edge — accent color of this module */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent 0%, rgba(${meta.accentRgb},0.4) 30%, rgba(${meta.accentRgb},0.5) 50%, rgba(${meta.accentRgb},0.4) 70%, transparent 100%)`,
        }}
        aria-hidden
      />

      <div className="flex items-center gap-3 px-4 py-3">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 transition-colors group"
          style={{ color: "rgba(255,255,255,0.35)" }}
          aria-label="Return to mission control"
        >
          <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          <span
            className="font-mono text-[9px] uppercase tracking-widest group-hover:opacity-100 transition-opacity"
            style={{ color: "rgba(136,192,208,0.5)" }}
          >
            Control
          </span>
        </button>

        {/* Divider */}
        <div className="h-4 w-px" style={{ background: "rgba(255,255,255,0.08)" }} aria-hidden />

        {/* Module info */}
        <div>
          <p
            className="font-mono text-[7px] uppercase tracking-[0.28em] leading-none mb-0.5"
            style={{ color: `rgba(${meta.accentRgb},0.6)` }}
          >
            {meta.moduleId}
          </p>
          <p
            className="text-sm font-black leading-none"
            style={{ color: "rgba(255,255,255,0.9)" }}
          >
            {title}
          </p>
        </div>

        {/* Right: live indicator */}
        <div className="ml-auto flex items-center gap-1.5">
          <div
            className="h-1.5 w-1.5 rounded-full animate-pulse"
            style={{
              background: `rgb(${meta.accentRgb})`,
              boxShadow: `0 0 6px rgba(${meta.accentRgb},0.9)`,
            }}
            aria-hidden
          />
          <span
            className="font-mono text-[8px] uppercase tracking-widest"
            style={{ color: `rgba(${meta.accentRgb},0.6)` }}
          >
            Active
          </span>
        </div>
      </div>
    </header>
  );
}
