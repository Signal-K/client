interface SectionLabelProps {
  text: string;
  right?: React.ReactNode;
}

export function SectionLabel({ text, right }: SectionLabelProps) {
  return (
    <div className="mb-2 flex items-center justify-between gap-3 sm:mb-3">
      <div className="flex items-center gap-2 min-w-0">
        {/* Diamond marker — physical panel label style */}
        <span className="shrink-0 text-[8px] text-primary/50 leading-none" aria-hidden>◆</span>
        <span className="shrink-0 font-mono text-[8px] font-bold uppercase tracking-[0.24em] text-muted-foreground/60 sm:text-[9px] sm:tracking-[0.28em]">
          {text}
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-border/60 to-transparent" />
      </div>
      {right && (
        <div className="shrink-0 font-mono text-[9px] text-muted-foreground/40">{right}</div>
      )}
    </div>
  );
}
