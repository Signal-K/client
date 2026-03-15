interface SectorBarProps {
  sectorName: string;
  ra?: string;
  dec?: string;
  online: boolean;
  signalCount: number;
}

function sectorCoords(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  const ra = ((hash % 3600) / 10).toFixed(1);
  const dec = (((hash >> 8) % 900) / 10 - 45).toFixed(1);
  return { ra, dec };
}

// Mini signal-strength bar (3 bars)
function SignalBars({ count }: { count: number }) {
  const filled = count > 10 ? 3 : count > 3 ? 2 : count > 0 ? 1 : 0;
  return (
    <div className="flex items-end gap-px" aria-hidden>
      {[1, 2, 3].map((bar) => (
        <div
          key={bar}
          className={`w-1 rounded-sm transition-colors ${
            bar <= filled
              ? "bg-amber-400"
              : "bg-muted-foreground/20"
          }`}
          style={{ height: `${4 + bar * 2}px` }}
        />
      ))}
    </div>
  );
}

export function SectorBar({ sectorName, online, signalCount }: SectorBarProps) {
  const { ra, dec } = sectorCoords(sectorName);

  return (
    <div className="flex items-center justify-between border-b border-primary/8 bg-primary/[0.03] px-4 py-1.5">
      <div className="flex items-center gap-2 min-w-0">
        {/* Status dot */}
        <span
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
            online
              ? "bg-teal-400 shadow-[0_0_4px_rgba(136,192,208,0.8)] animate-pulse-slow"
              : "bg-muted-foreground/30"
          }`}
          aria-hidden
        />
        <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/70 truncate">
          {sectorName}
        </span>
        <span className="font-mono text-[8px] text-muted-foreground/30 tabular-nums shrink-0">
          {ra}° / {Number(dec) >= 0 ? "+" : ""}{dec}°
        </span>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        {signalCount > 0 && (
          <>
            <SignalBars count={signalCount} />
            <span className="font-mono text-[9px] text-amber-400 tabular-nums animate-pulse">
              {signalCount} SIG
            </span>
          </>
        )}
        <span
          className={`font-mono text-[9px] uppercase tracking-widest ${
            online ? "text-teal-400" : "text-muted-foreground/40"
          }`}
        >
          {online ? "ONLINE" : "STANDBY"}
        </span>
      </div>
    </div>
  );
}
