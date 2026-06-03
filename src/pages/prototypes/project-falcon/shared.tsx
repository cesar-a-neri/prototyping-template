// Falcon-specific helpers + semantic badge wrappers. Atoms (Button, Badge,
// Input, Label, Checkbox, Tabs) live in `@/components/ui` — this file only
// adds Falcon-specific semantic colour mappings on top of them.

import React from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { HealthBucket, Tier, Workspace } from './types';
import { fStaleness, deployments, workspaces } from './data';

// ── tokens ──────────────────────────────────────────────────────────────

// Shadcn zinc palette overrides applied to the prototype root, so any inline
// `var(--*)` reference (and every Tailwind semantic class) reads as canonical
// shadcn rather than whatever the host theme is. Set on the outermost wrapper
// only — children inherit, so page wrappers don't need to repeat it.
const SHAD_FONT_TOKENS = {
    ['--font-sans' as never]: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
    ['--font-mono' as never]: 'ui-monospace, "SF Mono", Menlo, monospace',
    fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
};

// Precomputed diagonal-hatch background-image data URLs (one per theme), so
// `hatchStyle()` can reference a CSS variable and switch automatically when
// the theme flips. Geometry is identical between modes — only the stroke
// colour changes.
const HATCH_GAP_PX = +(4 * Math.SQRT2).toFixed(3); // 5.657
function buildHatchUrl(line: string): string {
    const p = HATCH_GAP_PX;
    const svg =
        `<svg xmlns='http://www.w3.org/2000/svg' width='${p}' height='${p}' shape-rendering='geometricPrecision'>` +
        `<path d='M-1,1 L1,-1 M0,${p} L${p},0 M${p - 1},${p + 1} L${p + 1},${p - 1}' ` +
        `stroke='${line}' stroke-width='1.6'/></svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

export const SHAD_VARS_LIGHT: React.CSSProperties = {
    // shadcn zinc — light
    ['--background' as never]: '#ffffff',
    ['--foreground' as never]: '#09090b',
    ['--card' as never]: '#ffffff',
    ['--card-foreground' as never]: '#09090b',
    ['--muted' as never]: '#f4f4f5',
    ['--muted-foreground' as never]: '#71717a',
    ['--secondary' as never]: '#f4f4f5',
    ['--secondary-foreground' as never]: '#18181b',
    ['--border' as never]: '#e4e4e7',
    ['--input' as never]: '#e4e4e7',
    ['--primary' as never]: '#18181b',
    ['--primary-foreground' as never]: '#fafafa',
    ['--accent' as never]: '#f4f4f5',
    ['--accent-foreground' as never]: '#18181b',
    ['--ring' as never]: '#a1a1aa',

    // Falcon health-severity surfaces — light
    // (`tint` = row default, `hover` = a slightly stronger wash for hovered rows)
    ['--sev-failed-fg'    as never]: '#b91c1c',
    ['--sev-failed-bg'    as never]: '#fef2f2',
    ['--sev-failed-bd'    as never]: '#fecaca',
    ['--sev-failed-dot'   as never]: '#ef4444',
    ['--sev-failed-tint'  as never]: '#fef8f8',
    ['--sev-failed-hover' as never]: '#fdf3f3',

    ['--sev-degraded-fg'    as never]: '#b45309',
    ['--sev-degraded-bg'    as never]: '#fffbeb',
    ['--sev-degraded-bd'    as never]: '#fde68a',
    ['--sev-degraded-dot'   as never]: '#f59e0b',
    ['--sev-degraded-tint'  as never]: '#fffdf5',
    ['--sev-degraded-hover' as never]: '#fefaed',

    ['--sev-stale-fg'    as never]: '#475569',
    ['--sev-stale-bg'    as never]: '#f8fafc',
    ['--sev-stale-bd'    as never]: '#e2e8f0',
    ['--sev-stale-dot'   as never]: '#64748b',
    ['--sev-stale-tint'  as never]: '#fcfdfe',
    ['--sev-stale-hover' as never]: '#f7f9fb',

    ['--sev-healthy-fg'    as never]: '#52525b',
    ['--sev-healthy-bg'    as never]: '#fafafa',
    ['--sev-healthy-bd'    as never]: '#e4e4e7',
    ['--sev-healthy-dot'   as never]: '#a1a1aa',
    ['--sev-healthy-tint'  as never]: 'transparent',
    ['--sev-healthy-hover' as never]: '#fafafa',

    // Pack-deployment status pills — light
    ['--pack-deployed-fg'  as never]: '#15803d',
    ['--pack-deployed-bg'  as never]: '#f0fdf4',
    ['--pack-deployed-bd'  as never]: '#bbf7d0',
    ['--pack-deployed-dot' as never]: '#16a34a',

    ['--pack-progressing-fg'  as never]: '#b45309',
    ['--pack-progressing-bg'  as never]: '#fffbeb',
    ['--pack-progressing-bd'  as never]: '#fde68a',
    ['--pack-progressing-dot' as never]: '#f59e0b',

    ['--pack-crash-fg'  as never]: '#b91c1c',
    ['--pack-crash-bg'  as never]: '#fef2f2',
    ['--pack-crash-bd'  as never]: '#fecaca',
    ['--pack-crash-dot' as never]: '#ef4444',

    ['--pack-unknown-fg'  as never]: '#475569',
    ['--pack-unknown-bg'  as never]: '#f8fafc',
    ['--pack-unknown-bd'  as never]: '#e2e8f0',
    ['--pack-unknown-dot' as never]: '#64748b',

    // Customer-tier badges — light
    ['--tier-p0-bg' as never]: '#18181b',
    ['--tier-p0-fg' as never]: '#fafafa',
    ['--tier-p1-bg' as never]: '#a1a1aa',
    ['--tier-p1-fg' as never]: '#fafafa',
    ['--tier-p2-bg' as never]: '#e4e4e7',
    ['--tier-p2-fg' as never]: '#3f3f46',

    // Diagonal-hatch distribution bars — light
    ['--hatch-bg'      as never]: '#bababa',
    ['--hatch-pattern' as never]: buildHatchUrl('#666666'),

    ...SHAD_FONT_TOKENS,
    color: '#09090b',
    background: '#ffffff',
};

export const SHAD_VARS_DARK: React.CSSProperties = {
    // shadcn zinc — dark
    ['--background' as never]: '#09090b',
    ['--foreground' as never]: '#fafafa',
    ['--card' as never]: '#18181b',
    ['--card-foreground' as never]: '#fafafa',
    ['--muted' as never]: '#27272a',
    ['--muted-foreground' as never]: '#a1a1aa',
    ['--secondary' as never]: '#27272a',
    ['--secondary-foreground' as never]: '#fafafa',
    ['--border' as never]: '#27272a',
    ['--input' as never]: '#27272a',
    ['--primary' as never]: '#fafafa',
    ['--primary-foreground' as never]: '#18181b',
    ['--accent' as never]: '#27272a',
    ['--accent-foreground' as never]: '#fafafa',
    ['--ring' as never]: '#d4d4d8',

    // Falcon health-severity surfaces — dark (deep-tinted backgrounds, light
    // foreground text, same vivid dots for instant recognition).
    // `hover` is a small step brighter than `tint` so hovered rows feel like
    // a subtle lift, not a flashbang.
    ['--sev-failed-fg'    as never]: '#fca5a5',
    ['--sev-failed-bg'    as never]: '#450a0a',
    ['--sev-failed-bd'    as never]: '#7f1d1d',
    ['--sev-failed-dot'   as never]: '#ef4444',
    ['--sev-failed-tint'  as never]: '#1f0a0c',
    ['--sev-failed-hover' as never]: '#2a1416',

    ['--sev-degraded-fg'    as never]: '#fcd34d',
    ['--sev-degraded-bg'    as never]: '#451a03',
    ['--sev-degraded-bd'    as never]: '#92400e',
    ['--sev-degraded-dot'   as never]: '#f59e0b',
    ['--sev-degraded-tint'  as never]: '#1c1308',
    ['--sev-degraded-hover' as never]: '#2a1f12',

    ['--sev-stale-fg'    as never]: '#94a3b8',
    ['--sev-stale-bg'    as never]: '#1e293b',
    ['--sev-stale-bd'    as never]: '#334155',
    ['--sev-stale-dot'   as never]: '#64748b',
    ['--sev-stale-tint'  as never]: '#13182b',
    ['--sev-stale-hover' as never]: '#1c2238',

    ['--sev-healthy-fg'    as never]: '#a1a1aa',
    ['--sev-healthy-bg'    as never]: '#1f1f23',
    ['--sev-healthy-bd'    as never]: '#3f3f46',
    ['--sev-healthy-dot'   as never]: '#71717a',
    ['--sev-healthy-tint'  as never]: 'transparent',
    ['--sev-healthy-hover' as never]: '#27272a',

    // Pack-deployment status pills — dark
    ['--pack-deployed-fg'  as never]: '#86efac',
    ['--pack-deployed-bg'  as never]: '#052e16',
    ['--pack-deployed-bd'  as never]: '#14532d',
    ['--pack-deployed-dot' as never]: '#16a34a',

    ['--pack-progressing-fg'  as never]: '#fcd34d',
    ['--pack-progressing-bg'  as never]: '#451a03',
    ['--pack-progressing-bd'  as never]: '#92400e',
    ['--pack-progressing-dot' as never]: '#f59e0b',

    ['--pack-crash-fg'  as never]: '#fca5a5',
    ['--pack-crash-bg'  as never]: '#450a0a',
    ['--pack-crash-bd'  as never]: '#7f1d1d',
    ['--pack-crash-dot' as never]: '#ef4444',

    ['--pack-unknown-fg'  as never]: '#94a3b8',
    ['--pack-unknown-bg'  as never]: '#1e293b',
    ['--pack-unknown-bd'  as never]: '#334155',
    ['--pack-unknown-dot' as never]: '#64748b',

    // Customer-tier badges — dark
    ['--tier-p0-bg' as never]: '#fafafa',
    ['--tier-p0-fg' as never]: '#18181b',
    ['--tier-p1-bg' as never]: '#71717a',
    ['--tier-p1-fg' as never]: '#fafafa',
    ['--tier-p2-bg' as never]: '#3f3f46',
    ['--tier-p2-fg' as never]: '#d4d4d8',

    // Diagonal-hatch distribution bars — dark
    ['--hatch-bg'      as never]: '#3f3f46',
    ['--hatch-pattern' as never]: buildHatchUrl('#a1a1aa'),

    ...SHAD_FONT_TOKENS,
    color: '#fafafa',
    background: '#09090b',
};

// Back-compat alias — defaults to light. New code should pick a variant.
export const SHAD_VARS = SHAD_VARS_LIGHT;

// Falcon-specific semantic colours. The actual values live in CSS variables
// (defined in `SHAD_VARS_LIGHT` / `SHAD_VARS_DARK` on the prototype root); the
// strings below are `var(--…)` references that resolve to the right surface
// for the current theme.
export const SHAD_SEV: Record<HealthBucket, {
    label: string; dot: string; fg: string; bg: string; bd: string; tint: string; hover: string;
}> = {
    failed:   { label: 'Failed',   dot: 'var(--sev-failed-dot)',   fg: 'var(--sev-failed-fg)',   bg: 'var(--sev-failed-bg)',   bd: 'var(--sev-failed-bd)',   tint: 'var(--sev-failed-tint)',   hover: 'var(--sev-failed-hover)'   },
    degraded: { label: 'Degraded', dot: 'var(--sev-degraded-dot)', fg: 'var(--sev-degraded-fg)', bg: 'var(--sev-degraded-bg)', bd: 'var(--sev-degraded-bd)', tint: 'var(--sev-degraded-tint)', hover: 'var(--sev-degraded-hover)' },
    stale:    { label: 'Stale',    dot: 'var(--sev-stale-dot)',    fg: 'var(--sev-stale-fg)',    bg: 'var(--sev-stale-bg)',    bd: 'var(--sev-stale-bd)',    tint: 'var(--sev-stale-tint)',    hover: 'var(--sev-stale-hover)'    },
    healthy:  { label: 'Healthy',  dot: 'var(--sev-healthy-dot)',  fg: 'var(--sev-healthy-fg)',  bg: 'var(--sev-healthy-bg)',  bd: 'var(--sev-healthy-bd)',  tint: 'var(--sev-healthy-tint)',  hover: 'var(--sev-healthy-hover)'  },
};

export const SHAD_PACK = {
    Deployed:         { fg: 'var(--pack-deployed-fg)',    bg: 'var(--pack-deployed-bg)',    bd: 'var(--pack-deployed-bd)',    dot: 'var(--pack-deployed-dot)'    },
    Progressing:      { fg: 'var(--pack-progressing-fg)', bg: 'var(--pack-progressing-bg)', bd: 'var(--pack-progressing-bd)', dot: 'var(--pack-progressing-dot)' },
    CrashLoopBackOff: { fg: 'var(--pack-crash-fg)',       bg: 'var(--pack-crash-bg)',       bd: 'var(--pack-crash-bd)',       dot: 'var(--pack-crash-dot)'       },
    Unknown:          { fg: 'var(--pack-unknown-fg)',     bg: 'var(--pack-unknown-bg)',     bd: 'var(--pack-unknown-bd)',     dot: 'var(--pack-unknown-dot)'     },
} as const;

export const DEP_STATUS_HEALTH: Record<string, HealthBucket> = {
    CrashLoopBackOff: 'failed',
    Progressing:      'degraded',
    Unknown:          'stale',
    Deployed:         'healthy',
};

const FI_RANK: Record<HealthBucket, number> = { failed: 0, degraded: 1, stale: 2, healthy: 3 };

export interface WsClass {
    k: HealthBucket;
    stale: boolean;
    silent?: boolean;
}

export function fiClass(w: Workspace): WsClass {
    const stale = fStaleness(w.lastHeartbeat).stale;
    if (w.health === 'failed')   return { k: 'failed',   stale };
    if (w.health === 'degraded') return { k: 'degraded', stale };
    if (w.health === 'unknown')  return { k: 'stale',    stale: true, silent: true };
    if (stale)                   return { k: 'stale',    stale: true };
    return { k: 'healthy', stale: false };
}

export function fiReason(w: Workspace, k: HealthBucket): string {
    const d = deployments.filter(x => x.workspace === w.id);
    if (k === 'failed') {
        const n = d.filter(x => x.status === 'CrashLoopBackOff').length || 3;
        return `${n} pods CrashLoopBackOff`;
    }
    if (k === 'degraded') return '1 pack Progressing > 6m';
    if (k === 'stale')    return w.health === 'unknown' ? 'no heartbeat received' : 'heartbeat delayed';
    return 'all packs Deployed';
}

export function fiSorted(list?: Workspace[]): Workspace[] {
    const base = list ?? workspaces;
    return [...base].sort((a, b) => {
        const ca = fiClass(a), cb = fiClass(b);
        if (FI_RANK[ca.k] !== FI_RANK[cb.k]) return FI_RANK[ca.k] - FI_RANK[cb.k];
        return fStaleness(b.lastHeartbeat).mins - fStaleness(a.lastHeartbeat).mins;
    });
}

// ── semantic Badge wrappers ────────────────────────────────────────────

export const ShadSevBadge: React.FC<{ k: HealthBucket; soft?: boolean }> = ({ k, soft }) => {
    const m = SHAD_SEV[k];
    return (
        <Badge
            variant="outline"
            className="h-[22px] px-2.5 text-[11.5px]"
            style={{
                background: soft ? m.bg : 'transparent',
                color: m.fg,
                borderColor: m.bd,
            }}
        >
            <span aria-hidden="true" className="size-[7px] rounded-full" style={{ background: m.dot }} />
            {m.label}
        </Badge>
    );
};

export const ShadTierBadge: React.FC<{ t: Tier; className?: string }> = ({ t, className }) => {
    const m = t === 'P0' ? { bg: 'var(--tier-p0-bg)', fg: 'var(--tier-p0-fg)' } :
              t === 'P1' ? { bg: 'var(--tier-p1-bg)', fg: 'var(--tier-p1-fg)' } :
                           { bg: 'var(--tier-p2-bg)', fg: 'var(--tier-p2-fg)' };
    return (
        <Badge
            variant="outline"
            className={cn('h-5 px-1.5 rounded-md border-transparent text-[10.5px] font-semibold tracking-wider', className)}
            style={{ background: m.bg, color: m.fg }}
        >
            {t}
        </Badge>
    );
};

export const ShadHealthPill: React.FC<{ h: 'Healthy' | 'Degraded' | 'Failed' | 'Unknown' }> = ({ h }) => {
    const map: Record<string, HealthBucket> = { Healthy: 'healthy', Degraded: 'degraded', Failed: 'failed', Unknown: 'stale' };
    const m = SHAD_SEV[map[h]];
    return (
        <Badge
            variant="outline"
            className="h-[22px] px-2.5 text-[11.5px]"
            style={{ background: m.bg, color: m.fg, borderColor: m.bd }}
        >
            <span aria-hidden="true" className="size-[7px] rounded-full" style={{ background: m.dot }} />
            {h}
        </Badge>
    );
};

export const ShadSummaryPill: React.FC<{ k: HealthBucket; label: string }> = ({ k, label }) => {
    const m = SHAD_SEV[k];
    return (
        <Badge
            variant="outline"
            className="h-[22px] px-2.5 text-[11.5px]"
            style={{ background: m.bg, color: m.fg, borderColor: m.bd }}
        >
            <span aria-hidden="true" className="size-[7px] rounded-full" style={{ background: m.dot }} />
            {label}
        </Badge>
    );
};

export const ShadKV: React.FC<{
    k: string; v: React.ReactNode; mono?: boolean; color?: string;
}> = ({ k, v, mono, color }) => (
    <div className="px-3.5 py-2.5 border-r border-b border-border">
        <div className="text-[11px] text-muted-foreground mb-1">{k}</div>
        <div
            className={cn('text-sm font-medium', mono ? 'font-mono' : 'font-sans')}
            style={color ? { color } : undefined}
        >
            {v}
        </div>
    </div>
);

export const ShadChip: React.FC<{ label: string; onClear: () => void }> = ({ label, onClear }) => (
    <span className="inline-flex items-center gap-1.5 h-6 pl-2.5 pr-1.5 bg-secondary rounded-lg text-xs text-foreground">
        {label}
        <Button
            variant="ghost"
            size="icon"
            onClick={onClear}
            aria-label={`Remove filter: ${label}`}
            className="size-5 rounded text-muted-foreground hover:text-foreground hover:bg-muted [&_svg]:size-3"
        >
            <X strokeWidth={2.25} />
        </Button>
    </span>
);

// Full-color Slack mark.
export const SlackLogo: React.FC<{ className?: string; size?: number }> = ({ className, size }) => (
    <svg
        viewBox="0 0 127 127"
        width={size}
        height={size}
        className={cn('inline-block shrink-0 align-middle', className)}
        aria-hidden="true"
    >
        <path fill="#E01E5A" d="M27.2 80a13.2 13.2 0 1 1-13.2-13.2h13.2V80zm6.6 0a13.2 13.2 0 0 1 26.4 0v33a13.2 13.2 0 1 1-26.4 0V80z" />
        <path fill="#36C5F0" d="M47 27.2A13.2 13.2 0 1 1 60.2 14v13.2H47zm0 6.7a13.2 13.2 0 0 1 0 26.4H14a13.2 13.2 0 1 1 0-26.4h33z" />
        <path fill="#2EB67D" d="M99.8 47A13.2 13.2 0 1 1 113 60.2H99.8V47zm-6.6 0a13.2 13.2 0 0 1-26.4 0V14a13.2 13.2 0 1 1 26.4 0v33z" />
        <path fill="#ECB22E" d="M80 99.8A13.2 13.2 0 1 1 66.8 113V99.8H80zm0-6.6a13.2 13.2 0 0 1 0-26.4h33a13.2 13.2 0 1 1 0 26.4H80z" />
    </svg>
);

// Loading skeleton for table-shaped sections — drop in while fetches resolve.
// Mirrors the row height + column rhythm of the fleet/deployments tables so
// the page doesn't reflow when real data arrives.
export const FalconTableSkeleton: React.FC<{ rows?: number; cols?: number; label?: string }> = ({
    rows = 6, cols = 4, label = 'Loading rows',
}) => (
    <div
        role="status"
        aria-busy="true"
        aria-label={label}
        className="border border-border rounded-xl overflow-hidden shadow-sm"
    >
        <div className="bg-muted px-3.5 py-2 flex gap-3.5">
            {Array.from({ length: cols }).map((_, i) => (
                <Skeleton key={i} className="h-3 flex-1" />
            ))}
        </div>
        <div className="divide-y divide-border">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="px-3.5 py-3 flex gap-3.5">
                    {Array.from({ length: cols }).map((__, j) => (
                        <Skeleton key={j} className={cn('h-4', j === 1 ? 'flex-[2]' : 'flex-1')} />
                    ))}
                </div>
            ))}
        </div>
        <span className="sr-only">{label}</span>
    </div>
);

// Diagonal-hatch fill style for the image-tag distribution bars. Reads from
// CSS variables so it automatically switches palette when the theme flips.
// SVG stroke pattern keeps every line at an even 1.6px weight.
export function hatchStyle(): React.CSSProperties {
    return {
        backgroundColor: 'var(--hatch-bg)',
        backgroundImage: 'var(--hatch-pattern)',
        backgroundSize: `${HATCH_GAP_PX}px ${HATCH_GAP_PX}px`,
    };
}
