// Falcon global navigation — Underline treatment.
// Three nav items + a tweakable brand colour and a logo-style toggle that
// the index.tsx config panel drives.

import React from 'react';

export type FalconSection = 'fleet' | 'deployments' | 'customers';

export interface NavItem {
    id: FalconSection;
    label: string;
}

export const FALCON_NAV_ITEMS: NavItem[] = [
    { id: 'fleet',       label: 'Fleet'       },
    { id: 'deployments', label: 'Deployments' },
    { id: 'customers',   label: 'Customers'   },
];

const NS_SANS = 'Inter, system-ui, sans-serif';
const NS_BRAND = "'Geist', Inter, system-ui, sans-serif";

const Avatar: React.FC = () => (
    <span
        role="img"
        aria-label="Signed in as Jamie Stone"
        className="inline-flex items-center justify-center size-7 rounded-md bg-zinc-800 text-zinc-50 text-[11px] font-semibold tracking-wide shrink-0"
        style={{ fontFamily: NS_SANS }}
    >
        JS
    </span>
);

export interface NavShellProps {
    section: FalconSection;
    items?: NavItem[];
    onNavigate: (id: FalconSection) => void;
    brandColor: string;
    logoStyle: 'text' | 'container';
    children: React.ReactNode;
}

export const NavShell: React.FC<NavShellProps> = ({
    section, items = FALCON_NAV_ITEMS, onNavigate, brandColor, logoStyle, children,
}) => (
    <div className="flex flex-col h-full w-full">
        <header
            className="h-12 shrink-0 bg-card border-b border-border flex items-stretch pr-6"
            style={{ fontFamily: NS_SANS }}
        >
            {logoStyle === 'container' ? (
                <button
                    type="button"
                    onClick={() => onNavigate('fleet')}
                    aria-label="Falcon — go to Fleet"
                    className="flex items-center mr-6 px-4 border-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                    style={{ background: brandColor }}
                >
                    <span
                        style={{
                            fontFamily: NS_BRAND, fontSize: 16,
                            color: '#fff', letterSpacing: '-.02em', fontWeight: 700,
                        }}
                    >
                        Falcon
                    </span>
                </button>
            ) : (
                <button
                    type="button"
                    onClick={() => onNavigate('fleet')}
                    aria-label="Falcon — go to Fleet"
                    className="flex items-center pl-6 pr-8 bg-transparent border-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                >
                    <span
                        style={{
                            fontFamily: NS_BRAND, fontSize: 16,
                            color: brandColor, letterSpacing: '-.02em', fontWeight: 700,
                        }}
                    >
                        Falcon
                    </span>
                </button>
            )}

            <nav aria-label="Primary" className="flex items-stretch gap-6">
                {items.map(it => {
                    const on = it.id === section;
                    return (
                        <button
                            key={it.id}
                            type="button"
                            onClick={() => onNavigate(it.id)}
                            aria-current={on ? 'page' : undefined}
                            className={[
                                'flex items-center text-sm font-medium border-b-2 -mb-px',
                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded-sm',
                                on
                                    ? 'text-foreground border-foreground'
                                    : 'text-muted-foreground border-transparent hover:text-foreground',
                            ].join(' ')}
                        >
                            {it.label}
                        </button>
                    );
                })}
            </nav>

            <div className="ml-auto flex items-center gap-2 pl-4">
                <Avatar />
            </div>
        </header>
        <div className="flex-1 min-h-0 min-w-0 flex flex-col">
            {children}
        </div>
    </div>
);
