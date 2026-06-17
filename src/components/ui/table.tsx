import * as React from "react"

import { cn } from "../../lib/utils"

export const Table = React.forwardRef<
    HTMLTableElement,
    React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
    <table
        ref={ref}
        className={cn("w-full border-collapse text-sm", className)}
        {...props}
    />
))
Table.displayName = "Table"

export const TableHeader = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <thead ref={ref} className={cn(className)} {...props} />
))
TableHeader.displayName = "TableHeader"

export const TableBody = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn(className)} {...props} />
))
TableBody.displayName = "TableBody"

export const TableRow = React.forwardRef<
    HTMLTableRowElement,
    React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
    <tr
        ref={ref}
        className={cn("border-b border-border last:border-0 transition-colors", className)}
        {...props}
    />
))
TableRow.displayName = "TableRow"

export const TableHead = React.forwardRef<
    HTMLTableCellElement,
    React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
    <th
        ref={ref}
        scope="col"
        className={cn(
            "text-left px-3.5 py-2 text-[11px] font-medium text-muted-foreground border-b border-border whitespace-nowrap",
            className,
        )}
        {...props}
    />
))
TableHead.displayName = "TableHead"

export const TableCell = React.forwardRef<
    HTMLTableCellElement,
    React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
    <td ref={ref} className={cn("px-3.5 py-2.5 align-middle", className)} {...props} />
))
TableCell.displayName = "TableCell"
