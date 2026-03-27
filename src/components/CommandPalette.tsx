import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import { Search, ArrowRight, Bug } from 'lucide-react';
import { PrototypeRoute } from '@/types';
import { useDebugMode } from '@/lib/tweakpane';
import { Switch } from '@/components/ui/switch';

interface CommandPaletteProps {
    prototypes: PrototypeRoute[];
}

type PaletteItem =
    | { kind: 'prototype'; route: PrototypeRoute }
    | { kind: 'action'; id: string; label: string; description: string; icon: React.ReactNode; onSelect: () => void };

const CommandPalette: React.FC<CommandPaletteProps> = ({ prototypes }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const { debugMode, toggleDebugMode } = useDebugMode();

    const actions: Extract<PaletteItem, { kind: 'action' }>[] = [
        {
            kind: 'action',
            id: 'toggle-debug',
            label: 'Debug mode',
            description: 'Show or hide the Tweakpane panel',
            icon: <Bug size={14} />,
            onSelect: () => { toggleDebugMode(); setOpen(false); },
        },
    ];

    const filteredPrototypes = prototypes.filter(p =>
        !query.trim() || p.title.toLowerCase().includes(query.toLowerCase())
    );
    const filteredActions = actions.filter(a =>
        !query.trim() || a.label.toLowerCase().includes(query.toLowerCase()) || a.description.toLowerCase().includes(query.toLowerCase())
    );

    const items: PaletteItem[] = [
        ...filteredActions,
        ...filteredPrototypes.map(r => ({ kind: 'prototype' as const, route: r })),
    ];

    const currentPath = location.pathname;

    // ⌘K / Ctrl+K global shortcut
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    // Reset state on open
    useEffect(() => {
        if (open) {
            setQuery('');
            setActiveIndex(0);
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    }, [open]);

    useEffect(() => { setActiveIndex(0); }, [query]);

    useEffect(() => {
        if (!listRef.current) return;
        const els = listRef.current.querySelectorAll('[data-item]');
        els[activeIndex]?.scrollIntoView({ block: 'nearest' });
    }, [activeIndex]);

    const selectItem = useCallback((item: PaletteItem) => {
        if (item.kind === 'prototype') {
            navigate(item.route.path);
            setOpen(false);
        } else {
            item.onSelect();
        }
    }, [navigate]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(i => Math.min(i + 1, items.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(i => Math.max(i - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (items[activeIndex]) selectItem(items[activeIndex]);
        }
    };

    const showActionsDivider = filteredActions.length > 0 && filteredPrototypes.length > 0;

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Portal>
                <Dialog.Overlay
                    className="fixed inset-0 z-[200]"
                    style={{ background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(2px)' }}
                />
                <Dialog.Content
                    className="fixed z-[201] top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg outline-none"
                    onKeyDown={handleKeyDown}
                    aria-label="Command palette"
                >
                    <Dialog.Title className="sr-only">Command palette</Dialog.Title>
                    <div
                        className="rounded-xl overflow-hidden shadow-2xl"
                        style={{ background: '#fff', border: '1px solid #e2e8f0' }}
                    >
                        {/* Search input */}
                        <div className="flex items-center gap-3 px-4 border-b" style={{ borderColor: '#e2e8f0' }}>
                            <Search size={16} style={{ color: '#94a3b8', flexShrink: 0 }} />
                            <input
                                ref={inputRef}
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder="Search prototypes or actions…"
                                className="flex-1 py-4 text-sm bg-transparent outline-none placeholder:text-slate-400"
                                style={{ color: '#0f172a' }}
                            />
                            <kbd
                                className="text-[11px] px-1.5 py-0.5 rounded border font-mono"
                                style={{ color: '#94a3b8', borderColor: '#e2e8f0', background: '#f8fafc' }}
                            >
                                esc
                            </kbd>
                        </div>

                        {/* Results list */}
                        <div ref={listRef} className="overflow-y-auto" style={{ maxHeight: 360 }}>
                            {items.length === 0 ? (
                                <div className="px-4 py-8 text-center text-sm" style={{ color: '#94a3b8' }}>
                                    No results found
                                </div>
                            ) : (
                                <div className="py-1.5">
                                    {items.map((item, i) => {
                                        const isActive = i === activeIndex;
                                        const globalIndex = i;

                                        // Section divider before prototypes when both sections present
                                        const showDivider = showActionsDivider && item.kind === 'prototype' && i === filteredActions.length;

                                        if (item.kind === 'action') {
                                            return (
                                                <button
                                                    key={item.id}
                                                    data-item
                                                    onClick={() => selectItem(item)}
                                                    onMouseEnter={() => setActiveIndex(globalIndex)}
                                                    className="w-full h-10 flex items-center gap-3 px-4 text-sm text-left transition-colors"
                                                    style={{
                                                        background: isActive ? '#f1f5f9' : 'transparent',
                                                        color: '#0f172a',
                                                    }}
                                                >
                                                    <span style={{ color: '#64748b', flexShrink: 0 }}>{item.icon}</span>
                                                    <span className="font-medium">{item.label}</span>
                                                    {item.id === 'toggle-debug' && (
                                                        <Switch
                                                            checked={debugMode}
                                                            className="ml-auto pointer-events-none"
                                                            tabIndex={-1}
                                                        />
                                                    )}
                                                    {isActive && item.id !== 'toggle-debug' && (
                                                        <ArrowRight size={14} style={{ color: '#94a3b8', flexShrink: 0, marginLeft: 'auto' }} />
                                                    )}
                                                </button>
                                            );
                                        }

                                        const isCurrent = item.route.path === currentPath;
                                        return (
                                            <React.Fragment key={item.route.path}>
                                                {showDivider && (
                                                    <div
                                                        className="px-4 pt-2 pb-1 text-[11px] font-medium uppercase tracking-wider"
                                                        style={{ color: '#94a3b8' }}
                                                    >
                                                        Prototypes
                                                    </div>
                                                )}
                                                <button
                                                    data-item
                                                    onClick={() => selectItem(item)}
                                                    onMouseEnter={() => setActiveIndex(globalIndex)}
                                                    className="w-full h-10 flex items-center justify-between px-4 text-sm text-left transition-colors"
                                                    style={{
                                                        background: isActive ? '#f1f5f9' : 'transparent',
                                                        color: isCurrent ? '#2563eb' : '#0f172a',
                                                    }}
                                                >
                                                    <span className="font-medium">{item.route.title}</span>
                                                    {isActive && (
                                                        <ArrowRight size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />
                                                    )}
                                                    {!isActive && isCurrent && (
                                                        <span
                                                            className="text-[11px] px-1.5 py-0.5 rounded font-medium"
                                                            style={{ background: '#dbeafe', color: '#2563eb' }}
                                                        >
                                                            current
                                                        </span>
                                                    )}
                                                </button>
                                            </React.Fragment>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer hint */}
                        <div
                            className="flex items-center gap-4 px-4 py-2.5 text-[11px] border-t"
                            style={{ borderColor: '#e2e8f0', color: '#94a3b8' }}
                        >
                            <span className="flex items-center gap-1">
                                <kbd className="px-1 py-0.5 rounded border font-mono" style={{ borderColor: '#e2e8f0', background: '#f8fafc' }}>↑</kbd>
                                <kbd className="px-1 py-0.5 rounded border font-mono" style={{ borderColor: '#e2e8f0', background: '#f8fafc' }}>↓</kbd>
                                navigate
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1 py-0.5 rounded border font-mono" style={{ borderColor: '#e2e8f0', background: '#f8fafc' }}>↵</kbd>
                                select
                            </span>
                            {debugMode && (
                                <span className="ml-auto flex items-center gap-1.5 text-[11px] font-medium" style={{ color: '#16a34a' }}>
                                    <Bug size={11} />
                                    debug on
                                </span>
                            )}
                        </div>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default CommandPalette;
