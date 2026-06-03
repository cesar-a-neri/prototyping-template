// Customer Detail (standard layout) — hero header, metrics grid, then the
// customer's workspaces table. Uses the same shadcn vocabulary as the rest
// of the app.

import React, { useState } from 'react';
import { ChevronRight, ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    SHAD_SEV,
    ShadSevBadge, ShadTierBadge, ShadKV, ShadSummaryPill,
    SlackLogo,
    fiClass,
} from './shared';
import {
    customers, workspaces, fCustomer, fCloudName, fStaleness,
} from './data';
import type { Workspace } from './types';

interface CustomerDetailProps {
    customerId: string;
    onBack: () => void;
    onSelectWorkspace: (id: string) => void;
    onSelectCustomer: (id: string) => void;
}

export const CustomerDetail: React.FC<CustomerDetailProps> = ({ customerId, onBack, onSelectWorkspace, onSelectCustomer }) => {
    const c = fCustomer(customerId);
    const ws = workspaces.filter(w => w.customer === customerId);
    const counts = { healthy: 0, degraded: 0, failed: 0, stale: 0 } as Record<string, number>;
    ws.forEach(w => { counts[fiClass(w).k]++; });
    const packs = ws.reduce((s, w) => s + (w.packs || 0), 0);
    const nodes = ws.reduce((s, w) => s + (w.nodes || 0), 0);
    const allHealthy = counts.failed + counts.degraded + counts.stale === 0;
    const idx = customers.findIndex(x => x.id === customerId);
    const step = (d: -1 | 1) => {
        const ni = (idx + d + customers.length) % customers.length;
        onSelectCustomer(customers[ni].id);
    };

    return (
        <div className="w-full h-full flex flex-col">
            {/* top bar */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-2.5 h-10 px-6 border-b border-border shrink-0">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onBack}
                    aria-label="Back to customers"
                    className="h-6 px-1.5 text-muted-foreground"
                >
                    <ChevronRight aria-hidden="true" className="size-3.5 rotate-180" strokeWidth={2} /> Customers
                </Button>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <ChevronRight aria-hidden="true" className="size-3" strokeWidth={2} />
                    <span className="text-foreground font-medium" aria-current="page">{c.name}</span>
                </div>
                <div className="flex-1" />
                <span className="text-xs text-muted-foreground">
                    Customer {idx + 1} of {customers.length}
                </span>
                <div className="flex gap-1">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => step(-1)}
                        aria-label="Previous customer"
                        className="size-7"
                    >
                        <ChevronRight aria-hidden="true" className="size-3.5 rotate-180" strokeWidth={2} />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => step(1)}
                        aria-label="Next customer"
                        className="size-7"
                    >
                        <ChevronRight aria-hidden="true" className="size-3.5" strokeWidth={2} />
                    </Button>
                </div>
            </nav>

            {/* hero */}
            <header className="px-6 pt-5 pb-5 border-b border-border shrink-0">
                <div className="flex items-center gap-2.5 mb-2.5">
                    <ShadTierBadge t={c.tier} />
                    <h1 className="text-2xl font-semibold m-0 tracking-tight">{c.name}</h1>
                    <span className="ml-1 inline-flex gap-1.5">
                        {allHealthy ? (
                            <ShadSummaryPill k="healthy" label="All healthy" />
                        ) : (
                            <>
                                {counts.failed > 0   && <ShadSummaryPill k="failed"   label={`${counts.failed} failed`} />}
                                {counts.degraded > 0 && <ShadSummaryPill k="degraded" label={`${counts.degraded} degraded`} />}
                                {counts.stale > 0    && <ShadSummaryPill k="stale"    label={`${counts.stale} stale`} />}
                            </>
                        )}
                    </span>
                </div>
                <div className="flex items-center gap-3.5 text-[13px] text-muted-foreground">
                    <span><span className="text-foreground font-semibold">{ws.length}</span> workspaces</span>
                    <span className="text-zinc-300" aria-hidden="true">·</span>
                    <span>Contact <span className="text-foreground">{c.accountMgr}</span></span>
                    <span className="inline-flex items-center gap-1.5">
                        <span className="text-muted-foreground">Email:</span>
                        <a
                            href={`mailto:${c.fde}`}
                            className="inline-flex items-center gap-0.5 text-[13px] text-foreground no-underline hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                        >
                            {c.fde}
                            <ArrowUpRight aria-hidden="true" className="size-3 text-muted-foreground" strokeWidth={2} />
                        </a>
                    </span>
                    <div className="ml-auto flex items-center gap-3.5">
                        <Button variant="ghost" size="sm" className="text-primary" aria-label={`Open ${c.slack} in Slack`}>
                            <SlackLogo className="size-[13px]" /> {c.slack}
                            <ArrowUpRight aria-hidden="true" className="size-3" strokeWidth={2} />
                        </Button>
                    </div>
                </div>
            </header>

            {/* body */}
            <div className="flex-1 overflow-auto px-6 pt-5 pb-7 flex flex-col gap-5">
                <div className="border border-border rounded-xl overflow-hidden border-b-0 border-r-0">
                    <div className="grid grid-cols-4">
                        <ShadKV k="Customer priority" v={c.tier} mono />
                        <ShadKV k="Workspaces" v={ws.length} mono />
                        <ShadKV k="Packs installed" v={packs} mono />
                        <ShadKV k="Nodes" v={nodes} mono />
                    </div>
                </div>

                <div>
                    <div className="flex items-baseline justify-between mb-2.5">
                        <div className="flex items-baseline gap-2">
                            <h2 className="text-[15px] font-semibold m-0">Workspaces</h2>
                            <Badge variant="secondary" className="font-mono">{ws.length}</Badge>
                        </div>
                        <span className="text-[11.5px] text-muted-foreground font-mono">
                            sorted by env · prod first
                        </span>
                    </div>
                    <WorkspaceTable rows={ws} onSelectWorkspace={onSelectWorkspace} />
                </div>
            </div>
        </div>
    );
};

const HOVER_TINT: Record<string, string> = {
    failed: '#fdf3f3', degraded: '#fefaed', stale: '#f7f9fb', healthy: '#fafafa',
};

const WorkspaceTable: React.FC<{ rows: Workspace[]; onSelectWorkspace: (id: string) => void }> = ({ rows, onSelectWorkspace }) => {
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    return (
    <div className="border border-border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full border-collapse text-sm">
            <thead>
                <tr className="bg-muted">
                    {['Workspace', 'Env', 'Cloud · Region', 'SGP', 'Packs', 'Nodes', 'Heartbeat', 'Status'].map(h => (
                        <th key={h} scope="col" className="text-left px-3.5 py-2 text-[11px] font-medium text-muted-foreground border-b border-border whitespace-nowrap">
                            {h}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rows.map((w, i) => {
                    const cl = fiClass(w);
                    const stale = fStaleness(w.lastHeartbeat);
                    const isHovered = hoveredId === w.id;
                    return (
                        <tr
                            key={w.id}
                            role="link"
                            tabIndex={0}
                            aria-label={`Open workspace ${w.id}`}
                            onClick={() => onSelectWorkspace(w.id)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    onSelectWorkspace(w.id);
                                }
                            }}
                            onMouseEnter={() => setHoveredId(w.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            className={cn(
                                'cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
                                i < rows.length - 1 && 'border-b border-border',
                            )}
                            style={{ background: isHovered ? HOVER_TINT[cl.k] : SHAD_SEV[cl.k].tint }}
                        >
                            <td className="px-3.5 py-2.5 font-mono text-[12.5px]">{w.id}</td>
                            <td className="px-3.5 py-2.5">
                                <Badge variant="secondary" className="h-[18px] px-1.5 text-[10px] uppercase tracking-wider">{w.env}</Badge>
                            </td>
                            <td className="px-3.5 py-2.5 text-[12.5px]">
                                {fCloudName(w.cloud)} <span className="text-zinc-300" aria-hidden="true">·</span>{' '}
                                <span className="font-mono text-muted-foreground">{w.region}</span>
                            </td>
                            <td className="px-3.5 py-2.5 font-mono text-xs">{w.sgp}</td>
                            <td className="px-3.5 py-2.5 font-mono text-xs">{w.packs}</td>
                            <td className="px-3.5 py-2.5 font-mono text-xs">{w.nodes}</td>
                            <td
                                className="px-3.5 py-2.5 font-mono text-xs"
                                style={{ color: cl.stale ? SHAD_SEV[cl.k].fg : undefined }}
                            >
                                {stale.label}
                            </td>
                            <td className="px-3.5 py-2.5"><ShadSevBadge k={cl.k} soft /></td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    </div>
    );
};
