// Faceted browse — powers both the Fleet Health Overview (workspaces mode)
// and the Deployment Search (deployments mode). One layout, two data sources,
// the same shadcn vocabulary so nothing diverges visually.

import React, { useMemo, useState } from 'react';
import { Search, X, FilterX, ChevronRight, AlertTriangle, WifiOff, OctagonX, Check } from 'lucide-react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    SHAD_SEV, DEP_STATUS_HEALTH,
    ShadSevBadge, ShadTierBadge, ShadChip,
    hatchStyle,
    fiClass, fiReason, fiSorted,
} from './shared';
import {
    customers, workspaces, deployments,
    fCustomer, fCloudName, fStaleness,
} from './data';
import type { Deployment, HealthBucket, Tier, Workspace } from './types';

type Mode = 'workspaces' | 'deployments';

interface BrowseFacet<X> {
    dim: string;
    label: string;
    opts: string[];
    get: (x: X) => string;
    render: (v: string) => React.ReactNode;
    health?: boolean;
    priority?: boolean;
    env?: boolean;
    mono?: boolean;
    scroll?: boolean;
}

interface FIBrowseProps {
    mode0?: Mode;
    showToggle?: boolean;
    onSelectWorkspace?: (id: string) => void;
}

const DEP_RANK: Record<string, number> = {
    CrashLoopBackOff: 0, Progressing: 1, Unknown: 2, Deployed: 3,
};
const TIER_RANK: Record<Tier, number> = { P0: 0, P1: 1, P2: 2 };

export const FIBrowse: React.FC<FIBrowseProps> = ({
    mode0 = 'workspaces', showToggle = false, onSelectWorkspace,
}) => {
    const [mode, setMode] = useState<Mode>(mode0);
    const [query, setQuery] = useState('');
    const [sel, setSel] = useState<Record<string, Set<string>>>({});
    const [facetQ, setFacetQ] = useState<Record<string, string>>({});

    const switchMode = (m: Mode) => {
        setMode(m); setQuery(''); setSel({});
    };
    const toggle = (dim: string, val: string) => setSel(prev => {
        const next = { ...prev };
        const s = new Set(next[dim] ?? []);
        if (s.has(val)) s.delete(val); else s.add(val);
        next[dim] = s;
        return next;
    });
    const clearAll = () => { setQuery(''); setSel({}); };

    const wsFacets: BrowseFacet<Workspace>[] = [
        { dim: 'health',   label: 'Health',            opts: ['failed', 'degraded', 'stale', 'healthy'],                                     get: w => fiClass(w).k,                                  render: v => SHAD_SEV[v as HealthBucket].label, health: true },
        { dim: 'priority', label: 'Customer priority', opts: ['P0', 'P1', 'P2'],                                                              get: w => fCustomer(w.customer).tier,                    render: v => v, priority: true },
        { dim: 'env',      label: 'Environment',       opts: ['prod', 'staging', 'dev'],                                                     get: w => w.env,                                         render: v => v.toUpperCase(), env: true },
        { dim: 'cloud',    label: 'Cloud',             opts: ['aws', 'gcp', 'azure', 'onprem'],                                              get: w => w.cloud,                                       render: v => fCloudName(v) },
        { dim: 'sgp',      label: 'SGP version',       opts: Array.from(new Set(workspaces.map(w => w.sgp))).sort().reverse(),               get: w => w.sgp,                                         render: v => v, mono: true },
        { dim: 'customer', label: 'Customer',          opts: customers.map(c => c.id),                                                       get: w => w.customer,                                    render: v => fCustomer(v).name, scroll: true },
    ];

    const depFacets: BrowseFacet<Deployment>[] = [
        { dim: 'status',   label: 'Status',            opts: ['failed', 'degraded', 'stale', 'healthy'],                                     get: d => DEP_STATUS_HEALTH[d.status],                   render: v => SHAD_SEV[v as HealthBucket].label, health: true },
        { dim: 'priority', label: 'Customer priority', opts: ['P0', 'P1', 'P2'],                                                              get: d => fCustomer(d.customer).tier,                    render: v => v, priority: true },
        { dim: 'pack',     label: 'Pack',              opts: Array.from(new Set(deployments.map(d => d.pack))).sort(),                       get: d => d.pack,                                        render: v => v, mono: true, scroll: true },
        { dim: 'cloud',    label: 'Cloud',             opts: ['aws', 'gcp', 'azure', 'onprem'],                                              get: d => d.cloud,                                       render: v => fCloudName(v) },
        { dim: 'env',      label: 'Environment',       opts: ['prod', 'staging', 'dev'],                                                     get: d => d.env,                                         render: v => v.toUpperCase(), env: true },
        { dim: 'customer', label: 'Customer',          opts: customers.map(c => c.id),                                                       get: d => d.customer,                                    render: v => fCustomer(v).name, scroll: true },
    ];

    const facets = mode === 'workspaces' ? wsFacets : depFacets;
    const source: (Workspace | Deployment)[] = mode === 'workspaces' ? workspaces : deployments;
    const countFor = <X,>(f: BrowseFacet<X>, opt: string) =>
        (source as unknown as X[]).filter(x => f.get(x) === opt).length;

    const passFacets = <X,>(x: X) => facets.every(f => {
        const s = sel[f.dim];
        if (!s || !s.size) return true;
        return s.has((f as BrowseFacet<X>).get(x));
    });

    const wsRows = useMemo(() => fiSorted().filter(w =>
        passFacets(w) && (!query || `${w.id} ${fCustomer(w.customer).name} ${w.region} ${w.cloud} ${w.sgp} ${w.env} ${fiClass(w).k}`.toLowerCase().includes(query.toLowerCase()))
    ), [query, sel, mode]);

    const depRows = useMemo(() => [...deployments]
        .filter(d => passFacets(d) && (!query || `${d.pack} ${d.image} ${d.chart} ${d.workspace} ${fCustomer(d.customer).name} ${d.cloud} ${d.env} ${d.status}`.toLowerCase().includes(query.toLowerCase())))
        .sort((a, b) =>
            DEP_RANK[a.status] - DEP_RANK[b.status] ||
            fCustomer(a.customer).name.localeCompare(fCustomer(b.customer).name)
        ),
    [query, sel, mode]);

    const problems = wsRows.filter(w => fiClass(w).k !== 'healthy');
    const healthy = wsRows.filter(w => fiClass(w).k === 'healthy').sort((a, b) => {
        const ra = TIER_RANK[fCustomer(a.customer).tier] ?? 9;
        const rb = TIER_RANK[fCustomer(b.customer).tier] ?? 9;
        if (ra !== rb) return ra - rb;
        return fCustomer(a.customer).name.localeCompare(fCustomer(b.customer).name);
    });

    const activeCount = Object.values(sel).reduce((s, x) => s + (x ? x.size : 0), 0) + (query ? 1 : 0);

    const title = mode === 'workspaces' ? 'Fleet Health Overview' : 'Deployment Search';
    const crumb = mode === 'workspaces' ? 'Fleet' : 'Deployments';

    return (
        <div className="w-full h-full flex flex-col">
            {/* top bar */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-2.5 h-10 px-6 border-b border-border shrink-0">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span>Falcon</span>
                    <ChevronRight aria-hidden="true" className="size-3" strokeWidth={2} />
                    <span className="text-foreground font-medium" aria-current="page">{crumb}</span>
                </div>
                <div className="flex-1" />
                <span className="text-xs text-muted-foreground">
                    {mode === 'workspaces' ? (
                        <>
                            <span className="font-semibold" style={{ color: SHAD_SEV.failed.fg }}>{problems.length}</span> need attention ·{' '}
                            <span className="font-semibold text-foreground">{wsRows.length}</span>/{workspaces.length}
                        </>
                    ) : (
                        <>
                            <span className="font-semibold text-foreground">{depRows.length}</span> of {deployments.length} deployments
                        </>
                    )}
                </span>
            </nav>

            <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
                {/* faceted rail */}
                <aside style={{ width: 252, flexShrink: 0, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', minHeight: 0, background: 'var(--card)' }}>
                    <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-.01em' }}>Filters</div>
                    </div>
                    <div style={{ flex: 1, overflow: 'auto', padding: '6px 0 16px' }}>
                        {facets.map(f => (
                            <FacetGroup
                                key={f.dim}
                                facet={f as BrowseFacet<unknown>}
                                selected={sel[f.dim] ?? new Set()}
                                onToggle={(v) => toggle(f.dim, v)}
                                count={(opt: string) => countFor(f as BrowseFacet<unknown>, opt)}
                                filterText={facetQ[f.dim] ?? ''}
                                onFilterText={(s) => setFacetQ(p => ({ ...p, [f.dim]: s }))}
                            />
                        ))}
                    </div>
                </aside>

                {/* main */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '20px 24px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0, letterSpacing: '-.01em' }}>{title}</h1>
                                {showToggle && (
                                    <div role="tablist" aria-label="View" className="inline-flex bg-muted rounded-lg p-[3px] gap-0.5">
                                        {(['workspaces', 'deployments'] as Mode[]).map(k => (
                                            <button
                                                key={k}
                                                type="button"
                                                role="tab"
                                                aria-selected={mode === k}
                                                onClick={() => switchMode(k)}
                                                className={[
                                                    'px-3 py-1 rounded-md border-0 text-xs font-medium cursor-pointer',
                                                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                                    mode === k ? 'bg-card text-foreground shadow-xs' : 'bg-transparent text-muted-foreground',
                                                ].join(' ')}
                                            >
                                                {k === 'workspaces' ? 'Workspaces' : 'Deployments'}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* central token search */}
                        <div className="mt-4 mb-5 flex items-center gap-1.5 flex-wrap border border-border bg-card shadow-sm rounded-md px-2.5 py-1 min-h-[34px]">
                            <Search aria-hidden="true" className="size-[15px] text-muted-foreground shrink-0" strokeWidth={2} />
                            {facets.flatMap(f =>
                                [...(sel[f.dim] ?? [])].map(v => (
                                    <ShadChip
                                        key={f.dim + v}
                                        label={`${f.label}: ${stringify(f.render(v))}`}
                                        onClear={() => toggle(f.dim, v)}
                                    />
                                ))
                            )}
                            <Label htmlFor="browse-search" className="sr-only">
                                {mode === 'workspaces' ? 'Search workspaces' : 'Search deployments'}
                            </Label>
                            <Input
                                id="browse-search"
                                type="search"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={
                                    Object.values(sel).every(s => !s || !s.size)
                                        ? mode === 'workspaces'
                                            ? 'Search workspaces, or pick filters on the left…'
                                            : 'Search packs, images, or pick filters on the left…'
                                        : 'Add a search term…'
                                }
                                className="flex-1 min-w-40 h-7 border-0 shadow-none bg-transparent px-0 py-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                            {activeCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearAll}
                                    aria-label="Clear all filters and search"
                                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                                >
                                    <X aria-hidden="true" className="size-3" strokeWidth={2} /> Clear all
                                </Button>
                            )}
                        </div>
                    </div>

                    <div style={{ flex: 1, overflow: 'auto', padding: '0 24px 28px' }}>
                        {mode === 'workspaces' ? (
                            <WsBody problems={problems} healthy={healthy} onSelectWorkspace={onSelectWorkspace} />
                        ) : (
                            <DepBody rows={depRows} onSelectWorkspace={onSelectWorkspace} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── facet group ────────────────────────────────────────────────────────

const FacetGroup: React.FC<{
    facet: BrowseFacet<unknown>;
    selected: Set<string>;
    onToggle: (v: string) => void;
    count: (opt: string) => number;
    filterText: string;
    onFilterText: (s: string) => void;
}> = ({ facet: f, selected, onToggle, count, filterText, onFilterText }) => {
    const opts = f.scroll
        ? f.opts.filter(o => String(stringify(f.render(o))).toLowerCase().includes(filterText.toLowerCase()))
        : f.opts;
    return (
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12.5, fontWeight: 600 }}>{f.label}</span>
                {selected.size > 0 && <span style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 500 }}>{selected.size}</span>}
            </div>
            {f.scroll && (
                <div className="relative mb-2">
                    <Label htmlFor={`facet-filter-${f.dim}`} className="sr-only">
                        Filter {f.label.toLowerCase()} options
                    </Label>
                    <Search aria-hidden="true" className="size-3 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" strokeWidth={2} />
                    <Input
                        id={`facet-filter-${f.dim}`}
                        type="search"
                        value={filterText}
                        onChange={(e) => onFilterText(e.target.value)}
                        placeholder={`Filter ${f.label.toLowerCase()}…`}
                        className={cn('h-7 pl-[26px] pr-2 text-[11.5px] shadow-none', f.mono && 'font-mono')}
                    />
                </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: f.scroll ? 156 : 'none', overflow: f.scroll ? 'auto' : 'visible' }}>
                {opts.map(opt => {
                    const on = selected.has(opt);
                    return (
                        <label
                            key={opt}
                            className={cn(
                                'flex items-center gap-2.5 px-1.5 py-1 rounded-md cursor-pointer',
                                'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1 focus-within:ring-offset-background',
                                on ? 'bg-accent' : 'hover:bg-muted',
                            )}
                        >
                            <Checkbox
                                checked={on}
                                onCheckedChange={() => onToggle(opt)}
                                aria-label={`${f.label}: ${stringify(f.render(opt))}`}
                            />
                            {f.health ? (
                                <span className="flex-1 flex"><ShadSevBadge k={opt as HealthBucket} soft /></span>
                            ) : f.priority ? (
                                <span className="flex-1 flex"><ShadTierBadge t={opt as Tier} /></span>
                            ) : f.env ? (
                                <span className="flex-1 flex">
                                    <Badge variant="secondary" className="h-[18px] px-1.5 text-[10px] uppercase tracking-wider">{opt}</Badge>
                                </span>
                            ) : (
                                <span
                                    className={cn(
                                        'flex-1 text-[12.5px] text-foreground whitespace-nowrap overflow-hidden text-ellipsis',
                                        f.mono && 'font-mono',
                                    )}
                                >
                                    {f.render(opt)}
                                </span>
                            )}
                            <span className="font-mono text-[11px] text-muted-foreground">{count(opt)}</span>
                        </label>
                    );
                })}
            </div>
        </div>
    );
};

// ── workspaces body ────────────────────────────────────────────────────

const WsBody: React.FC<{
    problems: Workspace[];
    healthy: Workspace[];
    onSelectWorkspace?: (id: string) => void;
}> = ({ problems, healthy, onSelectWorkspace }) => {
    const Head = () => (
        <thead>
            <tr style={{ background: 'var(--muted)' }}>
                {['Severity', 'Workspace', 'Cause', 'Last seen'].map((h, i) => (
                    <th
                        key={h}
                        style={{
                            textAlign: 'left', padding: '9px 14px',
                            fontSize: 11, fontWeight: 500, color: 'var(--muted-foreground)',
                            borderBottom: '1px solid var(--border)',
                            width: [150, undefined, 230, 130][i],
                        }}
                    >
                        {h}
                    </th>
                ))}
            </tr>
        </thead>
    );

    const Rows = ({ list, neutral }: { list: Workspace[]; neutral?: boolean }) => {
        const [hoveredId, setHoveredId] = useState<string | null>(null);
        return (
        <>
            {list.map((w, i) => {
                const cust = fCustomer(w.customer);
                const cl = fiClass(w);
                const stale = fStaleness(w.lastHeartbeat);
                const Icon = neutral ? Check : cl.k === 'failed' ? OctagonX : cl.k === 'degraded' ? AlertTriangle : WifiOff;
                const isHovered = hoveredId === w.id;
                const clickable = !!onSelectWorkspace;
                return (
                    <tr
                        key={w.id}
                        role={clickable ? 'link' : undefined}
                        tabIndex={clickable ? 0 : undefined}
                        aria-label={clickable ? `Open workspace ${w.id}` : undefined}
                        onClick={clickable ? () => onSelectWorkspace!(w.id) : undefined}
                        onKeyDown={clickable ? (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                onSelectWorkspace!(w.id);
                            }
                        } : undefined}
                        onMouseEnter={() => setHoveredId(w.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        className={clickable ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset' : ''}
                        style={{
                            borderBottom: i < list.length - 1 ? '1px solid var(--border)' : 'none',
                            background: isHovered ? SHAD_SEV[cl.k].hover : SHAD_SEV[cl.k].tint,
                            transition: 'background 0.1s',
                        }}
                    >
                        <td style={{ padding: '11px 14px' }}><ShadSevBadge k={cl.k} soft={!neutral} /></td>
                        <td style={{ padding: '11px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <ShadTierBadge t={cust.tier} className="h-[18px] px-1.5 text-[10px]" />
                                <span className="font-semibold text-[13.5px]">{cust.name}</span>
                                <Badge variant="secondary" className="h-[18px] px-1.5 text-[10px] uppercase tracking-wider">{w.env}</Badge>
                            </div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted-foreground)', marginTop: 3 }}>
                                {w.id} · {fCloudName(w.cloud)} · {w.region} · sgp {w.sgp}
                            </div>
                        </td>
                        <td style={{ padding: '11px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                <Icon
                                    style={{ width: 14, height: 14, color: neutral ? 'var(--muted-foreground)' : SHAD_SEV[cl.k].dot }}
                                    strokeWidth={2}
                                />
                                <span className="text-xs" style={{ color: neutral ? 'var(--muted-foreground)' : 'var(--foreground)' }}>{fiReason(w, cl.k)}</span>
                            </div>
                        </td>
                        <td style={{
                            padding: '11px 14px', fontFamily: 'var(--font-mono)', fontSize: 12,
                            color: cl.stale && !neutral ? SHAD_SEV[cl.k].fg : 'var(--muted-foreground)',
                        }}>
                            {stale.label}
                        </td>
                    </tr>
                );
            })}
        </>
        );
    };

    if (!problems.length && !healthy.length) return <EmptyState />;

    return (
        <>
            <ErrorChart />
            {problems.length > 0 && (
                <div style={{ marginBottom: 22 }}>
                    <div className="flex items-center gap-2 mb-2.5">
                        <h2 className="text-[15px] font-semibold m-0">Needs attention</h2>
                        <Badge variant="secondary" className="font-mono">{problems.length}</Badge>
                    </div>
                    <div className="border border-border rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full border-collapse text-sm">
                            <Head />
                            <tbody><Rows list={problems} /></tbody>
                        </table>
                    </div>
                </div>
            )}
            {healthy.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-2.5">
                        <h2 className="text-[15px] font-semibold m-0 text-muted-foreground">Healthy</h2>
                        <Badge variant="outline" className="font-mono text-muted-foreground">{healthy.length}</Badge>
                    </div>
                    <div className="border border-border rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full border-collapse text-sm">
                            <Head />
                            <tbody><Rows list={healthy} neutral /></tbody>
                        </table>
                    </div>
                </div>
            )}
        </>
    );
};

// ── deployments body ───────────────────────────────────────────────────

const DepBody: React.FC<{ rows: Deployment[]; onSelectWorkspace?: (id: string) => void }> = ({ rows, onSelectWorkspace }) => {
    const byTag: Record<string, number> = {};
    rows.forEach(d => { byTag[d.image] = (byTag[d.image] ?? 0) + 1; });
    const tags = Object.entries(byTag).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const tagMax = tags.length ? tags[0][1] : 1;

    const problems = rows.filter(d => d.status !== 'Deployed');
    const healthy = rows.filter(d => d.status === 'Deployed');
    const pShown = problems.slice(0, 30);
    const hShown = healthy.slice(0, 40);

    if (rows.length === 0) return <EmptyState />;

    const DepTable: React.FC<{ list: Deployment[] }> = ({ list }) => {
        const [hoveredKey, setHoveredKey] = useState<string | null>(null);
        return (
        <div className="border border-border overflow-hidden shadow-sm">
            <table className="w-full border-collapse text-sm">
                <thead>
                    <tr className="bg-muted">
                        {['Customer', 'Workspace', 'Env', 'Cloud', 'Pack', 'Image tag', 'Reps', 'Status'].map(h => (
                            <th key={h} scope="col" className="text-left px-3.5 py-2 text-[11px] font-medium text-muted-foreground border-b border-border whitespace-nowrap">
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {list.map((d, i) => {
                        const cust = fCustomer(d.customer);
                        const rowKey = `${d.workspace}-${d.pack}`;
                        const isHovered = hoveredKey === rowKey;
                        const health = DEP_STATUS_HEALTH[d.status];
                        const clickable = !!onSelectWorkspace;
                        return (
                            <tr
                                key={rowKey}
                                role={clickable ? 'link' : undefined}
                                tabIndex={clickable ? 0 : undefined}
                                aria-label={clickable ? `Open workspace ${d.workspace}` : undefined}
                                onClick={clickable ? () => onSelectWorkspace!(d.workspace) : undefined}
                                onKeyDown={clickable ? (e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        onSelectWorkspace!(d.workspace);
                                    }
                                } : undefined}
                                onMouseEnter={() => setHoveredKey(rowKey)}
                                onMouseLeave={() => setHoveredKey(null)}
                                className={clickable ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset' : ''}
                                style={{
                                    borderBottom: i < list.length - 1 ? '1px solid var(--border)' : 'none',
                                    background: isHovered ? SHAD_SEV[health].hover : SHAD_SEV[health].tint,
                                    transition: 'background 0.1s',
                                }}
                            >
                                <td style={{ padding: '10px 14px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                        <ShadTierBadge t={cust.tier} className="h-[18px] px-1.5 text-[10px]" />
                                        <span className="font-medium">{cust.name}</span>
                                    </div>
                                </td>
                                <td className="px-3.5 py-2.5 font-mono text-[11.5px] text-muted-foreground">{d.workspace}</td>
                                <td className="px-3.5 py-2.5">
                                    <Badge variant="secondary" className="h-[18px] px-1.5 text-[10px] uppercase tracking-wider">{d.env}</Badge>
                                </td>
                                <td style={{ padding: '10px 14px', fontSize: 12 }}>{fCloudName(d.cloud)}</td>
                                <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 500 }}>{d.pack}</td>
                                <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{d.image}</td>
                                <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{d.replicas}</td>
                                <td style={{ padding: '10px 14px' }}><ShadSevBadge k={DEP_STATUS_HEALTH[d.status]} soft /></td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
        );
    };

    return (
        <>
            <section
                aria-label="Image tag distribution"
                className="border border-border bg-card shadow-sm px-4 py-4 mb-5"
            >
                <h3 className="text-sm font-semibold m-0 mb-0.5">Image tag distribution</h3>
                <p className="text-xs text-muted-foreground m-0 mb-4">
                    How many deployments run each image across the filtered set.
                </p>
                <div className="flex flex-col gap-3.5">
                    {tags.map(([img, n]) => (
                        <div key={img} className="grid items-center gap-3.5" style={{ gridTemplateColumns: '230px 70px 1fr' }}>
                            <span className="font-mono text-xs whitespace-nowrap overflow-hidden text-ellipsis">{img}</span>
                            <span className="font-mono text-xs text-muted-foreground">{n} ws</span>
                            <div className="h-2.5 bg-muted overflow-hidden">
                                <div className="h-full" style={{ width: `${(n / tagMax) * 100}%`, ...hatchStyle() }} />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {problems.length > 0 && (
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2.5">
                        <h2 className="text-[15px] font-semibold m-0">Needs attention</h2>
                        <Badge variant="secondary" className="font-mono">{problems.length}</Badge>
                    </div>
                    <DepTable list={pShown} />
                    {problems.length > pShown.length && (
                        <p className="text-center pt-3 text-xs text-muted-foreground" aria-live="polite">
                            Showing first {pShown.length} of {problems.length} — refine filters to narrow.
                        </p>
                    )}
                </div>
            )}

            {healthy.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-2.5">
                        <h2 className="text-[15px] font-semibold m-0 text-muted-foreground">Healthy</h2>
                        <Badge variant="outline" className="font-mono text-muted-foreground">{healthy.length}</Badge>
                    </div>
                    <DepTable list={hShown} />
                    {healthy.length > hShown.length && (
                        <p className="text-center pt-3 text-xs text-muted-foreground" aria-live="polite">
                            Showing first {hShown.length} of {healthy.length} — refine filters to narrow.
                        </p>
                    )}
                </div>
            )}
        </>
    );
};

// ── error timeseries (solid bands, baked in) ──────────────────────────

const SHAD_EC = { failed: '#ef4444', degraded: '#f59e0b', stale: '#94a3b8' };

function shadSeries(range: '6h' | '24h' | '7d') {
    const n = range === '6h' ? 24 : range === '24h' ? 24 : 28;
    let s = (range === '6h' ? 613 : range === '24h' ? 244 : 707) >>> 0;
    const r = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 0xffffffff; };
    const scale = range === '7d' ? 4 : 1;
    const out: { failed: number; degraded: number; stale: number }[] = [];
    for (let i = 0; i < n; i++) {
        const tn = i / (n - 1);
        let failed = r() < 0.16 ? Math.round(r() * 2) : 0;
        if (tn > 0.8) failed += Math.round((tn - 0.8) / 0.2 * 7 + r());
        if (Math.abs(tn - 0.42) < 0.05) failed += Math.round(2 + r() * 2);
        const degraded = Math.max(0, Math.round(1.4 + Math.sin(i * 0.5) * 1.2 + r() * 1.3 + (tn > 0.7 ? 1.5 : 0)));
        let stale = r() < 0.22 ? Math.round(r() * 2) : 0;
        if (range === '7d' && Math.abs(tn - 0.3) < 0.06) stale += 3;
        if (tn > 0.86) stale += Math.round(r() * 1.5);
        out.push({ failed: failed * scale, degraded: degraded * scale, stale: stale * scale });
    }
    return out;
}

function shadLabel(range: '6h' | '24h' | '7d', i: number, n: number) {
    if (range === '6h') {
        const m = (n - 1 - i) * 15;
        return m === 0 ? 'now' : `−${Math.round(m / 60 * 10) / 10}h`;
    }
    if (range === '24h') {
        const h = n - 1 - i;
        return h === 0 ? 'now' : `−${h}h`;
    }
    const d = n - 1 - i;
    return d === 0 ? 'now' : `−${d}d`;
}

// Empty Tooltip content — the chart drives its readout into the header.
const EmptyTooltip: React.FC = () => null;

const ErrorChart: React.FC = () => {
    const [range, setRange] = useState<'6h' | '24h' | '7d'>('24h');
    const [hover, setHover] = useState<number | null>(null);
    const series = useMemo(() => shadSeries(range), [range]);
    const n = series.length;
    const errTotal = series.reduce((a, d) => a + d.failed + d.degraded + d.stale, 0);

    const data = useMemo(() => series.map((d, i) => ({
        idx: i,
        label: shadLabel(range, i, n),
        ...d,
    })), [series, range, n]);

    const hi = hover ?? n - 1;
    const hd = series[hi];

    // Render an X-axis label only every Nth tick (matches the original).
    const xStep = Math.max(1, Math.ceil(n / 6));

    return (
        <section
            aria-label="Errors over time"
            className="border border-border rounded-xl bg-card shadow-sm mb-5"
        >
            <header className="flex items-center gap-3.5 px-4 pt-3.5 pb-2">
                <div className="flex flex-col gap-0.5">
                    <h3 className="text-sm font-semibold m-0">Errors over time</h3>
                    <p className="text-xs text-muted-foreground m-0" aria-live="polite">
                        {hover != null ? `at ${shadLabel(range, hover, n)}` : `${errTotal} events · last ${range}`}
                        <span className="ml-2 font-mono" style={{ color: SHAD_EC.failed }}>{hd.failed}</span>
                        <span className="ml-1.5 font-mono" style={{ color: SHAD_EC.degraded }}>{hd.degraded}</span>
                        <span className="ml-1.5 font-mono" style={{ color: '#64748b' }}>{hd.stale}</span>
                    </p>
                </div>
                <div className="flex-1" />
                <div className="flex gap-3.5 text-xs text-muted-foreground" aria-hidden="true">
                    {([['failed', 'Failed'], ['degraded', 'Degraded'], ['stale', 'Stale']] as const).map(([k, l]) => (
                        <span key={k} className="inline-flex items-center gap-1.5">
                            <span className="size-2 rounded-sm" style={{ background: SHAD_EC[k] }} />
                            {l}
                        </span>
                    ))}
                </div>
                <div role="tablist" aria-label="Chart time range" className="inline-flex bg-muted rounded-lg p-[3px] gap-0.5">
                    {(['6h', '24h', '7d'] as const).map(rr => (
                        <button
                            key={rr}
                            type="button"
                            role="tab"
                            aria-selected={range === rr}
                            aria-label={`Show last ${rr === '6h' ? '6 hours' : rr === '24h' ? '24 hours' : '7 days'}`}
                            onClick={() => { setRange(rr); setHover(null); }}
                            className={cn(
                                'px-2.5 py-1 rounded-md border-0 text-xs font-medium cursor-pointer',
                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                range === rr ? 'bg-card text-foreground shadow-sm' : 'bg-transparent text-muted-foreground',
                            )}
                        >
                            {rr}
                        </button>
                    ))}
                </div>
            </header>
            <div className="px-2 pb-2 h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 8, right: 10, left: 0, bottom: 0 }}
                        onMouseMove={(state) => {
                            if (state && typeof state.activeTooltipIndex === 'number') {
                                setHover(state.activeTooltipIndex);
                            }
                        }}
                        onMouseLeave={() => setHover(null)}
                    >
                        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="label"
                            tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                            tickLine={false}
                            axisLine={{ stroke: 'var(--border)' }}
                            interval={xStep - 1}
                        />
                        <YAxis
                            tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                            tickLine={false}
                            axisLine={false}
                            width={28}
                        />
                        <Tooltip
                            cursor={{ stroke: 'var(--foreground)', strokeOpacity: 0.4 }}
                            content={<EmptyTooltip />}
                        />
                        <Area
                            type="linear"
                            dataKey="failed"
                            stackId="1"
                            stroke="none"
                            fill={SHAD_EC.failed}
                            fillOpacity={0.82}
                            isAnimationActive={false}
                        />
                        <Area
                            type="linear"
                            dataKey="degraded"
                            stackId="1"
                            stroke="none"
                            fill={SHAD_EC.degraded}
                            fillOpacity={0.78}
                            isAnimationActive={false}
                        />
                        <Area
                            type="linear"
                            dataKey="stale"
                            stackId="1"
                            stroke="none"
                            fill={SHAD_EC.stale}
                            fillOpacity={0.6}
                            isAnimationActive={false}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </section>
    );
};

// ── misc ───────────────────────────────────────────────────────────────

const EmptyState: React.FC = () => (
    <div role="status" aria-live="polite" className="py-12 text-center text-muted-foreground">
        <FilterX aria-hidden="true" className="size-5 block mx-auto mb-2.5" strokeWidth={1.6} />
        <p className="text-[13px] m-0">Nothing matches these filters.</p>
    </div>
);

function stringify(node: React.ReactNode): string {
    if (typeof node === 'string') return node;
    if (typeof node === 'number') return String(node);
    return '';
}
