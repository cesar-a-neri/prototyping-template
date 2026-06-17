// Customer Catalog — card grid, shadcn/Inter language.
// Sharp-corner cards, P0/P1/P2 priority badge top-right, FDE name + email +
// Slack as the contact stack, footer with workspace count + health summary.

import React, { useMemo, useState } from 'react';
import { Search, User, Mail, ChevronRight, FilterX } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { SegmentedControl } from '@/components/ui/segmented-control';
import {
    ShadTierBadge, ShadSummaryPill, SlackLogo,
} from './shared';
import {
    customers, workspaces, shadPersonName,
} from './data';
import { fiClass } from './shared';
import type { Tier } from './types';

interface CustomerCatalogProps {
    onSelectCustomer: (id: string) => void;
}

type SortKey = 'priority' | 'alphabetical';

const TIER_RANK: Record<Tier, number> = { P0: 0, P1: 1, P2: 2 };

export const CustomerCatalog: React.FC<CustomerCatalogProps> = ({ onSelectCustomer }) => {
    const [query, setQuery] = useState('');
    const [sort, setSort] = useState<SortKey>('priority');

    const decorated = useMemo(() => customers.map(c => {
        const ws = workspaces.filter(w => w.customer === c.id);
        const fail = ws.filter(w => fiClass(w).k === 'failed').length;
        const deg  = ws.filter(w => fiClass(w).k === 'degraded').length;
        const stl  = ws.filter(w => fiClass(w).k === 'stale').length;
        return { ...c, person: shadPersonName(c.fde), wsCount: ws.length, fail, deg, stl };
    }), []);

    const filtered = useMemo(() => {
        let list = decorated;
        if (query) {
            const q = query.toLowerCase();
            list = list.filter(c => `${c.name} ${c.person} ${c.fde} ${c.slack} ${c.tier}`.toLowerCase().includes(q));
        }
        list = [...list].sort((a, b) => sort === 'priority'
            ? (TIER_RANK[a.tier] - TIER_RANK[b.tier] || a.name.localeCompare(b.name))
            : a.name.localeCompare(b.name)
        );
        return list;
    }, [decorated, query, sort]);

    return (
        <div className="w-full h-full flex flex-col">
            {/* top bar */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-2.5 h-10 px-6 border-b border-border shrink-0">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span>Falcon</span>
                    <ChevronRight aria-hidden="true" className="size-3" strokeWidth={2} />
                    <span className="text-foreground font-medium" aria-current="page">Customers</span>
                </div>
                <div className="flex-1" />
                <span className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{filtered.length}</span> of {customers.length} customers
                </span>
            </nav>

            {/* header */}
            <header className="px-6 pt-4 pb-4 border-b border-border shrink-0">
                <div className="flex items-end justify-between gap-4 mb-3.5">
                    <h1 className="text-2xl font-semibold m-0 tracking-tight">Customer Catalog</h1>
                </div>
                <div className="flex items-center justify-between gap-4">
                    <div className="relative w-80">
                        <Label htmlFor="catalog-search" className="sr-only">Search customers</Label>
                        <Search aria-hidden="true" className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" strokeWidth={2} />
                        <Input
                            id="catalog-search"
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search"
                            className="pl-8"
                        />
                    </div>
                    <div className="flex items-center gap-2.5">
                        <span id="sort-label" className="text-sm text-muted-foreground">Sort by</span>
                        <SegmentedControl
                            aria-label="Sort customers"
                            className="bg-muted"
                            value={sort}
                            onValueChange={(v) => setSort(v as SortKey)}
                            options={[
                                { value: 'priority', label: 'Priority' },
                                { value: 'alphabetical', label: 'Alphabetical' },
                            ]}
                        />
                    </div>
                </div>
            </header>

            {/* grid */}
            <div className="flex-1 overflow-auto px-6 pt-5 pb-7">
                {filtered.length === 0 && (
                    <div role="status" aria-live="polite" className="py-12 text-center text-muted-foreground">
                        <FilterX aria-hidden="true" className="size-5 block mx-auto mb-2.5" strokeWidth={1.6} />
                        <p className="text-[13px] m-0">No customers match &ldquo;{query}&rdquo;.</p>
                    </div>
                )}
                <div className="grid grid-cols-4 gap-[18px]">
                    {filtered.map(c => {
                        const allHealthy = c.fail + c.deg + c.stl === 0;
                        return (
                            <Card
                                key={c.id}
                                role="button"
                                tabIndex={0}
                                onClick={() => onSelectCustomer(c.id)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        onSelectCustomer(c.id);
                                    }
                                }}
                                aria-label={`Open ${c.name}, ${c.tier}, ${c.wsCount} workspaces`}
                                style={{ borderRadius: 4 }}
                                className="flex flex-col text-left p-4 pb-0 cursor-pointer transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                            >
                                <div className="flex items-start justify-between gap-2.5 mb-3">
                                    <div className="text-base font-semibold tracking-tight">{c.name}</div>
                                    <ShadTierBadge t={c.tier} />
                                </div>
                                <div className="flex flex-col gap-2 mb-3.5">
                                    <div className="flex items-center gap-2.5 text-[13px] text-muted-foreground">
                                        <User aria-hidden="true" className="size-3.5" strokeWidth={2} />{c.person}
                                    </div>
                                    <div className="flex items-center gap-2.5 text-[13px] text-muted-foreground">
                                        <Mail aria-hidden="true" className="size-3.5" strokeWidth={2} />{c.fde}
                                    </div>
                                    <div className="flex items-center gap-2.5 text-[13px]">
                                        <SlackLogo className="size-3.5" />
                                        <span className="text-foreground">{c.slack}</span>
                                    </div>
                                </div>
                                <div className="border-t border-border -mx-4 px-4 py-3 flex items-center justify-between gap-2">
                                    <span className="text-[13px] text-muted-foreground">
                                        <span className="text-foreground font-medium">{c.wsCount}</span> {c.wsCount === 1 ? 'Workspace' : 'Workspaces'}
                                    </span>
                                    <div className="flex gap-1.5 flex-wrap justify-end">
                                        {allHealthy && <ShadSummaryPill k="healthy" label="All healthy" />}
                                        {c.deg > 0 && <ShadSummaryPill k="degraded" label={`${c.deg} degraded`} />}
                                        {c.fail > 0 && <ShadSummaryPill k="failed" label={`${c.fail} failed`} />}
                                        {c.stl > 0 && <ShadSummaryPill k="stale" label={`${c.stl} stale`} />}
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
