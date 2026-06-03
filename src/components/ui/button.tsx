import * as React from "react"

import { cn } from "../../lib/utils"

type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
type ButtonSize = "default" | "sm" | "lg" | "icon"

const VARIANT: Record<ButtonVariant, string> = {
    default:     "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive: "bg-error text-error-foreground hover:bg-error/90",
    outline:     "border border-border bg-card text-foreground hover:bg-muted",
    secondary:   "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost:       "bg-transparent text-foreground hover:bg-muted",
    link:        "bg-transparent text-primary underline-offset-4 hover:underline",
}

const SIZE: Record<ButtonSize, string> = {
    default: "h-9 px-4 py-2",
    sm:      "h-8 rounded-md px-3 text-xs",
    lg:      "h-10 rounded-md px-8",
    icon:    "size-9",
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant
    size?: ButtonSize
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", type, ...props }, ref) => (
        <button
            ref={ref}
            type={type ?? "button"}
            className={cn(
                "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                "disabled:pointer-events-none disabled:opacity-50",
                "[&_svg]:pointer-events-none [&_svg]:shrink-0",
                VARIANT[variant],
                SIZE[size],
                className,
            )}
            {...props}
        />
    )
)
Button.displayName = "Button"
