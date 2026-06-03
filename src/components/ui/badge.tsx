import * as React from "react"

import { cn } from "../../lib/utils"

type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "success" | "warning"

const VARIANT: Record<BadgeVariant, string> = {
    default:     "border-transparent bg-primary text-primary-foreground",
    secondary:   "border-transparent bg-secondary text-secondary-foreground",
    destructive: "border-transparent bg-error text-error-foreground",
    outline:     "border-border bg-transparent text-foreground",
    success:     "border-success-border bg-success text-success-text",
    warning:     "border-warning-border bg-warning text-warning-text",
}

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
    ({ className, variant = "default", ...props }, ref) => (
        <span
            ref={ref}
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-none whitespace-nowrap",
                VARIANT[variant],
                className,
            )}
            {...props}
        />
    )
)
Badge.displayName = "Badge"
