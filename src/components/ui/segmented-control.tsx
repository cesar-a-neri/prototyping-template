import * as React from "react"
import { cn } from "../../lib/utils"

interface SegmentedOption {
  value: string
  label: React.ReactNode
}

interface SegmentedControlProps {
  /** Boolean mode: a boolean. Options mode: the selected option's `value`. */
  value: boolean | string
  onValueChange: (value: boolean | string) => void
  /**
   * Multi-option mode. When provided, renders one segment per option and emits
   * the chosen option's `value`. When omitted, falls back to the boolean
   * On/Off control driven by `trueLabel` / `falseLabel`.
   */
  options?: SegmentedOption[]
  trueLabel?: string
  falseLabel?: string
  className?: string
  "aria-label"?: string
}

export const SegmentedControl = React.forwardRef<
  HTMLDivElement,
  SegmentedControlProps
>(({ value, onValueChange, options, trueLabel = "On", falseLabel = "Off", className, ...rest }, ref) => {
  const segments: SegmentedOption[] = options ?? [
    { value: "false", label: falseLabel },
    { value: "true", label: trueLabel },
  ]
  const current = options ? String(value) : value ? "true" : "false"
  const emit = (v: string) => {
    if (options) onValueChange(v)
    else onValueChange(v === "true")
  }

  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex h-8 items-center gap-0.5 rounded-md bg-background p-0.5",
        className
      )}
      role="radiogroup"
      {...rest}
    >
      {segments.map((o) => {
        const active = current === o.value
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => emit(o.value)}
            className={cn(
              "flex-1 h-full rounded px-2.5 py-1 text-xs hover:bg-gray-3 font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "bg-hover text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
})
SegmentedControl.displayName = "SegmentedControl"
