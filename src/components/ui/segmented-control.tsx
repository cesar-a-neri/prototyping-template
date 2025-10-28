import * as React from "react"
import { cn } from "../../lib/utils"

interface SegmentedControlProps {
  value: boolean
  onValueChange: (value: boolean) => void
  trueLabel?: string
  falseLabel?: string
  className?: string
}

export const SegmentedControl = React.forwardRef<
  HTMLDivElement,
  SegmentedControlProps
>(({ value, onValueChange, trueLabel = "On", falseLabel = "Off", className }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex h-8 items-center gap-0.5 rounded-md bg-background p-0.5",
        className
      )}
      role="group"
    >
      <button
        type="button"
        onClick={() => onValueChange(false)}
        className={cn(
          "flex-1 h-full rounded px-2.5 py-1 text-xs hover:bg-gray-3 font-medium transition-colors",
          !value
            ? "bg-hover text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        {falseLabel}
      </button>
      <button
        type="button"
        onClick={() => onValueChange(true)}
        className={cn(
          "flex-1 h-full rounded px-2.5 py-1 text-xs hover:bg-gray-3 font-medium transition-colors",
          value
            ? "bg-hover text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        {trueLabel}
      </button>
    </div>
  )
})
SegmentedControl.displayName = "SegmentedControl"
