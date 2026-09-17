interface SciFiPanelProps {
  children: React.ReactNode
  variant?: "primary" | "secondary"
  className?: string
};

export function SciFiPanel({ children, variant = "primary", className = "" }: SciFiPanelProps) {
  return (
    <div className={`
      relative rounded-lg overflow-hidden
      ${variant === "primary" 
        ? "bg-slate-900/80 border border-cyan-500/20" 
        : "bg-slate-800/60 border border-red-500/20"}
      ${className}
    `}>
      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-cyan-500/50" />
      <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-cyan-500/50" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-cyan-500/50" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-cyan-500/50" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Glowing Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />
    </div>
  );
};