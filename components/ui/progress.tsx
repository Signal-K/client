"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress };

interface ProgressBarProps {
  progress: number
  total: number
  showPercentage?: boolean
};

export function JournalProgressBar({ progress, total, showPercentage = false }: ProgressBarProps) {
  const percentage = Math.round((progress / total) * 100)
  
  return (
    <div className="w-full bg-[#2C4F64]/20 rounded-full h-2.5 my-2">
      <div
        className="bg-[#5FCBC3] h-2.5 rounded-full transition-all duration-300 ease-in-out"
        style={{ width: `${percentage}%` }}
      />
      {showPercentage && (
        <div className="text-xs text-[#5FCBC3] mt-1">
          {percentage}% complete
        </div>
      )}
    </div>
  );
};