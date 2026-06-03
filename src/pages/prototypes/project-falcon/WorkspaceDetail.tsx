// Workspace Detail — the page you land on after clicking a row in the
// Fleet Health Overview. Header → metadata grid → Packs / Feature flags tabs.

import React, { useMemo, useState } from 'react';
import { ChevronRight, ArrowUpRight, OctagonX, AlertTriangle, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsListUnderline, TabsTriggerUnderline, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
    SHAD_SEV,
    ShadSevBadge, ShadTierBadge, ShadKV, ShadHealthPill,
    SlackLogo,
    fiClass, fiReason, fiSorted,
} from './shared';
import {
    workspaces, deployments, featureFlags,
    fCustomer, fCloudName, fStaleness, fSgpChannel,
} from './data';
import type { Deployment, Workspace } from './types';

interface WorkspaceDetailProps {
    workspaceId: string;
    onBack: () => void;
    onSelectCustomer?: (id: string) => void;
}

const OBS_TOOLS = ['LGTM', 'Logs', 'Traces', 'Datadog'];

function shadAge(id: string) {
    let s = 0;
    for (let i = 0; i < id.length; i++) s = (s * 31 + id.charCodeAt(i)) >>> 0;
    return 40 + (s % 320);
}

interface PackGroup {
    pack: string;
    chart: string;
    rev: number;
    ns: string;
    health: 'Healthy' | 'Degraded' | 'Failed' | 'Unknown';
    wls: Array<{ workload: string; container: string; repo: string; tag: string }>;
}

const STATUS_TO_HEALTH: Record<string, PackGroup['health']> = {
    Deployed: 'Healthy', Progressing: 'Degraded', CrashLoopBackOff: 'Failed', Unknown: 'Unknown',
};

function shadPackGroups(ds: Deployment[], wsId: string): PackGroup[] {
    return ds.map(d => {
        let h = 0;
        const key = wsId + d.pack;
        for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
        const chartVer = (d.chart.match(/[0-9]+\.[0-9]+\.[0-9]+/) || ['1.0.0'])[0];
        const tag = (d.image.split(':')[1] || '').replace(/[^0-9.]/g, '') || chartVer;
        const repo = `egp/${d.pack}`;
        const wls = [
            { workload: `${d.pack}-api`, container: 'main', repo, tag },
            { workload: `${d.pack}-worker`, container: 'main', repo, tag },
        ];
        if (h % 2 === 0) {
            wls.push({ workload: `${d.pack}-worker`, container: 'sidecar', repo: 'egp/logging', tag: 'sha-' + h.toString(16).slice(0, 6) });
        }
        return {
            pack: d.pack,
            chart: `${d.pack} ${chartVer}`,
            rev: 6 + (h % 18),
            ns: 'sgp-system',
            health: STATUS_TO_HEALTH[d.status] || 'Unknown',
            wls,
        };
    });
}

export const WorkspaceDetail: React.FC<WorkspaceDetailProps> = ({ workspaceId, onBack, onSelectCustomer }) => {
    const ordered = useMemo(() => fiSorted(), []);
    const [id, setId] = useState<string>(workspaceId);
    const [tab, setTab] = useState<'packs' | 'flags'>('packs');
    const [packQuery, setPackQuery] = useState('');

    const w: Workspace = workspaces.find(x => x.id === id) ?? ordered[0];
    const cust = fCustomer(w.customer);
    const cl = fiClass(w);
    const stale = fStaleness(w.lastHeartbeat);
    const sev = SHAD_SEV[cl.k];
    const ds = deployments.filter(d => d.workspace === w.id);

    const idx = ordered.findIndex(x => x.id === w.id);
    const step = (d: -1 | 1) => {
        const ni = (idx + d + ordered.length) % ordered.length;
        setId(ordered[ni].id);
        setTab('packs');
    };

    const tabs: Array<['packs' | 'flags', string, number]> = [
        ['packs', 'Packs', ds.length],
        ['flags', 'Feature flags', featureFlags.length],
    ];

    return (
        <div className="w-full h-full flex flex-col">
            {/* top bar */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-2.5 h-10 px-6 border-b border-border shrink-0">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onBack}
                    aria-label="Back to fleet"
                    className="h-6 px-1.5 text-muted-foreground"
                >
                    <ChevronRight aria-hidden="true" className="size-3.5 rotate-180" strokeWidth={2} /> Fleet
                </Button>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <ChevronRight aria-hidden="true" className="size-3" strokeWidth={2} />
                    {onSelectCustomer ? (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onSelectCustomer(w.customer)}
                            aria-label={`View customer ${cust.name}`}
                            className="h-6 px-1.5 text-muted-foreground"
                        >
                            {cust.name}
                        </Button>
                    ) : (
                        <span>{cust.name}</span>
                    )}
                    <ChevronRight aria-hidden="true" className="size-3" strokeWidth={2} />
                    <span className="text-foreground font-medium" aria-current="page">{w.id}</span>
                </div>
                <div className="flex-1" />
                <span className="text-xs text-muted-foreground">
                    Workspace {idx + 1} of {ordered.length}
                </span>
                <div className="flex gap-1">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => step(-1)}
                        aria-label="Previous workspace"
                        className="size-7"
                    >
                        <ChevronRight aria-hidden="true" className="size-3.5 rotate-180" strokeWidth={2} />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => step(1)}
                        aria-label="Next workspace"
                        className="size-7"
                    >
                        <ChevronRight aria-hidden="true" className="size-3.5" strokeWidth={2} />
                    </Button>
                </div>
            </nav>

            <div className="flex-1 overflow-auto">
                {/* header */}
                <header className="px-6 pt-5 pb-4">
                    <div className="flex items-start justify-between gap-6">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2.5 mb-1.5">
                                <ShadTierBadge t={cust.tier} />
                                <h1 className="font-semibold m-0 text-2xl tracking-tight">
                                    {onSelectCustomer ? (
                                        <button
                                            type="button"
                                            onClick={() => onSelectCustomer(w.customer)}
                                            className="appearance-none bg-transparent border-0 p-0 m-0 font-semibold text-2xl tracking-tight text-left cursor-pointer rounded-sm transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        >
                                            {cust.name}
                                        </button>
                                    ) : (
                                        cust.name
                                    )}
                                </h1>
                                <Badge variant="secondary" className="uppercase tracking-wider text-[10.5px]">{w.env}</Badge>
                                <ShadSevBadge k={cl.k} soft />
                            </div>
                            <p className="text-[13px] text-muted-foreground m-0">
                                <span className="font-mono">{w.id}</span> · {fCloudName(w.cloud)} · {w.region} · SGP {w.sgp} ({fSgpChannel(w.sgp)})
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <div className="flex gap-1.5" role="group" aria-label="Observability tools">
                                {OBS_TOOLS.map(t => (
                                    <Button key={t} variant="outline" size="sm" aria-label={`Open ${t}`}>
                                        {t} <ArrowUpRight aria-hidden="true" className="size-3 text-muted-foreground" strokeWidth={2} />
                                    </Button>
                                ))}
                            </div>
                            <Button variant="ghost" size="sm" className="text-primary" aria-label={`Open ${cust.slack} in Slack`}>
                                <SlackLogo className="size-3" /> {cust.slack} <ArrowUpRight aria-hidden="true" className="size-3 text-muted-foreground" strokeWidth={2} />
                            </Button>
                        </div>
                    </div>
                </header>

                {/* incident banner */}
                {(cl.k === 'failed' || cl.k === 'degraded') && (
                    <div
                        role="alert"
                        className="mx-6 mb-4 p-3 rounded-xl flex items-center gap-2.5"
                        style={{ background: sev.bg }}
                    >
                        {cl.k === 'failed'
                            ? <OctagonX aria-hidden="true" className="size-4" style={{ color: sev.dot }} strokeWidth={2} />
                            : <AlertTriangle aria-hidden="true" className="size-4" style={{ color: sev.dot }} strokeWidth={2} />
                        }
                        <span className="text-xs font-semibold" style={{ color: sev.fg }}>{fiReason(w, cl.k)}</span>
                        <span className="text-xs text-muted-foreground">
                            {cl.k === 'failed'
                                ? `agentex · compass · gateway affected — paged ${cust.fde.split('@')[0]} ${stale.label}`
                                : 'rolling restart on agentex'
                            }
                        </span>
                        <div className="flex-1" />
                        <Button
                            size="sm"
                            className="text-white"
                            style={{ background: sev.dot }}
                        >
                            Open runbook <ArrowUpRight aria-hidden="true" className="size-3" strokeWidth={2} />
                        </Button>
                    </div>
                )}

                {/* metadata grid */}
                <div className="mx-6 mb-5 border border-border rounded-xl overflow-hidden border-b-0 border-r-0">
                    <div className="grid grid-cols-4">
                        <ShadKV k="Customer tier" v={cust.tier} mono />
                        <ShadKV k="Cloud" v={fCloudName(w.cloud)} />
                        <ShadKV k="Region" v={w.region} mono />
                        <ShadKV k="SGP version" v={`${w.sgp} · ${fSgpChannel(w.sgp)}`} mono />
                        <ShadKV k="Nodes" v={w.nodes} mono />
                        <ShadKV k="Packs installed" v={w.packs} mono />
                        <ShadKV k="Last heartbeat" v={stale.label} mono color={stale.stale ? sev.fg : undefined} />
                        <ShadKV k="Workspace age" v={`${shadAge(w.id)} d`} mono />
                    </div>
                </div>

                {/* tabs */}
                <Tabs value={tab} onValueChange={(v) => setTab(v as 'packs' | 'flags')}>
                    <TabsListUnderline className="flex mx-6" aria-label="Workspace sections">
                        {tabs.map(([k, l, c]) => (
                            <TabsTriggerUnderline key={k} value={k}>
                                {l}
                                <Badge variant="outline" className="h-[17px] px-1.5 text-[10px] font-mono text-muted-foreground">{c}</Badge>
                            </TabsTriggerUnderline>
                        ))}
                    </TabsListUnderline>
                    <TabsContent value="packs" className="px-6 pt-4 pb-7 mt-0">
                        <PacksTab ds={ds} wsId={w.id} packQuery={packQuery} setPackQuery={setPackQuery} />
                    </TabsContent>
                    <TabsContent value="flags" className="px-6 pt-4 pb-7 mt-0">
                        <FlagsTab />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

// ── packs tab ──────────────────────────────────────────────────────────

const PACK_COLS = ['Pack', 'Chart Version', 'Rev', 'Namespace', 'Health', 'Workload', 'Container', 'Repository', 'Tag'];

const PacksTab: React.FC<{ ds: Deployment[]; wsId: string; packQuery: string; setPackQuery: (s: string) => void }> = ({ ds, wsId, packQuery, setPackQuery }) => {
    const groups = shadPackGroups(ds, wsId).filter(g =>
        !packQuery ||
        g.pack.includes(packQuery.toLowerCase()) ||
        g.wls.some(x => x.workload.includes(packQuery.toLowerCase()) || x.repo.includes(packQuery.toLowerCase()))
    );

    return (
        <div>
            <div className="flex items-center justify-between gap-4 mb-3">
                <h2 className="text-base font-semibold m-0">Installed Packs</h2>
                <div className="relative w-72">
                    <Label htmlFor="packs-search" className="sr-only">Search installed packs</Label>
                    <Search aria-hidden="true" className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" strokeWidth={2} />
                    <Input
                        id="packs-search"
                        type="search"
                        value={packQuery}
                        onChange={(e) => setPackQuery(e.target.value)}
                        placeholder="Search"
                        className="pl-8"
                    />
                </div>
            </div>
            <div className="border border-border rounded-xl overflow-hidden shadow-sm">
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="bg-muted">
                            {PACK_COLS.map(h => (
                                <th key={h} scope="col" className="text-left px-3.5 py-2 text-[11px] font-medium text-muted-foreground border-b border-border whitespace-nowrap">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {groups.length === 0 && (
                            <tr>
                                <td colSpan={PACK_COLS.length} className="p-6 text-center text-muted-foreground text-sm" aria-live="polite">
                                    No packs match &ldquo;{packQuery}&rdquo;.
                                </td>
                            </tr>
                        )}
                        {groups.map((g, gi) => g.wls.map((wl, j) => {
                            const first = j === 0;
                            const isLast = gi === groups.length - 1 && j === g.wls.length - 1;
                            const tint = SHAD_SEV[(g.health === 'Healthy' ? 'healthy' : g.health === 'Degraded' ? 'degraded' : g.health === 'Failed' ? 'failed' : 'stale')].tint;
                            const cellBase = 'px-3.5 py-3 align-middle h-[42px] box-border';
                            return (
                                <tr
                                    key={g.pack + j}
                                    className={cn(!isLast && 'border-b border-border')}
                                    style={{ background: tint }}
                                >
                                    <td className={cn(cellBase, 'font-mono font-medium')}>{first ? g.pack : ''}</td>
                                    <td className={cn(cellBase, 'font-mono text-xs text-muted-foreground')}>{first ? g.chart : ''}</td>
                                    <td className={cn(cellBase, 'font-mono text-xs')}>{first ? g.rev : ''}</td>
                                    <td className={cn(cellBase, 'font-mono text-xs')}>{first ? g.ns : ''}</td>
                                    <td className={cellBase}>{first ? <ShadHealthPill h={g.health} /> : null}</td>
                                    <td className={cn(cellBase, 'font-mono text-xs')}>{wl.workload}</td>
                                    <td className={cn(cellBase, 'text-xs')}>{wl.container}</td>
                                    <td className={cn(cellBase, 'font-mono text-xs text-muted-foreground')}>{wl.repo}</td>
                                    <td className={cn(cellBase, 'font-mono text-xs')}>{wl.tag}</td>
                                </tr>
                            );
                        }))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// ── flags tab ──────────────────────────────────────────────────────────

const FlagsTab: React.FC = () => (
    <div className="grid grid-cols-2 gap-2.5">
        {featureFlags.map(f => {
            const on = f.type === 'bool' && f.value === 'true';
            return (
                <div
                    key={f.key}
                    className="flex items-center justify-between gap-2.5 px-3.5 py-3 border border-border rounded-xl bg-card shadow-sm"
                >
                    <div className="min-w-0">
                        <div className="font-mono text-[12.5px] whitespace-nowrap overflow-hidden text-ellipsis">{f.key}</div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 m-0">
                            {f.type} · owned by {f.owner}
                        </p>
                    </div>
                    {f.type === 'bool' ? (
                        <Badge variant={on ? 'success' : 'outline'} className={cn('font-mono', !on && 'text-muted-foreground')}>
                            <span
                                aria-hidden="true"
                                className={cn('size-1.5 rounded-full', on ? 'bg-success-text' : 'bg-zinc-300')}
                            />
                            {f.value}
                        </Badge>
                    ) : (
                        <span className="font-mono text-[12.5px] font-semibold">{f.value}</span>
                    )}
                </div>
            );
        })}
    </div>
);
