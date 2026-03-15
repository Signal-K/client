import { cn } from "@/src/shared/utils";

type StationStatus = "online" | "alert" | "standby" | "locked";

interface StationCardProps {
  stationId: string;
  icon: React.ReactNode;
  label: string;
  status: StationStatus;
  statusText: string;
  signalCount?: number;
  accentColor?: "teal" | "amber" | "sky" | "violet" | "muted";
  onClick: () => void;
}

// FTL-style segmented power/signal bar
function SignalSegments({ count, max = 5, color }: { count: number; max?: number; color: string }) {
  return (
    <div className="flex items-end gap-[2px]" aria-hidden>
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "w-1.5 rounded-sm transition-all duration-300",
            i < count ? color : "bg-white/8",
          )}
          style={{ height: `${5 + i * 2}px` }}
        />
      ))}
    </div>
  );
}

const statusConfig: Record<StationStatus, {
  led: string;
  ledGlow: string;
  text: string;
  screenGlow: string;
  segColor: string;
}> = {
  online:  {
    led: "bg-teal-400",
    ledGlow: "shadow-[0_0_6px_rgba(136,192,208,0.9)]",
    text: "text-teal-400",
    screenGlow: "shadow-[inset_0_0_20px_rgba(136,192,208,0.06)]",
    segColor: "bg-teal-400",
  },
  alert:   {
    led: "bg-amber-400 animate-pulse",
    ledGlow: "shadow-[0_0_8px_rgba(251,191,36,1)]",
    text: "text-amber-400",
    screenGlow: "shadow-[inset_0_0_20px_rgba(251,191,36,0.08)]",
    segColor: "bg-amber-400",
  },
  standby: {
    led: "bg-sky-500/60",
    ledGlow: "",
    text: "text-sky-400/70",
    screenGlow: "",
    segColor: "bg-sky-400/50",
  },
  locked:  {
    led: "bg-muted-foreground/20",
    ledGlow: "",
    text: "text-muted-foreground/40",
    screenGlow: "",
    segColor: "bg-muted-foreground/20",
  },
};

const accentConfig: Record<NonNullable<StationCardProps["accentColor"]>, {
  hoverBezel: string;
  iconActive: string;
  scanLine: string;
}> = {
  teal:   { hoverBezel: "hover:border-teal-500/40",   iconActive: "text-teal-300",   scanLine: "rgba(136,192,208,0.45)" },
  amber:  { hoverBezel: "hover:border-amber-500/40",  iconActive: "text-amber-300",  scanLine: "rgba(251,191,36,0.45)"  },
  sky:    { hoverBezel: "hover:border-sky-500/40",    iconActive: "text-sky-300",    scanLine: "rgba(56,189,248,0.45)"  },
  violet: { hoverBezel: "hover:border-violet-500/40", iconActive: "text-violet-300", scanLine: "rgba(167,139,250,0.45)" },
  muted:  { hoverBezel: "hover:border-border/60",     iconActive: "text-foreground/60", scanLine: "rgba(136,192,208,0.25)" },
};

export function StationCard({
  stationId,
  icon,
  label,
  status,
  statusText,
  signalCount,
  accentColor = "teal",
  onClick,
}: StationCardProps) {
  const sc = statusConfig[status];
  const ac = accentConfig[accentColor];
  const isActive = status === "online" || status === "alert";
  const segments = Math.min(signalCount ?? 0, 5);

  return (
    <button
      onClick={onClick}
      className={cn(
        // Outer bezel — physical panel frame
        "group relative flex flex-col rounded-xl border text-left",
        "transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]",
        // Bevel effect: lighter top-left, darker bottom-right
        "border-white/8 bg-gradient-to-br from-white/[0.04] to-black/20",
        "shadow-[inset_1px_1px_0_rgba(255,255,255,0.06),inset_-1px_-1px_0_rgba(0,0,0,0.3)]",
        ac.hoverBezel,
        isActive && sc.screenGlow,
      )}
    >
      {/* Inner screen surface */}
      <div
        className={cn(
          "relative flex flex-col justify-between m-[3px] rounded-lg p-2.5 overflow-hidden",
          "bg-gradient-to-b from-background/60 to-background/90",
          isActive
            ? "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]"
            : "shadow-[inset_0_0_0_1px_rgba(0,0,0,0.3)]",
        )}
        style={{ minHeight: "108px" }}
      >
        {/* Scan-line texture overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.035] z-0"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.4) 2px, rgba(255,255,255,0.4) 3px)",
          }}
        />

        {/* Scan sweep — slides in on hover */}
        <div
          className="absolute left-0 right-0 h-px top-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10"
          style={{
            background: `linear-gradient(90deg, transparent, ${ac.scanLine} 40%, ${ac.scanLine} 60%, transparent)`,
          }}
        />

        {/* Top row: station ID + LED status indicator */}
        <div className="flex items-center justify-between mb-2 relative z-10">
          <span className="font-mono text-[7px] uppercase tracking-[0.2em] text-muted-foreground/30 leading-none truncate">
            {stationId}
          </span>
          {/* LED indicator — Eve Online / FTL style */}
          <div className="flex items-center gap-1 shrink-0">
            {signalCount !== undefined && signalCount > 0 && (
              <span className="font-mono text-[8px] text-amber-400 tabular-nums animate-pulse">
                {signalCount}
              </span>
            )}
            <div
              className={cn("h-2 w-2 rounded-full shrink-0", sc.led, sc.ledGlow)}
              aria-hidden
            />
          </div>
        </div>

        {/* Icon */}
        <div
          className={cn(
            "mb-2 relative z-10 transition-colors duration-200",
            isActive
              ? status === "alert"
                ? "text-amber-400/80"
                : "text-teal-400/80"
              : "text-muted-foreground/30",
            `group-hover:${ac.iconActive}`,
          )}
        >
          {icon}
        </div>

        {/* Station name */}
        <p className="text-sm font-black text-foreground/90 leading-none mb-2 relative z-10">
          {label}
        </p>

        {/* Bottom: status text + signal segments */}
        <div className="flex items-end justify-between relative z-10">
          <span className={cn("text-[10px] font-medium leading-none", sc.text)}>
            {statusText}
          </span>
          {isActive && (
            <SignalSegments
              count={segments > 0 ? segments : (status === "online" ? 2 : 3)}
              color={sc.segColor}
            />
          )}
        </div>
      </div>

      {/* Bottom-edge accent strip */}
      {isActive && (
        <div
          className="absolute bottom-0 left-3 right-3 h-px rounded-full opacity-60"
          style={{
            background: `linear-gradient(90deg, transparent, ${ac.scanLine}, transparent)`,
          }}
        />
      )}
    </button>
  );
}
