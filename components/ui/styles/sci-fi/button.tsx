import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SciFiButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
  variant?: "primary" | "secondary"
}

export function SciFiButton({ 
  children, 
  active = false, 
  variant = "primary",
  className,
  ...props 
}: SciFiButtonProps) {
  return (
    <Button
      className={cn(
        "relative overflow-hidden transition-all duration-200",
        active 
          ? "bg-cyan-950 text-cyan-400 border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.1)]" 
          : "bg-slate-900 hover:bg-slate-800",
        variant === "secondary" && "border-red-500/50 text-red-400",
        className
      )}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      {active && (
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-600/10 to-transparent" />
      )}
    </Button>
  )
}

