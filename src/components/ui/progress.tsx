import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  threshold?: number;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, threshold, ...props }, ref) => (
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
      style={{ transform: `translateX(${100 - (value || 0)}%)`}}
    />
    {threshold !== undefined && threshold > 0 && threshold < 100 && (
      <div
        className="absolute top-0 h-full w-0.5 bg-amber-500 z-10 flex items-center justify-center"
        style={{ right: `${100 - threshold}%` }}
        title="מינימום נדרש לסיום"
      >
        <div className="w-2 h-2 bg-amber-500 rounded-full -mt-1 shadow-sm" />
      </div>
    )}
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
