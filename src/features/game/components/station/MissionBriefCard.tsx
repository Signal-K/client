import { ArrowRight } from "lucide-react";
import { cn } from "@/src/shared/utils";

type BriefVariant = "alert" | "progress" | "nominal" | "boot";

interface MissionBriefCardProps {
  variant: BriefVariant;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  progress?: number;
}

const variantConfig: Record<BriefVariant, {
  outerBorder: string;
  innerBg: string;
  accentLine: string;
  headerBg: string;
  ledColor: string;
  ledGlow: string;
  label: string;
  labelColor: string;
  actionStyle: string;
}> = {
  alert: {
    outerBorder: "border-amber-500/40",
    innerBg: "bg-amber-950/20",
    accentLine: "bg-amber-400",
    headerBg: "bg-amber-500/8",
    ledColor: "bg-amber-400 animate-pulse",
    ledGlow: "shadow-[0_0_8px_rgba(251,191,36,1),0_0_16px_rgba(251,191,36,0.4)]",
    label: "INCOMING TRANSMISSION",
    labelColor: "text-amber-400",
    actionStyle: "bg-amber-500 hover:bg-amber-400 text-black font-black shadow-[0_0_12px_rgba(251,191,36,0.4)]",
  },
  progress: {
    outerBorder: "border-primary/25",
    innerBg: "bg-teal-950/10",
    accentLine: "bg-primary",
    headerBg: "bg-primary/5",
    ledColor: "bg-primary animate-pulse-slow",
    ledGlow: "shadow-[0_0_6px_rgba(136,192,208,0.9)]",
    label: "MISSION IN PROGRESS",
    labelColor: "text-primary",
    actionStyle: "bg-primary hover:bg-primary/90 text-primary-foreground",
  },
  nominal: {
    outerBorder: "border-teal-500/20",
    innerBg: "bg-teal-950/5",
    accentLine: "bg-teal-400/60",
    headerBg: "bg-teal-500/5",
    ledColor: "bg-teal-400",
    ledGlow: "shadow-[0_0_5px_rgba(136,192,208,0.7)]",
    label: "SYSTEMS NOMINAL",
    labelColor: "text-teal-400",
    actionStyle: "bg-teal-500 hover:bg-teal-400 text-black",
  },
  boot: {
    outerBorder: "border-border/30",
    innerBg: "bg-transparent",
    accentLine: "bg-muted-foreground/20",
    headerBg: "bg-muted/10",
    ledColor: "bg-muted-foreground/30",
    ledGlow: "",
    label: "AWAITING DEPLOYMENT",
    labelColor: "text-muted-foreground/50",
    actionStyle: "bg-primary hover:bg-primary/90 text-primary-foreground",
  },
};

export function MissionBriefCard({
  variant,
  title,
  subtitle,
  actionLabel,
  onAction,
  progress,
}: MissionBriefCardProps) {
  const v = variantConfig[variant];

  return (
    <div
      className={cn(
        "rounded-xl border overflow-hidden",
        "shadow-[inset_1px_1px_0_rgba(255,255,255,0.04),inset_-1px_-1px_0_rgba(0,0,0,0.2)]",
        v.outerBorder,
      )}
    >
      {/* Top accent bar */}
      <div className={cn("h-[2px] w-full", v.accentLine)} />

      {/* Header row */}
      <div className={cn("flex items-center gap-2.5 px-4 py-2.5 border-b border-inherit", v.headerBg)}>
        <div className={cn("h-2 w-2 rounded-full shrink-0", v.ledColor, v.ledGlow)} aria-hidden />
        <span className={cn("font-mono text-[8px] uppercase tracking-[0.28em] leading-none", v.labelColor)}>
          {v.label}
        </span>
        {/* Right: scan-line decoration */}
        <div className="flex-1 flex items-center gap-px justify-end opacity-30" aria-hidden>
          {[4, 8, 6, 10, 7, 5, 9, 6, 4].map((h, i) => (
            <div
              key={i}
              className={cn("w-px rounded-full", v.accentLine)}
              style={{ height: `${h}px` }}
            />
          ))}
        </div>
      </div>

      {/* Body */}
      <div className={cn("px-4 pt-3 pb-4", v.innerBg)}>
        <p className="text-xl font-black leading-tight text-foreground mb-1.5">{title}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground leading-relaxed mb-4">{subtitle}</p>
        )}

        {/* Progress bar */}
        {typeof progress === "number" && (
          <div className="mb-4">
            <div className="h-1.5 w-full rounded-full bg-black/30 overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700 relative overflow-hidden"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              >
                {/* Shimmer on bar */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </div>
            </div>
            <div className="mt-1 flex justify-between font-mono text-[8px] text-muted-foreground/40">
              <span>PROGRESS</span>
              <span>{progress}%</span>
            </div>
          </div>
        )}

        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-black uppercase tracking-wider transition-all duration-150 active:scale-95",
              v.actionStyle,
            )}
          >
            {actionLabel}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </button>
        )}
      </div>
    </div>
  );
}
