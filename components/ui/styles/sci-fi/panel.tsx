interface SciFiPanelProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
}

export function SciFiPanel({
  children,
  variant = "primary",
  className = "",
}: SciFiPanelProps) {
  return (
    <div
      className={`
        relative rounded-2xl overflow-hidden p-4 shadow-md
        border ${variant === "primary" ? "border-[#B4CDE5]" : "border-[#D8DEE9]"}
        ${className}
      `}
      style={{
        background: "linear-gradient(135deg, #E5EEF4, #D8E5EC)",
        color: "#2E3440",
        boxShadow:
          "inset 0 1px 2px rgba(255,255,255,0.4), 0 2px 6px rgba(0,0,0,0.05)",
      }}
    >
      {/* Decorative corners (glow + seam) */}
      <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-[#81A1C1]/30 rounded-tl-lg shadow-[inset_0_0_4px_#81A1C1] pointer-events-none" />
      <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-[#81A1C1]/30 rounded-tr-lg shadow-[inset_0_0_4px_#81A1C1] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-[#81A1C1]/30 rounded-bl-lg shadow-[inset_0_0_4px_#81A1C1] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-[#81A1C1]/30 rounded-br-lg shadow-[inset_0_0_4px_#81A1C1] pointer-events-none" />

      {/* Top glow indicator bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#A3BE8C] via-[#81A1C1] to-[#D08770] opacity-20 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 space-y-2">{children}</div>
    </div>
  );
};