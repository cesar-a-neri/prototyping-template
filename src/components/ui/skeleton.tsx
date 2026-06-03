import * as React from "react"

import { cn } from "../../lib/utils"

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
    <div className={cn("animate-pulse rounded-md bg-muted", className)} aria-hidden="true" {...props} />
)
